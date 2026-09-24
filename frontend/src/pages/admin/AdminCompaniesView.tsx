import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  ExternalLink,
  Eye,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminCompaniesView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectCompany, setInspectCompany] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Reject / Reason Modal
  const [rejectModalCompany, setRejectModalCompany] = useState<any | null>(null);
  const [rejectStatusType, setRejectStatusType] = useState<'rejected' | 'suspended'>('rejected');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCompanies();
      setCompanies(res.data?.companies || []);
    } catch (err: any) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (companyId: number, status: 'verified' | 'rejected' | 'suspended', reason?: string) => {
    try {
      setActionLoading(companyId);
      await adminAPI.verifyCompany(companyId, { status, reason });
      setCompanies(prev => prev.map(c => 
        c.id === companyId 
          ? { ...c, verification_status: status, verified: status === 'verified' ? 1 : 0, rejection_reason: reason } 
          : c
      ));
      setRejectModalCompany(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (statusFilter !== 'all') {
      const current = c.verification_status || (c.verified ? 'verified' : 'pending');
      if (current !== statusFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (c.name || '').toLowerCase();
      const ind = (c.industry || '').toLowerCase();
      const loc = (c.location || '').toLowerCase();
      return name.includes(q) || ind.includes(q) || loc.includes(q);
    }
    return true;
  });

  const getStatusBadge = (company: any) => {
    const status = company.verification_status || (company.verified ? 'verified' : 'pending');
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3d6b35]/10 text-[#3d6b35] border border-[#3d6b35]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Enterprise
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fde9c0]/10 text-[#b45309] border border-[#b45309]/20">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
          Enterprise Verification & Audit
        </h1>
        <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
          Vet hiring organizations, enforce legitimate corporate domains, and award the platform trust seal.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by company name, industry, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#2c2a1e] placeholder-[#9a8e7a] focus:ring-2 focus:ring-[#3d6b35]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['all', 'pending', 'verified', 'rejected', 'suspended'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#3d6b35] text-[#f0ebe0]'
                    : 'bg-[#f5f0e8] text-[#9a8e7a] hover:text-[#f0ebe0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-12 text-center text-[#9a8e7a] space-y-2">
          <Building2 className="w-8 h-8 mx-auto text-[#6b6151]" />
          <p className="text-sm font-semibold text-[#f0ebe0]">No companies found under this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(c => {
            const status = c.verification_status || (c.verified ? 'verified' : 'pending');

            return (
              <div
                key={c.id}
                className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#4a4636] transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#f5f0e8] border border-[#4a4636] flex items-center justify-center text-[#f0ebe0] shrink-0">
                        {c.logo_url ? (
                          <img src={c.logo_url} alt={c.name} className="w-8 h-8 object-contain rounded" onError={(e) => (e.target as any).style.display = 'none'} />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#4a5e2f]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#f0ebe0] text-sm leading-tight">{c.name}</h3>
                        <span className="text-[11px] text-[#9a8e7a] block mt-0.5">{c.industry}</span>
                      </div>
                    </div>
                    {getStatusBadge(c)}
                  </div>

                  <div className="text-xs text-[#9a8e7a] space-y-1.5 pt-2 border-t border-[#4a4636]/80">
                    {c.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#9a8e7a] shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </div>
                    )}
                    {c.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#9a8e7a] shrink-0" />
                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="text-[#3d6b35] hover:underline truncate">
                          {c.website}
                        </a>
                      </div>
                    )}
                    {c.size && (
                      <div className="text-[11px] text-[#9a8e7a]">
                        Headcount: {c.size} employees • Founded: {c.founded_year || 'N/A'}
                      </div>
                    )}
                  </div>

                  {c.rejection_reason && status === 'rejected' && (
                    <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                      <strong>Audit Note:</strong> {c.rejection_reason}
                    </p>
                  )}
                </div>

                {/* Audit Action Buttons */}
                <div className="pt-3 border-t border-[#4a4636] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectCompany(c)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] text-xs font-semibold transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </button>

                  {status !== 'verified' && (
                    <button
                      disabled={actionLoading === c.id}
                      onClick={() => handleVerify(c.id, 'verified')}
                      className="py-1.5 px-3 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-xs font-bold transition flex items-center gap-1"
                      title="Approve & Grant Verified Status"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}

                  {status !== 'rejected' && (
                    <button
                      disabled={actionLoading === c.id}
                      onClick={() => {
                        setRejectModalCompany(c);
                        setRejectStatusType('rejected');
                        setRejectionReason('');
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition"
                      title="Reject with Note"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#f0ebe0] text-base">
              Reject Verification for {rejectModalCompany.name}
            </h3>
            <p className="text-xs text-[#9a8e7a]">
              Please specify the audit reason. This notification will be automatically delivered to the recruiter.
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Corporate website unreachable; domain mismatch with hiring email..."
              className="w-full px-3 py-2 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-xs text-[#f0ebe0]"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalCompany(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e8] hover:bg-[#3a3828] text-[#9a8e7a] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => handleVerify(rejectModalCompany.id, rejectStatusType, rejectionReason)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[#f0ebe0] text-xs font-bold transition disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {inspectCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border border-[#4a4636] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
              <h3 className="font-bold text-[#f0ebe0] text-base">{inspectCompany.name}</h3>
              <button onClick={() => setInspectCompany(null)} className="text-[#9a8e7a] hover:text-[#f0ebe0]">✕</button>
            </div>
            <div className="space-y-3 text-xs text-[#b5aa96]">
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Industry:</span>
                <span className="font-semibold text-[#f0ebe0]">{inspectCompany.industry}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Location:</span>
                <span className="text-[#f0ebe0]">{inspectCompany.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Website:</span>
                <span className="text-[#3d6b35]">{inspectCompany.website || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Contact Email:</span>
                <span className="text-[#f0ebe0]">{inspectCompany.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#4a4636]">
                <span className="text-[#9a8e7a]">Verification Status:</span>
                <span className="capitalize text-[#3d6b35] font-bold">{inspectCompany.verification_status || 'pending'}</span>
              </div>
              <div>
                <span className="text-[#9a8e7a] block mb-1">Company Mission & About:</span>
                <p className="bg-[#f5f0e8] p-2.5 rounded-xl border border-[#4a4636] text-[#b5aa96] leading-relaxed text-[11px]">
                  {inspectCompany.description || 'No detailed mission statement provided.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectCompany(null)}
                className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCompaniesView;


