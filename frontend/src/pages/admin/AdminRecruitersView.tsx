import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  Search, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  FileText,
  Mail,
  ExternalLink
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const AdminRecruitersView: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getRecruiters();
      setRecruiters(res.data?.recruiters || []);
    } catch (err: any) {
      console.error('Failed to load recruiters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (recruiterId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await adminAPI.updateUserStatus(recruiterId, newStatus);
      setRecruiters(prev => prev.map(r => r.id === recruiterId ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update recruiter status');
    }
  };

  const filteredRecruiters = recruiters.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.company_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
          Recruiter & Employer Operations
        </h1>
        <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
          Monitor enterprise hiring agents, associated business organizations, and hiring throughput.
        </p>
      </div>

      {/* Search */}
      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by recruiter name, email, or company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:outline-none focus:ring-2 focus:ring-[#3d6b35]"
          />
        </div>
      </div>

      {/* Recruiter Table */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRecruiters.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2">
          <Briefcase className="w-8 h-8 mx-auto text-[#6b6151]" />
          <p className="text-sm font-semibold text-[#f0ebe0]">No recruiters registered yet</p>
        </div>
      ) : (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#b5aa96]">
              <thead className="bg-[#f5f0e8]/80 text-[#9a8e7a] font-semibold uppercase tracking-wider border-b border-[#4a4636]">
                <tr>
                  <th className="px-6 py-4">Recruiter</th>
                  <th className="px-6 py-4">Company Entity</th>
                  <th className="px-6 py-4">Jobs Posted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filteredRecruiters.map(r => {
                  const isSuspended = r.status === 'suspended';

                  return (
                    <tr key={r.id} className="hover:bg-[#2c2a1e]/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#4a5e2f]/50 text-[#4a5e2f] font-bold flex items-center justify-center text-xs">
                            {r.name ? r.name[0].toUpperCase() : 'R'}
                          </div>
                          <div>
                            <span className="font-bold text-[#f0ebe0] block">{r.name}</span>
                            <span className="text-[11px] text-[#9a8e7a]">{r.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {r.company_name ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#9a8e7a]" />
                            <span className="font-semibold text-[#f0ebe0]">{r.company_name}</span>
                          </div>
                        ) : (
                          <span className="text-[#9a8e7a] italic">No company linked</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-[#3d6b35] font-bold">{r.jobs_count || 0} requisitions</span>
                      </td>

                      <td className="px-6 py-4">
                        {isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-[#3d6b35] bg-[#3d6b35]/10 border border-[#3d6b35]/20">
                            Active Recruiter
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(r.id, r.status || 'active')}
                            className={`p-1.5 rounded-lg transition ${
                              isSuspended
                                ? 'bg-[#3d6b35]/10 text-[#3d6b35] hover:bg-[#3d6b35]/20'
                                : 'bg-[#fde9c0]/10 text-[#b45309] hover:bg-[#fde9c0]/20'
                            }`}
                            title={isSuspended ? 'Activate Recruiter' : 'Suspend Recruiter'}
                          >
                            {isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminRecruitersView;


