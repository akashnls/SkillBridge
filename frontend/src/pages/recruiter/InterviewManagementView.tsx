import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Users, 
  Plus, 
  Eye,
  FileText,
  PhoneCall
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const InterviewManagementView: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rescheduleModal, setRescheduleModal] = useState<any | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getInterviews();
      setInterviews(res.data?.interviews || []);
    } catch (err: any) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (interviewId: number | string, status: string, scheduledAt?: string) => {
    try {
      setActionLoading(Number(interviewId) || 0);
      const dateParts = scheduledAt ? scheduledAt.split('T') : [];
      await recruiterAPI.updateInterviewStatus(interviewId, {
        status: status as any,
        interview_date: dateParts[0] || undefined,
        interview_time: dateParts[1]?.slice(0, 5) || undefined
      });
      setInterviews(prev => prev.map(inv => 
        String(inv.id) === String(interviewId) ? { ...inv, status: status as any } : inv
      ));
      if (rescheduleModal) setRescheduleModal(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update interview');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInterviews = interviews.filter(inv => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#c6ddb8]/50 text-[#3d6b35] border border-[#3d6b35]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3d6b35]" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fde9c0] text-[#b45309] border border-[#b45309]/25">
            <RotateCcw className="w-3.5 h-3.5 text-[#b45309]" />
            Rescheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#c8d5a8]/30 text-[#4a5e2f] border border-[#4a5e2f]">
            <Calendar className="w-3.5 h-3.5 text-[#4a5e2f]" />
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Interviews & Screenings</h1>
          <p className="text-[#9a8e7a] text-sm mt-1">
            Track upcoming video rounds, manage schedules, and keep candidate communications synchronized.
          </p>
        </div>

        <button
          onClick={() => navigate('/recruiter/applications')}
          className="px-4 py-2 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] font-semibold text-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule From Pipeline
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#d5cec3] pb-3">
        {['all', 'scheduled', 'completed', 'rescheduled', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              statusFilter === tab
                ? 'bg-[#ede8df] text-[#2c2a1e]'
                : 'text-[#6b6151] hover:bg-[#e4ddd2]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c8d5a8]/30 text-[#4a5e2f] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2c2a1e]">No interviews found</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            There are no interview sessions under this filter. Go to candidate applications to schedule an interview.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInterviews.map(inv => {
            const dateObj = new Date(inv.scheduled_at);
            const isVideo = inv.interview_type === 'video' || !inv.interview_type;

            return (
              <div
                key={inv.id}
                className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm hover:shadow-md transition p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-[#c8d5a8]/30 text-[#4a5e2f] font-bold flex items-center justify-center text-sm">
                      {inv.candidate_name ? inv.candidate_name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3
                        onClick={() => navigate(`/recruiter/candidates/${inv.candidate_id}`)}
                        className="font-bold text-[#2c2a1e] hover:text-[#4a5e2f] cursor-pointer text-base"
                      >
                        {inv.candidate_name}
                      </h3>
                      <span className="text-xs text-[#9a8e7a]">
                        Candidate for <strong className="text-[#6b6151]">{inv.job_title}</strong>
                      </span>
                    </div>
                    {getStatusBadge(inv.status)}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-[#6b6151] font-medium">
                    <span className="flex items-center gap-1.5 text-[#4a5e2f] font-semibold bg-[#c8d5a8]/30/70 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-[#4a5e2f]" />
                      {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9a8e7a]" />
                      {inv.duration_minutes || 45} mins
                    </span>
                    <span className="capitalize flex items-center gap-1">
                      {isVideo ? <Video className="w-3.5 h-3.5 text-[#9a8e7a]" /> : <PhoneCall className="w-3.5 h-3.5 text-[#9a8e7a]" />}
                      {inv.interview_type || 'Video'}
                    </span>
                  </div>

                  {inv.meeting_link && (
                    <div className="text-xs text-[#6b6151] flex items-center gap-2 pt-1">
                      <span className="text-[#9a8e7a]">Meeting:</span>
                      <a
                        href={inv.meeting_link.startsWith('http') ? inv.meeting_link : `https://${inv.meeting_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4a5e2f] hover:text-[#4a5e2f] font-medium inline-flex items-center gap-1 underline"
                      >
                        {inv.meeting_link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {inv.interviewer_notes && (
                    <p className="text-xs text-[#9a8e7a] bg-[#ede8df] p-2.5 rounded-xl border border-[#d5cec3]/60">
                      <strong>Notes:</strong> {inv.interviewer_notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#d5cec3]/60">
                  {inv.meeting_link && inv.status === 'scheduled' && (
                    <a
                      href={inv.meeting_link.startsWith('http') ? inv.meeting_link : `https://${inv.meeting_link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Call
                    </a>
                  )}

                  {inv.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(inv.id, 'completed')}
                        className="px-3 py-2 rounded-xl border border-[#3d6b35]/30 bg-[#c6ddb8]/30 hover:bg-[#c6ddb8]/50 text-[#3d6b35] text-xs font-semibold transition"
                      >
                        Mark Completed
                      </button>

                      <button
                        onClick={() => {
                          setRescheduleModal(inv);
                          setNewDateTime(inv.scheduled_at ? inv.scheduled_at.slice(0, 16) : '');
                        }}
                        className="px-3 py-2 rounded-xl border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#6b6151] text-xs font-medium transition"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(inv.id, 'cancelled')}
                        className="p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 transition"
                        title="Cancel Interview"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ede8df] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <h3 className="text-lg font-bold text-[#2c2a1e]">Reschedule Interview</h3>
            <p className="text-xs text-[#9a8e7a]">
              Select a new date and time for <strong>{rescheduleModal.candidate_name}</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#6b6151] mb-1">New Date & Time *</label>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={e => setNewDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs text-[#2c2a1e]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRescheduleModal(null)}
                className="px-4 py-2 rounded-xl border border-[#d5cec3] text-[#6b6151] text-xs font-semibold hover:bg-[#e4ddd2]"
              >
                Cancel
              </button>
              <button
                disabled={!newDateTime}
                onClick={() => handleUpdateStatus(rescheduleModal.id, 'rescheduled', newDateTime)}
                className="px-4 py-2 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold shadow disabled:opacity-50"
              >
                Save New Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InterviewManagementView;


