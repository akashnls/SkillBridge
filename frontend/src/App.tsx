import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { JobsExplorerPage } from './pages/JobsExplorerPage.js';
import { SkillAssessmentsPage } from './pages/SkillAssessmentsPage.js';
import { RoadmapPage } from './pages/RoadmapPage.js';
import { MockInterviewPage } from './pages/MockInterviewPage.js';
import { PortfolioPage } from './pages/PortfolioPage.js';
import { CandidateDashboard } from './pages/CandidateDashboard.js';
import { EmployerDashboard } from './pages/EmployerDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { PublicBadgeVerifyPage } from './pages/PublicBadgeVerifyPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [verifyBadgeCode, setVerifyBadgeCode] = useState<string | null>(null);

  // Check URL pathname for /verify/:badgeCode
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const code = path.replace('/verify/', '');
      if (code) {
        setVerifyBadgeCode(code);
        setActiveTab('verify');
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigateTab={setActiveTab} />;
      case 'jobs':
        return <JobsExplorerPage onNavigateToRoadmap={() => setActiveTab('roadmap')} />;
      case 'assessments':
        return <SkillAssessmentsPage />;
      case 'roadmap':
        return <RoadmapPage onNavigateTab={setActiveTab} />;
      case 'interview':
        return <MockInterviewPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'candidate-dashboard':
        return <CandidateDashboard onNavigateTab={setActiveTab} />;
      case 'employer':
        return <EmployerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'verify':
        return (
          <PublicBadgeVerifyPage
            initialBadgeCode={verifyBadgeCode || 'SKB-REACT-8921'}
            onNavigateHome={() => setActiveTab('home')}
          />
        );
      case 'login':
        return <LoginPage onNavigateTab={setActiveTab} />;
      case 'register':
        return <RegisterPage onNavigateTab={setActiveTab} />;
      default:
        return <LandingPage onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
