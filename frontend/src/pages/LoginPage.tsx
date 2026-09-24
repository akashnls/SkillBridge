import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useRouter } from '../context/RouterContext.js';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onNavigateTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateTab }) => {
  const { user, login } = useAuth();
  const { navigate } = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = (user: any) => {
    if (!user) return;
    if (user.role === 'employer') {
      navigate('/recruiter/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/candidate/dashboard');
    }
  };

  useEffect(() => {
    if (user) {
      redirectByRole(user);
    }
  }, [user]);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden transition-colors duration-200">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-radial from-[var(--accent-secondary)]/10 to-transparent blur-2xl" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-secondary)]/15 border border-[var(--accent-secondary)]/30 flex items-center justify-center mx-auto text-[var(--accent-secondary)] shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">{t('nav_login')}</h2>
          <p className="text-xs text-[var(--text-secondary)]">Access your verified skill profile or employer dashboard.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error)]/30 text-xs text-[var(--error)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--text-primary)] mb-1.5">Email Address</label>
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
            <label className="block font-bold text-[var(--text-primary)] mb-1.5">Password</label>
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

          <button
            type="submit"
            disabled={loading}
            className="sb-btn-primary w-full py-3 text-sm font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--border)] text-center text-[11px] text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigateTab('register')}
            className="text-[var(--accent-secondary)] hover:underline font-bold cursor-pointer"
          >
            Sign Up here
          </button>
        </div>
      </div>
    </div>
  );
};
