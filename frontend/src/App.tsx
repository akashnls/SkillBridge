import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { RouterProvider, useRouter } from './context/RouterContext.js';

// Layouts (Eager)
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Core Public & Auth Pages (Eagerly loaded for fast initial paint)
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

// Public & Candidate Shared Pages (Lazy Loaded)
const JobsExplorerPage = lazy(() => import('./pages/JobsExplorerPage.js').then(m => ({ default: m.JobsExplorerPage })));
const SkillAssessmentsPage = lazy(() => import('./pages/SkillAssessmentsPage.js').then(m => ({ default: m.SkillAssessmentsPage })));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage.js').then(m => ({ default: m.RoadmapPage })));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage.js').then(m => ({ default: m.PortfolioPage })));
const PublicBadgeVerifyPage = lazy(() => import('./pages/PublicBadgeVerifyPage.js').then(m => ({ default: m.PublicBadgeVerifyPage })));

// Dedicated Candidate Workspace Views (Lazy Loaded)
const CandidateLayout = lazy(() => import('./pages/candidate/CandidateLayout.js').then(m => ({ default: m.CandidateLayout })));
const CandidateDashboardView = lazy(() => import('./pages/candidate/CandidateDashboardView.js').then(m => ({ default: m.CandidateDashboardView })));
const CandidateProfileView = lazy(() => import('./pages/candidate/CandidateProfileView.js').then(m => ({ default: m.CandidateProfileView })));
const CandidateSkillsView = lazy(() => import('./pages/candidate/CandidateSkillsView.js').then(m => ({ default: m.CandidateSkillsView })));
const CandidateAssessmentsView = lazy(() => import('./pages/candidate/CandidateAssessmentsView.js').then(m => ({ default: m.CandidateAssessmentsView })));
const CandidateCareerRoadmapView = lazy(() => import('./pages/candidate/CandidateCareerRoadmapView.js').then(m => ({ default: m.CandidateCareerRoadmapView })));
const CandidateJobsView = lazy(() => import('./pages/candidate/CandidateJobsView.js').then(m => ({ default: m.CandidateJobsView })));
const CandidateJobDetailView = lazy(() => import('./pages/candidate/CandidateJobDetailView.js').then(m => ({ default: m.CandidateJobDetailView })));
const CandidateApplicationsView = lazy(() => import('./pages/candidate/CandidateApplicationsView.js').then(m => ({ default: m.CandidateApplicationsView })));
const CandidateSavedJobsView = lazy(() => import('./pages/candidate/CandidateSavedJobsView.js').then(m => ({ default: m.CandidateSavedJobsView })));
const CandidatePortfolioView = lazy(() => import('./pages/candidate/CandidatePortfolioView.js').then(m => ({ default: m.CandidatePortfolioView })));
const CandidateResumeView = lazy(() => import('./pages/candidate/CandidateResumeView.js').then(m => ({ default: m.CandidateResumeView })));
const CandidateInterviewPrepView = lazy(() => import('./pages/candidate/CandidateInterviewPrepView.js').then(m => ({ default: m.CandidateInterviewPrepView })));
const CandidateMockInterviewView = lazy(() => import('./pages/candidate/CandidateMockInterviewView.js').then(m => ({ default: m.CandidateMockInterviewView })));
const CandidateInterviewsView = lazy(() => import('./pages/candidate/CandidateInterviewsView.js').then(m => ({ default: m.CandidateInterviewsView })));
const CandidateNotificationsView = lazy(() => import('./pages/candidate/CandidateNotificationsView.js').then(m => ({ default: m.CandidateNotificationsView })));
const CandidateSettingsView = lazy(() => import('./pages/candidate/CandidateSettingsView.js').then(m => ({ default: m.CandidateSettingsView })));

