import React, { useState, useEffect } from 'react';
import { candidateAPI, CandidateDetailedProfile } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Link,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  X
} from 'lucide-react';

export const CandidateProfileView: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateDetailedProfile>({
    user_id: '',
    headline: '',
    bio: '',
    phone: '',
    location: '',
    skills: [],
    soft_skills: [],
    internships: [],
    education: '',
    education_entries: [],
    experience_years: 0,
    experience_entries: [],
    certifications: [],
    achievements: [],
    preferred_job_role: '',
    preferred_locations: [],
    expected_salary: 0,
    work_preference: 'Remote',
    linkedin_url: '',
    github_url: '',
    portfolio_website: ''
  });

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New item inputs
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getProfile();
      if (res.data?.success) {
        setProfile(res.data.profile);
        setName(res.data.user?.name || '');
        setAvatarUrl(res.data.user?.avatar_url || '');
        setProfileCompletion(res.data.profile_completion || 0);
        setMissingFields(res.data.missing_fields || []);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await candidateAPI.updateProfile({
        ...profile,
        name,
        avatar_url: avatarUrl
      });

      if (res.data?.success) {
        setProfile(res.data.profile);
        setName(res.data.user?.name || '');
        setAvatarUrl(res.data.user?.avatar_url || '');
        setProfileCompletion(res.data.profile_completion || 0);
        setMissingFields(res.data.missing_fields || []);
        setSuccessMsg('Profile changes saved successfully!');
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(res.data?.message || 'Failed to save profile changes');
      }
    } catch (err: any) {
      const reason = err.response?.data?.message || err.message || 'Unknown error occurred while saving';
      setErrorMsg(`Failed to save: ${reason}`);
    } finally {
      setSaving(false);
    }
  };

  // Skill management
  const addTechnicalSkill = () => {
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const removeTechnicalSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Soft skill management
  const addSoftSkill = () => {
    if (!newSoftSkill.trim()) return;
    if (!profile.soft_skills.includes(newSoftSkill.trim())) {
      setProfile(prev => ({ ...prev, soft_skills: [...prev.soft_skills, newSoftSkill.trim()] }));
    }
    setNewSoftSkill('');
  };

  const removeSoftSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, soft_skills: prev.soft_skills.filter(s => s !== skill) }));
  };

  // Preferred locations management
  const addPreferredLocation = () => {
    if (!newLocation.trim()) return;
    if (!profile.preferred_locations.includes(newLocation.trim())) {
      setProfile(prev => ({ ...prev, preferred_locations: [...prev.preferred_locations, newLocation.trim()] }));
    }
    setNewLocation('');
  };

  const removePreferredLocation = (loc: string) => {
    setProfile(prev => ({ ...prev, preferred_locations: prev.preferred_locations.filter(l => l !== loc) }));
  };

  // Achievements management
  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    setProfile(prev => ({ ...prev, achievements: [...prev.achievements, newAchievement.trim()] }));
    setNewAchievement('');
  };

  const removeAchievement = (idx: number) => {
    setProfile(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== idx) }));
  };

  // Education entry management
  const addEducationEntry = () => {
    setProfile(prev => ({
      ...prev,
      education_entries: [
        ...prev.education_entries,
        { degree: '', institution: '', year: '', score: '' }
      ]
    }));
  };

  const updateEducationEntry = (index: number, field: string, value: string) => {
    setProfile(prev => {
      const entries = [...prev.education_entries];
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, education_entries: entries };
    });
  };

  const removeEducationEntry = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education_entries: prev.education_entries.filter((_, i) => i !== index)
    }));
  };

  // Experience entry management
  const addExperienceEntry = () => {
    setProfile(prev => ({
      ...prev,
      experience_entries: [
        ...prev.experience_entries,
        { title: '', company: '', duration: '', description: '' }
      ]
    }));
  };

  const updateExperienceEntry = (index: number, field: string, value: string) => {
    setProfile(prev => {
      const entries = [...prev.experience_entries];
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, experience_entries: entries };
    });
  };

  const removeExperienceEntry = (index: number) => {
    setProfile(prev => ({
      ...prev,
      experience_entries: prev.experience_entries.filter((_, i) => i !== index)
    }));
  };

  // Internship entry management
  const addInternshipEntry = () => {
    setProfile(prev => ({
      ...prev,
      internships: [
        ...prev.internships,
        { title: '', company: '', duration: '', description: '' }
      ]
    }));
  };

  const updateInternshipEntry = (index: number, field: string, value: string) => {
    setProfile(prev => {
      const entries = [...prev.internships];
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, internships: entries };
    });
  };

  const removeInternshipEntry = (index: number) => {
    setProfile(prev => ({
      ...prev,
      internships: prev.internships.filter((_, i) => i !== index)
    }));
  };

  // Certification management
  const addCertificationEntry = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', year: '', link: '' }
      ]
    }));
  };

  const updateCertificationEntry = (index: number, field: string, value: string) => {
    setProfile(prev => {
      const entries = [...prev.certifications];
      entries[index] = { ...entries[index], [field]: value };
      return { ...prev, certifications: entries };
    });
  };

  const removeCertificationEntry = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#4a5e2f]/20 border-t-[#4a5e2f] rounded-full animate-spin" />
          <p className="text-sm text-[#9a8e7a]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      {/* Header & Profile Completion */}
      <PageHeader
        badge="PROFILE MANAGEMENT"
        badgeSubtext="Deterministic ATS Optimization"
        title="Candidate Profile"
        subtitle="Manage your skills, experience, and career preferences"
        actions={
          <button
            type="submit"
            disabled={saving}
            className="sb-btn-primary px-5 py-2.5 text-xs font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        }
      >
        {/* Completion Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-white">Profile Completion</span>
            <span className="font-bold text-[#B6FF3B]">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="bg-[#B6FF3B] h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(182,255,59,0.5)]"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {missingFields.length > 0 ? (
            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Missing: {missingFields.join(', ')}</span>
            </p>
          ) : (
            <p className="text-xs text-[#B6FF3B] mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Your profile is 100% complete! Recruiter visibility maximized.</span>
            </p>
          )}
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </PageHeader>

      {/* Basic Info */}
      <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
        <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
          <User className="w-4 h-4 text-[#4a5e2f]" />
          <span>Basic Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="e.g. Alex Johnson"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Profile Photo / Avatar URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Professional Headline</label>
            <input
              type="text"
              value={profile.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="e.g. Full Stack Developer | Python, React & Node.js"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Phone Number</label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Location</label>
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="e.g. San Francisco, CA or Remote"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="50"
              value={profile.experience_years || 0}
              onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Professional Summary / Bio</label>
          <textarea
            rows={3}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f] resize-none"
            placeholder="Briefly describe your career journey, key accomplishments, and technical expertise..."
          />
        </div>
      </div>

      {/* Technical & Soft Skills */}
      <div className="bg-[#16181A] p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-6">
        <div>
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B6FF3B]" />
            <span>Technical Skills</span>
          </h2>
          <p className="text-xs text-[#9CA3A1] mb-3">Add skills you know. You can take verified assessments for each skill to earn badges.</p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())}
              placeholder="Add a technical skill (e.g. React, Python, Docker)..."
              className="flex-1 px-3.5 py-2 bg-[#101211] border border-white/10 rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
            />
            <button
              type="button"
              onClick={addTechnicalSkill}
              className="sb-btn-primary px-4 py-2 text-xs font-bold shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
            {profile.skills && profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#B6FF3B]/10 text-white border border-[#B6FF3B]/30 shadow-sm transition-all hover:border-[#B6FF3B]/60"
              >
                <span className="font-semibold text-white">{skill}</span>
                <button
                  type="button"
                  onClick={() => removeTechnicalSkill(skill)}
                  className="text-[#9CA3A1] hover:text-rose-400 hover:bg-rose-500/20 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer ml-0.5"
                  title={`Remove ${skill}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {(!profile.skills || profile.skills.length === 0) && (
              <p className="text-xs text-[#6B7280] italic">No technical skills added yet. Type a skill and click Add.</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08]">
          <h2 className="text-base font-bold text-white mb-1">Soft Skills</h2>
          <p className="text-xs text-[#9CA3A1] mb-3">Communication, teamwork, leadership, problem solving</p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
              placeholder="Add a soft skill (e.g. Cross-functional Collaboration)..."
              className="flex-1 px-3.5 py-2 bg-[#101211] border border-white/10 rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
            />
            <button
              type="button"
              onClick={addSoftSkill}
              className="sb-btn-primary px-4 py-2 text-xs font-bold shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
            {profile.soft_skills && profile.soft_skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#B6FF3B]/10 text-white border border-[#B6FF3B]/30 shadow-sm transition-all hover:border-[#B6FF3B]/60"
              >
                <span className="font-semibold text-white">{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSoftSkill(skill)}
                  className="text-[#9CA3A1] hover:text-rose-400 hover:bg-rose-500/20 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer ml-0.5"
                  title={`Remove ${skill}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {(!profile.soft_skills || profile.soft_skills.length === 0) && (
              <p className="text-xs text-[#6B7280] italic">No soft skills added yet. Type a skill and click Add.</p>
            )}
          </div>
        </div>
      </div>

      {/* Experience Entries */}
      <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#4a5e2f]" />
            <span>Work Experience</span>
          </h2>
          <button
            type="button"
            onClick={addExperienceEntry}
            className="px-3 py-1.5 bg-[#3a3828] hover:bg-[#4a4636] text-[#4a5e2f] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        {profile.experience_entries.map((entry, idx) => (
          <div key={idx} className="p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b5aa96]">Position #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeExperienceEntry(idx)}
                className="text-[#9a8e7a] hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Job Title (e.g. Senior Backend Dev)"
                value={entry.title}
                onChange={(e) => updateExperienceEntry(idx, 'title', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={entry.company}
                onChange={(e) => updateExperienceEntry(idx, 'company', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 2021 - Present)"
                value={entry.duration}
                onChange={(e) => updateExperienceEntry(idx, 'duration', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Key responsibilities and achievements..."
              value={entry.description}
              onChange={(e) => updateExperienceEntry(idx, 'description', e.target.value)}
              className="w-full px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0] resize-none"
            />
          </div>
        ))}
      </div>

      {/* Internships */}
      <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#4a5e2f]" />
            <span>Internships</span>
          </h2>
          <button
            type="button"
            onClick={addInternshipEntry}
            className="px-3 py-1.5 bg-[#3a3828] hover:bg-[#4a4636] text-[#4a5e2f] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Internship</span>
          </button>
        </div>

        {profile.internships.map((entry, idx) => (
          <div key={idx} className="p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b5aa96]">Internship #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeInternshipEntry(idx)}
                className="text-[#9a8e7a] hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Internship Role (e.g. Software Engineer Intern)"
                value={entry.title}
                onChange={(e) => updateInternshipEntry(idx, 'title', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Organization / Company"
                value={entry.company}
                onChange={(e) => updateInternshipEntry(idx, 'company', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Duration (e.g. Summer 2023 - 3 mos)"
                value={entry.duration}
                onChange={(e) => updateInternshipEntry(idx, 'duration', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
            </div>
            <textarea
              rows={2}
              placeholder="What you learned and delivered..."
              value={entry.description}
              onChange={(e) => updateInternshipEntry(idx, 'description', e.target.value)}
              className="w-full px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0] resize-none"
            />
          </div>
        ))}
      </div>

      {/* Education Entries */}
      <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#4a5e2f]" />
            <span>Education</span>
          </h2>
          <button
            type="button"
            onClick={addEducationEntry}
            className="px-3 py-1.5 bg-[#3a3828] hover:bg-[#4a4636] text-[#4a5e2f] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>

        {profile.education_entries.map((entry, idx) => (
          <div key={idx} className="p-4 bg-[#f5f0e8] rounded-xl border border-[#4a4636] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#b5aa96]">Degree #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeEducationEntry(idx)}
                className="text-[#9a8e7a] hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Degree / Major (e.g. B.S. Computer Science)"
                value={entry.degree}
                onChange={(e) => updateEducationEntry(idx, 'degree', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="University / Institute"
                value={entry.institution}
                onChange={(e) => updateEducationEntry(idx, 'institution', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Graduation Year (e.g. 2024)"
                value={entry.year}
                onChange={(e) => updateEducationEntry(idx, 'year', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="GPA / Grade (Optional)"
                value={entry.score || ''}
                onChange={(e) => updateEducationEntry(idx, 'score', e.target.value)}
                className="px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Certifications & Achievements */}
      <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#b45309]" />
              <span>Certifications</span>
            </h2>
            <button
              type="button"
              onClick={addCertificationEntry}
              className="px-3 py-1.5 bg-[#3a3828] hover:bg-[#4a4636] text-[#b45309] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Certification</span>
            </button>
          </div>

          {profile.certifications.map((cert, idx) => (
            <div key={idx} className="p-3 bg-[#f5f0e8] rounded-xl border border-[#4a4636] mb-2 flex flex-col md:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Certification Name (e.g. AWS Solutions Architect)"
                value={cert.name}
                onChange={(e) => updateCertificationEntry(idx, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Issuer (e.g. Amazon Web Services)"
                value={cert.issuer}
                onChange={(e) => updateCertificationEntry(idx, 'issuer', e.target.value)}
                className="w-48 px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <input
                type="text"
                placeholder="Year"
                value={cert.year}
                onChange={(e) => updateCertificationEntry(idx, 'year', e.target.value)}
                className="w-24 px-3 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-lg text-xs text-[#f0ebe0]"
              />
              <button
                type="button"
                onClick={() => removeCertificationEntry(idx)}
                className="text-[#9a8e7a] hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#4a4636]">
          <h2 className="text-base font-bold text-[#f0ebe0] mb-2">Key Achievements</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
              placeholder="e.g. 1st Place at National Hackathon 2024, Published paper on AI..."
              className="flex-1 px-3.5 py-2 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
            />
            <button
              type="button"
              onClick={addAchievement}
              className="px-4 py-2 bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {profile.achievements.map((ach, idx) => (
              <div key={idx} className="p-2.5 bg-[#f5f0e8] rounded-xl border border-[#4a4636] flex items-center justify-between text-xs text-[#9a8e7a]">
                <span>🏆 {ach}</span>
                <button
                  type="button"
                  onClick={() => removeAchievement(idx)}
                  className="text-[#9a8e7a] hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Preferences & Links */}
      <div className="bg-[#f5f0e8]/70 p-6 rounded-2xl border border-[#4a4636] space-y-4">
        <h2 className="text-base font-bold text-[#f0ebe0] flex items-center gap-2">
          <Link className="w-4 h-4 text-[#4a5e2f]" />
          <span>Job Preferences & Social Links</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Target Job Role</label>
            <input
              type="text"
              value={profile.preferred_job_role || ''}
              onChange={(e) => setProfile({ ...profile, preferred_job_role: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="e.g. Full Stack Developer, Python Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Work Mode Preference</label>
            <select
              value={profile.work_preference || 'Remote'}
              onChange={(e) => setProfile({ ...profile, work_preference: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
              <option value="Any">Any Work Mode</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Expected Salary (Annual USD)</label>
            <input
              type="number"
              min="0"
              value={profile.expected_salary || 0}
              onChange={(e) => setProfile({ ...profile, expected_salary: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="e.g. 95000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">LinkedIn Profile URL</label>
            <input
              type="text"
              value={profile.linkedin_url || ''}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">GitHub Profile URL</label>
            <input
              type="text"
              value={profile.github_url || ''}
              onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b5aa96] mb-1">Portfolio Website</label>
            <input
              type="text"
              value={profile.portfolio_website || ''}
              onChange={(e) => setProfile({ ...profile, portfolio_website: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#f5f0e8] border border-[#4a4636] rounded-xl text-sm text-[#f0ebe0] focus:outline-none focus:border-[#4a5e2f]"
              placeholder="https://yourportfolio.dev"
            />
          </div>
        </div>

        {/* Preferred Locations tags */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-[#9CA3A1] mb-1">Preferred Locations</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredLocation())}
              placeholder="Add location (e.g. San Francisco, Bangalore, Remote)..."
              className="flex-1 px-3.5 py-2 bg-[#101211] border border-white/10 rounded-xl text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#B6FF3B]"
            />
            <button
              type="button"
              onClick={addPreferredLocation}
              className="sb-btn-secondary px-4 py-2 text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
            {profile.preferred_locations.map((loc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-white shadow-sm"
              >
                <span>{loc}</span>
                <button
                  type="button"
                  onClick={() => removePreferredLocation(loc)}
                  className="text-[#9CA3A1] hover:text-rose-400 hover:bg-rose-500/20 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer ml-0.5"
                  title={`Remove ${loc}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {profile.preferred_locations.length === 0 && (
              <p className="text-xs text-[#6B7280] italic">No preferred locations added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-in slide-in-from-top-2 fade-in duration-200">
          {successMsg && (
            <div className="p-4 bg-[#16181A]/95 border border-[#B6FF3B]/40 text-[#B6FF3B] rounded-2xl shadow-2xl backdrop-blur flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#B6FF3B] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-[#B6FF3B]">Saved</p>
                <p className="text-xs text-[#9CA3A1] mt-0.5">{successMsg}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-[#9CA3A1] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-[#16181A]/95 border border-rose-500/40 text-rose-400 rounded-2xl shadow-2xl backdrop-blur flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-300">Failed to save</p>
                <p className="text-xs text-[#9CA3A1] mt-0.5">{errorMsg}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-[#9CA3A1] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-30">
        <div />
        <div className="flex items-center gap-3 p-3 bg-[#16181A]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
          {successMsg && (
            <div className="px-3 py-1.5 bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] text-xs rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B6FF3B] shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="sb-btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};


