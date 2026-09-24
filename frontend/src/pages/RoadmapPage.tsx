import React, { useState, useEffect } from 'react';
import { Roadmap } from '../types/index.js';
import { roadmapAPI } from '../services/api.js';
import { SkillRoadmapView } from '../components/SkillRoadmapView.js';
import { Compass, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface RoadmapPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onNavigateTab }) => {
  const { t } = useLanguage();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetRoleInput, setTargetRoleInput] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await roadmapAPI.getMyRoadmaps();
      if (res.data.success) {
        setRoadmaps(res.data.roadmaps);
      }
    } catch (e) {
      console.error('Failed to load roadmaps', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleInput.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await roadmapAPI.generateRoadmap(targetRoleInput);
      if (res.data.success) {
        setTargetRoleInput('');
        await loadRoadmaps();
      }
    } catch (e) {
      console.error('Failed to generate roadmap', e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner - Dark Fintech style */}
      <div className="bg-[#16181A] rounded-3xl border border-white/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#B6FF3B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
              Personalized Skill Gap Roadmaps
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t('roadmap_title')}</h2>
          <p className="text-xs sm:text-sm text-[#9CA3A1] mt-1.5 max-w-xl leading-relaxed">{t('roadmap_subtitle')}</p>
        </div>

        {/* Generate Custom Roadmap Form */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2 w-full md:w-auto relative z-10">
          <input
            type="text"
            placeholder="e.g. AI Prompt Engineer, Cloud DevOps..."
            value={targetRoleInput}
            onChange={e => setTargetRoleInput(e.target.value)}
            className="bg-[#101211] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B] focus:ring-1 focus:ring-[#B6FF3B] min-w-[240px] transition-all"
          />
          <button
            type="submit"
            disabled={generating || !targetRoleInput.trim()}
            className="px-5 py-2.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] disabled:opacity-40 text-[#0B0D0C] text-xs font-bold shadow-lg shadow-[#B6FF3B]/20 flex items-center gap-2 shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Generating...' : 'Generate Pathway'}</span>
          </button>
        </form>
      </div>

      {/* 4-Step Methodology Concept Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#16181A] border border-white/8 flex items-center gap-3 hover:border-white/15 transition-all">
          <div className="w-10 h-10 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_1')}</p>
            <p className="text-[11px] text-[#9CA3A1]">Targeted syntax & theory</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16181A] border border-white/8 flex items-center gap-3 hover:border-white/15 transition-all">
          <div className="w-10 h-10 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_2')}</p>
            <p className="text-[11px] text-[#9CA3A1]">Real capstone repo</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16181A] border border-white/8 flex items-center gap-3 hover:border-white/15 transition-all">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_3')}</p>
            <p className="text-[11px] text-[#9CA3A1]">Verifiable quiz test</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#16181A] border border-white/8 flex items-center gap-3 hover:border-white/15 transition-all">
          <div className="w-10 h-10 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_4')}</p>
            <p className="text-[11px] text-[#9CA3A1]">High-fit application</p>
          </div>
        </div>
      </div>

      {/* Roadmaps List */}
      {loading ? (
        <div className="text-center py-12 text-[#9CA3A1] text-xs">Loading personal pathways...</div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-[#16181A] rounded-3xl border border-white/8 p-12 text-center space-y-4 shadow-xl">
          <Compass className="w-12 h-12 text-[#6B7280] mx-auto" />
          <h3 className="text-base font-bold text-white">No Learning Pathways Generated Yet</h3>
          <p className="text-xs text-[#9CA3A1] max-w-md mx-auto leading-relaxed">
            Pick a target role or click "Explain AI Match" on any job opening to automatically generate a personalized 4-step upskilling roadmap.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmaps.map((rm) => (
            <SkillRoadmapView
              key={rm.id}
              roadmap={rm}
              onUpdate={loadRoadmaps}
              onNavigateTab={onNavigateTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};


