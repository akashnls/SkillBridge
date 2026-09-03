import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { SupportedLanguage } from '../types/index.js';
import {
  User,
  Building2,
  Lock,
  Mail,
  Languages,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface RegisterPageProps {
  onNavigateTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateTab }) => {
  const { register } = useAuth();
  const { t, languageNames } = useLanguage();

  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>('en');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Technology');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        headline: role === 'job_seeker' ? headline : undefined,
        preferred_language: preferredLang,
        company_name: role === 'employer' ? companyName : undefined,
        company_industry: role === 'employer' ? companyIndustry : undefined
      });
      onNavigateTab('jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">{t('nav_register')}</h2>
          <p className="text-xs text-slate-400">
            Join SkillBridge for verified skill matching and fair job opportunities.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('job_seeker')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'job_seeker' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('employer')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'employer' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Employer</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="ramesh@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {role === 'job_seeker' ? (
            <>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Headline / Target Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Aspiring Full Stack Developer (Self-Taught)"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Preferred Interface Language</label>
                <select
                  value={preferredLang}
                  onChange={e => setPreferredLang(e.target.value as SupportedLanguage)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  {(Object.keys(languageNames) as SupportedLanguage[]).map(l => (
                    <option key={l} value={l}>
                      {languageNames[l].flag} {languageNames[l].native} ({languageNames[l].label})
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CloudScale Innovations"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={companyIndustry}
                  onChange={e => setCompanyIndustry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Profile...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigateTab('login')}
            className="text-indigo-400 hover:underline font-bold"
          >
            Log In here
          </button>
        </div>
      </div>
    </div>
  );
};
