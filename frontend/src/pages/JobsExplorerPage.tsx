import React, { useState, useEffect } from 'react';
import { Job } from '../types/index.js';
import { jobsAPI } from '../services/api.js';
import { JobCard } from '../components/JobCard.js';
import { Search, Filter, Briefcase, Sparkles, Building2, MapPin } from 'lucide-react';
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
        experience_level: levelFilter || undefined
      });
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (e) {
      console.error('Failed to load jobs', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI Job-Fit Explorer
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{t('jobs_title')}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{t('jobs_subtitle')}</p>
        </div>

        {user && user.role === 'job_seeker' && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 text-xs flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Live AI Ranking Active</p>
              <p className="text-[11px] text-slate-400">
                Jobs automatically ranked by your verified skills and credentials.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center gap-4">
        {/* Search input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Job Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
        <div className="text-center py-16 text-slate-400 text-xs">Computing AI Job-Fit rankings...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center text-slate-400 text-xs">
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
