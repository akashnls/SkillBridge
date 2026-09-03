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
      ? 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40'
      : score >= 60
      ? 'text-indigo-400 border-indigo-500/50 bg-indigo-950/40'
      : 'text-amber-400 border-amber-500/50 bg-amber-950/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Explainable AI Job-Fit
              </span>
              <span className="text-xs text-slate-400">• {companyName}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{jobTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${scoreColor}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Computed Compatibility Score</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black">{score}%</span>
                <span className="text-xs font-medium">({fitData.confidence_level} Confidence)</span>
              </div>
            </div>
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center gap-1.5 justify-end text-emerald-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>+{fitData.verified_badge_bonus}% Verified Badge Bonus</span>
              </div>
              {fitData.practical_portfolio_bonus > 0 && (
                <div className="flex items-center gap-1.5 justify-end text-cyan-300 font-medium">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>+{fitData.practical_portfolio_bonus}% Practical Portfolio Proof</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Narrative Breakdown */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Compatibility Diagnosis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{fitData.ai_explanation}</p>
          </div>

          {/* Matched Skills */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Matched Skills ({fitData.matched_skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {fitData.matched_skills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                    skill.is_verified
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 shadow-sm shadow-emerald-950'
                      : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  {skill.is_verified ? (
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{skill.name}</span>
                  {skill.is_verified && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
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
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Competencies ({fitData.missing_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {fitData.missing_skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                      skill.importance === 'required'
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
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
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-cyan-400" /> Practical Portfolio Proofs
              </h4>
              <div className="space-y-2">
                {fitData.portfolio_evidence.map((port, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs">
                    <p className="font-semibold text-cyan-300">{port.project_title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Demonstrates applied usage of: {port.matched_skills.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onGenerateRoadmap();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('btn_generate_roadmap')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              disabled={hasApplied}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                hasApplied
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
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
