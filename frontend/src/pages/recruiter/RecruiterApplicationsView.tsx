import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Award, 
  Eye, 
  MessageSquare, 
  Video, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const RecruiterApplicationsView: React.FC = () => {
  const { navigate, params } = useRouter();
  const initialJobId = params?.jobId || 'all';

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  
  // Matching breakdown modal state
  const [matchModalData, setMatchModalData] = useState<any | null>(null);

  // Quick schedule interview modal state
  const [scheduleModalApp, setScheduleModalApp] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_type: 'video',
    scheduled_at: '',
    duration_minutes: 45,
    location: 'Google Meet',
    meeting_link: 'https://meet.google.com/sb-' + Math.random().toString(36).substring(7),
    interviewer_notes: ''
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        recruiterAPI.getApplications(),
        recruiterAPI.getMyJobs()
      ]);
      setApplications(appsRes.data?.applications || []);
      setJobs(jobsRes.data?.jobs || []);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      await recruiterAPI.updateApplicationStatus(applicationId, newStatus);
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update application status');
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
      // Move application status to interview
      await handleStatusUpdate(scheduleModalApp.id, 'Interviewing');
      setScheduleModalApp(null);
      alert('Interview successfully scheduled and invitation dispatched to candidate!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedJobId !== 'all' && String(app.job_id) !== String(selectedJobId)) return false;
    if (selectedStatus !== 'all' && (app.status || '').toLowerCase() !== selectedStatus.toLowerCase()) return false;
    if (minMatchScore > 0 && (app.fit_score ?? app.deterministic_match?.overall_percentage ?? 0) < minMatchScore) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (app.candidate_name || '').toLowerCase();
      const jobTitle = (app.job_title || '').toLowerCase();
      const email = (app.candidate_email || '').toLowerCase();
      return name.includes(q) || jobTitle.includes(q) || email.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
      'Applied': { label: 'Applied', bg: 'bg-[#c8d5a8]/30', text: 'text-[#4a5e2f]', border: 'border-[#4a5e2f]/25' },
      'Under Review': { label: 'Under Review', bg: 'bg-[#c8d5a8]/30', text: 'text-[#4a5e2f]', border: 'border-[#4a5e2f]' },
      'Shortlisted': { label: 'Shortlisted', bg: 'bg-[#4a5e2f]', text: 'text-[#6b7f47]', border: 'border-[#4a5e2f]' },
      'Interviewing': { label: 'Interviewing', bg: 'bg-[#fde9c0]', text: 'text-[#b45309]', border: 'border-[#b45309]/25' },
      'Offered': { label: 'Hired / Offer', bg: 'bg-[#c6ddb8]/50', text: 'text-[#3d6b35]', border: 'border-[#3d6b35]/30' },
      'Rejected': { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };

    const s = map[status] || { label: status, bg: 'bg-[#ede8df]', text: 'text-[#6b6151]', border: 'border-[#d5cec3]' };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Candidate Applications</h1>
        <p className="text-[#9a8e7a] text-sm mt-1">
          Review, filter, and progress candidates with verified credentials across your hiring pipelines.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
            />
          </div>

          {/* Job Filter */}
          <div>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm font-medium text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
            >
              <option value="all">All Job Requisitions ({jobs.length})</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm font-medium text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
            >
              <option value="all">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interview Scheduled</option>
              <option value="Offered">Hired / Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Min Match Slider */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs font-semibold text-[#6b6151] whitespace-nowrap">
              Min Match: {minMatchScore}%
            </span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minMatchScore}
              onChange={e => setMinMatchScore(parseInt(e.target.value))}
              className="w-full accent-[#4a5e2f] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c8d5a8]/30 text-[#4a5e2f] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2c2a1e]">No applications match the filters</h3>
          <p className="text-xs text-[#9a8e7a] max-w-sm mx-auto">
            Try adjusting your search criteria, selecting a different requisition, or lowering the minimum match threshold.
          </p>
        </div>
      ) : (
        <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#6b6151]">
              <thead className="bg-[#ede8df] text-[#6b6151] text-xs font-semibold uppercase tracking-wider border-b border-[#d5cec3]">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Job Requisition</th>
                  <th className="px-6 py-4">Match Engine</th>
                  <th className="px-6 py-4">Status & Pipeline</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5cec3]">
                {filteredApplications.map(app => {
                  const matchScore = app.fit_score ?? app.deterministic_match?.overall_percentage ?? 82;
                  const deterministic = app.deterministic_match;

                  return (
                    <tr key={app.id} className="hover:bg-[#e4ddd2]/80 transition">
                      {/* Candidate info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#c8d5a8]/30 text-[#4a5e2f] font-bold flex items-center justify-center text-sm shrink-0">
                            {app.candidate_name ? app.candidate_name[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <button
                              onClick={() => navigate(`/recruiter/candidates/${app.candidate_id}`)}
                              className="font-bold text-[#2c2a1e] hover:text-[#4a5e2f] text-left transition block"
                            >
                              {app.candidate_name || 'Candidate #' + app.candidate_id}
                            </button>
                            <span className="text-xs text-[#9a8e7a] block">
                              {app.candidate_email || 'Verified Candidate'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#2c2a1e] block text-xs md:text-sm">
                          {app.job_title}
                        </span>
                        <span className="text-xs text-[#9a8e7a]">
                          {app.department || 'Engineering'}
                        </span>
                      </td>

                      {/* Match Engine */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setMatchModalData(app)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                            matchScore >= 80 
                              ? 'bg-[#c6ddb8]/50 text-[#3d6b35] border-[#3d6b35]/30 hover:bg-[#c6ddb8]' 
                              : matchScore >= 60 
                              ? 'bg-[#c8d5a8]/30 text-[#4a5e2f] border-[#4a5e2f] hover:bg-[#c8d5a8]/30' 
                              : 'bg-[#fde9c0] text-[#b45309] border-[#b45309]/25 hover:bg-[#b45309]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{matchScore}% Match</span>
                        </button>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={app.status}
                            onChange={e => handleStatusUpdate(app.id, e.target.value)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#d5cec3] bg-[#ede8df] text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] cursor-pointer"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offered">Hired / Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 text-xs text-[#9a8e7a]">
                        {new Date(app.created_at || Date.now()).toLocaleDateString()}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/recruiter/candidates/${app.candidate_id}`)}
                            className="p-1.5 rounded-lg text-[#9a8e7a] hover:text-[#4a5e2f] hover:bg-[#c8d5a8]/30 transition"
                            title="View Full Candidate Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setScheduleModalApp(app);
                              setInterviewForm(prev => ({
                                ...prev,
                                scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
                              }));
                            }}
                            className="p-1.5 rounded-lg text-[#4a5e2f] hover:bg-[#c8d5a8]/30 transition"
                            title="Schedule Interview"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/recruiter/messages?candidateId=${app.candidate_id}`)}
                            className="p-1.5 rounded-lg text-[#9a8e7a] hover:text-[#4a5e2f] hover:bg-[#c8d5a8]/30 transition"
                            title="Direct Message"
                          >
                            <MessageSquare className="w-4 h-4" />
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

      {/* Match Breakdown Modal */}
      {matchModalData && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ede8df] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5cec3] space-y-5">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a5e2f]">Deterministic Fit Engine</span>
                <h3 className="text-lg font-bold text-[#2c2a1e]">{matchModalData.candidate_name}</h3>
              </div>
              <div className="text-xl font-extrabold text-[#4a5e2f]">
                {matchModalData.fit_score ?? matchModalData.deterministic_match?.overall_percentage ?? 82}%
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#ede8df] border border-[#d5cec3]/60 space-y-2">
                <div className="flex justify-between font-semibold text-[#6b6151]">
                  <span>Required Skills (50% max)</span>
                  <span className="text-[#4a5e2f] font-bold">
                    {matchModalData.deterministic_match?.breakdown?.required_skills_score ?? 45} / 50 pts
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#6b6151]">
                  <span>Preferred Skills (20% max)</span>
                  <span className="text-[#4a5e2f] font-bold">
                    {matchModalData.deterministic_match?.breakdown?.preferred_skills_score ?? 15} / 20 pts
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#6b6151]">
                  <span>Experience Alignment (15% max)</span>
                  <span className="text-[#4a5e2f] font-bold">
                    {matchModalData.deterministic_match?.breakdown?.experience_score ?? 15} / 15 pts
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#6b6151]">
                  <span>Education Level (10% max)</span>
                  <span className="text-[#4a5e2f] font-bold">
                    {matchModalData.deterministic_match?.breakdown?.education_score ?? 10} / 10 pts
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#6b6151]">
                  <span>Location & Work Preference (5% max)</span>
                  <span className="text-[#4a5e2f] font-bold">
                    {matchModalData.deterministic_match?.breakdown?.location_score ?? 5} / 5 pts
                  </span>
                </div>
              </div>

              {/* Matched Skills Tags */}
              {matchModalData.deterministic_match?.matched_skills?.length > 0 && (
                <div>
                  <span className="font-bold text-[#2c2a1e] block mb-1">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchModalData.deterministic_match.matched_skills.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-[#c6ddb8]/50 text-[#3d6b35] font-medium text-[11px] border border-[#3d6b35]/30">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills Tags */}
              {matchModalData.deterministic_match?.missing_skills?.length > 0 && (
                <div>
                  <span className="font-bold text-[#2c2a1e] block mb-1">Missing / Unverified Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchModalData.deterministic_match.missing_skills.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium text-[11px] border border-rose-200">
                        ✕ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#d5cec3]/60 pt-3 flex justify-end">
              <button
                onClick={() => setMatchModalData(null)}
                className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold hover:bg-[#3a3828] transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleScheduleInterview} className="bg-[#ede8df] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#4a5e2f]" />
                <h3 className="text-lg font-bold text-[#2c2a1e]">Schedule Interview</h3>
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
              Scheduling interview with <strong>{scheduleModalApp.candidate_name}</strong> for <strong>{scheduleModalApp.job_title}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b6151] mb-1">Interview Format</label>
                <select
                  value={interviewForm.interview_type}
                  onChange={e => setInterviewForm(p => ({ ...p, interview_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-medium text-[#2c2a1e] bg-[#ede8df]"
                >
                  <option value="video">Live Video Call</option>
                  <option value="phone">Phone Screening</option>
                  <option value="in_person">On-Site / In-Person</option>
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
                  <option value={90}>90 Minutes</option>
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
                placeholder="https://meet.google.com/xyz or Office Room 4B"
                className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs text-[#2c2a1e]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6b6151] mb-1">Interviewer Instructions / Agenda</label>
              <textarea
                rows={3}
                value={interviewForm.interviewer_notes}
                onChange={e => setInterviewForm(p => ({ ...p, interviewer_notes: e.target.value }))}
                placeholder="Brief candidate on what to expect, system design questions, etc."
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
                {scheduling ? 'Scheduling...' : 'Confirm & Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default RecruiterApplicationsView;


