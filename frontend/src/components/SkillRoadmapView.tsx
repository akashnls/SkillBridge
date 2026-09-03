import React, { useState } from 'react';
import { Roadmap, RoadmapStage, RoadmapItem } from '../types/index.js';
import { roadmapAPI } from '../services/api.js';
import {
  Compass,
  CheckCircle2,
  Circle,
  BookOpen,
  FolderGit2,
  Award,
  Send,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface SkillRoadmapViewProps {
  roadmap: Roadmap;
  onUpdate?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SkillRoadmapView: React.FC<SkillRoadmapViewProps> = ({ roadmap, onUpdate, onNavigateTab }) => {
  const { t } = useLanguage();
  const [expandedStage, setExpandedStage] = useState<number | null>(1);
  const [stages, setStages] = useState<RoadmapStage[]>(roadmap.stages || []);
  const [progress, setProgress] = useState(roadmap.overall_progress || 0);

  const handleToggleItem = async (itemId: string, currentCompleted: boolean) => {
    try {
      const newStatus = !currentCompleted;
      const res = await roadmapAPI.toggleStepItem(roadmap.id, itemId, newStatus);
      if (res.data.success) {
        setProgress(res.data.overall_progress);
        setStages(res.data.stages);
        if (onUpdate) onUpdate();
      }
    } catch (e) {
      console.error('Failed to toggle item', e);
    }
  };

  const getStageIcon = (stageNum: number) => {
    switch (stageNum) {
      case 1:
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case 2:
        return <FolderGit2 className="w-5 h-5 text-cyan-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-400" />;
      case 4:
        return <Send className="w-5 h-5 text-emerald-400" />;
      default:
        return <Compass className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Personalized Pathway
            </span>
            <span className="text-xs text-slate-400">
              Target: <strong className="text-white">{roadmap.target_role}</strong>
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">4-Step Sequential Upskilling Roadmap</h3>
        </div>

        {/* Overall Progress Widget */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 min-w-[200px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Total Progress</span>
              <span className="text-emerald-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Coaching Advice */}
      {roadmap.ai_coaching_advice && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-indigo-300 block mb-0.5">AI Career Coach Advice</span>
            <p className="leading-relaxed">{roadmap.ai_coaching_advice}</p>
          </div>
        </div>
      )}

      {/* 4 Stages Timeline */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isExpanded = expandedStage === stage.stage_number;
          const completedCount = stage.items.filter(i => i.completed).length;
          const allCompleted = completedCount === stage.items.length && stage.items.length > 0;

          return (
            <div
              key={stage.stage_number}
              className={`rounded-2xl border transition-all overflow-hidden ${
                allCompleted
                  ? 'bg-emerald-950/15 border-emerald-500/30'
                  : isExpanded
                  ? 'bg-slate-800/40 border-indigo-500/40 shadow-lg'
                  : 'bg-slate-850/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Stage Header */}
              <button
                onClick={() => setExpandedStage(isExpanded ? null : stage.stage_number)}
                className="w-full p-4 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      allCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {allCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : getStageIcon(stage.stage_number)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{stage.stage_name}</span>
                      {allCompleted && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          Completed
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 hidden sm:block">
                    {completedCount} / {stage.items.length} Tasks
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Items List */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-800/60 space-y-3 mt-2">
                  {stage.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                        item.completed
                          ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                          : 'bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleItem(item.id, item.completed)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-indigo-400" />
                          )}
                        </button>
                        <div>
                          <p className={`font-bold ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                            <span>⏱️ ~{item.estimated_hours} Hours</span>
                            <span className="capitalize font-semibold text-indigo-400">Type: {item.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action trigger */}
                      {item.link_or_action && (
                        <div className="shrink-0">
                          {item.link_or_action.startsWith('/') ? (
                            <button
                              onClick={() => onNavigateTab && onNavigateTab(item.link_or_action!.substring(1))}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1 transition-all"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <a
                              href={item.link_or_action}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-all"
                            >
                              <span>Learn</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