// Recruiter Workspace Views (Lazy Loaded)
const RecruiterLayout = lazy(() => import('./pages/recruiter/RecruiterLayout.js').then(m => ({ default: m.RecruiterLayout })));
const RecruiterDashboardView = lazy(() => import('./pages/recruiter/RecruiterDashboardView.js').then(m => ({ default: m.RecruiterDashboardView })));
const CompanyProfileView = lazy(() => import('./pages/recruiter/CompanyProfileView.js').then(m => ({ default: m.CompanyProfileView })));
const PostJobView = lazy(() => import('./pages/recruiter/PostJobView.js').then(m => ({ default: m.PostJobView })));
const MyJobsView = lazy(() => import('./pages/recruiter/MyJobsView.js').then(m => ({ default: m.MyJobsView })));
const RecruiterApplicationsView = lazy(() => import('./pages/recruiter/RecruiterApplicationsView.js').then(m => ({ default: m.RecruiterApplicationsView })));
const CandidateProfileDetailView = lazy(() => import('./pages/recruiter/CandidateProfileDetailView.js').then(m => ({ default: m.CandidateProfileDetailView })));
const CandidateSearchView = lazy(() => import('./pages/recruiter/CandidateSearchView.js').then(m => ({ default: m.CandidateSearchView })));
const ShortlistedCandidatesView = lazy(() => import('./pages/recruiter/ShortlistedCandidatesView.js').then(m => ({ default: m.ShortlistedCandidatesView })));
const InterviewManagementView = lazy(() => import('./pages/recruiter/InterviewManagementView.js').then(m => ({ default: m.InterviewManagementView })));
const RecruiterMessagingView = lazy(() => import('./pages/recruiter/RecruiterMessagingView.js').then(m => ({ default: m.RecruiterMessagingView })));
const RecruiterNotificationsView = lazy(() => import('./pages/recruiter/RecruiterNotificationsView.js').then(m => ({ default: m.RecruiterNotificationsView })));
const RecruiterSettingsView = lazy(() => import('./pages/recruiter/RecruiterSettingsView.js').then(m => ({ default: m.RecruiterSettingsView })));

// Admin Portal Views (Lazy Loaded)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.js').then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.js').then(m => ({ default: m.AdminLayout })));
const AdminDashboardView = lazy(() => import('./pages/admin/AdminDashboardView.js').then(m => ({ default: m.AdminDashboardView })));
const AdminUsersView = lazy(() => import('./pages/admin/AdminUsersView.js').then(m => ({ default: m.AdminUsersView })));
const AdminRecruitersView = lazy(() => import('./pages/admin/AdminRecruitersView.js').then(m => ({ default: m.AdminRecruitersView })));
const AdminCompaniesView = lazy(() => import('./pages/admin/AdminCompaniesView.js').then(m => ({ default: m.AdminCompaniesView })));
const AdminJobsModerationView = lazy(() => import('./pages/admin/AdminJobsModerationView.js').then(m => ({ default: m.AdminJobsModerationView })));
const AdminApplicationsView = lazy(() => import('./pages/admin/AdminApplicationsView.js').then(m => ({ default: m.AdminApplicationsView })));
const AdminSkillsView = lazy(() => import('./pages/admin/AdminSkillsView.js').then(m => ({ default: m.AdminSkillsView })));
const AdminAssessmentsView = lazy(() => import('./pages/admin/AdminAssessmentsView.js').then(m => ({ default: m.AdminAssessmentsView })));
const AdminBadgesView = lazy(() => import('./pages/admin/AdminBadgesView.js').then(m => ({ default: m.AdminBadgesView })));
const AdminReportsView = lazy(() => import('./pages/admin/AdminReportsView.js').then(m => ({ default: m.AdminReportsView })));
const AdminAnalyticsView = lazy(() => import('./pages/admin/AdminAnalyticsView.js').then(m => ({ default: m.AdminAnalyticsView })));
const AdminActivityLogsView = lazy(() => import('./pages/admin/AdminActivityLogsView.js').then(m => ({ default: m.AdminActivityLogsView })));
const AdminSettingsView = lazy(() => import('./pages/admin/AdminSettingsView.js').then(m => ({ default: m.AdminSettingsView })));

// Lightweight loading indicator for chunk hydration
const PageLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[40vh] w-full py-16 text-[#9CA3A1]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-7 h-7 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono tracking-wider uppercase opacity-75">Loading workspace...</span>
    </div>
  </div>
);

