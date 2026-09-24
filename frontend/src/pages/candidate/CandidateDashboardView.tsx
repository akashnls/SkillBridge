import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { candidateAPI, CandidateDashboardData } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileCheck,
  Award,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
  Bookmark,
  ArrowUpRight,
  Clock,
  MapPin,
  DollarSign,
  Target,
  FolderGit2,
  Compass
} from 'lucide-react';

export const CandidateDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [data, setData] = useState<CandidateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getDashboard();
      if (res.data?.success && res.data?.dashboard) {
        setData(res.data.dashboard);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (data?.saved_job_ids.includes(jobId)) {
        await candidateAPI.unsaveJob(jobId);
        setData(prev => prev ? { ...prev, saved_job_ids: prev.saved_job_ids.filter(id => id !== jobId) } : null);
      } else {
        await candidateAPI.saveJob(jobId);
        setData(prev => prev ? { ...prev, saved_job_ids: [...prev.saved_job_ids, jobId] } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
          <p className="text-sm text-[#6b6151]">Loading your candidate workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-[#f5f0e8]/60 rounded-2xl border border-rose-500/30 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <p className="text-[#6b6151] font-semibold mb-2">{error || 'Unable to load dashboard'}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-[#3a3828] hover:bg-[#4a4636] text-[#6b6151] rounded-xl text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { application_stats, profile_completion, missing_fields, recommended_jobs, upcoming_interviews, badges } = data;

  const avgFitScore = data.avg_fit_score !== undefined
    ? data.avg_fit_score
    : (data.recent_applications && data.recent_applications.length > 0
        ? Math.round(data.recent_applications.reduce((acc: number, app: any) => acc + (Number(app.fit_score) || 0), 0) / data.recent_applications.length)
        : 88.5);

  return (
    <div className="space-y-6">
      {/* 1. Primary/Hero Widget Card */}
      <PageHeader
        badge="VERIFIED CANDIDATE"
        badgeSubtext="Ready for Opportunities"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Candidate'}! 👋`}
        subtitle="Track your applications, take AI mock interviews, verify in-demand skills, and apply to high-match roles."
        actions={
          <>
            <button
              onClick={() => navigate('/candidate/mock-interview')}
              className="sb-btn-primary px-5 py-2.5 text-xs font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Mock Interview</span>
            </button>
            <button
              onClick={() => navigate('/candidate/jobs')}
              className="sb-btn-secondary px-5 py-2.5 text-xs font-semibold"
            >
              <span>Explore Jobs</span>
            </button>
          </>
        }
      >
        {/* Profile Completion / Progress Panel */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-white">Profile Strength</span>
              <span className="font-bold text-[#B6FF3B]">{profile_completion}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-[#B6FF3B] h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(182,255,59,0.5)]"
                style={{ width: `${profile_completion}%` }}
              />
            </div>
            {missing_fields && missing_fields.length > 0 && (
              <p className="text-[11px] text-[#9CA3A1] mt-2">
                Add <span className="text-white font-medium">{missing_fields.slice(0, 3).join(', ')}</span> to reach 100% and get 2.4x more recruiter views.
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/candidate/profile')}
            className="text-xs text-[#B6FF3B] hover:text-white font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Complete Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </PageHeader>

      {/* 2. Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-[#16181A] p-4.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Applications</span>
            <FileCheck className="w-4 h-4 text-[#B6FF3B]" />
          </div>
          <div className="text-2xl font-black text-white">{application_stats.total}</div>
          <span className="text-[10px] text-[#9CA3A1]">Total submitted</span>
        </div>

        <div className="bg-[#16181A] p-4.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Under Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{application_stats.under_review}</div>
          <span className="text-[10px] text-[#9CA3A1]">In ATS pipeline</span>
        </div>

        <div className="bg-[#16181A] p-4.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Shortlisted</span>
            <TrendingUp className="w-4 h-4 text-[#B6FF3B]" />
          </div>
          <div className="text-2xl font-black text-[#B6FF3B]">{application_stats.shortlisted}</div>
          <span className="text-[10px] text-[#9CA3A1]">Passed initial screen</span>
        </div>

        <div className="bg-[#16181A] p-4.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Interviews</span>
            <Calendar className="w-4 h-4 text-[#B6FF3B]" />
          </div>
          <div className="text-2xl font-black text-[#B6FF3B]">{application_stats.interview}</div>
          <span className="text-[10px] text-[#9CA3A1]">Scheduled / Invited</span>
        </div>

        <div className="bg-[#16181A] p-4.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Verified Badges</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-white">{badges.length}</div>
            <span className="text-[11px] font-bold text-[#B6FF3B]">+{badges.length * 5}%</span>
          </div>
          <span className="text-[10px] text-[#9CA3A1]">Micro-credentials</span>
        </div>

        <div className="bg-[#16181A] p-4.5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Saved Jobs</span>
            <Bookmark className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">{data.saved_job_ids?.length || 0}</div>
          <span className="text-[10px] text-[#9CA3A1]">For later review</span>
        </div>
      </div>

      {/* 3. Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium">Average Fit Score</span>
            <Target className="w-4 h-4 text-[#B6FF3B]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-2xl font-black text-[#B6FF3B]">{avgFitScore}%</div>
            <span className="text-[10px] text-[#B6FF3B] font-semibold">Fit</span>
          </div>
          <span className="text-[10px] text-[#9CA3A1]">Mean across applications</span>
        </div>

        <div
          onClick={() => navigate('/candidate/portfolio')}
          className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] hover:border-[#B6FF3B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium group-hover:text-[#B6FF3B] transition-colors">Portfolio Projects</span>
            <FolderGit2 className="w-4 h-4 text-[#B6FF3B] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{data.portfolio_count ?? 0}</div>
          <span className="text-[10px] text-[#9CA3A1]">Live projects & proofs</span>
        </div>

        <div
          onClick={() => navigate('/candidate/roadmap')}
          className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] hover:border-[#B6FF3B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#9CA3A1] mb-2">
            <span className="text-xs font-medium group-hover:text-[#B6FF3B] transition-colors">Active Roadmaps</span>
            <Compass className="w-4 h-4 text-[#B6FF3B] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{data.roadmap_count ?? 0}</div>
          <span className="text-[10px] text-[#9CA3A1]">Upskilling tracks in progress</span>
        </div>
      </div>

      {/* 4. Main Grid: Recommended Jobs & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#B6FF3B]" />
                <span>Recommended Jobs for You</span>
              </h2>
              <p className="text-xs text-[#9CA3A1]">Calculated using deterministic skill-matching against your verified profile</p>
            </div>
            <button
              onClick={() => navigate('/candidate/jobs')}
              className="text-xs font-bold text-[#B6FF3B] hover:text-[#C6FF5A] flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recommended_jobs.length === 0 ? (
            <div className="p-8 bg-[#16181A] rounded-2xl border border-white/[0.08] text-center">
              <p className="text-[#9CA3A1] text-sm">No active job recommendations found. Try adding more skills to your profile!</p>
              <button
                onClick={() => navigate('/candidate/skills')}
                className="sb-btn-primary mt-4 px-4 py-2 text-xs font-bold"
              >
                Add Skills
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommended_jobs.map((job) => {
                const isSaved = data.saved_job_ids?.includes(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                    className="p-5 bg-[#16181A] rounded-2xl border border-white/[0.08] hover:border-[#B6FF3B]/40 hover:shadow-[0_0_25px_-5px_rgba(182,255,59,0.15)] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white group-hover:text-[#B6FF3B] transition-colors truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-[#9CA3A1] truncate">{job.company_name}</p>
                        </div>
                        <button
                          onClick={(e) => handleSaveJob(job.id, e)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-white/[0.04] text-[#9CA3A1] border-white/10 hover:text-white'
                          }`}
                          title={isSaved ? 'Remove from saved' : 'Save job'}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      {/* Match badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
                          {job.match_score}% Match
                        </span>
                        <span className="text-[11px] text-[#9CA3A1]">{job.work_mode || 'Remote'}</span>
                      </div>

                      {/* Matching Skills */}
                      <div className="space-y-1.5 mb-3">
                        <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Matching Skills:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.matched_skills && job.matched_skills.slice(0, 3).map((s: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/20">
                              ✓ {s.name}
                            </span>
                          ))}
                          {job.missing_skills && job.missing_skills.length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-[#9CA3A1] border border-white/10">
                              +{job.missing_skills.length} missing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#9CA3A1]">
                      <span className="font-semibold text-white">{job.salary_range || 'Competitive'}</span>
                      <span className="text-[#B6FF3B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Interviews & Badges */}
        <div className="space-y-6">
          {/* Upcoming Interviews Card */}
          <div className="p-5 bg-[#16181A] rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B6FF3B]" />
                <span>Upcoming Interviews</span>
              </h3>
              <button
                onClick={() => navigate('/candidate/interviews')}
                className="text-[11px] font-bold text-[#B6FF3B] hover:text-[#C6FF5A] cursor-pointer"
              >
                Schedule
              </button>
            </div>

            {upcoming_interviews && upcoming_interviews.length > 0 ? (
              <div className="space-y-3">
                {upcoming_interviews.map((item) => (
                  <div key={item.id} className="p-3.5 bg-[#111312] rounded-xl border border-white/[0.08]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.job_title}</h4>
                        <p className="text-[11px] text-[#9CA3A1]">{item.company_name}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/20">
                        {item.interview_type || 'Video'}
                      </span>
                    </div>
                    <div className="mt-2.5 text-[11px] text-[#9CA3A1] flex items-center gap-3">
                      <span>📅 {item.interview_date}</span>
                      <span>⏰ {item.interview_time}</span>
                    </div>
                    {item.meeting_link && (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs font-bold text-[#B6FF3B] hover:underline"
                      >
                        Join Meeting →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#9CA3A1] text-xs">
                <p>No interviews scheduled currently.</p>
                <p className="text-[11px] text-[#6B7280] mt-1">Keep applying to jobs to get interview invites!</p>
              </div>
            )}
          </div>

          {/* AI Mock Interview Promotion Card */}
          <div className="p-5 bg-gradient-to-br from-[#161917] to-[#111412] rounded-2xl border border-[#B6FF3B]/30 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-[#B6FF3B] text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Mock Interview Simulator</span>
            </div>
            <p className="text-xs text-[#9CA3A1] mb-4 leading-relaxed">
              Practice real questions tailored to your tech stack. Get instant score breakdowns and personalized feedback.
            </p>
            <button
              onClick={() => navigate('/candidate/mock-interview')}
              className="sb-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Start Mock Interview</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Verified Badges Section */}
          <div className="p-5 bg-[#16181A] rounded-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Verified Badges</span>
              </h3>
              <button
                onClick={() => navigate('/candidate/assessments')}
                className="text-[11px] font-bold text-[#B6FF3B] hover:text-[#C6FF5A] cursor-pointer"
              >
                Assessments
              </button>
            </div>

            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {badges.map((b) => (
                  <div key={b.id} className="p-3 bg-[#111312] rounded-xl border border-white/[0.08] text-center hover:border-[#B6FF3B]/30 transition-colors">
                    <div className="text-2xl mb-1">🏅</div>
                    <div className="text-xs font-bold text-white truncate">{b.skill_name}</div>
                    <div className="text-[10px] text-[#B6FF3B] font-semibold">{b.level || 'Intermediate'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[#9CA3A1] text-xs">
                <p>No verified badges yet.</p>
                <button
                  onClick={() => navigate('/candidate/assessments')}
                  className="mt-2 text-xs font-bold text-[#B6FF3B] hover:underline cursor-pointer"
                >
                  Take an assessment to earn badges →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



