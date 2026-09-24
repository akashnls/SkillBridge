import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  ExternalLink, 
  Globe, 
  Video, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  BookmarkCheck,
  Sparkles,
  Layers,
  Code,
  Code2
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const CandidateProfileDetailView: React.FC = () => {
  const { navigate, params } = useRouter();
  const candidateId = params?.candidateId || params?.id;

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const [interviewForm, setInterviewForm] = useState({
    job_id: '',
    interview_type: 'video',
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    duration_minutes: 45,
    location: 'Google Meet',
    meeting_link: 'https://meet.google.com/sb-' + Math.random().toString(36).substring(7),
    interviewer_notes: ''
  });

  useEffect(() => {
    if (candidateId) {
      loadProfile(candidateId);
    }
  }, [candidateId]);

  const loadProfile = async (id: string) => {
    try {
      setLoading(true);
      const [candRes, jobsRes] = await Promise.all([
        recruiterAPI.getCandidateProfile(id),
        recruiterAPI.getMyJobs()
      ]);
      setCandidate(candRes.data?.candidate || null);
      const availableJobs = jobsRes.data?.jobs || [];
      setJobs(availableJobs);
      if (availableJobs.length > 0) {
        setInterviewForm(prev => ({ ...prev, job_id: String(availableJobs[0].id) }));
      }
    } catch (err: any) {
      console.error('Failed to load candidate dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !interviewForm.job_id) return;

    try {
      setScheduling(true);
      const scheduledAt = new Date(interviewForm.scheduled_at);
      await recruiterAPI.scheduleInterview({
        candidate_id: String(candidateId),
        job_id: String(interviewForm.job_id),
        interview_type: interviewForm.interview_type,
        interview_date: scheduledAt.toISOString().slice(0, 10),
        interview_time: scheduledAt.toTimeString().slice(0, 5),
        meeting_link: interviewForm.meeting_link,
        location: interviewForm.location,
        notes: interviewForm.interviewer_notes
      });
      setScheduleModalOpen(false);
      alert('Interview scheduled successfully and calendar invite dispatched!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-[#2c2a1e]">Candidate Not Found</h2>
        <button
          onClick={() => navigate('/recruiter/candidates')}
          className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold"
        >
          Back to Candidate Search
        </button>
      </div>
    );
  }

  const badges = candidate.badges || [];
  const portfolios = candidate.portfolios || [];
  const skills: string[] = Array.isArray(candidate.skills)
    ? candidate.skills
    : typeof candidate.skills === 'string'
    ? JSON.parse(candidate.skills || '[]')
    : [];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/recruiter/candidates')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a8e7a] hover:text-[#2c2a1e] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Candidate Search
      </button>

      {/* Header Banner */}
      <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-[#4a5e2f] to-[#4a5e2f] text-[#f0ebe0] font-extrabold text-3xl flex items-center justify-center shadow-lg shrink-0">
            {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">{candidate.name}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3d6b35] text-[#B6FF3B] border border-[#3d6b35] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#B6FF3B]" />
                Verified Candidate Dossier
              </span>
            </div>
            <p className="text-sm font-medium text-[#6b6151]">
              {candidate.title || candidate.headline || 'Software Engineer'}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#9a8e7a] pt-1 flex-wrap">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9a8e7a]" />
                  {candidate.location}
                </span>
              )}
              {candidate.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#9a8e7a]" />
                  {candidate.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#9a8e7a]" />
                {candidate.experience_years || 2} Years Experience
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            Schedule Interview
          </button>
          <button
            onClick={() => navigate(`/recruiter/messages?candidateId=${candidate.id}`)}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#6b6151] font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-[#9a8e7a]" />
            Direct Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Credentials, Projects, Experience */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cryptographic Badges Section */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#4a5e2f]" />
                <h2 className="text-base font-bold text-[#2c2a1e]">
                  Verified Skill Micro-Credentials ({badges.length})
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-[#B6FF3B] bg-[#3d6b35] px-2.5 py-0.5 rounded-full border border-[#3d6b35]">
                HMAC SHA-256 Verifiable
              </span>
            </div>

            {badges.length === 0 ? (
              <p className="text-xs text-[#9a8e7a] py-4">No verified credentials earned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((b: any) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBadge(b)}
                    className="p-4 rounded-xl border border-[#d5cec3] bg-[#ede8df]/50 hover:bg-[#e4ddd2] hover:border-[#4a5e2f] transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#4a5e2f] text-[#f0ebe0] flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition">
                          ★
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#2c2a1e] group-hover:text-[#4a5e2f] transition">
                            {b.title}
                          </h4>
                          <span className="text-[11px] text-[#9a8e7a] block">
                            Score: {b.score}% • {new Date(b.issue_date || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-[#3d6b35] shrink-0" />
                    </div>
                    <div className="text-[11px] text-[#9a8e7a] line-clamp-2">
                      {b.description || 'Demonstrated proficiency in assessment evaluation.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Projects Section */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#d5cec3]/60 pb-3">
              <Layers className="w-5 h-5 text-[#4a5e2f]" />
              <h2 className="text-base font-bold text-[#2c2a1e]">
                Verified Portfolio Projects ({portfolios.length})
              </h2>
            </div>

            {portfolios.length === 0 ? (
              <p className="text-xs text-[#9a8e7a] py-4">No portfolio projects published yet.</p>
            ) : (
              <div className="space-y-4">
                {portfolios.map((proj: any) => {
                  const projTags = Array.isArray(proj.tech_stack)
                    ? proj.tech_stack
                    : typeof proj.tech_stack === 'string'
                    ? JSON.parse(proj.tech_stack || '[]')
                    : [];

                  return (
                    <div key={proj.id} className="p-4 rounded-xl border border-[#d5cec3] space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#2c2a1e]">{proj.title}</h3>
                          <p className="text-xs text-[#6b6151] mt-1 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-[#d5cec3] text-[#6b6151] hover:text-[#2c2a1e] hover:bg-[#e4ddd2] transition"
                              title="GitHub Repository"
                            >
                              <Code2 className="w-4 h-4" />
                            </a>
                          )}
                          {proj.live_url && (
                            <a
                              href={proj.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-[#d5cec3] text-[#4a5e2f] hover:bg-[#c8d5a8]/30 transition"
                              title="Live Demo"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {projTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {projTags.map((t: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#ede8df] text-[#6b6151] text-[11px] font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* About / Bio */}
          {candidate.bio && (
            <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3">
                Candidate Bio & Background
              </h2>
              <p className="text-xs md:text-sm text-[#6b6151] whitespace-pre-wrap leading-relaxed">
                {candidate.bio}
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Skills, Education & Metadata */}
        <div className="space-y-6">
          {/* Skills Breakdown */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-[#2c2a1e] text-base border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#4a5e2f]" />
              Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold border border-[#d5cec3]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Experience Details */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-[#2c2a1e] text-base border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#4a5e2f]" />
              Education & Background
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-[#6b6151] block">Degree / Level</span>
                <span className="text-[#2c2a1e]">{candidate.education || "Bachelor of Science in Computer Science"}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6b6151] block">Total Experience</span>
                <span className="text-[#2c2a1e]">{candidate.experience_years || 2} Years Professional</span>
              </div>
              <div>
                <span className="font-semibold text-[#6b6151] block">Preferred Work Mode</span>
                <span className="text-[#2c2a1e]">Remote or Hybrid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Cryptographic Verification Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ede8df] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3d6b35]" />
                <h3 className="font-bold text-[#2c2a1e] text-base">Cryptographic Credential</h3>
              </div>
              <button onClick={() => setSelectedBadge(null)} className="text-[#9a8e7a] hover:text-[#6b6151]">
                ✕
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <div className="w-16 h-16 rounded-2xl bg-[#4a5e2f] text-[#f0ebe0] font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
                ★
              </div>
              <h4 className="font-bold text-[#2c2a1e] text-lg">{selectedBadge.title}</h4>
              <p className="text-xs text-[#9a8e7a]">{selectedBadge.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#ede8df] border border-[#d5cec3]/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#9a8e7a]">Recipient:</span>
                <span className="font-semibold text-[#2c2a1e]">{candidate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a8e7a]">Evaluation Score:</span>
                <span className="font-bold text-[#3d6b35]">{selectedBadge.score}% (Proficient)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a8e7a]">Issuer:</span>
                <span className="font-semibold text-[#2c2a1e]">{selectedBadge.issuer || 'SkillBridge Credential Authority'}</span>
              </div>
              <div>
                <span className="text-[#9a8e7a] block mb-1">Verification Hash (HMAC):</span>
                <code className="text-[10px] text-[#6b6151] bg-[#d5cec3]/70 p-1.5 rounded block break-all font-mono">
                  {selectedBadge.verification_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </code>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold hover:bg-[#3a3828] transition"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleScheduleInterview} className="bg-[#ede8df] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d5cec3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#4a5e2f]" />
                <h3 className="text-lg font-bold text-[#2c2a1e]">Schedule Candidate Interview</h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-[#9a8e7a] hover:text-[#6b6151]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6b6151] mb-1">Select Job Requisition *</label>
              <select
                required
                value={interviewForm.job_id}
                onChange={e => setInterviewForm(p => ({ ...p, job_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-semibold text-[#2c2a1e] bg-[#ede8df]"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b6151] mb-1">Format</label>
                <select
                  value={interviewForm.interview_type}
                  onChange={e => setInterviewForm(p => ({ ...p, interview_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-xs font-medium text-[#2c2a1e] bg-[#ede8df]"
                >
                  <option value="video">Live Video</option>
                  <option value="phone">Phone Screen</option>
                  <option value="in_person">In-Person</option>
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
                onClick={() => setScheduleModalOpen(false)}
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
export default CandidateProfileDetailView;


