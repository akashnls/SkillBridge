import React, { useState, useEffect } from 'react';
import { Application } from '../types/index.js';
import { applicationsAPI, jobsAPI } from '../services/api.js';
import {
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FolderGit2,
  Filter,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface ApplicantPipelineATSProps {
  onPostJobClick?: () => void;
}

export const ApplicantPipelineATS: React.FC<ApplicantPipelineATSProps> = ({ onPostJobClick }) => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadEmployerJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadApplicants(selectedJobId, statusFilter);
    }
  }, [selectedJobId, statusFilter]);

  const loadEmployerJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getMyPostedJobs();
      if (res.data.success && res.data.jobs.length > 0) {
        setJobs(res.data.jobs);
        setSelectedJobId(res.data.jobs[0].id);
      }
    } catch (e) {
      console.error('Failed to load employer jobs', e);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicants = async (jobId: string, status?: string) => {
    try {
      const res = await applicationsAPI.getJobApplicants(jobId, status);
      if (res.data.success) {
        setApplicants(res.data.applicants);
      }
    } catch (e) {
      console.error('Failed to load applicants', e);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await applicationsAPI.updateStatus(appId, newStatus);
      setApplicants(prev =>
        prev.map(a => (a.id === appId ? { ...a, status: newStatus as any } : a))
      );
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant(prev => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-[#B6FF3B]/10 border-[#B6FF3B]/40 text-[#B6FF3B]';
    if (score >= 60) return 'bg-amber-400/10 border-amber-400/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar - Dark Fintech style */}
      <div className="bg-[#16181A] rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
              Skill-First Applicant Tracking System (ATS)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">{t('ats_title')}</h2>
          <p className="text-xs text-[#9CA3A1] mt-1 max-w-xl leading-relaxed">{t('ats_subtitle')}</p>
        </div>

        {onPostJobClick && (
          <button
            onClick={onPostJobClick}
            className="px-5 py-2.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-lg shadow-[#B6FF3B]/20 flex items-center gap-2 shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_post_job')}</span>
          </button>
        )}
      </div>

      {/* Select Active Job & Filters */}
      <div className="bg-[#16181A] rounded-2xl border border-white/8 p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <span className="text-xs font-bold text-[#9CA3A1] uppercase tracking-wider">Select Job:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-[#101211] border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#B6FF3B] focus:ring-1 focus:ring-[#B6FF3B] flex-1"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.total_applicants || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#101211] border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#B6FF3B]"
          >
            <option value="">All Statuses</option>
            {stages.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ranked Candidates List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9CA3A1] px-1">
            <span>
              Showing <strong className="text-white">{applicants.length}</strong> candidates (sorted by verified Fit Score)
            </span>
          </div>

          {applicants.length === 0 ? (
            <div className="bg-[#16181A] rounded-2xl border border-white/8 p-12 text-center text-[#9CA3A1] text-xs shadow-xl">
              No applicants found for this position yet.
            </div>
          ) : (
            applicants.map((app) => {
              const isSelected = selectedApplicant?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplicant(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#101211] border-[#B6FF3B] shadow-lg shadow-[#B6FF3B]/5 ring-1 ring-[#B6FF3B]'
                      : 'bg-[#16181A] hover:bg-white/5 border-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={app.candidate_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + app.candidate_name}
                      alt={app.candidate_name}
                      className="w-10 h-10 rounded-full bg-white/10 ring-2 ring-[#B6FF3B]/30 object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{app.candidate_name}</h4>
                        <span className="text-[10px] bg-white/5 text-[#9CA3A1] px-2 py-0.5 rounded-full border border-white/10">
                          {app.candidate_location || 'India'}
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3A1] line-clamp-1 mt-0.5">{app.candidate_headline}</p>

                      {/* Verified Badges Count & Practical Projects Indicator */}
                      <div className="flex items-center gap-3 mt-2 text-[11px]">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          <span>{app.earned_badges_count || 0} Verified Badges</span>
                        </span>
                        {app.portfolios && app.portfolios.length > 0 && (
                          <span className="flex items-center gap-1 text-[#B6FF3B] font-semibold">
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>{app.portfolios.length} Portfolio Projects</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Score & Stage Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${getScoreBadge(app.fit_score)}`}>
                      <Sparkles className="w-3 h-3 text-[#B6FF3B]" />
                      <span>{app.fit_score}% AI Match</span>
                    </div>

                    <span className="text-[11px] px-3 py-0.5 rounded-full font-bold bg-white/5 text-white border border-white/10">
                      {app.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Candidate Deep-Dive Inspector */}
        <div className="lg:col-span-1">
          {selectedApplicant ? (
            <div className="bg-[#16181A] rounded-3xl border border-white/10 p-5 space-y-5 sticky top-20 shadow-2xl">
              <div className="flex items-start justify-between border-b border-white/8 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedApplicant.candidate_name}</h3>
                  <p className="text-xs text-[#9CA3A1]">{selectedApplicant.candidate_email}</p>
                </div>
                <div className={`px-3 py-1 rounded-full border text-xs font-black ${getScoreBadge(selectedApplicant.fit_score)}`}>
                  {selectedApplicant.fit_score}% Match
                </div>
              </div>

              {/* Status Stepper */}
              <div>
                <label className="block text-xs font-bold text-[#9CA3A1] uppercase tracking-wider mb-2">
                  Update Candidate Stage
                </label>
                <select
                  value={selectedApplicant.status}
                  onChange={(e) => handleUpdateStatus(selectedApplicant.id, e.target.value)}
                  className="w-full bg-[#101211] border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-[#B6FF3B] font-bold"
                >
                  {stages.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Fit Breakdown */}
              <div className="bg-[#101211] p-3.5 rounded-2xl border border-white/8 text-xs space-y-2">
                <span className="font-bold text-[#B6FF3B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B6FF3B]" /> AI Compatibility Diagnosis
                </span>
                <p className="text-[#9CA3A1] text-[11px] leading-relaxed">
                  {selectedApplicant.fit_score_breakdown?.ai_explanation || 'Candidate demonstrated verified competencies.'}
                </p>
              </div>

              {/* Verified Badges */}
              {selectedApplicant.badges && selectedApplicant.badges.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#9CA3A1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#B6FF3B]" /> Verified Micro-Credentials
                  </h4>
                  <div className="space-y-1.5">
                    {selectedApplicant.badges.map(b => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-xl bg-[#B6FF3B]/5 border border-[#B6FF3B]/20 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white">{b.skill_name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#B6FF3B] bg-[#B6FF3B]/10 px-2 py-0.5 rounded-full">
                          {b.score_percentage}% Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Portfolio Projects */}
              {selectedApplicant.portfolios && selectedApplicant.portfolios.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#9CA3A1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-[#B6FF3B]" /> Practical Project Proofs
                  </h4>
                  <div className="space-y-2">
                    {selectedApplicant.portfolios.map(p => (
                      <div key={p.id} className="p-3 rounded-xl bg-[#101211] border border-white/8 text-xs">
                        <p className="font-bold text-white">{p.title}</p>
                        <p className="text-[#9CA3A1] text-[11px] mt-0.5 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          {p.github_url && (
                            <a
                              href={p.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#B6FF3B] hover:underline flex items-center gap-1"
                            >
                              GitHub <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {p.live_demo_url && (
                            <a
                              href={p.live_demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#B6FF3B] hover:underline flex items-center gap-1 font-medium"
                            >
                              Live Demo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#16181A] rounded-3xl border border-white/8 p-8 text-center text-[#9CA3A1] text-xs shadow-xl">
              Select an applicant from the list to view their verified credentials, portfolio proofs, and AI match diagnosis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


