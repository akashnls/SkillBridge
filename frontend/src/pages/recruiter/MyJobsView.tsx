import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  PauseCircle, 
  PlayCircle, 
  XCircle, 
  Trash2, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  MapPin,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const MyJobsView: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getMyJobs();
      setJobs(res.data?.jobs || []);
    } catch (err: any) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      setActionLoading(jobId);
      await recruiterAPI.updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const handleDelete = async (jobId: number) => {
    try {
      setActionLoading(jobId);
      await recruiterAPI.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return job.status === 'open' && (job.moderation_status === 'approved' || !job.moderation_status);
    if (statusFilter === 'pending') return job.moderation_status === 'pending';
    if (statusFilter === 'draft') return job.status === 'draft';
    if (statusFilter === 'paused') return job.status === 'paused';
    if (statusFilter === 'closed') return job.status === 'closed';
    if (statusFilter === 'rejected') return job.moderation_status === 'rejected';
    return true;
  });

  const getModerationBadge = (job: any) => {
    if (job.status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ede8df] text-[#6b6151] border border-[#d5cec3]">
          Draft Requisition
        </span>
      );
    }
    if (job.moderation_status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200" title={job.rejection_reason || 'Rejected by Admin'}>
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Rejected
        </span>
      );
    }
    if (job.moderation_status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fde9c0] text-[#b45309] border border-[#b45309]/25">
          <Clock className="w-3 h-3 text-[#b45309]" />
          In Admin Review
        </span>
      );
    }
    if (job.status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fde9c0] text-[#b45309] border border-[#b45309]/25">
          Paused
        </span>
      );
    }
    if (job.status === 'closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ede8df] text-[#6b6151] border border-[#d5cec3]">
          Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c6ddb8]/50 text-[#3d6b35] border border-[#3d6b35]/30">
        <CheckCircle2 className="w-3 h-3 text-[#3d6b35]" />
        Live & Active
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Job Requisitions</h1>
          <p className="text-[#9a8e7a] text-sm mt-1">
            Manage your company's live openings, review candidate pipelines, and monitor moderation status.
          </p>
        </div>
        <button
          onClick={() => navigate('/recruiter/jobs/create')}
          className="px-5 py-2.5 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by job title, department, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'active', label: 'Active' },
              { id: 'pending', label: 'In Review' },
              { id: 'draft', label: 'Drafts' },
              { id: 'paused', label: 'Paused' },
              { id: 'closed', label: 'Closed' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? 'bg-[#ede8df] text-[#2c2a1e] shadow-sm'
                    : 'text-[#6b6151] hover:bg-[#e4ddd2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c8d5a8]/30 text-[#4a5e2f] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2c2a1e]">No job openings found</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search keywords or status filter.'
              : 'You have not created any job listings yet. Create your first opening to attract verified talent.'}
          </p>
          <button
            onClick={() => navigate('/recruiter/jobs/create')}
            className="px-4 py-2 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold transition"
          >
            Create First Opening
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm hover:shadow-md transition p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Job Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-[#2c2a1e] hover:text-[#4a5e2f] transition cursor-pointer"
                      onClick={() => navigate(`/recruiter/applications?jobId=${job.id}`)}>
                    {job.title}
                  </h3>
                  {getModerationBadge(job)}
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-[#9a8e7a] font-medium">
                  {job.department && <span>{job.department}</span>}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9a8e7a]" />
                    {job.location || 'Remote'} ({job.work_mode || 'remote'})
                  </span>
                  <span>{job.type}</span>
                  {job.openings > 0 && <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#9a8e7a]" />
                    Posted {new Date(job.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {/* Moderation Rejection Box */}
                {job.moderation_status === 'rejected' && job.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Reason:</strong> {job.rejection_reason}</span>
                  </div>
                )}
              </div>

              {/* Applicant Metrics & Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#d5cec3]/60">
                {/* View Applicants Button */}
                <button
                  onClick={() => navigate(`/recruiter/applications?jobId=${job.id}`)}
                  className="px-4 py-2 rounded-xl bg-[#ede8df] hover:bg-[#c8d5a8]/30 border border-[#d5cec3] hover:border-[#4a5e2f] text-[#6b6151] hover:text-[#4a5e2f] text-xs font-semibold transition flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                  <ArrowRight className="w-3 h-3 text-[#9a8e7a]" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => navigate(`/recruiter/jobs/create?id=${job.id}`)}
                  className="p-2 rounded-xl border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#6b6151] transition"
                  title="Edit Requisition"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Status Toggle Button */}
                {job.status === 'open' ? (
                  <button
                    disabled={actionLoading === job.id}
                    onClick={() => handleStatusChange(job.id, 'paused')}
                    className="p-2 rounded-xl border border-[#b45309]/25 bg-[#fde9c0]/50 hover:bg-[#fde9c0] text-[#b45309] transition"
                    title="Pause Applications"
                  >
                    <PauseCircle className="w-4 h-4" />
                  </button>
                ) : job.status === 'paused' ? (
                  <button
                    disabled={actionLoading === job.id}
                    onClick={() => handleStatusChange(job.id, 'open')}
                    className="p-2 rounded-xl border border-[#3d6b35]/30 bg-[#c6ddb8]/30 hover:bg-[#c6ddb8]/50 text-[#3d6b35] transition"
                    title="Resume Applications"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                ) : null}

                {/* Close Button */}
                {job.status !== 'closed' && (
                  <button
                    disabled={actionLoading === job.id}
                    onClick={() => handleStatusChange(job.id, 'closed')}
                    className="p-2 rounded-xl border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#9a8e7a] transition"
                    title="Close Requisition"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirmId(job.id)}
                  className="p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 transition"
                  title="Delete Requisition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ede8df] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c2a1e]">Delete Job Requisition?</h3>
              <p className="text-xs text-[#9a8e7a] mt-1 leading-relaxed">
                This action will permanently remove this job opening and disconnect associated candidate applications. This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-[#d5cec3] text-[#6b6151] text-xs font-semibold hover:bg-[#e4ddd2] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#f0ebe0] text-xs font-semibold shadow transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyJobsView;


