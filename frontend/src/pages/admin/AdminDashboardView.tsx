import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Building2, 
  CheckSquare, 
  Award, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  FileSpreadsheet, 
  TrendingUp,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const AdminDashboardView: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboard();
      setData(res.data || null);
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId: number, status: 'verified' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Please enter rejection reason for this company:') : undefined;
    if (status === 'rejected' && !reason) return;

    try {
      setActionLoading(`company-${companyId}`);
      await adminAPI.verifyCompany(companyId, { status, reason });
      await loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateJob = async (jobId: number, status: 'approved' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Enter moderation rejection reason:') : undefined;
    if (status === 'rejected' && !reason) return;

    try {
      setActionLoading(`job-${jobId}`);
      await adminAPI.moderateJob(jobId, { status, reason });
      await loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-[#3d6b35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const pendingCompanies = data?.company_verifications || [];
  const pendingJobs = data?.job_moderations || [];
  const reports = data?.flagged_reports || [];
  const recentLogs = data?.recent_activity || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#f0ebe0] tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-[#9a8e7a] text-xs md:text-sm mt-1">
            Real-time compliance monitoring, entity verification queues, and audit telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard()}
            className="px-3.5 py-2 rounded-xl bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] text-xs font-semibold transition border border-[#4a4636] flex items-center gap-2"
          >
            <Activity className="w-3.5 h-3.5 text-[#3d6b35]" />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-[#f5f0e8]/80 border border-[#4a4636] p-5 rounded-2xl cursor-pointer hover:border-[#4a4636] transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a8e7a]">Total Accounts</span>
            <Users className="w-4 h-4 text-[#3d6b35]" />
          </div>
          <div className="text-2xl font-bold text-[#f0ebe0]">{kpis.total_users || 0}</div>
          <div className="text-[11px] text-[#9a8e7a]">
            {kpis.candidates_count || 0} candidates • {kpis.recruiters_count || 0} recruiters
          </div>
        </div>

        {/* Company Verifications */}
        <div 
          onClick={() => navigate('/admin/companies')}
          className="bg-[#f5f0e8]/80 border border-[#4a4636] p-5 rounded-2xl cursor-pointer hover:border-[#4a4636] transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a8e7a]">Companies</span>
            <Building2 className="w-4 h-4 text-[#4a5e2f]" />
          </div>
          <div className="text-2xl font-bold text-[#f0ebe0]">{kpis.companies_count || 0}</div>
          <div className="text-[11px] text-[#b45309] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {kpis.pending_companies || 0} awaiting verification
          </div>
        </div>

        {/* Job Requisitions */}
        <div 
          onClick={() => navigate('/admin/jobs')}
          className="bg-[#f5f0e8]/80 border border-[#4a4636] p-5 rounded-2xl cursor-pointer hover:border-[#4a4636] transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a8e7a]">Job Requisitions</span>
            <CheckSquare className="w-4 h-4 text-[#4a5e2f]" />
          </div>
          <div className="text-2xl font-bold text-[#f0ebe0]">{kpis.total_jobs || 0}</div>
          <div className="text-[11px] text-[#b45309] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {kpis.pending_jobs || 0} pending moderation
          </div>
        </div>

        {/* Applications */}
        <div 
          onClick={() => navigate('/admin/applications')}
          className="bg-[#f5f0e8]/80 border border-[#4a4636] p-5 rounded-2xl cursor-pointer hover:border-[#4a4636] transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a8e7a]">Total Applications</span>
            <FileSpreadsheet className="w-4 h-4 text-[#6b7f47]" />
          </div>
          <div className="text-2xl font-bold text-[#f0ebe0]">{kpis.total_applications || 0}</div>
          <div className="text-[11px] text-[#3d6b35] font-semibold">
            {kpis.verified_badges || 0} verified credentials issued
          </div>
        </div>
      </div>

      {/* Action Queues: Company Verifications & Job Moderations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Companies Queue */}
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#4a5e2f]" />
              <h2 className="font-bold text-sm text-[#f0ebe0]">Company Verification Queue</h2>
            </div>
            <button
              onClick={() => navigate('/admin/companies')}
              className="text-xs text-[#3d6b35] hover:text-[#3d6b35] font-semibold flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingCompanies.length === 0 ? (
            <div className="p-8 text-center text-[#9a8e7a] text-xs">
              <CheckCircle2 className="w-8 h-8 text-[#3d6b35] mx-auto mb-2" />
              No pending company verifications! All enterprises audited.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCompanies.slice(0, 4).map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[#f5f0e8] border border-[#4a4636] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#f0ebe0] truncate">{c.name}</h4>
                    <p className="text-[11px] text-[#9a8e7a]">
                      {c.industry} • {c.location || 'Location unspecified'}
                    </p>
                    {c.website && (
                      <span className="text-[10px] text-[#4a5e2f] block truncate">{c.website}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={actionLoading === `company-${c.id}`}
                      onClick={() => handleVerifyCompany(c.id, 'verified')}
                      className="p-2 rounded-lg bg-[#3d6b35]/20 hover:bg-[#3d6b35] text-[#3d6b35] hover:text-[#f0ebe0] transition"
                      title="Verify Company"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      disabled={actionLoading === `company-${c.id}`}
                      onClick={() => handleVerifyCompany(c.id, 'rejected')}
                      className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-[#f0ebe0] transition"
                      title="Reject Verification"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Job Moderation Queue */}
        <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#4a5e2f]" />
              <h2 className="font-bold text-sm text-[#f0ebe0]">Job Moderation Queue</h2>
            </div>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="text-xs text-[#3d6b35] hover:text-[#3d6b35] font-semibold flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="p-8 text-center text-[#9a8e7a] text-xs">
              <CheckCircle2 className="w-8 h-8 text-[#3d6b35] mx-auto mb-2" />
              Job moderation queue is clear. All submissions approved.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.slice(0, 4).map((j: any) => (
                <div
                  key={j.id}
                  className="p-4 rounded-xl bg-[#f5f0e8] border border-[#4a4636] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#f0ebe0] truncate">{j.title}</h4>
                    <p className="text-[11px] text-[#9a8e7a]">
                      {j.company_name || 'Enterprise'} • {j.location} ({j.work_mode || 'remote'})
                    </p>
                    <span className="text-[10px] text-[#9a8e7a] block">
                      Posted by {j.recruiter_name || 'Recruiter'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={actionLoading === `job-${j.id}`}
                      onClick={() => handleModerateJob(j.id, 'approved')}
                      className="p-2 rounded-lg bg-[#3d6b35]/20 hover:bg-[#3d6b35] text-[#3d6b35] hover:text-[#f0ebe0] transition"
                      title="Approve Job"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      disabled={actionLoading === `job-${j.id}`}
                      onClick={() => handleModerateJob(j.id, 'rejected')}
                      className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-[#f0ebe0] transition"
                      title="Reject Job with Reason"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flagged Reports & Audit Log Peek */}
      <div className="bg-[#f5f0e8]/80 border border-[#4a4636] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#4a4636] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#b45309]" />
            <h2 className="font-bold text-sm text-[#f0ebe0]">Trust & Safety Reports ({reports.length})</h2>
          </div>
          <button
            onClick={() => navigate('/admin/reports')}
            className="text-xs text-[#3d6b35] hover:text-[#3d6b35] font-semibold flex items-center gap-1"
          >
            Manage Reports
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-[#9a8e7a] py-3">No active user flags or incident reports.</p>
        ) : (
          <div className="divide-y divide-[#d5cec3]">
            {reports.slice(0, 3).map((r: any) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f0ebe0]">{r.reason || 'Flagged Content'}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#fde9c0]/20 text-[#b45309] border border-[#b45309]/30">
                      {r.target_type} #{r.target_id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9a8e7a]">{r.description || 'No detailed description provided.'}</p>
                </div>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="px-3 py-1.5 rounded-lg bg-[#3a3828] hover:bg-[#4a4636] text-[#9a8e7a] text-xs font-medium transition"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboardView;


