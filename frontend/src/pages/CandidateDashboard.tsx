import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { applicationsAPI, assessmentsAPI, portfolioAPI, roadmapAPI } from '../services/api.js';
import { Application, VerifiableBadge, PortfolioProject, Roadmap } from '../types/index.js';
import { VerifiableBadgeCard } from '../components/VerifiableBadgeCard.js';
import {
  User,
  Award,
  Compass,
  FolderGit2,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CandidateDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [badges, setBadges] = useState<VerifiableBadge[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioProject[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, pRes, rRes, aRes] = await Promise.all([
        assessmentsAPI.getMyBadges(),
        portfolioAPI.getMyPortfolios(),
        roadmapAPI.getMyRoadmaps(),
        applicationsAPI.getMyApplications()
      ]);

      if (bRes.data.success) setBadges(bRes.data.badges);
      if (pRes.data.success) setPortfolios(pRes.data.portfolios);
      if (rRes.data.success) setRoadmaps(rRes.data.roadmaps);
      if (aRes.data.success) setApplications(aRes.data.applications);
    } catch (e) {
      console.error('Failed to load candidate stats', e);
    } finally {
      setLoading(false);
    }
  };

  const avgFitScore =
    applications.length > 0
      ? Math.round(applications.reduce((a, b) => a + b.fit_score, 0) / applications.length)
      : 88.5;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Profile Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.name}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl bg-slate-800 ring-2 ring-indigo-500/50 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{user?.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Verified Candidate
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              {user?.profile?.headline || 'Full Stack Web Developer & Self-Taught Problem Solver'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{user?.profile?.location || 'India'}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateTab('assessments')}
            className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Earn New Badge</span>
          </button>
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Add Practical Repo</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Verified Badges</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{badges.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold">+{badges.length * 5}% Bonus</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Portfolio Proofs</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{portfolios.length}</span>
            <span className="text-[10px] text-slate-500">Live projects</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Roadmaps</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-400">{roadmaps.length}</span>
            <span className="text-[10px] text-slate-500">Upskilling tracks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Jobs Applied</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{applications.length}</span>
            <span className="text-[10px] text-indigo-400 font-bold">Avg {avgFitScore}% Fit</span>
          </div>
        </div>
      </div>

      {/* Applications Tracker */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span>Submitted Applications ({applications.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('jobs')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Explore More Jobs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No applications submitted yet. Browse jobs and apply with your verified skills!
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{app.job_title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {app.company_name} • {app.location}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Applied on {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">AI Match Score</span>
                    <span className="text-sm font-black text-emerald-400">{app.fit_score}%</span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earned Micro-Credentials Carousel/Grid */}
      {badges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Earned Micro-Credentials</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <VerifiableBadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
