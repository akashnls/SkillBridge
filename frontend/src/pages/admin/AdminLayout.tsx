import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  CheckSquare, 
  Layers, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  BarChart3, 
  Activity, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  Bell, 
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeKey?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeKey }) => {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { key: 'users', label: 'User Directory', icon: Users, path: '/admin/users' },
    { key: 'recruiters', label: 'Recruiter Roster', icon: Briefcase, path: '/admin/recruiters' },
    { key: 'companies', label: 'Company Verification', icon: Building2, path: '/admin/companies' },
    { key: 'jobs', label: 'Job Moderation', icon: CheckSquare, path: '/admin/jobs' },
    { key: 'applications', label: 'All Applications', icon: FileSpreadsheet, path: '/admin/applications' },
    { key: 'skills', label: 'Skill Taxonomy', icon: Layers, path: '/admin/skills' },
    { key: 'assessments', label: 'Assessments', icon: BookOpen, path: '/admin/assessments' },
    { key: 'badges', label: 'Badge Templates', icon: Award, path: '/admin/badges' },
    { key: 'reports', label: 'Reports & Flagged', icon: AlertTriangle, path: '/admin/reports' },
    { key: 'analytics', label: 'Platform Analytics', icon: BarChart3, path: '/admin/analytics' },
    { key: 'activity-logs', label: 'Audit Activity Logs', icon: Activity, path: '/admin/activity-logs' },
    { key: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isCurrent = (itemPath: string) => path.startsWith(itemPath);

  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#9CA3A1] flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#101211] border-b border-white/[0.08] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#B6FF3B] flex items-center justify-center text-[#0B0D0C]">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[#9CA3A1] hover:text-white hover:bg-white/[0.05]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#101211] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E2914] to-[#121A0C] border border-[#B6FF3B]/30 flex items-center justify-center text-[#B6FF3B] shadow-[0_0_15px_rgba(182,255,59,0.2)]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">SkillBridge</span>
                <span className="text-[10px] uppercase tracking-widest text-[#B6FF3B] font-bold">Platform Governance</span>
              </div>
            </div>
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden text-[#9CA3A1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isCurrent(item.path);

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-[#B6FF3B] text-[#0B0D0C] font-bold shadow-[0_0_18px_rgba(182,255,59,0.35)]'
                      : 'text-[#9CA3A1] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#0B0D0C]' : 'text-[#9CA3A1]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#0B0D0C]" />}
                </button>
              );
            })}
          </div>

          {/* Admin User Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0E100F] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-[#9CA3A1] block truncate">{user?.email || 'admin@skillbridge.org'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9CA3A1] hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1.5 border border-white/10"
                title="View Public App"
              >
                <Globe className="w-3.5 h-3.5" />
                Public App
              </button>
              <button
                onClick={handleLogout}
                className="py-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-rose-400 text-[11px] font-medium transition flex items-center justify-center gap-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex h-16 bg-[#121412]/80 backdrop-blur-md border-b border-white/[0.08] items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF3B] animate-pulse shadow-[0_0_8px_rgba(182,255,59,0.8)]"></span>
            <span className="text-xs font-semibold text-[#9CA3A1]">
              System Health: <strong className="text-[#B6FF3B]">100% Operational</strong>
            </span>
            <span className="text-[#6B7280] text-xs">•</span>
            <span className="text-xs text-[#9CA3A1]">Database Engine: SQLite WAL</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono bg-white/[0.04] text-[#9CA3A1] px-3 py-1 rounded-full border border-white/10">
              Role: SUPER_ADMIN
            </span>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0B0D0C]">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;



