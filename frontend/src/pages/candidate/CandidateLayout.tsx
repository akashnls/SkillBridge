import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter } from '../../context/RouterContext.js';
import { SkillBridgeLogo } from '../../components/SkillBridgeLogo.js';
import { notificationsAPI } from '../../services/api.js';
import {
  LayoutDashboard,
  User,
  Award,
  CheckSquare,
  Compass,
  Briefcase,
  Send,
  Bookmark,
  FolderGit2,
  FileText,
  BookOpen,
  Sparkles,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface CandidateLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children, activePath }) => {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    notificationsAPI.getAll().then(res => {
      if (res.data?.notifications) {
        const unread = res.data.notifications.filter((n: any) => !n.is_read).length;
        setUnreadNotifs(unread);
      }
    }).catch(() => {});
  }, [activePath]);

  const navItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/candidate/profile', icon: User },
    { label: 'Skills & Badges', path: '/candidate/skills', icon: Award },
    { label: 'Skill Assessments', path: '/candidate/assessments', icon: CheckSquare },
    { label: 'Career Roadmap', path: '/candidate/roadmap', icon: Compass },
    { label: 'Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'Applications', path: '/candidate/applications', icon: Send },
    { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
    { label: 'Portfolio', path: '/candidate/portfolio', icon: FolderGit2 },
    { label: 'Resume', path: '/candidate/resumes', icon: FileText },
    {
      label: 'AI Mock Interview',
      path: '/candidate/mock-interview',
      icon: Sparkles,
      badge: 'AI Coach',
      highlight: true
    },
    { label: 'Interviews', path: '/candidate/interviews', icon: Calendar },
    {
      label: 'Notifications',
      path: '/candidate/notifications',
      icon: Bell,
      badgeCount: unreadNotifs > 0 ? unreadNotifs : undefined
    },
    { label: 'Settings', path: '/candidate/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#9CA3A1] flex flex-col antialiased font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 bg-[#121412]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/candidate/dashboard')}>
            <SkillBridgeLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">SkillBridge</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
                  Candidate Portal
                </span>
              </div>
              <p className="text-[11px] text-[#9CA3A1] hidden sm:block">Verified Skills & Career Accelerator</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick AI Mock Interview Button */}
          <button
            onClick={() => navigate('/candidate/mock-interview')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice with AI</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => navigate('/candidate/notifications')}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white border border-white/10 relative cursor-pointer transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B6FF3B] px-1 text-[10px] font-bold text-[#0B0D0C] shadow-[0_0_8px_rgba(182,255,59,0.6)]">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>

          {/* Candidate Profile Avatar & Menu Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <div
              onClick={() => navigate('/candidate/profile')}
              className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] cursor-pointer group transition-colors"
            >
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#B6FF3B]/40 group-hover:ring-[#B6FF3B] transition-all"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white group-hover:text-[#B6FF3B] transition-colors truncate max-w-[110px]">
                  {user?.name || 'Job Seeker'}
                </p>
                <p className="text-[10px] text-[#9CA3A1]">Candidate</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#9CA3A1] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Left Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] hidden md:flex flex-col w-64 bg-[#101211] border-r border-white/[0.08] p-3.5 shrink-0 z-30">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-[#6B7280] uppercase shrink-0">
            Navigation
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path || (item.path !== '/candidate/dashboard' && activePath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#B6FF3B] text-[#0B0D0C] shadow-[0_0_18px_rgba(182,255,59,0.35)] font-bold'
                      : 'text-[#9CA3A1] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B0D0C]' : item.highlight ? 'text-[#B6FF3B]' : 'text-[#9CA3A1]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-[#0B0D0C]/20 text-[#0B0D0C]' : 'bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.badgeCount !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#0B0D0C] text-[#B6FF3B]' : 'bg-[#B6FF3B] text-[#0B0D0C]'}`}>
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#101211] border-r border-white/[0.08] p-4 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-3">
                  <div className="flex items-center gap-2">
                    <SkillBridgeLogo size="sm" />
                    <span className="font-bold text-sm text-white">SkillBridge</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded-lg text-[#9CA3A1] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.path || (item.path !== '/candidate/dashboard' && activePath.startsWith(item.path));
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-[#B6FF3B] text-[#0B0D0C] font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)]'
                            : 'text-[#9CA3A1] hover:bg-white/[0.05] hover:text-white text-left'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B0D0C]' : 'text-[#9CA3A1]'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-[#0B0D0C]/20 text-[#0B0D0C]' : 'bg-[#B6FF3B]/10 text-[#B6FF3B]'}`}>
                            {item.badge}
                          </span>
                        )}
                        {item.badgeCount !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#0B0D0C] text-[#B6FF3B]' : 'bg-[#B6FF3B] text-[#0B0D0C]'}`}>
                            {item.badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 bg-[#0B0D0C] min-w-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};



