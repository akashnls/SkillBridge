import React, { useState } from 'react';
import { Roadmap, RoadmapStage } from '../types/index.js';
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
        return <BookOpen className="w-5 h-5 text-[#B6FF3B]" />;
      case 2:
        return <FolderGit2 className="w-5 h-5 text-[#B6FF3B]" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-400" />;
      case 4:
        return <Send className="w-5 h-5 text-[#B6FF3B]" />;
      default:
        return <Compass className="w-5 h-5 text-[#B6FF3B]" />;
    }
  };

  return (
    <div className="bg-[#16181A] rounded-2xl border border-white/10 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
              Personalized Pathway
            </span>
            <span className="text-xs text-[#9CA3A1]">
              Target: <strong className="text-white">{roadmap.target_role}</strong>
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">4-Step Sequential Upskilling Roadmap</h3>
        </div>

        {/* Overall Progress Widget */}
        <div className="flex items-center gap-3 bg-[#101211] p-3 rounded-2xl border border-white/8 min-w-[220px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#9CA3A1]">Total Progress</span>
              <span className="text-[#B6FF3B] font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-[#2A2C2E] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#B6FF3B] h-full transition-all duration-500 rounded-full shadow-sm shadow-[#B6FF3B]/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Coaching Advice */}
      {roadmap.ai_coaching_advice && (
        <div className="p-4 rounded-xl bg-[#B6FF3B]/5 border border-[#B6FF3B]/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#B6FF3B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#9CA3A1]">
            <span className="font-bold text-[#B6FF3B] block mb-0.5">AI Career Coach Advice</span>
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
                  ? 'bg-[#B6FF3B]/5 border-[#B6FF3B]/30'
                  : isExpanded
                  ? 'bg-[#101211] border-[#B6FF3B]/30 shadow-lg'
                  : 'bg-[#16181A] border-white/8 hover:border-white/15'
              }`}
            >
              {/* Stage Header */}
              <button
                onClick={() => setExpandedStage(isExpanded ? null : stage.stage_number)}
                className="w-full p-4 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      allCompleted
                        ? 'bg-[#B6FF3B]/20 border-[#B6FF3B]/40 text-[#B6FF3B]'
                        : 'bg-white/5 border-white/10 text-white shadow-xs'
                    }`}
                  >
                    {allCompleted ? <CheckCircle2 className="w-5 h-5 text-[#B6FF3B]" /> : getStageIcon(stage.stage_number)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{stage.stage_name}</span>
                      {allCompleted && (
                        <span className="text-[10px] bg-[#B6FF3B] text-[#0B0D0C] px-2 py-0.5 rounded-full font-bold">
                          Completed
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#9CA3A1] mt-0.5">{stage.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#9CA3A1] hidden sm:block">
                    {completedCount} / {stage.items.length} Tasks
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#9CA3A1]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9CA3A1]" />
                  )}
                </div>
              </button>

              {/* Items List */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/8 space-y-3 mt-2">
                  {stage.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                        item.completed
                          ? 'bg-[#101211]/80 border-white/5 text-[#6B7280]'
                          : 'bg-[#16181A] border-white/10 text-white hover:border-[#B6FF3B]/30 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleItem(item.id, item.completed)}
                          className="mt-0.5 text-[#6B7280] hover:text-[#B6FF3B] transition-colors"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#B6FF3B]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#6B7280] hover:text-[#B6FF3B]" />
                          )}
                        </button>
                        <div>
                          <p className={`font-bold ${item.completed ? 'line-through text-[#6B7280]' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <p className="text-[#9CA3A1] text-[11px] mt-0.5 leading-relaxed">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9CA3A1]">
                            <span>⏱️ ~{item.estimated_hours} Hours</span>
                            <span className="capitalize font-semibold text-[#B6FF3B]">Type: {item.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action trigger */}
                      {item.link_or_action && (
                        <div className="shrink-0">
                          {item.link_or_action.startsWith('/') ? (
                            <button
                              onClick={() => onNavigateTab && onNavigateTab(item.link_or_action!.substring(1))}
                              className="px-3.5 py-1.5 rounded-full bg-[#B6FF3B]/10 hover:bg-[#B6FF3B]/20 text-[#B6FF3B] text-[11px] font-bold border border-[#B6FF3B]/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <a
                              href={item.link_or_action}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 transition-all hover:border-white/20"
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


