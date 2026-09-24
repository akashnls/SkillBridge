import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { jobsAPI, candidateAPI, applicationsAPI, Job, JobFitExplanation, CandidateResumeItem } from '../../services/api.js';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';

interface CandidateJobDetailViewProps {
  jobId: string;
}

export const CandidateJobDetailView: React.FC<CandidateJobDetailViewProps> = ({ jobId }) => {
  const { navigate } = useRouter();
  const [job, setJob] = useState<any | null>(null);
  const [fit, setFit] = useState<JobFitExplanation | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [resumes, setResumes] = useState<CandidateResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const [resJob, resFit, resSaved, resResumes, resApps] = await Promise.all([
        jobsAPI.getJobById(jobId),
        jobsAPI.getMatchExplanation(jobId).catch(() => ({ data: { success: false, match: null } })),
        candidateAPI.getSavedJobs().catch(() => ({ data: { success: false, saved_jobs: [] } })),
        candidateAPI.getResumes().catch(() => ({ data: { success: false, resumes: [] } })),
        applicationsAPI.getMyApplications().catch(() => ({ data: { success: false, applications: [] } }))
      ]);

      if (resJob.data?.success) {
        setJob(resJob.data.job);
      }
      if (resFit.data?.success && resFit.data.match) {
        setFit(resFit.data.match);
      }
      if (resSaved.data?.success && resSaved.data.saved_jobs) {
        const saved = resSaved.data.saved_jobs.some((j: any) => j.id === jobId);
        setIsSaved(saved);
      }
      if (resResumes.data?.success && resResumes.data.resumes) {
        setResumes(resResumes.data.resumes);
        const primary = resResumes.data.resumes.find(r => r.is_primary === 1) || resResumes.data.resumes[0];
        if (primary) setSelectedResumeId(primary.id);
      }
      if (resApps.data?.success && resApps.data.applications) {
        const alreadyApplied = resApps.data.applications.some((a: any) => a.job_id === jobId);
        setHasApplied(alreadyApplied);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await candidateAPI.unsaveJob(jobId);
        setIsSaved(false);
      } else {
        await candidateAPI.saveJob(jobId);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplying(true);
      const res = await applicationsAPI.apply(jobId, coverLetter);
      if (res.data?.success) {
        setHasApplied(true);
        setShowApplyModal(false);
        alert('Application submitted successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const startMockInterviewForThisJob = () => {
    // Navigate to mock interview with job_id pre-filled in query
    navigate(`/candidate/mock-interview?job_id=${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 bg-[#f5f0e8]/60 rounded-2xl border border-rose-500/30 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#f0ebe0] mb-2">{error || 'Job Not Found'}</h3>
        <button
          onClick={() => navigate('/candidate/jobs')}
          className="px-4 py-2 bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] rounded-xl text-xs font-semibold"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const matchPercent = fit?.overall_percentage || 75;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/candidate/jobs')}
        className="text-xs font-semibold text-[#9CA3A1] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </button>

      {/* Main Job Header Card */}
      <div className="bg-[#16181A] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#B6FF3B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 shadow-sm shadow-[#B6FF3B]/20">
                {matchPercent}% Match
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#9CA3A1] border border-white/10">
                {job.work_mode || 'Remote'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#9CA3A1] border border-white/10">
                {job.job_type || 'Full-time'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#9CA3A1] border border-white/10">
                {job.experience_level || 'Mid-Level'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{job.title}</h1>
            <p className="text-sm font-semibold text-[#9CA3A1] flex items-center gap-2 mt-1.5">
              <Building2 className="w-4 h-4 text-[#6B7280]" />
              <span className="text-white">{job.company_name}</span>
              <span>•</span>
              <MapPin className="w-4 h-4 text-[#6B7280]" />
              <span>{job.location || 'Remote'}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3A1] font-medium">
              <div className="flex items-center gap-1.5 bg-[#101211] px-3.5 py-1.5 rounded-full border border-white/8">
                <DollarSign className="w-4 h-4 text-[#B6FF3B]" />
                <span className="text-white font-semibold">{job.salary_range || 'Competitive'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#101211] px-3.5 py-1.5 rounded-full border border-white/8">
                <Calendar className="w-4 h-4 text-[#6B7280]" />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            {hasApplied ? (
              <div className="px-6 py-2.5 bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] rounded-full text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Applied</span>
              </div>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-2.5 bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#B6FF3B]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#0B0D0C]" />
                <span>Apply Now</span>
              </button>
            )}

            <button
              onClick={handleSaveToggle}
              className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-white/5 text-[#9CA3A1] border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>{isSaved ? 'Saved Job' : 'Save Job'}</span>
            </button>

            {/* Practice with AI Mock Interview for this job */}
            <button
              onClick={startMockInterviewForThisJob}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#B6FF3B] border border-[#B6FF3B]/30 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Generate tailored AI interview questions for this specific role"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Practice for This Job</span>
            </button>
          </div>
        </div>

        {/* Real Job-Match Explanation Breakdown */}
        {fit && (
          <div className="mt-6 pt-6 border-t border-white/8 relative z-10">
            <h3 className="text-xs font-bold text-[#9CA3A1] uppercase tracking-wider mb-3">
              Candidate Skill Match Breakdown:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="p-4 bg-[#101211] border border-[#B6FF3B]/20 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-[#B6FF3B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matching Skills ({fit.matched_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fit.matched_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center gap-1"
                    >
                      <span>✓ {s.name}</span>
                      {s.is_verified && <span className="text-[10px] text-[#B6FF3B] font-bold">[Verified]</span>}
                    </span>
                  ))}
                  {fit.matched_skills.length === 0 && (
                    <span className="text-xs text-[#6B7280]">No matching skills detected.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-4 bg-[#101211] border border-amber-500/20 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Missing Skills ({fit.missing_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fit.missing_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    >
                      {s.name} ({s.importance})
                    </span>
                  ))}
                  {fit.missing_skills.length === 0 && (
                    <span className="text-xs text-[#B6FF3B]">You have all required skills!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description & Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#16181A] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white">Job Description</h2>
            <div className="text-sm text-[#9CA3A1] leading-relaxed whitespace-pre-line">
              {job.description || 'No description provided.'}
            </div>

            {job.responsibilities && (
              <div className="pt-4 border-t border-white/8 space-y-2">
                <h3 className="text-sm font-bold text-white">Key Responsibilities</h3>
                <div className="text-sm text-[#9CA3A1] leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-[#16181A] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white">Role Overview</h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#6B7280]">Employment Type</span>
                <p className="font-semibold text-white mt-0.5">{job.job_type || 'Full-time'}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Work Mode</span>
                <p className="font-semibold text-white mt-0.5">{job.work_mode || 'Remote'}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Experience Level</span>
                <p className="font-semibold text-white mt-0.5">{job.experience_level || 'Mid-Level'}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Salary Range</span>
                <p className="font-semibold text-[#B6FF3B] mt-0.5">{job.salary_range || 'Competitive'}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Location</span>
                <p className="font-semibold text-white mt-0.5">{job.location || 'Remote'}</p>
              </div>
              {job.application_deadline && (
                <div>
                  <span className="text-[#6B7280]">Application Deadline</span>
                  <p className="font-semibold text-white mt-0.5">
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#16181A] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-white">Apply for {job.title}</h2>
              <p className="text-xs text-[#9CA3A1] mt-1">at {job.company_name}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3A1] mb-1.5">
                  Select Resume
                </label>
                {resumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#101211] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#B6FF3B]"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file_name} {r.is_primary ? '(Primary)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-[#101211] rounded-xl border border-white/5 text-xs text-[#9CA3A1]">
                    <span>No resumes uploaded. </span>
                    <button
                      type="button"
                      onClick={() => navigate('/candidate/resumes')}
                      className="text-[#B6FF3B] hover:underline font-semibold"
                    >
                      Upload a resume
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3A1] mb-1.5">
                  Cover Letter / Note to Recruiter (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you are a great fit for this position..."
                  className="w-full px-4 py-2.5 bg-[#101211] border border-white/10 rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#B6FF3B]/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


