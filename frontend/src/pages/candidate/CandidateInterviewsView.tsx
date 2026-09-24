import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { candidateAPI, ScheduledInterview } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const CandidateInterviewsView: React.FC = () => {
  const { navigate } = useRouter();
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getInterviews();
      if (res.data?.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#c8d5a8]/15 text-[#4a5e2f] border border-[#4a5e2f]/30 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#4a5e2f]/15 text-[#4a5e2f] border border-[#4a5e2f]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#3d6b35]/15 text-[#3d6b35] border border-[#3d6b35]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fde9c0]/15 text-[#b45309] border border-[#b45309]/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Rescheduled
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#3a3828] text-[#b5aa96]">
            {status}
          </span>
        );
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
        badge="RECRUITER MEETINGS"
        badgeSubtext="Live Video & Technical Rounds"
        icon={<Calendar className="w-6 h-6" />}
        title="Scheduled Interviews"
        subtitle="Review your upcoming recruiter interviews, video meeting links, and preparation guidance."
        actions={
          <button
            onClick={() => navigate('/candidate/mock-interview')}
            className="sb-btn-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Practice with AI</span>
          </button>
        }
      />

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="p-12 bg-[#f5f0e8]/60 rounded-2xl border border-[#4a4636] text-center space-y-3">
          <Calendar className="w-12 h-12 text-[#9a8e7a] mx-auto" />
          <h3 className="text-base font-bold text-[#f0ebe0]">No Scheduled Interviews Yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            When recruiters shortlist your applications and schedule an interview, details and meeting links will appear here.
          </p>
          <button
            onClick={() => navigate('/candidate/jobs')}
            className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-semibold cursor-pointer"
          >
            Apply to More Roles
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#f5f0e8]/70 rounded-2xl border border-[#4a4636] hover:border-[#4a4636] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#f0ebe0]">{item.job_title}</h3>
                    <span className="text-[#9a8e7a]">•</span>
                    <span className="text-xs font-semibold text-[#b5aa96]">{item.company_name}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#b5aa96] mt-2">
                    <div className="flex items-center gap-1.5 bg-[#f5f0e8] px-3 py-1.5 rounded-lg border border-[#4a4636]">
                      <Calendar className="w-3.5 h-3.5 text-[#4a5e2f]" />
                      <span>{item.interview_date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#f5f0e8] px-3 py-1.5 rounded-lg border border-[#4a4636]">
                      <Clock className="w-3.5 h-3.5 text-[#4a5e2f]" />
                      <span>{item.interview_time}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#f5f0e8] px-3 py-1.5 rounded-lg border border-[#4a4636]">
                      <Video className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>{item.interview_type || 'Video Call'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Notes & Meeting Link */}
              <div className="pt-3 border-t border-[#4a4636]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#9a8e7a]">
                  {item.notes ? (
                    <span>Note: {item.notes}</span>
                  ) : (
                    <span>Make sure your camera and microphone are tested before the call.</span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => navigate(`/candidate/mock-interview?job_id=${item.job_id}`)}
                    className="px-3 py-1.5 bg-[#f5f0e8] hover:bg-[#3a3828] text-[#b5aa96] border border-[#4a4636] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>Prep for this Role</span>
                  </button>

                  {item.meeting_link && item.status !== 'cancelled' && (
                    <a
                      href={item.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 bg-gradient-to-r from-[#4a5e2f] to-[#4a5e2f] hover:from-[#4a5e2f] hover:to-[#4a5e2f] text-[#f0ebe0] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#4a5e2f]/20"
                    >
                      <span>Join Meeting</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


