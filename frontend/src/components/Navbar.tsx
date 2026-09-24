import React, { useState } from 'react';
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useRouter } from '../context/RouterContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { SkillBridgeLogo } from './SkillBridgeLogo.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const workspace = () => setActiveTab(user?.role === 'job_seeker' ? 'candidate-dashboard' : 'employer');

  const handleNavigate = (path: string, tab: string) => {
    setActiveTab(tab);
    navigate(path);
    setOpen(false);
  };

  const link = (label: string, tab: string) => (
    <button
      key={tab}
      onClick={() => {
        setActiveTab(tab);
        setOpen(false);
      }}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        activeTab === tab
          ? 'bg-[var(--accent-secondary)]/15 text-[var(--text-primary)] border border-[var(--accent-secondary)]/30 font-semibold shadow-xs'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-3 z-50 mx-3 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 shadow-xl shadow-black/10 dark:shadow-black/60 backdrop-blur-xl sm:mx-6 transition-colors duration-200">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => { setActiveTab('home'); navigate('/'); }} className="flex items-center gap-2.5 group">
          <SkillBridgeLogo size="md" />
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] group-hover:opacity-90 transition">SkillBridge</span>
        </button>

        {user ? (
          <>
            {/* Authenticated Desktop Nav */}
            <nav className="hidden items-center gap-1.5 md:flex">
              {link('Jobs', 'jobs')}
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60 transition"
              >
                How It Works
              </button>
              <button
                onClick={() => document.getElementById('recruiters')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60 transition"
              >
                For Recruiters
              </button>
            </nav>

            <div className="hidden items-center gap-2.5 md:flex">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-secondary)] transition shadow-xs cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--warning)]" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent-secondary)] transition cursor-pointer"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt=""
                    className="h-6 w-6 rounded-full ring-1 ring-[var(--accent-secondary)]/50"
                  />
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl backdrop-blur-xl">
                    <button
                      onClick={workspace}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/30 transition cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[var(--accent-secondary)]" />
                      Open workspace
                    </button>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--error)] hover:bg-[var(--error-bg)] transition cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Public (Logged-Out) Desktop Nav: Exactly Jobs -> Login -> Theme Toggle -> Get Started */
          <div className="hidden items-center gap-3.5 md:flex">
            <button
              onClick={() => handleNavigate('/jobs', 'jobs')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-[var(--accent-secondary)]/15 text-[var(--text-primary)] border border-[var(--accent-secondary)]/30 font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => handleNavigate('/login', 'login')}
              className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              Log in
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-secondary)] transition shadow-xs cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--warning)]" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
            </button>
            <button
              onClick={() => handleNavigate('/register', 'register')}
              className="sb-btn-primary px-4 py-2 text-sm font-bold shadow-[0_0_20px_rgba(182,255,59,0.35)] cursor-pointer"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--warning)]" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
          </button>
          <button
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-[var(--border)] px-4 py-4 rounded-b-2xl bg-[var(--surface)]/95 backdrop-blur-xl md:hidden">
          {user ? (
            <nav className="flex flex-col gap-1.5">
              {link('Jobs', 'jobs')}
              <button
                onClick={() => {
                  setActiveTab('home');
                  setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView(), 0);
                  setOpen(false);
                }}
                className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                How It Works
              </button>
              <button
                onClick={workspace}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/10"
              >
                Open workspace
              </button>
              <button
                onClick={logout}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--error)] hover:bg-[var(--error-bg)]"
              >
                Log out
              </button>
            </nav>
          ) : (
            /* Public (Logged-Out) Mobile Nav */
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => handleNavigate('/jobs', 'jobs')}
                className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                  activeTab === 'jobs' ? 'bg-[var(--accent-secondary)]/15 text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => handleNavigate('/login', 'login')}
                className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Log in
              </button>
              <button
                onClick={() => handleNavigate('/register', 'register')}
                className="sb-btn-primary justify-center px-4 py-2 text-sm font-bold mt-1"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      )}
    </header>
  );
};
