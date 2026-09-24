import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Save, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { Company } from '../../types';

export const CompanyProfileView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    website: '',
    logo_url: '',
    industry: 'Technology & Software',
    company_size: '51-200',
    location: '',
    email: '',
    phone: '',
    founded_year: String(new Date().getFullYear() - 5),
    description: '',
    culture_text: '',
    verification_status: 'pending'
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getMyCompany();
      if (res.data?.company) {
        setFormData(res.data.company);
      }
    } catch (err: any) {
      console.error('Failed to load company profile:', err);
      setErrorMsg('Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await recruiterAPI.updateCompany(formData);
      if (res.data?.company) {
        setFormData(res.data.company);
      }
      setSuccessMsg('Company profile updated successfully! Platform admins have been notified if details changed.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    const status = formData.verification_status || 'pending';
    switch (status) {
      case 'verified':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c6ddb8]/50 text-[#3d6b35] border border-[#3d6b35]/30 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#3d6b35]" />
            Verified Enterprise
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Verification Rejected
          </div>
        );
      case 'suspended':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            Account Suspended
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fde9c0] text-[#b45309] border border-[#b45309]/25 text-sm font-semibold">
            <Clock className="w-4 h-4 text-[#b45309]" />
            Verification Pending Admin Review
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4a5e2f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9a8e7a] text-sm font-medium">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2c2a1e] via-[#2c2a1e] to-[#2c2a1e] rounded-2xl p-6 md:p-8 text-[#f0ebe0] shadow-xl relative overflow-hidden border border-[#4a4636]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4a5e2f]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#ede8df]/10 backdrop-blur border border-white/20 flex items-center justify-center p-2 shrink-0 shadow-inner overflow-hidden">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt={formData.name || 'Company'} 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-10 h-10 text-[#4a5e2f]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-[#f0ebe0] tracking-tight">
                  {formData.name || 'Your Company Name'}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-[#4a5e2f] text-sm mt-1 flex items-center gap-2">
                <span>{formData.industry || 'Industry unspecified'}</span>
                {formData.location && <span>• {formData.location}</span>}
              </p>
            </div>
          </div>
          {formData.website && (
            <a 
              href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ede8df]/10 hover:bg-[#ede8df]/20 text-[#f0ebe0] text-sm font-medium transition border border-white/10"
            >
              <Globe className="w-4 h-4" />
              Visit Website
              <ExternalLink className="w-3.5 h-3.5 text-[#4a5e2f] ml-0.5" />
            </a>
          )}
        </div>
      </div>

      {/* Verification Status Alert Boxes */}
      {formData.verification_status === 'pending' && (
        <div className="p-4 rounded-xl bg-[#fde9c0] border border-[#b45309]/25 text-[#b45309] text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Trust & Safety Under Review:</span> Your company registration is currently being audited by SkillBridge Platform Admins. You can still create draft jobs and view candidate profiles. Once verified, your posted jobs will carry the verified enterprise badge.
          </div>
        </div>
      )}

      {formData.verification_status === 'rejected' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Verification Request Rejected:</span> {formData.rejection_reason || 'Incomplete business registration or invalid corporate email domain. Please update your profile information and contact support.'}
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#c6ddb8]/50 border border-[#3d6b35]/30 text-[#3d6b35] text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#3d6b35] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4a5e2f]" />
              General Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Legal Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder="e.g. TechCorp Solutions Inc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Industry / Sector *
                </label>
                <select
                  name="industry"
                  value={formData.industry || 'Technology & Software'}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
                >
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Financial Services & Fintech">Financial Services & Fintech</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Education & EdTech">Education & EdTech</option>
                  <option value="Manufacturing & Hardware">Manufacturing & Hardware</option>
                  <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Company Size (Employees)
                </label>
                <select
                  name="company_size"
                  value={formData.company_size || '51-200'}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] bg-[#ede8df]"
                >
                  <option value="1-10">1-10 (Seed Startup)</option>
                  <option value="11-50">11-50 (Early Stage)</option>
                  <option value="51-200">51-200 (Growth)</option>
                  <option value="201-500">201-500 (Mid-Market)</option>
                  <option value="500-1000">500-1000 (Scale-Up)</option>
                  <option value="1000+">1000+ (Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Founded Year
                </label>
                <input
                  type="number"
                  name="founded_year"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.founded_year || ''}
                  onChange={handleChange}
                  placeholder="e.g. 2018"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Headquarters Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location || ''}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru, India or San Francisco, CA"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    placeholder="https://company.example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                  Company Logo URL (PNG/SVG)
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
                <p className="text-xs text-[#9a8e7a] mt-1">Recommended: square image at least 256x256 pixels.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                About the Company
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Describe your company mission, business model, and what sets you apart..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] leading-relaxed"
              />
            </div>
          </div>

          {/* Culture & Values */}
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#2c2a1e] border-b border-[#d5cec3]/60 pb-3 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#4a5e2f]" />
              Culture, Perks & Values
            </h2>
            <p className="text-xs text-[#9a8e7a]">
              Highlight work flexibility, learning budgets, diversity initiatives, and tech stack culture. Candidates view this before applying.
            </p>
            <textarea
              name="culture_text"
              rows={4}
              value={formData.culture_text || ''}
              onChange={handleChange}
              placeholder="e.g. Remote-first mindset, annual $2,000 learning stipend, transparent compensation bands, and quarterly company retreats..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f] leading-relaxed"
            />
          </div>
        </div>

        {/* Right 1 Col: Contact & Verification Metadata */}
        <div className="space-y-6">
          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm p-6 space-y-5">
            <h3 className="font-bold text-[#2c2a1e] text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#4a5e2f]" />
              Recruiting Contact
            </h3>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Official Hiring Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="careers@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
              />
              <p className="text-[11px] text-[#9a8e7a] mt-1">Used for platform notifications and candidate inquiries.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6151] mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#d5cec3] text-[#2c2a1e] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#2c2a1e] font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#4a5e2f]" />
              Verification Guidelines
            </div>
            <ul className="text-xs text-[#6b6151] space-y-2 list-disc pl-4">
              <li>Use an authorized corporate domain (e.g. @yourcompany.com).</li>
              <li>Provide an active, verifiable business website.</li>
              <li>Accurate location and employee headcount help expedite admin approval.</li>
            </ul>
            <div className="pt-2 border-t border-[#d5cec3]">
              <span className="text-[11px] text-[#9a8e7a]">
                Verification status can only be modified by SkillBridge Compliance Officers.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CompanyProfileView;


