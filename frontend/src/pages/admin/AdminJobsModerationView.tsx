import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Building2,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminJobsModerationView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [rejectModal, setRejectModal] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectJob, setInspectJob] = useState<any | null>(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getJobs();
      setJobs(res.data?.jobs || []);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (jobId: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      setActionLoading(jobId);
      await adminAPI.moderateJob(jobId, { status, reason });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, moderation_status: status, status: status === 'approved' ? 'open' : 'closed', rejection_reason: reason } : j));
      setRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Moderation action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (statusFilter !== 'all') {
      const mod = j.moderation_status || 'pending';
      const st = j.status || 'open';
      if (statusFilter === 'pending' && mod !== 'pending') return false;
      if (statusFilter === 'approved' && mod !== 'approved') return false;
      if (statusFilter === 'rejected' && mod !== 'rejected') return false;
      if (statusFilter === 'active' && (st !== 'open' || mod !== 'approved')) return false;
      if (statusFilter === 'paused' && st !== 'paused') return false;
      if (statusFilter === 'closed' && st !== 'closed') return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (j.title || '').toLowerCase().includes(q) || (j.company_name || '').toLowerCase().includes(q) || (j.location || '').toLowerCase().includes(q);
    }
    return true;
  });

  const getModerationBadge = (job: any) => {
    const mod = job.moderation_status || 'pending';
    if (mod === 'approved') return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">Approved</span>;
    if (mod === 'rejected') return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejected</span>;
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fde9c0]/10 text-[#b45309] border border-[#b45309]/20"><Clock className="w-3 h-3 inline mr-1" />Pending Review</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">Job Moderation Queue</h1>
        <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">Review, approve, or reject recruiter job submissions to maintain platform quality standards.</p>
      </div>

      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
            <input type="text" placeholder="Search by job title, company, or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['all', 'pending', 'approved', 'rejected', 'active', 'paused', 'closed'].map(tab => (
              <button key={tab} onClick={() => setStatusFilter(tab)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${statusFilter === tab ? 'bg-[#3d6b35] text-[#f0ebe0]' : 'bg-[#f5f0e8] text-[#9a8e7a] hover:text-[#f0ebe0]'}`}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2">
          <CheckSquare className="w-8 h-8 mx-auto text-[#6b6151]" />
          <p className="text-sm font-semibold text-[#f0ebe0]">No jobs match the current filter</p>
        </div>
      ) : (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#b5aa96]">
              <thead className="bg-[#f5f0e8]/80 text-[#9a8e7a] font-semibold uppercase tracking-wider border-b border-[#4a4636]">
                <tr>
                  <th className="px-6 py-4">Job Requisition</th>
                  <th className="px-6 py-4">Company / Recruiter</th>
                  <th className="px-6 py-4">Location & Mode</th>
                  <th className="px-6 py-4">Moderation</th>
                  <th className="px-6 py-4">Posted</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filteredJobs.map(j => (
                  <tr key={j.id} className="hover:bg-[#2c2a1e]/40 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#f0ebe0] block">{j.title}</span>
                      <span className="text-[11px] text-[#9a8e7a]">{j.type} • {j.experience_level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#f0ebe0] block">{j.company_name || 'Enterprise'}</span>
                      <span className="text-[11px] text-[#9a8e7a]">{j.recruiter_name || 'Recruiter'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[#b5aa96]"><MapPin className="w-3 h-3 text-[#9a8e7a]" />{j.location || 'Remote'}</span>
                      <span className="text-[10px] text-[#9a8e7a] capitalize">{j.work_mode || 'remote'}</span>
                    </td>
                    <td className="px-6 py-4">{getModerationBadge(j)}</td>
                    <td className="px-6 py-4 text-[#9a8e7a]">{new Date(j.created_at || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setInspectJob(j)} className="p-1.5 rounded-lg bg-[#f5f0e8] hover:bg-[#3a3828] text-[#9a8e7a] hover:text-[#f0ebe0] transition" title="Inspect Job"><Eye className="w-4 h-4" /></button>
                        {(j.moderation_status || 'pending') !== 'approved' && (
                          <button disabled={actionLoading === j.id} onClick={() => handleModerate(j.id, 'approved')} className="p-1.5 rounded-lg bg-[#3d6b35]/10 text-[#3d6b35] hover:bg-[#3d6b35]/20 transition" title="Approve Job"><CheckCircle2 className="w-4 h-4" /></button>
                        )}
                        {(j.moderation_status || 'pending') !== 'rejected' && (
                          <button disabled={actionLoading === j.id} onClick={() => { setRejectModal(j); setRejectReason(''); }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="Reject with Reason"><XCircle className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#f0ebe0] text-base">Reject Job: {rejectModal.title}</h3>
            <p className="text-xs text-[#9a8e7a]">Provide a mandatory rejection reason. The recruiter will receive this as a notification.</p>
            <textarea rows={3} required value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Job description violates platform content guidelines..." className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setRejectModal(null)} className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e8] hover:bg-[#3a3828] text-[#9a8e7a] text-xs font-semibold">Cancel</button>
              <button disabled={!rejectReason.trim()} onClick={() => handleModerate(rejectModal.id, 'rejected', rejectReason)} className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[#f0ebe0] text-xs font-bold transition disabled:opacity-50">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {inspectJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
              <h3 className="font-bold text-[#f0ebe0] text-base">{inspectJob.title}</h3>
              <button onClick={() => setInspectJob(null)} className="text-[#9a8e7a] hover:text-[#f0ebe0]">✕</button>
            </div>
            <div className="space-y-2 text-xs text-[#b5aa96]">
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Company:</span><span className="text-[#f0ebe0] font-semibold">{inspectJob.company_name || 'N/A'}</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Location:</span><span className="text-[#f0ebe0]">{inspectJob.location} ({inspectJob.work_mode})</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Type:</span><span className="text-[#f0ebe0] capitalize">{inspectJob.type} • {inspectJob.experience_level}</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Salary Range:</span><span className="text-[#3d6b35] font-semibold">{inspectJob.currency || 'USD'} {inspectJob.salary_min?.toLocaleString()} – {inspectJob.salary_max?.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Openings:</span><span className="text-[#f0ebe0]">{inspectJob.openings || 1}</span></div>
              <div><span className="text-[#9a8e7a] block mb-1">Description:</span><p className="bg-[#f5f0e8] p-2.5 rounded-xl border border-[#4a4636] text-[#b5aa96] text-[11px] leading-relaxed whitespace-pre-wrap">{inspectJob.description || 'No description.'}</p></div>
              {inspectJob.rejection_reason && <p className="text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-[11px]"><strong>Rejection Reason:</strong> {inspectJob.rejection_reason}</p>}
            </div>
            <div className="flex justify-end pt-2"><button onClick={() => setInspectJob(null)} className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminJobsModerationView;


