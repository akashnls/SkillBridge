import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { candidateAPI, CandidateSkillItem } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Award,
  CheckCircle2,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export const CandidateSkillsView: React.FC = () => {
  const { navigate } = useRouter();
  const [skills, setSkills] = useState<CandidateSkillItem[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newCategory, setNewCategory] = useState('Technical');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getSkills();
      if (res.data?.success) {
        setSkills(res.data.skills || []);
        setBadges(res.data.badges || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      setSubmitting(true);
      const res = await candidateAPI.addSkill({
        skill_name: newSkillName.trim(),
        proficiency: newProficiency,
        category: newCategory
      });
      if (res.data?.success) {
        setNewSkillName('');
        await loadSkills();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProficiency = async (id: string, proficiency: string) => {
    try {
      await candidateAPI.updateSkillProficiency(id, proficiency);
      setSkills(prev => prev.map(s => s.id === id ? { ...s, proficiency: proficiency as any } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSkill = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) return;
    try {
      await candidateAPI.removeSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Popular in-demand skills for suggestions
  const inDemandSuggestions = ['Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Docker', 'AWS', 'MongoDB', 'Git'];
  const missingSuggestions = inDemandSuggestions.filter(
    s => !skills.some(userSkill => userSkill.skill_name.toLowerCase() === s.toLowerCase())
  );

  const verifiedCount = skills.filter(s => s.is_verified === 1).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <PageHeader
        badge="SKILL VERIFICATION"
        badgeSubtext="Micro-Credentials & Badges"
        icon={<Award className="w-6 h-6" />}
        title="Skills & Verification"
        subtitle="Showcase your technical competencies and prove proficiency with cryptographically verified badges."
        actions={
          <button
            onClick={() => navigate('/candidate/assessments')}
            className="sb-btn-primary px-5 py-2.5 text-xs font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Take Skill Assessment</span>
          </button>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-xs text-[#9CA3A1]">Total Skills</span>
          <div className="text-2xl font-black text-white mt-1">{skills.length}</div>
          <span className="text-[11px] text-[#9CA3A1]">In your profile</span>
        </div>
        <div className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-xs text-[#9CA3A1]">Verified Skills</span>
          <div className="text-2xl font-black text-[#B6FF3B] mt-1">{verifiedCount}</div>
          <span className="text-[11px] text-[#B6FF3B]/80">Backed by assessments</span>
        </div>
        <div className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] shadow-lg">
          <span className="text-xs text-[#9CA3A1]">Earned Badges</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{badges.length}</div>
          <span className="text-[11px] text-[#9CA3A1]">Verifiable credentials</span>
        </div>
      </div>

      {/* Add New Skill Card */}
      <div className="bg-[#16181A] p-6 rounded-2xl border border-white/[0.08] shadow-xl">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#B6FF3B]" />
          <span>Add New Skill</span>
        </h2>
        <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name (e.g. Python, React, PostgreSQL)..."
              className="w-full px-3.5 py-2.5 bg-[#101211] border border-white/10 rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
            />
          </div>
          <div>
            <select
              value={newProficiency}
              onChange={(e) => setNewProficiency(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-[#101211] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#B6FF3B]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting || !newSkillName.trim()}
              className="sb-btn-primary w-full py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)] disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Adding...' : 'Add Skill'}</span>
            </button>
          </div>
        </form>

        {/* In-Demand Suggestions */}
        {missingSuggestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/[0.08]">
            <span className="text-[11px] text-[#9CA3A1] mr-2">💡 In-demand suggestions:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {missingSuggestions.slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewSkillName(s)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white/[0.04] hover:bg-[#B6FF3B]/10 hover:text-[#B6FF3B] border border-white/10 hover:border-[#B6FF3B]/30 text-xs font-medium text-white rounded-full transition-all cursor-pointer"
                >
                  <span className="text-[#B6FF3B] font-bold">+</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills List Table */}
      <div className="bg-[#16181A] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Your Skills & Proficiency</h2>
          <span className="text-xs text-[#9CA3A1]">{skills.length} skills recorded</span>
        </div>

        {skills.length === 0 ? (
          <div className="p-8 text-center text-[#9CA3A1] text-sm">
            <p>No skills added yet. Add your technical skills above to get accurate job matches!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {skills.map((skill) => {
              const isVerified = skill.is_verified === 1;
              return (
                <div
                  key={skill.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isVerified ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30' : 'bg-white/5 text-[#9CA3A1] border border-white/10'}`}>
                      {isVerified ? <ShieldCheck className="w-5 h-5 text-[#B6FF3B]" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{skill.skill_name}</span>
                        {isVerified ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-[#9CA3A1] border border-white/10">
                            Self-reported
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#9CA3A1]">
                        {isVerified && skill.badge_code ? `Badge: ${skill.badge_code}` : 'Take assessment to verify'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Proficiency dropdown */}
                    <select
                      value={skill.proficiency}
                      onChange={(e) => handleUpdateProficiency(skill.id, e.target.value)}
                      className="px-2.5 py-1.5 bg-[#101211] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#B6FF3B]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>

                    {/* Verify Action if not verified */}
                    {!isVerified && (
                      <button
                        onClick={() => navigate('/candidate/assessments')}
                        className="sb-btn-secondary px-3 py-1.5 text-xs font-semibold"
                      >
                        <Zap className="w-3 h-3 text-[#B6FF3B]" />
                        <span>Verify</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="p-1.5 text-[#9CA3A1] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skill Gap Analysis Box */}
      <div className="p-6 bg-[#16181A] rounded-2xl border border-white/[0.08] shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-radial from-[#B6FF3B]/10 to-transparent blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#B6FF3B]" />
              <span>Target Role Skill Gap Analysis</span>
            </h3>
            <p className="text-xs text-[#9CA3A1] mt-1 max-w-xl leading-relaxed">
              Want to see exactly what skills you need for your target career role? Use our Career Roadmap tool to calculate your complete roadmap and next steps.
            </p>
          </div>
          <button
            onClick={() => navigate('/candidate/roadmap')}
            className="sb-btn-primary px-5 py-2.5 text-xs font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)] shrink-0"
          >
            <span>Open Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


