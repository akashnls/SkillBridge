import React, { useState, useEffect } from 'react';
import { Job } from '../types/index.js';
import { jobsAPI } from '../services/api.js';
import { JobCard } from '../components/JobCard.js';
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';

interface JobsExplorerPageProps {
  onNavigateToRoadmap?: () => void;
}

export const JobsExplorerPage: React.FC<JobsExplorerPageProps> = ({ onNavigateToRoadmap }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    loadJobs();
  }, [searchTerm, jobTypeFilter, levelFilter, user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getJobs({
        search: searchTerm || undefined,
        job_type: jobTypeFilter || undefined,
        experience_level: levelFilter || undefined,
        status: 'open'
      });
      if (res.data.success) {
        // Display all jobs with status "open", regardless of auth state
        const openJobs = (res.data.jobs || []).filter(
          (job) => !job.status || job.status.toLowerCase() === 'open'
        );
        // Show fit scores only if logged in
        const formattedJobs = openJobs.map((job) =>
          !user
            ? { ...job, user_fit_score: undefined, match_summary: undefined }
            : job
        );
        setJobs(formattedJobs);
      }
    } catch (e) {
      console.error('Failed to load jobs', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#16181A] rounded-3xl border border-white/[0.08] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-radial from-[#B6FF3B]/10 to-transparent blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
              AI Job-Fit Explorer
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('jobs_title')}</h2>
          <p className="text-xs text-[#9CA3A1] mt-1 max-w-xl">{t('jobs_subtitle')}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#16181A] rounded-2xl border border-white/[0.08] p-4 flex flex-wrap items-center gap-4 shadow-xl">
        {/* Search input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-[#B6FF3B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-[#111312] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B] transition-all"
          />
        </div>

        {/* Job Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9CA3A1]" />
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="bg-[#111312] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B6FF3B]"
          >
            <option value="">{t('filter_all')}</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Experience Level Filter */}
        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#111312] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#B6FF3B]"
          >
            <option value="">All Experience Levels</option>
            <option value="Entry-Level">Entry-Level / 0-2 Yrs</option>
            <option value="Junior">Junior</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#9CA3A1] text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-[#B6FF3B]/20 border-t-[#B6FF3B] animate-spin" />
          <span>Computing AI Job-Fit rankings...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-[#16181A] rounded-3xl border border-white/[0.08] p-12 text-center text-[#9CA3A1] text-xs shadow-xl">
          No job openings matched your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onNavigateToRoadmap={onNavigateToRoadmap}
              onAppliedSuccess={loadJobs}
            />
          ))}
        </div>
      )}
    </div>
  );
};


