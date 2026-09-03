import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api.js';
import { AuditLog } from '../types/index.js';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Award,
  Layers,
  Database,
  Lock,
  Search,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [mismatchData, setMismatchData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'audit' | 'taxonomy'>('analytics');

  // Taxonomy Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Frontend');
  const [newSkillDiff, setNewSkillDiff] = useState('Intermediate');
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, taxRes, auditRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getSkillsTaxonomy(),
        adminAPI.getAuditLogs()
      ]);

      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.stats);
        setMismatchData(analyticsRes.data.skillMismatchComparison);
      }
      if (taxRes.data.success) setTaxonomy(taxRes.data.skills);
      if (auditRes.data.success) setAuditLogs(auditRes.data.logs);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    try {
      await adminAPI.addSkillTaxonomy({
        name: newSkillName,
        category: newSkillCat,
        difficulty_level: newSkillDiff
      });
      setNewSkillName('');
      const taxRes = await adminAPI.getSkillsTaxonomy();
      if (taxRes.data.success) setTaxonomy(taxRes.data.skills);
    } catch (e) {
      console.error('Failed to add skill', e);
    } finally {
      setAddingSkill(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Platform Governance & Analytics
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{t('nav_admin')}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitor macro skill supply-demand mismatch metrics, manage standardized taxonomy, and inspect cryptographic audit logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mismatch Analytics
          </button>
          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'taxonomy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Skill Taxonomy
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Audit Logs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading platform intelligence...</div>
      ) : (
        <>
          {/* TAB 1: Macro Analytics & Skill Mismatch Comparison */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Macro Impact Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Total Users</span>
                  <p className="text-2xl font-black text-white">{stats?.totalUsers || 6}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Active Job Postings</span>
                  <p className="text-2xl font-black text-indigo-400">{stats?.totalJobs || 4}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Micro-Credentials Issued</span>
                  <p className="text-2xl font-black text-amber-400">{stats?.totalBadgesIssued || 3}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Skill Mismatch Reduction</span>
                  <p className="text-2xl font-black text-emerald-400">{stats?.skillMismatchReductionRate || '42%'}</p>
                </div>
              </div>

              {/* Macro Skill Supply Gap Heatmap Table */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <span>Labour Market Skill Supply vs Demand Gap</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Identifies specific technical competencies with high employer demand but low candidate credential verification.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">Competency / Skill</th>
                        <th className="pb-3">Market Demand Frequency</th>
                        <th className="pb-3">Verified Candidate Supply</th>
                        <th className="pb-3">Supply Gap Index</th>
                        <th className="pb-3">Recommended Intervention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {mismatchData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-850/50">
                          <td className="py-3.5 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span>{item.skill}</span>
                          </td>
                          <td className="py-3.5 text-indigo-300 font-semibold">{item.demand_frequency} Postings</td>
                          <td className="py-3.5 text-emerald-400 font-semibold">
                            {item.verified_candidates} Certified Badges
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${Math.min(item.supply_gap * 25, 100)}%` }}
                                />
                              </div>
                              <span className="font-bold text-amber-400">{item.supply_gap} units</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-300">
                            {item.supply_gap > 2 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Priority Roadmap Promotion
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Healthy Supply Equilibrium
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standardized Skills Taxonomy Management */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-6">
              {/* Add Skill Form */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Add Standardized Skill to Global Taxonomy</span>
                </h3>

                <form onSubmit={handleAddSkill} className="flex flex-wrap items-center gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Skill name (e.g. Next.js, LangChain, PyTorch)"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 min-w-[240px]"
                  />

                  <select
                    value={newSkillCat}
                    onChange={e => setNewSkillCat(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Data Science</option>
                    <option>AI/ML</option>
                    <option>DevOps</option>
                    <option>Design</option>
                    <option>Soft Skills</option>
                  </select>

                  <select
                    value={newSkillDiff}
                    onChange={e => setNewSkillDiff(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>

                  <button
                    type="submit"
                    disabled={addingSkill}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                  >
                    {addingSkill ? 'Saving...' : 'Add Competency'}
                  </button>
                </form>
              </div>

              {/* Taxonomy List */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
                <h3 className="text-base font-bold text-white mb-4">
                  Standardized Skill Taxonomy Directory ({taxonomy.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {taxonomy.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{s.name}</span>
                        <span className="text-[10px] bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {s.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-1">{s.description || 'Standard technical skill'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Cryptographic Audit Logs */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Security & Micro-Credential Audit Logs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable event log of badge issuances, WebAuthn biometric registrations, and auth attempts.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">User ID</th>
                      <th className="pb-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-3 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 font-bold text-white">{log.action}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.category === 'BADGE_ISSUED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : log.category === 'AUTH'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-slate-400 text-[11px]">{log.user_id || 'Anonymous'}</td>
                        <td className="py-3 text-slate-300 font-mono text-[10px] max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
