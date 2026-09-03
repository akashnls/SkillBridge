import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Lock,
  Mail,
  Fingerprint,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onNavigateTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateTab }) => {
  const { login, loginBiometric, switchDemoUser } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('arjun@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onNavigateTab('jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginBiometric(email);
      onNavigateTab('jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Biometric authentication failed. Ensure biometrics are enabled on your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-white">{t('nav_login')}</h2>
          <p className="text-xs text-slate-400">Access your verified skill profile or employer dashboard.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Logins Selection */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Instant One-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('arjun@example.com');
                setPassword('password123');
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left"
            >
              <p className="font-bold text-white">👨‍💻 Arjun (Candidate)</p>
              <p className="text-[10px] text-slate-400">React & Python Dev</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('recruiter@techcorp.io');
                setPassword('password123');
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left"
            >
              <p className="font-bold text-white">🏢 Sarah (Recruiter)</p>
              <p className="text-[10px] text-slate-400">TechCorp Solutions</p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Biometric WebAuthn Button */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-3">
          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>{t('biometric_login_btn')}</span>
          </button>

          <p className="text-[11px] text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigateTab('register')}
              className="text-indigo-400 hover:underline font-bold"
            >
              Sign Up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
