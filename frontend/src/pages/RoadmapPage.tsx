import React, { useState, useEffect } from 'react';
import { Roadmap } from '../types/index.js';
import { roadmapAPI } from '../services/api.js';
import { SkillRoadmapView } from '../components/SkillRoadmapView.js';
import { Compass, Plus, Sparkles, TrendingUp, BookOpen, FolderGit2, Award, Send } from 'lucide-react';
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Personalized Skill Gap Roadmaps
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{t('roadmap_title')}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{t('roadmap_subtitle')}</p>
        </div>

        {/* Generate Custom Roadmap Form */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="e.g. AI Prompt Engineer, Cloud DevOps..."
            value={targetRoleInput}
            onChange={e => setTargetRoleInput(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 min-w-[220px]"
          />
          <button
            type="submit"
            disabled={generating || !targetRoleInput.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 shrink-0 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Generating...' : 'Generate Pathway'}</span>
          </button>
        </form>
      </div>

      {/* 4-Step Methodology Concept Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_1')}</p>
            <p className="text-[11px] text-slate-400">Targeted syntax & theory</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_2')}</p>
            <p className="text-[11px] text-slate-400">Real capstone repo</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_3')}</p>
            <p className="text-[11px] text-slate-400">Verifiable quiz test</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            4
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t('stage_4')}</p>
            <p className="text-[11px] text-slate-400">High-fit application</p>
          </div>
        </div>
      </div>

      {/* Roadmaps List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading personal pathways...</div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Learning Pathways Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Pick a target role or click "Explain AI Match" on any job opening to automatically generate a personalized 4-step upskilling roadmap.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmaps.map((roadmap) => (
            <SkillRoadmapView
              key={roadmap.id}
              roadmap={roadmap}
              onUpdate={loadRoadmaps}
              onNavigateTab={onNavigateTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};
