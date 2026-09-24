import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search } from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminApplicationsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchApps(); }, []);
  const fetchApps = async () => {
    try { setLoading(true); const res = await adminAPI.getApplications(); setApps(res.data?.applications || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const normalizeStatus = (status?: string): string => {
    if (!status) return '';
    const s = status.toLowerCase().trim().replace(/[\s_-]+/g, '_');
    if (['applied', 'submitted'].includes(s)) return 'Applied';
    if (['under_review', 'reviewing', 'in_review'].includes(s)) return 'Under Review';
    if (['shortlisted'].includes(s)) return 'Shortlisted';
    if (['interview', 'interviewing', 'interview_invited', 'interview_scheduled'].includes(s)) return 'Interviewing';
    if (['offered', 'offer', 'selected', 'hired'].includes(s)) return 'Offered';
    if (['rejected', 'not_selected', 'archived'].includes(s)) return 'Rejected';
    if (['withdrawn'].includes(s)) return 'Withdrawn';
    return status;
  };

  const filtered = apps.filter(a => {
    if (statusFilter !== 'all' && normalizeStatus(a.status) !== normalizeStatus(statusFilter)) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return (a.candidate_name||'').toLowerCase().includes(q) || (a.job_title||'').toLowerCase().includes(q) || (a.company_name||'').toLowerCase().includes(q); }
    return true;
  });

  const statusColor = (s: string) => {
    const norm = normalizeStatus(s);
    const m: Record<string, string> = {
      'Applied': 'text-[#4a5e2f] bg-[#c8d5a8]/10 border-[#4a5e2f]/20',
      'Under Review': 'text-[#4a5e2f] bg-[#4a5e2f]/10 border-[#4a5e2f]/20',
      'Shortlisted': 'text-[#6b7f47] bg-[#4a5e2f]/10 border-[#4a5e2f]/20',
      'Interviewing': 'text-[#b45309] bg-[#fde9c0]/10 border-[#b45309]/20',
      'Offered': 'text-[#3d6b35] bg-[#3d6b35]/10 border-[#3d6b35]/20',
      'Rejected': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      'Withdrawn': 'text-[#9a8e7a] bg-[#9a8e7a]/10 border-[#4a4636]/20'
    };
    return m[norm] || 'text-[#9a8e7a] bg-[#9a8e7a]/10 border-[#4a4636]/20';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">Platform Applications Monitor</h1>
        <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">Read-only visibility into all candidate-job applications for compliance and analytics purposes.</p>
      </div>

      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" /><input type="text" placeholder="Search candidate, job, or company..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] focus:ring-2 focus:ring-[#3d6b35]">
          <option value="all">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offered">Offered</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2"><FileSpreadsheet className="w-8 h-8 mx-auto text-[#6b6151]" /><p className="text-sm font-semibold text-[#f0ebe0]">No applications match the filter</p></div>
      ) : (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#b5aa96]">
              <thead className="bg-[#f5f0e8]/80 text-[#9a8e7a] font-semibold uppercase tracking-wider border-b border-[#4a4636]">
                <tr><th className="px-6 py-4">Candidate</th><th className="px-6 py-4">Job Requisition</th><th className="px-6 py-4">Company</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Applied</th></tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-[#2c2a1e]/40 transition">
                    <td className="px-6 py-4"><span className="font-bold text-[#f0ebe0] block">{a.candidate_name || 'Candidate #' + a.candidate_id}</span><span className="text-[11px] text-[#9a8e7a]">{a.candidate_email || ''}</span></td>
                    <td className="px-6 py-4 font-semibold text-[#f0ebe0]">{a.job_title}</td>
                    <td className="px-6 py-4 text-[#9a8e7a]">{a.company_name || 'Enterprise'}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColor(a.status)}`}>{normalizeStatus(a.status)}</span></td>
                    <td className="px-6 py-4 text-[#9a8e7a]">{new Date(a.created_at || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminApplicationsView;


