import React, { useState, useEffect } from 'react';
import { Roadmap } from '../../types/index.js';
import { roadmapAPI, candidateAPI } from '../../services/api.js';
import { SkillRoadmapView } from '../../components/SkillRoadmapView.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext.js';

const TARGET_ROLES = [
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'Python Developer',
  'Java Developer',
  'Software Engineer',
  'Data Analyst'
];

export const CandidateCareerRoadmapView: React.FC = () => {
  const { navigate } = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resRoadmaps, resSkills] = await Promise.all([
        roadmapAPI.getMyRoadmaps().catch(() => ({ data: { success: false, roadmaps: [] } })),
        candidateAPI.getSkills().catch(() => ({ data: { success: false, skills: [] } }))
      ]);

      if (resRoadmaps.data?.success) {
        setRoadmaps(resRoadmaps.data.roadmaps);
        if (resRoadmaps.data.roadmaps.length > 0 && !activeRoadmapId) {
          setActiveRoadmapId(resRoadmaps.data.roadmaps[0].id);
        }
      }
      if (resSkills.data?.success && resSkills.data.skills) {
        setUserSkills(resSkills.data.skills.map((s: any) => s.skill_name.toLowerCase()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRole = async (roleName: string) => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await roadmapAPI.generateRoadmap(roleName);
      if (res.data?.success && res.data.roadmap) {
        await loadData();
        setActiveRoadmapId(res.data.roadmap.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRoleInput.trim()) {
      handleGenerateRole(targetRoleInput.trim());
      setTargetRoleInput('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  const selectedRoadmap = roadmaps.find(r => r.id === activeRoadmapId) || roadmaps[0];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <PageHeader
        badge="PERSONALIZED CAREER ACCELERATOR"
        badgeSubtext="Deterministic Skill Gap Bridges"
        icon={<Compass className="w-6 h-6" />}
        title="Career Goal & Skill Roadmap"
        subtitle="Select your target dream role to reveal all missing skills, project milestones, verified assessments, and recommended next steps."
        actions={
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Custom role (e.g. AI Engineer)..."
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              className="px-4 py-2.5 bg-[#121412] border border-white/10 rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B] min-w-[200px]"
            />
            <button
              type="submit"
              disabled={generating || !targetRoleInput.trim()}
              className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Generating...' : 'Generate'}</span>
            </button>
          </form>
        }
      />

      {/* Target Role Selector Chips */}
      <div className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] shadow-xl space-y-3">
        <div className="text-xs font-semibold text-[#9CA3A1]">Popular Career Goals:</div>
        <div className="flex flex-wrap gap-2">
          {TARGET_ROLES.map((role) => {
            const hasRoadmap = roadmaps.some(r => r.target_role.toLowerCase() === role.toLowerCase());
            const isSelected = selectedRoadmap?.target_role.toLowerCase() === role.toLowerCase();
            return (
              <button
                key={role}
                onClick={() => {
                  const existing = roadmaps.find(r => r.target_role.toLowerCase() === role.toLowerCase());
                  if (existing) {
                    setActiveRoadmapId(existing.id);
                  } else {
                    handleGenerateRole(role);
                  }
                }}
                disabled={generating}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/50 shadow-[0_0_12px_rgba(182,255,59,0.2)]'
                    : hasRoadmap
                      ? 'bg-white/5 text-white border border-white/10 hover:border-white/20'
                      : 'bg-white/[0.02] text-[#9CA3A1] border border-white/[0.06] hover:text-white hover:border-white/15'
                }`}
              >
                <span>{role}</span>
                {hasRoadmap && <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF3B]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Roadmap View */}
      {selectedRoadmap ? (
        <div className="space-y-6">
          {/* Active Roadmap Overview */}
          <div className="bg-[#16181A] p-6 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#9CA3A1]">Active Career Target:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
                  {selectedRoadmap.target_role}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Your Path to Becoming a {selectedRoadmap.target_role}</h2>
              <p className="text-xs text-[#9CA3A1] mt-1">Complete the stages below to bridge your missing skills and verify competencies.</p>
            </div>

            <div className="flex items-center gap-4 bg-[#101211] p-4 rounded-xl border border-white/10 shrink-0">
              <div>
                <div className="text-[11px] text-[#9CA3A1]">Roadmap Progress</div>
                <div className="text-2xl font-black text-[#B6FF3B]">{selectedRoadmap.overall_progress || 0}%</div>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center text-sm font-bold text-[#B6FF3B] shadow-[0_0_12px_rgba(182,255,59,0.2)]">
                {selectedRoadmap.overall_progress || 0}%
              </div>
            </div>
          </div>

          {/* Interactive Skill Roadmap component */}
          <SkillRoadmapView
            roadmap={selectedRoadmap}
            onUpdate={loadData}
            onNavigateTab={(tab) => {
              if (tab === 'assessments') navigate('/candidate/assessments');
              if (tab === 'portfolio') navigate('/candidate/portfolio');
              if (tab === 'jobs') navigate('/candidate/jobs');
            }}
          />
        </div>
      ) : (
        <div className="p-12 bg-[#16181A] rounded-2xl border border-white/[0.08] text-center space-y-4 shadow-xl">
          <Compass className="w-12 h-12 text-[#B6FF3B] mx-auto" />
          <h3 className="text-lg font-bold text-white">No Career Roadmap Generated Yet</h3>
          <p className="text-sm text-[#9CA3A1] max-w-md mx-auto leading-relaxed">
            Choose a target role above (e.g. Full Stack Developer or Python Developer) to generate your personalized career plan.
          </p>
          <button
            onClick={() => handleGenerateRole('Full Stack Developer')}
            className="sb-btn-primary px-5 py-2.5 text-xs font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)]"
          >
            Generate Full Stack Developer Roadmap
          </button>
        </div>
      )}
    </div>
  );
};


