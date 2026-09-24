import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { AuditLog } from '../../types';
import {
  Activity,
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Globe,
  FileCode2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';

export const AdminActivityLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
      const res = await adminAPI.getAuditLogs(categoryParam);
      if (res.data?.success) {
        setLogs(res.data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const action = (log.action || '').toLowerCase();
    const cat = (log.category || '').toLowerCase();
    const actor = (log.user_id || '').toLowerCase();
    const details = JSON.stringify(log.details || '').toLowerCase();
    return action.includes(q) || cat.includes(q) || actor.includes(q) || details.includes(q);
  });

  const getActionBadge = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('APPROVED') || action.includes('VERIFIED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">
          {action}
        </span>
      );
    }
    if (action.includes('FAIL') || action.includes('REJECTED') || action.includes('SUSPENDED') || action.includes('DELETED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4a5e2f]/10 text-[#4a5e2f] border border-[#4a5e2f]/20">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30">
              Immutable Governance Trail
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
            Security & Cryptographic Audit Logs
          </h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
            Tamper-evident logs of administrative decisions, authentication attempts, company verifications, and badge issuances.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] border border-[#4a4636] text-xs font-semibold transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#f5f0e8]/80 border border-[#4a4636]/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-[#f5f0e8] border border-[#4a4636] rounded-xl px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-[#9a8e7a] shrink-0" />
          <input
            type="text"
            placeholder="Search action, actor ID, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[#2c2a1e] placeholder-[#9a8e7a] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['all', 'AUTH', 'SECURITY', 'JOB_POSTED', 'BADGE_ISSUED'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#3d6b35] text-[#f0ebe0] shadow-sm'
                  : 'bg-[#f5f0e8] hover:bg-[#3a3828] text-[#9a8e7a] border border-[#4a4636]'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#f5f0e8]/80 rounded-3xl border border-[#4a4636]/80 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center text-[#9a8e7a] text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#3d6b35]" />
            Reading audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-[#9a8e7a] text-xs">
            No audit records matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f0e8]/90 text-[#9a8e7a] font-semibold border-b border-[#4a4636]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Actor / User ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#2c2a1e]/40 transition">
                    <td className="py-3.5 px-4 font-mono text-[#9a8e7a] whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#9a8e7a]" />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{getActionBadge(log.action)}</td>
                    <td className="py-3.5 px-4 text-[#b5aa96]">{log.category}</td>
                    <td className="py-3.5 px-4 font-mono text-[#9a8e7a] max-w-[150px] truncate" title={log.user_id || 'System'}>
                      {log.user_id || 'SYSTEM_GUEST'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#9a8e7a]">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-[#f5f0e8] hover:bg-[#3a3828] text-[#4a5e2f] hover:text-[#f0ebe0] border border-[#4a4636] text-[11px] font-semibold transition"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#3d6b35]" />
                <h3 className="font-bold text-[#f0ebe0] text-sm">Audit Record Detail</h3>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="p-1 rounded-lg bg-[#3a3828] text-[#9a8e7a] hover:text-[#f0ebe0]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#f5f0e8] border border-[#4a4636]/80">
                <span className="text-[#9a8e7a] block text-[10px] uppercase">Action</span>
                <span className="font-bold text-[#f0ebe0] mt-0.5 block">{activeLog.action}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f0e8] border border-[#4a4636]/80">
                <span className="text-[#9a8e7a] block text-[10px] uppercase">Category</span>
                <span className="font-bold text-[#f0ebe0] mt-0.5 block">{activeLog.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f0e8] border border-[#4a4636]/80">
                <span className="text-[#9a8e7a] block text-[10px] uppercase">Actor</span>
                <span className="font-mono text-[#b5aa96] mt-0.5 block truncate">{activeLog.user_id || 'SYSTEM'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f0e8] border border-[#4a4636]/80">
                <span className="text-[#9a8e7a] block text-[10px] uppercase">IP Address</span>
                <span className="font-mono text-[#b5aa96] mt-0.5 block">{activeLog.ip_address}</span>
              </div>
            </div>

            <div>
              <span className="text-[#9a8e7a] text-xs font-semibold block mb-1">Payload Metadata (JSON)</span>
              <pre className="p-4 rounded-xl bg-[#f5f0e8] border border-[#4a4636] font-mono text-[11px] text-[#3d6b35] max-h-48 overflow-y-auto">
                {JSON.stringify(activeLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 rounded-xl bg-[#3a3828] hover:bg-[#4a4636] text-[#f0ebe0] text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogsView;


