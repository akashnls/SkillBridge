import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useRouter } from '../context/RouterContext.js';
import { SupportedLanguage } from '../types/index.js';
import {
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface RegisterPageProps {
  onNavigateTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateTab }) => {
  const { user, register } = useAuth();
  const { navigate } = useRouter();
  const { t, languageNames } = useLanguage();

  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>('en');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Technology');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'employer') {
        navigate('/recruiter/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    }
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        preferred_language: preferredLang,
        company_name: role === 'employer' ? companyName : undefined,
        company_industry: role === 'employer' ? companyIndustry : undefined
      });
      if (role === 'employer') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden transition-colors duration-200">
        <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-radial from-[var(--accent-secondary)]/10 to-transparent blur-2xl" />

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">{t('nav_register')}</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Join SkillBridge for verified skill matching and fair job opportunities.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error)]/30 text-xs text-[var(--error)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] text-center">
            Choose Your Account Type
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[var(--bg)] p-1.5 rounded-2xl border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setRole('job_seeker')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'job_seeker'
                  ? 'bg-[var(--accent-secondary)] text-[var(--bg)] shadow-sm font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'employer'
                  ? 'bg-[var(--accent-secondary)] text-[var(--bg)] shadow-sm font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Employer</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          {role === 'job_seeker' ? (
            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-1.5">Preferred Interface Language</label>
              <select
                value={preferredLang}
                onChange={e => setPreferredLang(e.target.value as SupportedLanguage)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
              >
                {(Object.keys(languageNames) as SupportedLanguage[]).map(l => (
                  <option key={l} value={l}>
                    {languageNames[l].flag} {languageNames[l].native} ({languageNames[l].label})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1.5">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CloudScale Innovations"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1.5">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Technology, Finance, Healthcare"
                  value={companyIndustry}
                  onChange={e => setCompanyIndustry(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sb-btn-primary w-full py-3 text-sm font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--border)] text-center text-[11px] text-[var(--text-secondary)]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigateTab('login')}
            className="text-[var(--accent-secondary)] hover:underline font-bold cursor-pointer"
          >
            Log In here
          </button>
        </div>
      </div>
    </div>
  );
};