const MainRouterApp: React.FC = () => {
  const { user, loading } = useAuth();
  const { path, navigate, params } = useRouter();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
    if (p.startsWith('/jobs')) return 'jobs';
    if (p.startsWith('/assessments')) return 'assessments';
    if (p.startsWith('/roadmap')) return 'roadmap';
    if (p.startsWith('/portfolio')) return 'portfolio';
    if (p.startsWith('/candidate-dashboard') || p.startsWith('/candidate/dashboard')) return 'candidate-dashboard';
    if (p.startsWith('/verify')) return 'verify';
    if (p.startsWith('/login')) return 'login';
    if (p.startsWith('/register')) return 'register';
    return 'home';
  });

  // Synchronize path with activeTab for candidate pages
  useEffect(() => {
    if (path.startsWith('/admin') || path.startsWith('/recruiter')) {
      return;
    }
    if (path === '/' || path === '/home') setActiveTab('home');
    else if (path.startsWith('/jobs')) setActiveTab('jobs');
    else if (path.startsWith('/assessments')) setActiveTab('assessments');
    else if (path.startsWith('/roadmap')) setActiveTab('roadmap');
    else if (path.startsWith('/interview')) navigate('/candidate/mock-interview');
    else if (path.startsWith('/portfolio')) setActiveTab('portfolio');
    else if (path.startsWith('/candidate-dashboard') || path.startsWith('/candidate/dashboard')) setActiveTab('candidate-dashboard');
    else if (path.startsWith('/verify')) setActiveTab('verify');
    else if (path.startsWith('/login')) setActiveTab('login');
    else if (path.startsWith('/register')) setActiveTab('register');
  }, [path]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/');
    else if (tab === 'jobs') navigate('/jobs');
    else if (tab === 'assessments') navigate('/assessments');
    else if (tab === 'roadmap') navigate('/roadmap');
    else if (tab === 'interview') navigate('/candidate/mock-interview');
    else if (tab === 'portfolio') navigate('/portfolio');
    else if (tab === 'candidate-dashboard') navigate('/candidate/dashboard');
    else if (tab === 'login') navigate('/login');
    else if (tab === 'register') navigate('/register');
    else if (tab === 'employer') navigate('/recruiter/dashboard');
    else if (tab === 'admin') navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D0C] flex items-center justify-center text-[#9CA3A1] text-xs">
        Initializing SkillBridge session...
      </div>
    );
  }

  // ==========================================
  // 1. ADMIN PORTAL ROUTING
  // ==========================================
  if (path === '/admin/login') {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
      return null;
    }
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminLoginPage />
      </Suspense>
    );
  }

  if (path.startsWith('/admin')) {
    if (!user) {
      navigate('/admin/login');
      return null;
    }
    if (user.role !== 'admin') {
      navigate('/recruiter/dashboard');
      return null;
    }

    const renderAdminContent = () => {
      if (path === '/admin/dashboard' || path === '/admin') return <AdminDashboardView />;
      if (path.startsWith('/admin/users')) return <AdminUsersView />;
      if (path.startsWith('/admin/recruiters')) return <AdminRecruitersView />;
      if (path.startsWith('/admin/companies')) return <AdminCompaniesView />;
      if (path.startsWith('/admin/jobs')) return <AdminJobsModerationView />;
      if (path.startsWith('/admin/applications')) return <AdminApplicationsView />;
      if (path.startsWith('/admin/skills')) return <AdminSkillsView />;
      if (path.startsWith('/admin/assessments')) return <AdminAssessmentsView />;
      if (path.startsWith('/admin/badges')) return <AdminBadgesView />;
      if (path.startsWith('/admin/reports')) return <AdminReportsView />;
      if (path.startsWith('/admin/analytics')) return <AdminAnalyticsView />;
      if (path.startsWith('/admin/activity-logs')) return <AdminActivityLogsView />;
      if (path.startsWith('/admin/settings')) return <AdminSettingsView />;
      return <AdminDashboardView />;
    };

    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AdminLayout>{renderAdminContent()}</AdminLayout>
      </Suspense>
    );
  }

  // ==========================================
  // 2. RECRUITER WORKSPACE ROUTING
  // ==========================================
  if (path.startsWith('/recruiter')) {
    if (!user) {
      navigate('/login');
      return null;
    }
    if (user.role !== 'employer' && user.role !== 'admin') {
      navigate('/candidate-dashboard');
      return null;
    }

    const renderRecruiterContent = () => {
      if (path === '/recruiter/dashboard' || path === '/recruiter') return <RecruiterDashboardView />;
      if (path.startsWith('/recruiter/company')) return <CompanyProfileView />;
      if (path.startsWith('/recruiter/jobs/create') || path.startsWith('/recruiter/jobs/edit/')) return <PostJobView />;
      if (path.startsWith('/recruiter/jobs')) return <MyJobsView />;
      if (path.startsWith('/recruiter/applications')) return <RecruiterApplicationsView />;
      if (path.startsWith('/recruiter/candidates/')) return <CandidateProfileDetailView />;
      if (path.startsWith('/recruiter/candidates')) return <CandidateSearchView />;
      if (path.startsWith('/recruiter/shortlisted')) return <ShortlistedCandidatesView />;
      if (path.startsWith('/recruiter/interviews')) return <InterviewManagementView />;
      if (path.startsWith('/recruiter/messages')) return <RecruiterMessagingView />;
      if (path.startsWith('/recruiter/notifications')) return <RecruiterNotificationsView />;
      if (path.startsWith('/recruiter/settings')) return <RecruiterSettingsView />;
      return <RecruiterDashboardView />;
    };

    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <RecruiterLayout activePath={path}>{renderRecruiterContent()}</RecruiterLayout>
      </Suspense>
    );
  }

  // ==========================================
  // 3. CANDIDATE WORKSPACE ROUTING
  // ==========================================
  if (path.startsWith('/candidate') || path === '/candidate-dashboard') {
    if (!user) {
      navigate('/login');
      return null;
    }
    if (user.role === 'employer') {
      navigate('/recruiter/dashboard');
      return null;
    }

    const renderCandidateWorkspaceContent = () => {
      if (path === '/candidate/dashboard' || path === '/candidate' || path === '/candidate-dashboard') {
        return <CandidateDashboardView />;
      }
      if (path.startsWith('/candidate/profile')) return <CandidateProfileView />;
      if (path.startsWith('/candidate/skills')) return <CandidateSkillsView />;
      if (path.startsWith('/candidate/assessments')) return <CandidateAssessmentsView />;
      if (path.startsWith('/candidate/roadmap')) return <CandidateCareerRoadmapView />;
      if ((path.startsWith('/candidate/jobs/') || path.startsWith('/jobs/')) && params?.jobId) {
        return <CandidateJobDetailView jobId={params.jobId} />;
      }
      if (path.startsWith('/candidate/jobs')) return <CandidateJobsView />;
      if (path.startsWith('/candidate/applications')) return <CandidateApplicationsView />;
      if (path.startsWith('/candidate/saved-jobs')) return <CandidateSavedJobsView />;
      if (path.startsWith('/candidate/portfolio')) return <CandidatePortfolioView />;
      if (path.startsWith('/candidate/resumes')) return <CandidateResumeView />;
      if (path.startsWith('/candidate/interview-prep') || path.startsWith('/candidate/mock-interview')) {
        return <CandidateMockInterviewView />;
      }
      if (path.startsWith('/candidate/interviews')) return <CandidateInterviewsView />;
      if (path.startsWith('/candidate/notifications')) return <CandidateNotificationsView />;
      if (path.startsWith('/candidate/settings')) return <CandidateSettingsView />;
      return <CandidateDashboardView />;
    };

    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <CandidateLayout activePath={path}>{renderCandidateWorkspaceContent()}</CandidateLayout>
      </Suspense>
    );
  }

  // ==========================================
  // 4. CANDIDATE & PUBLIC SHELL (PRESERVED)
  // ==========================================
  const renderCandidateContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigateTab={handleTabChange} />;
      case 'jobs':
        if (params?.jobId) {
          return <CandidateJobDetailView jobId={params.jobId} />;
        }
        return <JobsExplorerPage onNavigateToRoadmap={() => handleTabChange('roadmap')} />;
      case 'assessments':
        return <SkillAssessmentsPage />;
      case 'roadmap':
        if (!user) {
          handleTabChange('login');
          return null;
        }
        return <RoadmapPage onNavigateTab={handleTabChange} />;
      case 'interview':
        if (!user) {
          handleTabChange('login');
          return null;
        }
        return <CandidateMockInterviewView />;
      case 'portfolio':
        if (!user) {
          handleTabChange('login');
          return null;
        }
        return <PortfolioPage />;
      case 'candidate-dashboard':
        if (!user) {
          handleTabChange('login');
          return null;
        }
        if (user.role === 'employer') {
          navigate('/recruiter/dashboard');
          return null;
        }
        return <CandidateDashboardView />;
      case 'verify':
        return (
          <PublicBadgeVerifyPage
            initialBadgeCode={params?.badgeCode || 'SKB-REACT-8921'}
            onNavigateHome={() => handleTabChange('home')}
          />
        );
      case 'login':
        return <LoginPage onNavigateTab={handleTabChange} />;
      case 'register':
        return <RegisterPage onNavigateTab={handleTabChange} />;
      default:
        return <LandingPage onNavigateTab={handleTabChange} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text-secondary)] flex flex-col justify-between selection:bg-[var(--accent-primary)] selection:text-[#0B0D0C] font-sans antialiased overflow-x-hidden transition-colors duration-200">
      {/* Subtle top ambient radial beam */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-[#B6FF3B]/[0.06] via-[#B6FF3B]/[0.01] to-transparent blur-3xl" />
      <div>
        <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <Suspense fallback={<PageLoadingFallback />}>
            {renderCandidateContent()}
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <RouterProvider>
            <MainRouterApp />
          </RouterProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
