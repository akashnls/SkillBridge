import React from 'react';
import { JobFitExplanation } from '../types/index.js';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FolderGit2,
  TrendingUp,
  ArrowRight,
  Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface JobFitExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  fitData: JobFitExplanation;
  onGenerateRoadmap: () => void;
  onApply: () => void;
  hasApplied?: boolean;
}

export const JobFitExplanationModal: React.FC<JobFitExplanationModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  fitData,
  onGenerateRoadmap,
  onApply,
  hasApplied
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const score = fitData.overall_percentage;
  const scoreColor =
    score >= 80
      ? 'text-[#B6FF3B] border-[#B6FF3B]/30 bg-[#B6FF3B]/10'
      : score >= 60
      ? 'text-[#B6FF3B] border-[#B6FF3B]/20 bg-[#B6FF3B]/5'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#16181A] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-start justify-between bg-[#121412]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B6FF3B]" /> Explainable AI Job-Fit
              </span>
              <span className="text-xs text-[#9CA3A1]">• {companyName}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{jobTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${scoreColor}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Computed Compatibility Score</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black">{score}%</span>
                <span className="text-xs font-medium">({fitData.confidence_level} Confidence)</span>
              </div>
            </div>
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center gap-1.5 justify-end text-[#B6FF3B] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>+{fitData.verified_badge_bonus}% Verified Badge Bonus</span>
              </div>
              {fitData.practical_portfolio_bonus > 0 && (
                <div className="flex items-center gap-1.5 justify-end text-[#B6FF3B] font-semibold">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>+{fitData.practical_portfolio_bonus}% Practical Portfolio Proof</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Narrative Breakdown */}
          <div className="bg-[#111312] p-4 rounded-xl border border-white/[0.08]">
            <h4 className="text-xs font-bold text-[#B6FF3B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B6FF3B]" /> AI Compatibility Diagnosis
            </h4>
            <p className="text-xs text-[#9CA3A1] leading-relaxed">{fitData.ai_explanation}</p>
          </div>

          {/* Matched Skills */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#B6FF3B]" /> Matched Skills ({fitData.matched_skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {fitData.matched_skills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    skill.is_verified
                      ? 'bg-[#B6FF3B]/10 border-[#B6FF3B]/30 text-[#B6FF3B]'
                      : 'bg-white/[0.04] border-white/10 text-[#9CA3A1]'
                  }`}
                >
                  {skill.is_verified ? (
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-[#9CA3A1]" />
                  )}
                  <span>{skill.name}</span>
                  {skill.is_verified && (
                    <span className="text-[10px] bg-[#B6FF3B]/20 text-[#B6FF3B] px-1.5 py-0.5 rounded font-bold">
                      {skill.score}% Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          {fitData.missing_skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Competencies ({fitData.missing_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {fitData.missing_skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                      skill.importance === 'required'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] uppercase font-bold opacity-75">
                      ({skill.importance})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Portfolio Evidence */}
          {fitData.portfolio_evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-[#B6FF3B]" /> Practical Portfolio Proofs
              </h4>
              <div className="space-y-2">
                {fitData.portfolio_evidence.map((port, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#111312] border border-white/[0.08] text-xs">
                    <p className="font-semibold text-white">{port.project_title}</p>
                    <p className="text-[#9CA3A1] text-[11px] mt-0.5">
                      Demonstrates applied usage of: {port.matched_skills.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-[#121412] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onGenerateRoadmap();
              onClose();
            }}
            className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-[#B6FF3B]" />
            <span>{t('btn_generate_roadmap')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white border border-white/10 text-xs font-semibold transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              disabled={hasApplied}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                hasApplied
                  ? 'bg-white/[0.04] text-[#6B7280] border border-white/10 cursor-not-allowed'
                  : 'sb-btn-primary shadow-[0_0_15px_rgba(182,255,59,0.3)]'
              }`}
            >
              <span>{hasApplied ? t('btn_already_applied') : t('btn_apply_now')}</span>
              {!hasApplied && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


