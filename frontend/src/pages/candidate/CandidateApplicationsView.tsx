import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { applicationsAPI, Application } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  XCircle,
  Briefcase,
  ChevronRight,
  Filter,
  Eye,
  ArrowUpRight
} from 'lucide-react';

export const CandidateApplicationsView: React.FC = () => {
  const { navigate } = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsAPI.getMyApplications();
      if (res.data?.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    try {
      await applicationsAPI.withdraw(applicationId);
      setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: 'rejected' } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const normalizeStatus = (status?: string): string => {
    if (!status) return '';
    const s = status.toLowerCase().trim().replace(/[\s_-]+/g, '_');
    if (['applied', 'submitted'].includes(s)) return 'applied';
    if (['under_review', 'reviewing', 'in_review'].includes(s)) return 'under_review';
    if (['shortlisted'].includes(s)) return 'shortlisted';
    if (['interview', 'interviewing', 'interview_invited', 'interview_scheduled'].includes(s)) return 'interview';
    if (['selected', 'hired', 'offered', 'offer'].includes(s)) return 'selected';
    if (['rejected', 'withdrawn', 'not_selected', 'archived'].includes(s)) return 'rejected';
    return s;
  };

  const getStatusBadge = (status: string) => {
    const category = normalizeStatus(status);
    const rawLower = status?.toLowerCase().trim() || '';
    switch (category) {
      case 'applied':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-400/10 text-sky-300 border border-sky-400/30 flex items-center gap-1.5 shadow-sm">
            <Send className="w-3.5 h-3.5" />
            <span>Applied</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
      case 'shortlisted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Shortlisted</span>
          </span>
        );
      case 'interview':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center gap-1.5 shadow-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span>{rawLower.includes('invited') ? 'Interview Invited' : 'Interviewing'}</span>
          </span>
        );
      case 'selected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/40 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{rawLower === 'offered' ? 'Offered' : 'Selected / Hired'}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            <span>{rawLower === 'withdrawn' ? 'Withdrawn' : 'Not Selected'}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-[#9CA3A1] border border-white/10">
            {status}
          </span>
        );
    }
  };

  const getCategoryCount = (category: string) => {
    if (category === 'all') return applications.length;
    return applications.filter(a => normalizeStatus(a.status) === category).length;
  };

  const filteredApps = applications.filter(app => {
    if (activeFilter === 'all') return true;
    return normalizeStatus(app.status) === activeFilter;
  });

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
        badge="APPLICATION TRACKER"
        badgeSubtext="Real-Time Status Updates"
        icon={<Send className="w-6 h-6" />}
        title="Job Applications"
        subtitle="Track real-time status changes and interview invitations across all your active submissions."
        actions={
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse More Jobs</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#4a4636] pb-3 text-xs font-semibold">
        {[
          { key: 'all', label: 'All Applications', count: getCategoryCount('all') },
          { key: 'applied', label: 'Applied', count: getCategoryCount('applied') },
          { key: 'under_review', label: 'Under Review', count: getCategoryCount('under_review') },
          { key: 'shortlisted', label: 'Shortlisted', count: getCategoryCount('shortlisted') },
          { key: 'interview', label: 'Interviews', count: getCategoryCount('interview') },
          { key: 'selected', label: 'Selected', count: getCategoryCount('selected') },
          { key: 'rejected', label: 'Archived', count: getCategoryCount('rejected') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/40'
                : 'text-[#9a8e7a] hover:text-[#f0ebe0] hover:bg-[#3a3828]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f5f0e8] border border-[#4a4636]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
          <Briefcase className="w-10 h-10 text-[#9a8e7a] mx-auto" />
          <h3 className="text-base font-bold text-[#f0ebe0]">No Applications in this Category</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Ready to find your next opportunity? Explore recommended jobs tailored to your skills.
          </p>
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-semibold"
          >
            Explore Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a4636] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#f0ebe0]">{app.job_title}</h3>
                    <span className="text-[#9a8e7a]">•</span>
                    <span className="text-xs font-semibold text-[#b5aa96]">{app.company_name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#9a8e7a]">
                    <span>Applied on {new Date(app.created_at).toLocaleDateString()}</span>
                    {app.fit_score !== undefined && (
                      <span className="text-[#4a5e2f] font-bold">Fit Score: {app.fit_score}%</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  {getStatusBadge(app.status)}

                  <button
                    onClick={() => navigate(`/candidate/jobs/${app.job_id}`)}
                    className="p-2 text-[#9a8e7a] hover:text-[#f0ebe0] rounded-lg hover:bg-[#f5f0e8] transition-colors"
                    title="View Job Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {normalizeStatus(app.status) === 'applied' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="px-2.5 py-1 text-xs text-[#9a8e7a] hover:text-rose-400 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Pipeline Visualization */}
              <div className="pt-3 border-t border-[#4a4636]/80">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    ['applied', 'under_review', 'shortlisted', 'interview', 'selected'].includes(normalizeStatus(app.status))
                      ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30'
                      : 'bg-[#f5f0e8] text-[#9a8e7a]'
                  }`}>
                    1. Applied
                  </div>
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    ['under_review', 'shortlisted', 'interview', 'selected'].includes(normalizeStatus(app.status))
                      ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30'
                      : 'bg-[#f5f0e8] text-[#9a8e7a]'
                  }`}>
                    2. Under Review
                  </div>
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    ['shortlisted', 'interview', 'selected'].includes(normalizeStatus(app.status))
                      ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30'
                      : 'bg-[#f5f0e8] text-[#9a8e7a]'
                  }`}>
                    3. Shortlisted
                  </div>
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    ['interview', 'selected'].includes(normalizeStatus(app.status))
                      ? 'bg-[#4a5e2f]/20 text-[#4a5e2f] border border-[#4a5e2f]/30'
                      : 'bg-[#f5f0e8] text-[#9a8e7a]'
                  }`}>
                    4. Interview
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


