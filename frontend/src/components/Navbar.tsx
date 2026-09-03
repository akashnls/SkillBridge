import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { SupportedLanguage } from '../types/index.js';
import {
  Briefcase,
  Award,
  Compass,
  Mic,
  FolderGit2,
  LayoutDashboard,
  ShieldCheck,
  Languages,
  LogOut,
  Fingerprint,
  CheckCircle2,
  ChevronDown,
  User,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, switchDemoUser, registerBiometric } = useAuth();
  const { language, setLanguage, t, languageNames } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [bioToast, setBioToast] = useState<string | null>(null);

  const handleBiometricEnable = async () => {
    try {
      const msg = await registerBiometric();
      setBioToast(msg);
      setTimeout(() => setBioToast(null), 4000);
    } catch (e: any) {
      setBioToast(e.message || 'Failed');
      setTimeout(() => setBioToast(null), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Demo Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 px-4 py-1.5 border-b border-indigo-900/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{t('demo_switch')}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => switchDemoUser('arjun@example.com')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              user?.email === 'arjun@example.com'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👨‍💻 Arjun (Self-Taught Dev)
          </button>
          <button
            onClick={() => switchDemoUser('priya@example.com')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              user?.email === 'priya@example.com'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Priya (Data Analyst)
          </button>
          <button
            onClick={() => switchDemoUser('recruiter@techcorp.io')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              user?.email === 'recruiter@techcorp.io'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏢 Sarah (TechCorp Recruiter)
          </button>
          <button
            onClick={() => switchDemoUser('admin@skillbridge.org')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              user?.email === 'admin@skillbridge.org'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛡️ Platform Admin
          </button>
        </div>
      </div>

      {bioToast && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{bioToast}</span>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-indigo-400/50">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  {t('app_name')}
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Skill-First Hiring Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t('nav_home')}
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>{t('nav_jobs')}</span>
            </button>

            {(!user || user.role === 'job_seeker') && (
              <>
                <button
                  onClick={() => setActiveTab('assessments')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'assessments'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{t('nav_assessments')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'roadmap'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>{t('nav_roadmap')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('interview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'interview'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4 text-rose-400" />
                  <span>{t('nav_interview')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'portfolio'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  <span>{t('nav_portfolio')}</span>
                </button>
              </>
            )}

            {user && (user.role === 'employer' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('employer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'employer'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>{t('nav_employer_dashboard')}</span>
              </button>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('nav_admin')}</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Language Switcher & Profile */}
          <div className="flex items-center gap-3">
            {/* Regional Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
                <span>{languageNames[language].native}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Choose Language
                  </div>
                  {(Object.keys(languageNames) as SupportedLanguage[]).map(langKey => (
                    <button
                      key={langKey}
                      onClick={() => {
                        setLanguage(langKey);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        language === langKey ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{languageNames[langKey].flag}</span>
                        <span>{languageNames[langKey].native}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{languageNames[langKey].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Session / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                >
                  <img
                    src={user.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-slate-700 ring-1 ring-indigo-500/50 object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-indigo-300 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {user.role === 'job_seeker' ? 'Candidate' : user.role === 'employer' ? 'Recruiter' : 'Admin'}
                        </span>
                        {user.biometric_enabled ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <Fingerprint className="w-3 h-3" /> Biometrics Active
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="py-1">
                      {!user.biometric_enabled && (
                        <button
                          onClick={() => {
                            handleBiometricEnable();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-indigo-300 hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Fingerprint className="w-4 h-4 text-indigo-400" />
                          <span>{t('biometric_register_btn')}</span>
                        </button>
                      )}

                      {user.role === 'job_seeker' && (
                        <button
                          onClick={() => {
                            setActiveTab('candidate-dashboard');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Candidate Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav_logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
              >
                {t('nav_login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
