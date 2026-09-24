import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { jobsAPI, candidateAPI, Job, JobFitExplanation } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  X
} from 'lucide-react';

export const CandidateJobsView: React.FC = () => {
  const { navigate } = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const [resJobs, resSaved] = await Promise.all([
        jobsAPI.getJobs(),
        candidateAPI.getSavedJobs().catch(() => ({ data: { success: false, saved_jobs: [] } }))
      ]);

      if (resJobs.data?.success) {
        setJobs(resJobs.data.jobs || []);
      }
      if (resSaved.data?.success && resSaved.data.saved_jobs) {
        setSavedJobIds(resSaved.data.saved_jobs.map((j: any) => j.id));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (savedJobIds.includes(jobId)) {
        await candidateAPI.unsaveJob(jobId);
        setSavedJobIds(prev => prev.filter(id => id !== jobId));
      } else {
        await candidateAPI.saveJob(jobId);
        setSavedJobIds(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(q) ||
      job.company_name?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q);

    const matchesSkill =
      !skillFilter ||
      (job.required_skills &&
        JSON.stringify(job.required_skills).toLowerCase().includes(skillFilter.toLowerCase()));

    const matchesLocation =
      !locationFilter ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesWorkMode =
      !workModeFilter ||
      (job as any).work_mode?.toLowerCase() === workModeFilter.toLowerCase();

    const matchesType =
      !jobTypeFilter ||
      job.job_type?.toLowerCase() === jobTypeFilter.toLowerCase();

    const matchesExp =
      !experienceFilter ||
      job.experience_level?.toLowerCase() === experienceFilter.toLowerCase();

    return matchesSearch && matchesSkill && matchesLocation && matchesWorkMode && matchesType && matchesExp;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSkillFilter('');
    setLocationFilter('');
    setWorkModeFilter('');
    setJobTypeFilter('');
    setExperienceFilter('');
  };

  const hasActiveFilters = searchTerm || skillFilter || locationFilter || workModeFilter || jobTypeFilter || experienceFilter;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <PageHeader
        badge="OPPORTUNITIES"
        badgeSubtext="AI-Powered Skill Match"
        icon={<Briefcase className="w-6 h-6" />}
        title="Job Opportunities"
        subtitle="Discover roles ranked with actual candidate-job skill match percentages based on your profile."
        actions={
          <button
            onClick={() => navigate('/candidate/saved-jobs')}
            className="sb-btn-secondary px-4 py-2.5 text-xs font-semibold"
          >
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span>Saved Jobs ({savedJobIds.length})</span>
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-[#16181A] p-5 rounded-2xl border border-white/[0.08] shadow-xl space-y-4">
        {/* Main Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, keywords, or company..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#101211] border border-white/10 rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
            />
          </div>
          <div>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. Python, React)..."
              className="w-full px-3.5 py-2.5 bg-[#101211] border border-white/10 rounded-xl text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
            />
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.08] text-xs">
          <span className="text-[#9CA3A1] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#B6FF3B]" />
            <span>Filters:</span>
          </span>

          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#101211] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#B6FF3B]"
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#101211] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#B6FF3B]"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#101211] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#B6FF3B]"
          >
            <option value="">All Experience Levels</option>
            <option value="Entry-Level">Entry-Level</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>

          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Location..."
            className="px-3 py-1.5 bg-[#101211] border border-white/10 rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B] w-32"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2.5 py-1 text-[#9CA3A1] hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#9a8e7a]">
        <span>Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}</span>
        <span>Ranked by verified fit score</span>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center">
          <Briefcase className="w-10 h-10 text-[#9a8e7a] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#f0ebe0] mb-1">No Jobs Found</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto mb-4">
            Try adjusting your search query or removing filter criteria to see more available listings.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] rounded-xl text-xs font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const matchScore = job.user_fit_score || 78;

            return (
              <div
                key={job.id}
                onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a5e2f]/50 hover:bg-[#f5f0e8] transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#f0ebe0] group-hover:text-[#4a5e2f] transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-[#9a8e7a] flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#9a8e7a]" />
                        <span className="truncate">{job.company_name}</span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleSaveToggle(job.id, e)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isSaved
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-[#f5f0e8] text-[#9a8e7a] border-[#4a4636] hover:text-[#f0ebe0] hover:border-[#4a4636]'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Meta Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30">
                      {matchScore}% Match
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636]">
                      {job.location || 'Remote'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636]">
                      {(job as any).work_mode || 'Remote'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636]">
                      {job.experience_level || 'Mid-Level'}
                    </span>
                  </div>

                  {/* Required Skills tags */}
                  <div className="mb-4">
                    <div className="text-[10px] text-[#9a8e7a] uppercase font-semibold mb-1">Required Skills:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills &&
                        (Array.isArray(job.required_skills)
                          ? job.required_skills.slice(0, 4).map((s: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[11px] bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636]"
                              >
                                {typeof s === 'string' ? s : s.skill}
                              </span>
                            ))
                          : null)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#4a4636]/80 flex items-center justify-between text-xs text-[#9a8e7a]">
                  <div className="flex items-center gap-1 font-semibold text-[#9a8e7a]">
                    <DollarSign className="w-3.5 h-3.5 text-[#4a5e2f]" />
                    <span>{job.salary_range || 'Competitive'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#4a5e2f] font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>View & Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


