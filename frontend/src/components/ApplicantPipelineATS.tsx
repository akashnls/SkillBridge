import React, { useState, useEffect } from 'react';
import { Application, Job } from '../types/index.js';
import { applicationsAPI, jobsAPI } from '../services/api.js';
import {
  Users,
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FolderGit2,
  ChevronRight,
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
    if (score >= 80) return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
    if (score >= 60) return 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300';
    return 'bg-amber-950/80 border-amber-500/50 text-amber-300';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Skill-First Applicant Tracking System (ATS)
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{t('ats_title')}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{t('ats_subtitle')}</p>
        </div>

        {onPostJobClick && (
          <button
            onClick={onPostJobClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_post_job')}</span>
          </button>
        )}
      </div>

      {/* Select Active Job & Filters */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Job:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 flex-1"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.total_applicants || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{applicants.length}</strong> candidates (sorted by verified Fit Score)
            </span>
          </div>

          {applicants.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 text-xs">
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
                      ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={app.candidate_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + app.candidate_name}
                      alt={app.candidate_name}
                      className="w-10 h-10 rounded-full bg-slate-800 ring-2 ring-purple-500/40 object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{app.candidate_name}</h4>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {app.candidate_location || 'India'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{app.candidate_headline}</p>

                      {/* Verified Badges Count & Practical Projects Indicator */}
                      <div className="flex items-center gap-3 mt-2 text-[11px]">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          <span>{app.earned_badges_count || 0} Verified Badges</span>
                        </span>
                        {app.portfolios && app.portfolios.length > 0 && (
                          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>{app.portfolios.length} Portfolio Projects</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Score & Stage Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className={`px-3 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 ${getScoreBadge(app.fit_score)}`}>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{app.fit_score}% AI Match</span>
                    </div>

                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
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
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-5 sticky top-20 shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedApplicant.candidate_name}</h3>
                  <p className="text-xs text-slate-400">{selectedApplicant.candidate_email}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${getScoreBadge(selectedApplicant.fit_score)}`}>
                  {selectedApplicant.fit_score}% Match
                </div>
              </div>

              {/* Status Stepper */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Update Candidate Stage
                </label>
                <select
                  value={selectedApplicant.status}
                  onChange={(e) => handleUpdateStatus(selectedApplicant.id, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                >
                  {stages.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Fit Breakdown */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 text-xs space-y-2">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Compatibility Diagnosis
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedApplicant.fit_score_breakdown?.ai_explanation || 'Candidate demonstrated verified competencies.'}
                </p>
              </div>

              {/* Verified Badges */}
              {selectedApplicant.badges && selectedApplicant.badges.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Micro-Credentials
                  </h4>
                  <div className="space-y-1.5">
                    {selectedApplicant.badges.map(b => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white">{b.skill_name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded">
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
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-cyan-400" /> Practical Project Proofs
                  </h4>
                  <div className="space-y-2">
                    {selectedApplicant.portfolios.map(p => (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                        <p className="font-bold text-cyan-300">{p.title}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          {p.github_url && (
                            <a
                              href={p.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              GitHub <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {p.live_demo_url && (
                            <a
                              href={p.live_demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center gap-1"
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
            <div className="bg-slate-900/50 rounded-3xl border border-slate-800/60 p-8 text-center text-slate-500 text-xs">
              Select an applicant from the list to view their verified credentials, portfolio proofs, and AI match diagnosis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
