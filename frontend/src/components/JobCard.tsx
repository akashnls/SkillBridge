import React, { useState } from 'react';
import { Job, JobFitExplanation } from '../types/index.js';
import {
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { jobsAPI, applicationsAPI, roadmapAPI } from '../services/api.js';
import { JobFitExplanationModal } from './JobFitExplanationModal.js';

interface JobCardProps {
  job: Job;
  onAppliedSuccess?: () => void;
  onNavigateToRoadmap?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onAppliedSuccess, onNavigateToRoadmap }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<JobFitExplanation | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fitScore = job.user_fit_score;

  const scoreColor =
    fitScore && fitScore >= 80
      ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'
      : fitScore && fitScore >= 60
      ? 'border-indigo-500/50 bg-indigo-950/30 text-indigo-400'
      : 'border-amber-500/50 bg-amber-950/30 text-amber-400';

  const handleOpenExplanation = async () => {
    if (!user) return;
    setLoadingExplanation(true);
    try {
      const res = await jobsAPI.getMatchExplanation(job.id);
      if (res.data.success) {
        setExplanationData(res.data.match);
        setModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to get match explanation', e);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    try {
      const res = await applicationsAPI.apply(job.id, 'Applied directly via SkillBridge AI-verified profile');
      if (res.data.success) {
        setHasApplied(true);
        setFeedbackMsg('Application submitted with verified score!');
        setTimeout(() => setFeedbackMsg(null), 4000);
        if (onAppliedSuccess) onAppliedSuccess();
      }
    } catch (e: any) {
      setFeedbackMsg(e.response?.data?.message || 'Application already submitted.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      await roadmapAPI.generateRoadmap(job.title, job.id);
      if (onNavigateToRoadmap) onNavigateToRoadmap();
    } catch (e) {
      console.error('Failed to generate roadmap', e);
    }
  };

  return (
    <>
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-indigo-950/20 flex flex-col justify-between relative group">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">{job.company_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {job.location}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {job.title}
              </h3>
            </div>

            {/* AI Fit Score Badge */}
            {user && user.role === 'job_seeker' && fitScore !== null && fitScore !== undefined && (
              <button
                onClick={handleOpenExplanation}
                title="Click to view explainable AI match breakdown"
                className={`flex flex-col items-center px-3 py-1.5 rounded-xl border font-bold transition-transform hover:scale-105 ${scoreColor}`}
              >
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-80">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Job-Fit</span>
                </div>
                <span className="text-lg font-black">{fitScore}%</span>
              </button>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>

          {/* Key Skill Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.map((req, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700/80"
                >
                  {req.skill}
                </span>
              ))}
              {job.preferred_skills.slice(0, 2).map((pref, idx) => (
                <span
                  key={`p-${idx}`}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/40 text-slate-400 border border-slate-800"
                >
                  +{pref}
                </span>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
            <span className="font-semibold text-emerald-400">{job.salary_range}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {job.job_type}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
              {job.experience_level}
            </span>
          </div>

          {feedbackMsg && (
            <div className="mb-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {user && user.role === 'job_seeker' && (
            <button
              onClick={handleOpenExplanation}
              disabled={loadingExplanation}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{loadingExplanation ? 'Analyzing...' : t('btn_explain_match')}</span>
            </button>
          )}

          {user && user.role === 'job_seeker' && (
            <button
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                hasApplied
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              }`}
            >
              <span>{hasApplied ? t('btn_already_applied') : t('btn_apply_now')}</span>
              {!hasApplied && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {!user && (
            <button
              onClick={handleOpenExplanation}
              className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25"
            >
              <span>Log in to compute AI Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {explanationData && (
        <JobFitExplanationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          jobTitle={job.title}
          companyName={job.company_name}
          fitData={explanationData}
          onGenerateRoadmap={handleGenerateRoadmap}
          onApply={handleApply}
          hasApplied={hasApplied}
        />
      )}
    </>
  );
};
