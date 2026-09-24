import React, { useState } from 'react';
import { Job, JobFitExplanation } from '../types/index.js';
import {
  Building2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useRouter } from '../context/RouterContext.js';
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
  const { navigate } = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<JobFitExplanation | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fitScore = job.user_fit_score;

  const scoreColor =
    fitScore && fitScore >= 80
      ? 'border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]'
      : fitScore && fitScore >= 60
      ? 'border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]'
      : 'border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]';

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
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--accent-secondary)] transition-all hover:shadow-lg flex flex-col justify-between relative group">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                <Building2 className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                <span className="font-semibold text-[var(--text-primary)]">{job.company_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[var(--text-secondary)]" />
                  {job.location}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                {job.title}
              </h3>
            </div>

            {/* AI Fit Score Badge */}
            {user && user.role === 'job_seeker' && fitScore !== null && fitScore !== undefined && (
              <button
                onClick={handleOpenExplanation}
                title="Click to view explainable AI match breakdown"
                className={`flex flex-col items-center px-3 py-1.5 rounded-xl border font-bold transition-transform hover:scale-105 shadow-xs cursor-pointer ${scoreColor}`}
              >
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-90">
                  <Sparkles className="w-3 h-3" />
                  <span>Job-Fit</span>
                </div>
                <span className="text-lg font-black">{fitScore}%</span>
              </button>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>

          {/* Key Skill Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.map((req, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]"
                >
                  {req.skill}
                </span>
              ))}
              {job.preferred_skills.slice(0, 2).map((pref, idx) => (
                <span
                  key={`p-${idx}`}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg)]/60 text-[var(--text-secondary)] border border-[var(--border)]"
                >
                  +{pref}
                </span>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[var(--text-secondary)] border-t border-[var(--border)] pt-3 mb-4">
            <span className="font-bold text-[var(--accent-secondary)]">{job.salary_range}</span>
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              {job.job_type}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--bg)] text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border)]">
              {job.experience_level}
            </span>
          </div>

          {feedbackMsg && (
            <div className="mb-3 text-xs text-[var(--success)] bg-[var(--success)]/10 border border-[var(--success)]/30 p-2.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
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
              className="flex-1 px-3 py-2 rounded-full bg-[var(--bg)] hover:bg-[var(--border)]/30 text-[var(--text-primary)] text-xs font-semibold border border-[var(--border)] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span>{loadingExplanation ? 'Analyzing...' : t('btn_explain_match')}</span>
            </button>
          )}

          {user && user.role === 'job_seeker' && (
            <button
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                hasApplied
                  ? 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)] cursor-not-allowed'
                  : 'sb-btn-primary shadow-[0_0_15px_rgba(182,255,59,0.3)]'
              }`}
            >
              <span>{hasApplied ? t('btn_already_applied') : t('btn_apply_now')}</span>
              {!hasApplied && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="sb-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(182,255,59,0.3)]"
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
