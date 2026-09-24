import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
  AlertTriangle
} from 'lucide-react';

export const AdminAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Failed to load platform analytics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#9a8e7a] text-xs animate-pulse">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#3d6b35]" />
        Calculating platform macro analytics from database...
      </div>
    );
  }

  const userA = data?.user_analytics || {};
  const jobA = data?.job_analytics || {};
  const appA = data?.application_analytics || {};
  const hireA = data?.hiring_analytics || {};
  const skillA: any[] = data?.skill_analytics || [];
  const mismatchData: any[] = data?.skillMismatchComparison || data?.skill_analytics || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#3d6b35]/20 text-[#3d6b35] border border-[#3d6b35]/30">
              Telemetry & Insights
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
            Platform Analytics & Intelligence
          </h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
            Aggregated metrics across candidates, recruiters, jobs, supply-demand skill gaps, and hiring velocity.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] border border-[#4a4636] text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. High-Level KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#f5f0e8]/70 border border-[#4a4636]/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9a8e7a] font-medium">Total Platform Users</span>
            <span className="p-2 rounded-xl bg-[#c8d5a8]/10 text-[#4a5e2f]"><Users className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#f0ebe0]">{userA.total_users || 0}</span>
            <span className="text-[11px] text-[#3d6b35] font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> {userA.candidate_growth || '+15%'}
            </span>
          </div>
          <p className="text-[11px] text-[#9a8e7a] mt-1">
            {userA.candidates || 0} candidates • {userA.recruiters || 0} recruiters
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f5f0e8]/70 border border-[#4a4636]/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9a8e7a] font-medium">Active Requisitions</span>
            <span className="p-2 rounded-xl bg-[#4a5e2f]/10 text-[#4a5e2f]"><Briefcase className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#f0ebe0]">{jobA.active_jobs || 0}</span>
            <span className="text-[11px] text-[#9a8e7a] font-medium">of {jobA.total_jobs || 0} total</span>
          </div>
          <p className="text-[11px] text-[#9a8e7a] mt-1">
            {jobA.approved_jobs || 0} approved • {jobA.pending_jobs || 0} pending review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f5f0e8]/70 border border-[#4a4636]/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9a8e7a] font-medium">Total Applications</span>
            <span className="p-2 rounded-xl bg-[#fde9c0]/10 text-[#b45309]"><BarChart3 className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#f0ebe0]">{appA.total_applications || 0}</span>
            <span className="text-[11px] text-[#4a5e2f] font-semibold">{appA.avg_per_job || 0} per job</span>
          </div>
          <p className="text-[11px] text-[#9a8e7a] mt-1">
            {appA.shortlisting_rate || 0}% shortlisted • {appA.interview_rate || 0}% interview rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f5f0e8]/70 border border-[#4a4636]/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9a8e7a] font-medium">Successful Hires</span>
            <span className="p-2 rounded-xl bg-[#3d6b35]/10 text-[#3d6b35]"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#f0ebe0]">{hireA.total_hires || 0}</span>
            <span className="text-[11px] text-[#3d6b35] font-bold">{appA.selection_rate || 0}% conversion</span>
          </div>
          <p className="text-[11px] text-[#9a8e7a] mt-1">
            Across verified partner companies
          </p>
        </div>
      </div>

      {/* 2. Application Funnel & Hiring Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3d6b35]" />
              Recruitment Pipeline Conversion Funnel
            </h2>
            <span className="text-xs text-[#9a8e7a]">Deterministic ATS Stages</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-[#b5aa96] font-semibold mb-1">
                <span>1. Applied ({appA.total_applications || 0})</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-[#3a3828] rounded-full h-3 overflow-hidden">
                <div className="bg-[#c8d5a8]/300 h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#b5aa96] font-semibold mb-1">
                <span>2. Shortlisted by Recruiter</span>
                <span>{appA.shortlisting_rate || 0}%</span>
              </div>
              <div className="w-full bg-[#3a3828] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#4a5e2f] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, appA.shortlisting_rate || 0)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#b5aa96] font-semibold mb-1">
                <span>3. Scheduled for Interview</span>
                <span>{appA.interview_rate || 0}%</span>
              </div>
              <div className="w-full bg-[#3a3828] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#fde9c0]0 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, appA.interview_rate || 0)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#b5aa96] font-semibold mb-1">
                <span>4. Selected / Offer Extended</span>
                <span>{appA.selection_rate || 0}%</span>
              </div>
              <div className="w-full bg-[#3a3828] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#3d6b35] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(3, appA.selection_rate || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#4a5e2f]" />
            Top Hiring Employers
          </h2>
          <p className="text-xs text-[#9a8e7a]">Enterprises with confirmed job offers.</p>

          <div className="space-y-3 pt-2">
            {(hireA.hires_by_company || []).length === 0 ? (
              <p className="text-xs text-[#9a8e7a] py-6 text-center">No hire events recorded yet.</p>
            ) : (
              (hireA.hires_by_company || []).map((c: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-[#f5f0e8] border border-[#4a4636] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#4a5e2f]/20 text-[#4a5e2f] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#9a8e7a]">{c.company_name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">
                    {c.hire_count} hires
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Skill Supply vs Demand Gap Analytics */}
      <div className="p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4a5e2f]" />
              Skill Supply & Demand Macro Gaps
            </h2>
            <p className="text-xs text-[#9a8e7a] mt-0.5">
              Live comparison between employer requisition skill requirements and verified candidate micro-credentials.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#9a8e7a]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#4a5e2f] inline-block" /> Job Demand</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#3d6b35] inline-block" /> Verified Badges</span>
          </div>
        </div>

        {skillA.length === 0 ? (
          <p className="text-xs text-[#9a8e7a] py-8 text-center">No skill requirements logged in open jobs.</p>
        ) : (
          <div className="space-y-4">
            {skillA.slice(0, 10).map((s: any, idx: number) => {
              const maxVal = Math.max(...skillA.map((x: any) => Math.max(x.demand, x.supply, x.verified, 1)));
              const demandWidth = Math.round((s.demand / maxVal) * 100);
              const verifiedWidth = Math.round((s.verified / maxVal) * 100);

              return (
                <div key={idx} className="p-3.5 rounded-xl bg-[#f5f0e8]/60 border border-[#4a4636]/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#f0ebe0] flex items-center gap-2">
                      <span>{s.skill}</span>
                      {s.gap > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fde9c0]/20 text-[#b45309] border border-[#b45309]/30">
                          Gap: {s.gap} needed
                        </span>
                      )}
                    </span>
                    <span className="text-[#9a8e7a] font-mono text-[11px]">
                      Demand: <strong className="text-[#4a5e2f]">{s.demand} jobs</strong> • Verified Badges: <strong className="text-[#3d6b35]">{s.verified}</strong>
                    </span>
                  </div>

                  {/* Dual Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[#3a3828]/80 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#4a5e2f] h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(5, demandWidth)}%` }} />
                    </div>
                    <div className="w-full bg-[#3a3828]/80 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#3d6b35] h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(3, verifiedWidth)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Labour Market Skill Supply vs Demand Gap Heatmap Table */}
      <div className="p-6 rounded-3xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#4a4636] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#b45309]" />
              <span>Labour Market Skill Supply vs Demand Gap</span>
            </h2>
            <p className="text-xs text-[#9a8e7a] mt-0.5">
              Identifies specific technical competencies with high employer demand but low candidate credential verification.
            </p>
          </div>
        </div>

        {mismatchData.length === 0 ? (
          <p className="text-xs text-[#9a8e7a] py-6 text-center">No skill mismatch telemetry recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#4a4636] text-[#9a8e7a] font-bold uppercase text-[10px]">
                  <th className="pb-3">Competency / Skill</th>
                  <th className="pb-3">Market Demand Frequency</th>
                  <th className="pb-3">Verified Candidate Supply</th>
                  <th className="pb-3">Supply Gap Index</th>
                  <th className="pb-3">Recommended Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {mismatchData.map((item: any, idx: number) => {
                  const demandFreq = item.demand_frequency ?? item.demand ?? 0;
                  const verifiedCount = item.verified_candidates ?? item.verified ?? 0;
                  const supplyGap = item.supply_gap !== undefined ? item.supply_gap : Math.max(demandFreq * 3 - verifiedCount, 0);
                  const isHighGap = supplyGap > 2;

                  return (
                    <tr key={idx} className="hover:bg-[#f5f0e8]/50 transition-colors">
                      <td className="py-3.5 font-bold text-[#f0ebe0] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4a5e2f]" />
                        <span>{item.skill}</span>
                      </td>
                      <td className="py-3.5 text-[#4a5e2f] font-semibold">
                        {demandFreq} Postings
                      </td>
                      <td className="py-3.5 text-[#3d6b35] font-semibold">
                        {verifiedCount} Certified Badges
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-[#3a3828] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#fde9c0]0 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(supplyGap * 25, 100)}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#b45309]">{supplyGap} units</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {isHighGap ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fde9c0]/20 text-[#b45309] border border-[#b45309]/30">
                            Priority Roadmap Promotion
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3d6b35]/20 text-[#3d6b35] border border-[#3d6b35]/30">
                            Healthy Supply Equilibrium
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsView;


