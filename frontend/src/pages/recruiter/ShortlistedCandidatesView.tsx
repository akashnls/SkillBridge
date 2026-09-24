import React, { useState, useEffect } from 'react';
import { 
  BookmarkCheck, 
  Users, 
  Video, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const ShortlistedCandidatesView: React.FC = () => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  // Quick schedule interview modal state
  const [scheduleModalApp, setScheduleModalApp] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_type: 'video',
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    duration_minutes: 45,
    location: 'Google Meet',
    meeting_link: 'https://meet.google.com/sb-' + Math.random().toString(36).substring(7),
    interviewer_notes: ''
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchShortlisted();
  }, []);

  const fetchShortlisted = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getApplications();
      const allApps = res.data?.applications || [];
      // Filter for shortlisted or under_review
      setApplications(allApps.filter((a: any) => a.status === 'shortlisted' || a.status === 'under_review'));
    } catch (err: any) {
      console.error('Failed to load shortlisted candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      await recruiterAPI.updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    try {
      const dateParts = interviewForm.scheduled_at ? interviewForm.scheduled_at.split('T') : [];
      await recruiterAPI.scheduleInterview({
        application_id: String(scheduleModalApp.id),
        candidate_id: String(scheduleModalApp.candidate_id || scheduleModalApp.user_id),
        job_id: String(scheduleModalApp.job_id),
        interview_date: dateParts[0] || new Date().toISOString().split('T')[0],
        interview_time: dateParts[1]?.slice(0, 5) || '10:00',
        interview_type: interviewForm.interview_type || 'Video',
        meeting_link: interviewForm.meeting_link,
        location: interviewForm.location,
        notes: interviewForm.interviewer_notes
      });
      await recruiterAPI.updateApplicationStatus(scheduleModalApp.id, 'interview');
      setApplications(prev => prev.filter(a => a.id !== scheduleModalApp.id));
      setScheduleModalApp(null);
      alert('Interview scheduled successfully! Candidate moved to Interview stage.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-6 h-6 text-[#4a5e2f]" />
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Shortlisted Talent Pipeline</h1>
        </div>
        <p className="text-[#9a8e7a] text-sm mt-1">
          Priority candidates selected for further evaluation and interview scheduling.
        </p>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c8d5a8]/30 text-[#4a5e2f] flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2c2a1e]">No candidates shortlisted yet</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Review your incoming job applications and promote standout candidates to the shortlist.
          </p>
          <button
            onClick={() => navigate('/recruiter/applications')}
            className="px-4 py-2 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold transition"
          >
            Review Applications
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => {
            const score = app.fit_score ?? app.deterministic_match?.overall_percentage ?? 80;

            return (
              <div
                key={app.id}
                className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#4a5e2f] text-[#6b7f47] font-bold flex items-center justify-center text-sm">
                        {app.candidate_name ? app.candidate_name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h3 
                          onClick={() => navigate(`/recruiter/candidates/${app.candidate_id}`)}
                          className="font-bold text-[#2c2a1e] hover:text-[#4a5e2f] cursor-pointer text-sm"
                        >
                          {app.candidate_name}
                        </h3>
                        <span className="text-xs text-[#9a8e7a] block">{app.candidate_email}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#4a5e2f] text-[#6b7f47] border border-[#4a5e2f] text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {score}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#ede8df] border border-[#d5cec3]/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#9a8e7a]">Applied for:</span>
                      <span className="font-semibold text-[#2c2a1e]">{app.job_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9a8e7a]">Status:</span>
                      <span className="font-semibold text-[#4a5e2f] capitalize">{app.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#d5cec3]/60 space-y-2">
                  <button
                    onClick={() => setScheduleModalApp(app)}
                    className="w-full py-2 px-3 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Schedule Interview
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/recruiter/candidates/${app.candidate_id}`)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#6b6151] text-xs font-medium transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Dossier
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id, 'rejected')}
                      className="py-1.5 px-3 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-600 text-xs font-medium transition"
                      title="Pass / Reject"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleScheduleInterview} className="bg-[#ede8df] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#4a5e2f]" />
                <h3 className="text-lg font-bold text-[#2c2a1e]">Schedule Candidate Interview</h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalApp(null)}
                className="text-[#9a8e7a] hover:text-[#6b6151]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#9a8e7a]">
              Candidate: <strong>{scheduleModalApp.candidate_name}</strong> • Role: <strong>{scheduleModalApp.job_title}</strong>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b6151] mb-1">Type</label>
                <select
                  value={interviewForm.interview_type}
                  onChange={e => setInterviewForm(p => ({ ...p, interview_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-medium text-[#2c2a1e] bg-[#ede8df]"
                >
                  <option value="video">Live Video</option>
                  <option value="phone">Phone Screening</option>
                  <option value="in_person">On-Site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b6151] mb-1">Duration</label>
                <select
                  value={interviewForm.duration_minutes}
                  onChange={e => setInterviewForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-medium text-[#2c2a1e] bg-[#ede8df]"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6b6151] mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={interviewForm.scheduled_at}
                onChange={e => setInterviewForm(p => ({ ...p, scheduled_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs text-[#2c2a1e]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6b6151] mb-1">Meeting Link or Location</label>
              <input
                type="text"
                value={interviewForm.meeting_link}
                onChange={e => setInterviewForm(p => ({ ...p, meeting_link: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs text-[#2c2a1e]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#d5cec3]/60">
              <button
                type="button"
                onClick={() => setScheduleModalApp(null)}
                className="px-4 py-2 rounded-xl border border-[#d5cec3] text-[#6b6151] text-xs font-semibold hover:bg-[#e4ddd2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduling}
                className="px-5 py-2 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold shadow transition disabled:opacity-50"
              >
                {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default ShortlistedCandidatesView;


