import React, { useState } from 'react';
import { ApplicantPipelineATS } from '../components/ApplicantPipelineATS.js';
import { jobsAPI } from '../services/api.js';
import { Plus, X, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const EmployerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Bengaluru / Remote');
  const [jobType, setJobType] = useState('Full-time');
  const [expLevel, setExpLevel] = useState('Junior / 1-2 Years');
  const [salaryRange, setSalaryRange] = useState('₹7,00,000 - ₹10,00,000 / year');
  const [reqSkillsInput, setReqSkillsInput] = useState('');
  const [prefSkillsInput, setPrefSkillsInput] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !reqSkillsInput) return;
    setPosting(true);

    try {
      const requiredSkills = reqSkillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => ({ skill: s, weight: 1.0 }));

      const preferredSkills = prefSkillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await jobsAPI.createJob({
        title,
        description,
        location,
        job_type: jobType,
        experience_level: expLevel,
        salary_range: salaryRange,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills
      });

      if (res.data.success) {
        setPostSuccess(true);
        setTimeout(() => {
          setPostSuccess(false);
          setPostJobModalOpen(false);
          window.location.reload();
        }, 1500);
      }
    } catch (e) {
      console.error('Failed to post job', e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ApplicantPipelineATS onPostJobClick={() => setPostJobModalOpen(true)} />

      {/* Post Job Modal */}
      {postJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>Post New Skill-First Job Opening</span>
              </h3>
              <button
                onClick={() => setPostJobModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postSuccess ? (
              <div className="p-8 text-center text-emerald-400 space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <h4 className="text-base font-bold text-white">Job Opening Published!</h4>
                <p className="text-xs text-slate-400">
                  SkillBridge AI matching engine is now calculating Job-Fit scores for relevant candidates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Engineer (React & Python)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Job Description & Responsibilities *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe core project goals, stack expectations, and collaboration style..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={salaryRange}
                      onChange={e => setSalaryRange(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={e => setJobType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Experience Level</label>
                    <select
                      value={expLevel}
                      onChange={e => setExpLevel(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                    >
                      <option>Entry-Level / 0-2 Years</option>
                      <option>Junior / 1-2 Years</option>
                      <option>Mid-Level / 2-4 Years</option>
                      <option>Senior / 5+ Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Required Skills (Comma-separated, Weighted heavily) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Node.js, SQL, JavaScript"
                    value={reqSkillsInput}
                    onChange={e => setReqSkillsInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Preferred / Nice-to-Have Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. Docker, TypeScript, Tailwind CSS"
                    value={prefSkillsInput}
                    onChange={e => setPrefSkillsInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPostJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={posting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/25"
                  >
                    {posting ? 'Publishing Opening...' : 'Publish Job Opening'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
