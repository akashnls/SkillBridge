import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Eye, CheckCircle2, XCircle, Lock, MessageSquare } from 'lucide-react';
import { adminAPI, reportsAPI } from '../../services/api';

export const AdminReportsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectReport, setInspectReport] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchReports(); }, []);
  const fetchReports = async () => { try { setLoading(true); const res = await adminAPI.getReports(); setReports(res.data?.reports || []); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const handleResolve = async (id: number, resolution: string, note?: string) => {
    try {
      setActionLoading(id);
      await adminAPI.resolveReport(id, { status: resolution, admin_note: note });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: resolution, admin_note: note } : r));
      setInspectReport(null);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to resolve report'); } finally { setActionLoading(null); }
  };

  const filtered = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return (r.reason || '').toLowerCase().includes(q) || (r.reporter_name || '').toLowerCase().includes(q); }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const m: Record<string, string> = { pending: 'text-[#b45309] bg-[#fde9c0]/10 border-[#b45309]/20', investigating: 'text-[#4a5e2f] bg-[#c8d5a8]/10 border-[#4a5e2f]/20', resolved: 'text-[#3d6b35] bg-[#3d6b35]/10 border-[#3d6b35]/20', rejected: 'text-[#9a8e7a] bg-[#9a8e7a]/10 border-[#4a4636]/20' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${m[status] || m.pending}`}>{status}</span>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = { fake_job: 'text-rose-300 bg-rose-500/10', fake_company: 'text-orange-300 bg-orange-500/10', spam: 'text-[#b45309] bg-[#fde9c0]/10', fraud: 'text-red-300 bg-red-500/10', abusive: 'text-[#6b7f47] bg-[#4a5e2f]/10', inappropriate: 'text-pink-300 bg-pink-500/10' };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[type] || 'text-[#b5aa96] bg-[#9a8e7a]/10'}`}>{(type || 'report').replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">Trust & Safety Reports</h1>
        <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">Review user-submitted flags for fake jobs, fraudulent companies, spam, and abusive content.</p>
      </div>

      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" /><input type="text" placeholder="Search by reason or reporter..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]" /></div>
        <div className="flex items-center gap-2">{['all', 'pending', 'investigating', 'resolved', 'rejected'].map(tab => (<button key={tab} onClick={() => setStatusFilter(tab)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${statusFilter === tab ? 'bg-[#3d6b35] text-[#f0ebe0]' : 'bg-[#f5f0e8] text-[#9a8e7a] hover:text-[#f0ebe0]'}`}>{tab}</button>))}</div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2"><AlertTriangle className="w-8 h-8 mx-auto text-[#6b6151]" /><p className="text-sm font-semibold text-[#f0ebe0]">No reports in this category</p></div>
      ) : (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#b5aa96]">
              <thead className="bg-[#f5f0e8]/80 text-[#9a8e7a] font-semibold uppercase tracking-wider border-b border-[#4a4636]">
                <tr><th className="px-6 py-4">Report</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Target</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Filed</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[#2c2a1e]/40 transition">
                    <td className="px-6 py-4"><span className="font-bold text-[#f0ebe0] block">{r.reason || 'Flagged Content'}</span><span className="text-[11px] text-[#9a8e7a]">by {r.reporter_name || 'User #' + r.reporter_id}</span></td>
                    <td className="px-6 py-4">{getTypeBadge(r.target_type)}</td>
                    <td className="px-6 py-4 text-[#9a8e7a]">{r.target_type} #{r.target_id}</td>
                    <td className="px-6 py-4">{getStatusBadge(r.status || 'pending')}</td>
                    <td className="px-6 py-4 text-[#9a8e7a]">{new Date(r.created_at || Date.now()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setInspectReport(r); setAdminNote(r.admin_note || ''); }} className="p-1.5 rounded-lg bg-[#f5f0e8] hover:bg-[#3a3828] text-[#9a8e7a] hover:text-[#f0ebe0] transition"><Eye className="w-4 h-4" /></button>
                        {r.status !== 'resolved' && <button onClick={() => handleResolve(r.id, 'resolved')} className="p-1.5 rounded-lg bg-[#3d6b35]/10 text-[#3d6b35] hover:bg-[#3d6b35]/20 transition"><CheckCircle2 className="w-4 h-4" /></button>}
                        {r.status !== 'rejected' && <button onClick={() => handleResolve(r.id, 'rejected')} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"><XCircle className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inspectReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#4a4636] pb-3"><h3 className="font-bold text-[#f0ebe0] text-base">Report Investigation</h3><button onClick={() => setInspectReport(null)} className="text-[#9a8e7a] hover:text-[#f0ebe0]">✕</button></div>
            <div className="space-y-2 text-xs text-[#b5aa96]">
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Reason:</span><span className="text-[#f0ebe0] font-semibold">{inspectReport.reason}</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Description:</span><span className="text-[#f0ebe0]">{inspectReport.description || 'No details provided'}</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Target:</span><span className="text-[#f0ebe0] capitalize">{inspectReport.target_type} #{inspectReport.target_id}</span></div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]"><span className="text-[#9a8e7a]">Reporter:</span><span className="text-[#f0ebe0]">{inspectReport.reporter_name || 'User #' + inspectReport.reporter_id}</span></div>
              <div className="flex justify-between py-1"><span className="text-[#9a8e7a]">Status:</span>{getStatusBadge(inspectReport.status || 'pending')}</div>
            </div>
            <div><label className="block text-xs font-semibold text-[#b5aa96] mb-1">Admin Investigation Note</label><textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Document findings, actions taken, etc." className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]" /></div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => handleResolve(inspectReport.id, 'investigating', adminNote)} className="px-3 py-1.5 rounded-xl bg-[#4a5e2f] hover:bg-[#c8d5a8]/300 text-[#f0ebe0] text-xs font-bold">Mark Investigating</button>
              <button onClick={() => handleResolve(inspectReport.id, 'resolved', adminNote)} className="px-3 py-1.5 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold">Resolve</button>
              <button onClick={() => handleResolve(inspectReport.id, 'rejected', adminNote)} className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[#f0ebe0] text-xs font-bold">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminReportsView;


