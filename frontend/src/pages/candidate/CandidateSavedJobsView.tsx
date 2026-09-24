import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { candidateAPI, Job } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Bookmark,
  Briefcase,
  Trash2,
  ArrowUpRight,
  DollarSign,
  MapPin,
  Building2,
  Calendar,
  Send
} from 'lucide-react';

export const CandidateSavedJobsView: React.FC = () => {
  const { navigate } = useRouter();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getSavedJobs();
      if (res.data?.success) {
        setSavedJobs(res.data.saved_jobs || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await candidateAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        badge="BOOKMARKS"
        badgeSubtext="Saved Opportunities"
        icon={<Bookmark className="w-6 h-6 text-rose-400" />}
        title="Saved Jobs"
        subtitle="Keep track of job openings you want to review or apply for later."
        actions={
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]"
          >
            <Briefcase className="w-4 h-4" />
            <span>Discover More Jobs</span>
          </button>
        }
      />

      {savedJobs.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
          <Bookmark className="w-12 h-12 text-[#9a8e7a] mx-auto" />
          <h3 className="text-base font-bold text-[#f0ebe0]">No Saved Jobs Yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Browse job opportunities and click the bookmark icon on any card to save it here for later.
          </p>
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-semibold cursor-pointer"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
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
                    onClick={(e) => handleRemove(job.id, e)}
                    className="p-1.5 text-[#9a8e7a] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30">
                    {job.match_score || 80}% Match
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636]">
                    {job.location || 'Remote'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#f5f0e8] text-[#b5aa96] border border-[#4a4636]">
                    {job.work_mode || 'Remote'}
                  </span>
                </div>

                {job.matched_skills && job.matched_skills.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] text-[#9a8e7a] uppercase font-semibold">Top Matching Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.matched_skills.slice(0, 3).map((s: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">
                          ✓ {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#4a4636]/80 flex items-center justify-between text-xs text-[#9a8e7a]">
                <div className="flex items-center gap-1 font-semibold text-[#9a8e7a]">
                  <DollarSign className="w-3.5 h-3.5 text-[#4a5e2f]" />
                  <span>{job.salary_range || 'Competitive'}</span>
                </div>
                <div className="flex items-center gap-1 text-[#4a5e2f] font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


