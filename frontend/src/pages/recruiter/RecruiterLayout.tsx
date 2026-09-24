import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useRouter } from '../../context/RouterContext.js';
import { SkillBridgeLogo } from '../../components/SkillBridgeLogo.js';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Briefcase,
  Users,
  Search,
  BookmarkCheck,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface RecruiterLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export const RecruiterLayout: React.FC<RecruiterLayoutProps> = ({ children, activePath }) => {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Company Profile', path: '/recruiter/company', icon: Building2 },
    { label: 'Post Job', path: '/recruiter/jobs/create', icon: PlusCircle, badge: 'New' },
    { label: 'My Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Applications', path: '/recruiter/applications', icon: Users },
    { label: 'Candidates', path: '/recruiter/candidates', icon: Search },
    { label: 'Shortlisted', path: '/recruiter/shortlisted', icon: BookmarkCheck },
    { label: 'Interviews', path: '/recruiter/interviews', icon: Calendar },
    { label: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/recruiter/notifications', icon: Bell },
    { label: 'Settings', path: '/recruiter/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#9CA3A1] flex flex-col antialiased font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#121412]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/recruiter/dashboard')}>
            <SkillBridgeLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">SkillBridge</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/25">
                  Recruiter Workspace
                </span>
              </div>
              <p className="text-[11px] text-[#9CA3A1] hidden sm:block">Talent Acquisition & ATS Pipeline</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recruiter/jobs/create')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#B6FF3B] hover:bg-[#C6FF5A] text-[#0B0D0C] text-xs font-bold shadow-[0_0_15px_rgba(182,255,59,0.3)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Job</span>
          </button>

          <button
            onClick={() => navigate('/recruiter/notifications')}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white border border-white/10 relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B6FF3B] ring-2 ring-[#121412]" />
          </button>

          {/* Recruiter Profile chip pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (user?.name || 'Recruiter')}
                alt={user?.name}
                className="w-6 h-6 rounded-full bg-[#16181A] ring-1 ring-[#B6FF3B]/40 object-cover"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-[#B6FF3B] capitalize">Recruiter / Employer</p>
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

      {/* Main Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-[57px] bottom-0 z-30 w-64 bg-[#101211] backdrop-blur-md border-r border-white/[0.08] flex flex-col justify-between py-5 px-3 transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Recruitment Suite
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path || (item.path !== '/recruiter/dashboard' && activePath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#B6FF3B] text-[#0B0D0C] font-bold shadow-[0_0_18px_rgba(182,255,59,0.35)]'
                      : 'text-[#9CA3A1] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B0D0C]' : 'text-[#9CA3A1]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-[#0B0D0C]/20 text-[#0B0D0C]' : 'bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <div className="px-3 py-2.5 rounded-xl bg-[#16181A] border border-white/[0.08] text-[11px] text-[#9CA3A1] flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B6FF3B] shrink-0" />
              <div className="truncate">
                <span className="text-white font-semibold block truncate">{user?.company?.name || 'Recruiter Portal'}</span>
                <span className="text-[10px] text-[#B6FF3B]">Verified Recruiter Access</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Workspace</span>
            </button>
          </div>
        </aside>

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#0B0D0C] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};



