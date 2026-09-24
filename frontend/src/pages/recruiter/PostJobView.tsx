import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  Layers, 
  Plus, 
  X, 
  Save, 
  Send, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Building2,
  Users,
  GraduationCap
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const PostJobView: React.FC = () => {
  const { navigate, params } = useRouter();
  const editJobId = params?.id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Skill input helpers
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    work_mode: 'remote',
    type: 'full-time',
    experience_level: 'mid',
    experience_years_required: 3,
    education_requirement: "Bachelor's Degree",
    openings: 1,
    application_deadline: '',
    salary_min: 80000,
    salary_max: 120000,
    currency: 'USD',
    required_skills: ['TypeScript', 'React', 'Node.js'] as string[],
    preferred_skills: ['Docker', 'AWS', 'PostgreSQL'] as string[],
    description: '',
    responsibilities: '',
    benefits_text: '• Comprehensive Health Insurance\n• 401(k) Matching\n• Flexible Working Hours & Remote Work\n• Annual Education & Tech Stipend',
    status: 'open'
  });

  useEffect(() => {
    if (editJobId) {
      loadJobDetails(editJobId);
    }
  }, [editJobId]);

  const loadJobDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getMyJobs();
      const existing = (res.data?.jobs || []).find((j: any) => String(j.id) === String(id));
      if (existing) {
        setFormData({
          title: existing.title || '',
          department: existing.department || 'Engineering',
          location: existing.location || 'Remote',
          work_mode: existing.work_mode || 'remote',
          type: existing.type || 'full-time',
          experience_level: existing.experience_level || 'mid',
          experience_years_required: existing.experience_years_required || 3,
          education_requirement: existing.education_requirement || "Bachelor's Degree",
          openings: existing.openings || 1,
          application_deadline: existing.application_deadline ? existing.application_deadline.slice(0, 10) : '',
          salary_min: existing.salary_min || 0,
          salary_max: existing.salary_max || 0,
          currency: existing.currency || 'USD',
          required_skills: Array.isArray(existing.required_skills) ? existing.required_skills : (typeof existing.required_skills === 'string' ? JSON.parse(existing.required_skills || '[]') : []),
          preferred_skills: Array.isArray(existing.preferred_skills) ? existing.preferred_skills : (typeof existing.preferred_skills === 'string' ? JSON.parse(existing.preferred_skills || '[]') : []),
          description: existing.description || '',
          responsibilities: existing.responsibilities || '',
          benefits_text: existing.benefits_text || '',
          status: existing.status || 'open'
        });
      }
    } catch (err: any) {
      console.error('Failed to load existing job:', err);
      setErrorMsg('Could not fetch existing job details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['salary_min', 'salary_max', 'experience_years_required', 'openings'].includes(name)
        ? (parseInt(value) || 0)
        : value
    }));
  };

  const addSkill = (type: 'req' | 'pref') => {
    if (type === 'req') {
      const trimmed = reqSkillInput.trim();
      if (trimmed && !formData.required_skills.includes(trimmed)) {
        setFormData(p => ({ ...p, required_skills: [...p.required_skills, trimmed] }));
        setReqSkillInput('');
      }
    } else {
      const trimmed = prefSkillInput.trim();
      if (trimmed && !formData.preferred_skills.includes(trimmed)) {
        setFormData(p => ({ ...p, preferred_skills: [...p.preferred_skills, trimmed] }));
        setPrefSkillInput('');
      }
    }
  };

  const removeSkill = (type: 'req' | 'pref', skillToRemove: string) => {
    if (type === 'req') {
      setFormData(p => ({
        ...p,
        required_skills: p.required_skills.filter(s => s !== skillToRemove)
      }));
    } else {
      setFormData(p => ({
        ...p,
        preferred_skills: p.preferred_skills.filter(s => s !== skillToRemove)
      }));
    }
  };

  const handleSave = async (statusOverride?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.title.trim()) {
      setErrorMsg('Job title is required');
      return;
    }
    if (formData.required_skills.length === 0) {
      setErrorMsg('Please specify at least one required skill for deterministic candidate matching');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Please provide a job description');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: statusOverride || formData.status
      };

      if (editJobId) {
        await recruiterAPI.updateJob(editJobId, payload);
        setSuccessMsg('Job requisition updated successfully!');
      } else {
        await recruiterAPI.createJob(payload);
        setSuccessMsg(
          statusOverride === 'draft' 
            ? 'Draft requisition saved successfully!' 
            : 'Job opening posted successfully! Submitted to platform review.'
        );
      }

      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save job opening');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a8e7a] hover:text-[#2c2a1e] transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Job Listings
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">
            {editJobId ? 'Edit Job Requisition' : 'Create Job Opening'}
          </h1>
          <p className="text-[#9a8e7a] text-sm mt-1">
            Fill in job requirements. SkillBridge uses these parameters for deterministic 50/20/15/10/5 candidate matching.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#d5cec3] hover:bg-[#e4ddd2] text-[#6b6151] font-semibold text-sm transition flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4 text-[#9a8e7a]" />
            Preview
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('draft')}
            className="px-4 py-2.5 rounded-xl border border-[#4a5e2f] bg-[#c8d5a8]/30/50 hover:bg-[#c8d5a8]/30 text-[#4a5e2f] font-semibold text-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('open')}
            className="px-5 py-2.5 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            {editJobId ? 'Save & Update' : 'Publish Job'}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#c6ddb8]/50 border border-[#3d6b35]/30 text-[#3d6b35] text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#3d6b35] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Primary Title & Department */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#4a5e2f]" />
              Role Overview
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Department / Team
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Platform Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Work Mode *
                </label>
                <select
                  name="work_mode"
                  value={formData.work_mode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
                >
                  <option value="remote">Remote (Work from Anywhere)</option>
                  <option value="hybrid">Hybrid (Flexible Office/Home)</option>
                  <option value="on-site">On-Site (Office Location)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Employment Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Office / Target Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA or Remote - USA"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Candidate Matching Parameters */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-3">
              <h2 className="text-base font-bold text-[#2c2a1e] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4a5e2f]" />
                Matching Engine Parameters
              </h2>
              <span className="text-[11px] font-semibold text-[#4a5e2f] bg-[#c8d5a8]/30 px-2.5 py-1 rounded-full border border-[#d5cec3]">
                50% Req Skills • 20% Pref • 15% Exp • 10% Edu • 5% Loc
              </span>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1">
                Required Skills (50% Weight) *
              </label>
              <p className="text-xs text-[#9a8e7a] mb-2">
                Key technical capabilities candidates must possess. Checked against verified assessment badges for extra verification credibility.
              </p>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={reqSkillInput}
                  onChange={e => setReqSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('req'); } }}
                  placeholder="e.g. React, Python, PostgreSQL..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
                <button
                  type="button"
                  onClick={() => addSkill('req')}
                  className="px-4 py-2 rounded-xl bg-[#f5f0e8] hover:bg-[#3a3828] text-[#f0ebe0] text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B6FF3B]/10 text-white border border-[#B6FF3B]/30 text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill('req', skill)}
                      className="text-[#9CA3A1] hover:text-rose-400 transition ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3A1] mb-1">
                Preferred / Nice-to-Have Skills (20% Weight)
              </label>
              <p className="text-xs text-[#6B7280] mb-2">
                Bonus competencies that boost candidate fit scores.
              </p>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={prefSkillInput}
                  onChange={e => setPrefSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('pref'); } }}
                  placeholder="e.g. GraphQL, Kubernetes, Redis..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-white/10 bg-[#16181A] text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#B6FF3B]"
                />
                <button
                  type="button"
                  onClick={() => addSkill('pref')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-white/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.preferred_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white border border-white/10 text-xs font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill('pref', skill)}
                      className="text-[#9CA3A1] hover:text-rose-400 transition ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#d5cec3]/60">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Seniority Level
                </label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead / Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Min. Years Experience (15%)
                </label>
                <input
                  type="number"
                  name="experience_years_required"
                  min="0"
                  max="30"
                  value={formData.experience_years_required}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Education Degree (10%)
                </label>
                <select
                  name="education_requirement"
                  value={formData.education_requirement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
                >
                  <option value="Any">Any / High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD / Doctorate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Detailed Description */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3">
              Description & Responsibilities
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Role Description *
              </label>
              <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the opportunity, key missions, and who the candidate will work with..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Core Responsibilities
              </label>
              <textarea
                name="responsibilities"
                rows={4}
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="• Architect scalable frontend architectures&#10;• Collaborate with cross-functional product teams&#10;• Mentor junior and mid-level engineers"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] leading-relaxed font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Benefits, Compensation & Perks
              </label>
              <textarea
                name="benefits_text"
                rows={3}
                value={formData.benefits_text}
                onChange={handleChange}
                placeholder="List health insurance, 401k, remote stipend, PTO, equity..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] leading-relaxed font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Hiring Logistics */}
        <div className="space-y-6">
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-5">
            <h3 className="font-bold text-[#2c2a1e] text-base border-b border-[#d5cec3]/60 pb-3">
              Compensation & Capacity
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm font-semibold text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Min Salary
                </label>
                <input
                  type="number"
                  name="salary_min"
                  step="1000"
                  value={formData.salary_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Max Salary
                </label>
                <input
                  type="number"
                  name="salary_max"
                  step="1000"
                  value={formData.salary_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Number of Openings
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#9a8e7a] absolute left-3 top-2.5" />
                <input
                  type="number"
                  name="openings"
                  min="1"
                  max="100"
                  value={formData.openings}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Application Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#9a8e7a] absolute left-3 top-2.5" />
                <input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#d5cec3] text-sm text-[#2c2a1e] focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="p-5 rounded-2xl bg-[#c8d5a8]/30/60 border border-[#d5cec3] space-y-3 text-xs text-[#4a5e2f]">
            <div className="font-bold flex items-center gap-1.5 text-[#4a5e2f]">
              <CheckCircle2 className="w-4 h-4 text-[#4a5e2f]" />
              Recruiter Best Practices
            </div>
            <p>
              Candidates on SkillBridge earn verified skill credentials. Clear required skills significantly boost matching precision and inbound pipeline quality.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-[#f5f0e8]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#ede8df] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#d5cec3] space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#d5cec3]/60 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a5e2f]">Candidate View Preview</span>
                <h3 className="text-xl font-bold text-[#2c2a1e]">{formData.title || 'Untitled Role'}</h3>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg text-[#9a8e7a] hover:text-[#6b6151] hover:bg-[#e4ddd2] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#6b6151]">
              <span className="px-2.5 py-1 bg-[#ede8df] rounded-lg">{formData.work_mode.toUpperCase()}</span>
              <span className="px-2.5 py-1 bg-[#ede8df] rounded-lg">{formData.type}</span>
              <span className="px-2.5 py-1 bg-[#ede8df] rounded-lg">{formData.location}</span>
              <span className="px-2.5 py-1 bg-[#c6ddb8]/50 text-[#3d6b35] rounded-lg">
                {formData.currency} {formData.salary_min?.toLocaleString()} - {formData.salary_max?.toLocaleString()}
              </span>
            </div>

            <div className="space-y-4 text-sm text-[#6b6151]">
              <div>
                <h4 className="font-bold text-[#2c2a1e] text-xs uppercase tracking-wider mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {formData.required_skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#c8d5a8]/30 text-[#4a5e2f] font-semibold text-xs border border-[#d5cec3]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#2c2a1e] text-xs uppercase tracking-wider mb-1">About the Role</h4>
                <p className="whitespace-pre-wrap leading-relaxed text-[#6b6151] text-xs">
                  {formData.description || 'No description provided.'}
                </p>
              </div>

              {formData.responsibilities && (
                <div>
                  <h4 className="font-bold text-[#2c2a1e] text-xs uppercase tracking-wider mb-1">Key Responsibilities</h4>
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed text-[#6b6151] text-xs">
                    {formData.responsibilities}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-[#d5cec3]/60 pt-4 flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#ede8df] text-[#2c2a1e] text-xs font-semibold hover:bg-[#3a3828] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PostJobView;


