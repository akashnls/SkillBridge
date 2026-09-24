import React, { useState, useEffect } from 'react';
import { recruiterAPI, applicationsAPI } from '../../services/api.js';
import { useRouter } from '../../context/RouterContext.js';
import {
  Briefcase,
  Users,
  CheckCircle,
  Calendar,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  Eye,
  XCircle,
  UserCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

export const RecruiterDashboardView: React.FC = () => {
  const { navigate } = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getDashboard();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (appId: string, candidateName: string) => {
    try {
      await recruiterAPI.shortlistCandidate(appId);
      setActionMessage(`Candidate ${candidateName} moved to Shortlisted!`);
      setTimeout(() => setActionMessage(null), 3000);
      loadDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await applicationsAPI.updateStatus(appId, 'Rejected');
      setActionMessage('Application marked as Rejected.');
      setTimeout(() => setActionMessage(null), 3000);
      loadDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#9a8e7a] text-xs animate-pulse">
        Loading real-time recruitment metrics from database...
      </div>
    );
  }

  const stats = data?.stats || {
    total_jobs: 0,
    active_jobs: 0,
    applications: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="p-3 rounded-2xl bg-[#4a5e2f]/20 border border-[#4a5e2f]/40 text-[#4a5e2f] text-xs flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-[#9a8e7a] hover:text-[#f0ebe0] text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#2c2a1e]/80 via-[#2c2a1e] to-[#2c2a1e]/80 border border-[#4a5e2f]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#4a5e2f]/30 text-[#4a5e2f] border border-[#4a5e2f]/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Recruitment Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#f0ebe0] tracking-tight">Recruiter Command Center</h1>
          <p className="text-xs text-[#9a8e7a] mt-1 max-w-xl">
            Real-time candidate metrics, deterministic SkillBridge match scores, and interview pipelines retrieved directly from the database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/recruiter/jobs/create')}
            className="px-4 py-2.5 rounded-xl bg-[#4a5e2f] hover:bg-[#3b4d25] text-[#f0ebe0] text-xs font-bold shadow-lg shadow-[#4a5e2f]/30 transition-all flex items-center gap-2"
          >
            <span>Post New Opening</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/recruiter/candidates')}
            className="px-4 py-2.5 rounded-xl bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] border border-[#4a4636] text-xs font-bold transition-all"
          >
            Find Candidates
          </button>
        </div>
      </div>

      {/* Statistics Cards (Real Database Counts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#9a8e7a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Jobs</span>
            <Briefcase className="w-4 h-4 text-[#4a5e2f]" />
          </div>
          <p className="text-2xl font-black text-[#f0ebe0]">{stats.total_jobs}</p>
          <span className="text-[10px] text-[#9a8e7a]">Created openings</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#9a8e7a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Jobs</span>
            <span className="w-2 h-2 rounded-full bg-[#3d6b35] animate-pulse" />
          </div>
          <p className="text-2xl font-black text-[#3d6b35]">{stats.active_jobs}</p>
          <span className="text-[10px] text-[#9a8e7a]">Open to applications</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#9a8e7a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Applications</span>
            <Users className="w-4 h-4 text-[#6b7f47]" />
          </div>
          <p className="text-2xl font-black text-[#6b7f47]">{stats.applications}</p>
          <span className="text-[10px] text-[#9a8e7a]">Total received</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#9a8e7a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Shortlisted</span>
            <Award className="w-4 h-4 text-[#b45309]" />
          </div>
          <p className="text-2xl font-black text-[#b45309]">{stats.shortlisted}</p>
          <span className="text-[10px] text-[#9a8e7a]">Qualified talent</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#9a8e7a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Interviews</span>
            <Calendar className="w-4 h-4 text-[#6b7f47]" />
          </div>
          <p className="text-2xl font-black text-[#6b7f47]">{stats.interviews}</p>
          <span className="text-[10px] text-[#9a8e7a]">Scheduled rounds</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#9a8e7a]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hired</span>
            <CheckCircle className="w-4 h-4 text-[#3d6b35]" />
          </div>
          <p className="text-2xl font-black text-[#3d6b35]">{stats.hired}</p>
          <span className="text-[10px] text-[#9a8e7a]">Offers accepted</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4a5e2f]" />
                <span>Recent Candidate Applications</span>
              </h2>
              <p className="text-xs text-[#9a8e7a]">Latest submissions evaluated against required & preferred competencies</p>
            </div>
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="text-xs font-semibold text-[#4a5e2f] hover:text-[#4a5e2f] flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(!data?.recent_applications || data.recent_applications.length === 0) ? (
              <div className="p-8 rounded-2xl bg-[#f5f0e8]/40 border border-[#4a4636]/80 text-center text-[#9a8e7a] text-xs">
                No candidate applications received yet. Once job seekers apply, they will appear here with transparent match scores.
              </div>
            ) : (
              data.recent_applications.map((app: any) => {
                const score = app.match_percentage ?? Math.round(app.fit_score || 75);
                const scoreBadgeColor =
                  score >= 80
                    ? 'bg-[#3d6b35]/20 text-[#3d6b35] border-[#3d6b35]/30'
                    : score >= 60
                    ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border-[#4a5e2f]/30'
                    : 'bg-[#fde9c0]/20 text-[#b45309] border-[#b45309]/30';

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] hover:border-[#4a4636] transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.candidate_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + app.candidate_name}
                          alt={app.candidate_name}
                          className="w-10 h-10 rounded-xl bg-[#3a3828] ring-1 ring-[#4a4636] object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#f0ebe0]">{app.candidate_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${scoreBadgeColor}`}>
                              {score}% Match
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#3a3828] text-[#b5aa96]">
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#9a8e7a] mt-0.5">
                            Applied for <span className="text-[#4a5e2f] font-semibold">{app.job_title}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs text-[#9a8e7a]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Candidate Skills tags */}
                    {app.candidate_skills && app.candidate_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-[#9a8e7a]">Skills:</span>
                        {app.candidate_skills.slice(0, 5).map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg bg-[#3a3828]/80 text-[#b5aa96] text-[11px] border border-[#4a4636]/60"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.candidate_skills.length > 5 && (
                          <span className="text-[11px] text-[#9a8e7a]">+{app.candidate_skills.length - 5} more</span>
                        )}
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="pt-2 border-t border-[#4a4636]/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => navigate(`/recruiter/candidates/${app.user_id}`)}
                        className="px-3 py-1.5 rounded-xl bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {app.status !== 'Shortlisted' && (
                          <button
                            onClick={() => handleShortlist(app.id, app.candidate_name)}
                            className="px-3 py-1.5 rounded-xl bg-[#fde9c0]/20 hover:bg-[#fde9c0]/30 text-[#b45309] border border-[#b45309]/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Shortlist</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/recruiter/interviews?candidate=${app.user_id}&job=${app.job_id}&app=${app.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-[#4a5e2f] hover:bg-[#3b4d25] text-[#f0ebe0] text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Interview</span>
                        </button>

                        {app.status !== 'Rejected' && (
                          <button
                            onClick={() => handleReject(app.id)}
                            className="px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 text-[#9a8e7a] hover:text-rose-300 text-xs font-semibold transition-colors"
                            title="Reject Candidate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Job Performance Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3d6b35]" />
              <span>Job Performance</span>
            </h2>
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="text-xs font-semibold text-[#4a5e2f] hover:text-[#4a5e2f] flex items-center gap-1"
            >
              <span>Manage Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(!data?.job_performance || data.job_performance.length === 0) ? (
              <div className="p-8 rounded-2xl bg-[#f5f0e8]/40 border border-[#4a4636]/80 text-center text-[#9a8e7a] text-xs">
                No jobs posted yet. Click "Post Job" to list your first vacancy and attract verified talent.
              </div>
            ) : (
              data.job_performance.map((job: any) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/recruiter/applications?job=${job.id}`)}
                  className="p-4 rounded-2xl bg-[#f5f0e8]/60 border border-[#4a4636] hover:border-[#4a5e2f]/50 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#f0ebe0] group-hover:text-[#4a5e2f] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.status === 'open' || job.status === 'active'
                            ? 'bg-[#3d6b35]/20 text-[#3d6b35] border border-[#3d6b35]/30'
                            : 'bg-[#3a3828] text-[#9a8e7a]'
                        }`}>
                          {job.status.toUpperCase()}
                        </span>
                        {job.moderation_status !== 'approved' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fde9c0]/20 text-[#b45309] border border-[#b45309]/30">
                            Mod: {job.moderation_status}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#9a8e7a] group-hover:text-[#4a5e2f] transition-colors" />
                  </div>

                  {/* Performance stats row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#4a4636]/80 text-center">
                    <div className="p-2 rounded-xl bg-[#f5f0e8]/80">
                      <p className="text-xs text-[#9a8e7a]">Applications</p>
                      <p className="text-sm font-bold text-[#f0ebe0] mt-0.5">{job.total_applications}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#f5f0e8]/80">
                      <p className="text-xs text-[#9a8e7a]">Shortlisted</p>
                      <p className="text-sm font-bold text-[#b45309] mt-0.5">{job.shortlisted_count}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#f5f0e8]/80">
                      <p className="text-xs text-[#9a8e7a]">Interviews</p>
                      <p className="text-sm font-bold text-[#6b7f47] mt-0.5">{job.interviews_count}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


