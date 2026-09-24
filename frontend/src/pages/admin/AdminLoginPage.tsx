import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('admin@skillbridge.org');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (!user || user.role !== 'admin') {
        setError('Unauthorized: This portal is strictly restricted to Platform Administrators.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@skillbridge.org');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3d6b35]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#4a5e2f]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4a5e2f] to-[#4a5e2f] flex items-center justify-center text-[#f0ebe0] shadow-xl shadow-[#4a5e2f]/30">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-[#f0ebe0] tracking-tight">
          SkillBridge Governance Console
        </h2>
        <p className="mt-1 text-center text-xs text-[#9a8e7a]">
          Strictly authorized personnel only. All access is cryptographically audited.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#f5f0e8]/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-[#4a4636] space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] uppercase tracking-wider mb-1.5">
                Admin Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-[#9a8e7a] text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b35] focus:border-[#3d6b35]"
                  placeholder="admin@skillbridge.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b5aa96] uppercase tracking-wider mb-1.5">
                Security Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9a8e7a] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#f5f0e8] border border-[#4a4636] text-[#9a8e7a] text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b35] focus:border-[#3d6b35]"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#3d6b35] hover:bg-[#3d6b35] text-[#f0ebe0] text-sm font-bold shadow-lg shadow-[#4a5e2f]/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-[#4a4636]">
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="w-full py-2 px-3 rounded-xl bg-[#3a3828]/80 hover:bg-[#3a3828] text-[#b5aa96] text-xs font-medium transition flex items-center justify-center gap-2 border border-[#4a4636]/50"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#3d6b35]" />
              Fill Platform Admin Demo Account
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={() => navigate('/')}
              className="text-[11px] text-[#9a8e7a] hover:text-[#9a8e7a] transition"
            >
              Return to Public Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;


