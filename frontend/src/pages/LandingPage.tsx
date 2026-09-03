import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  Award,
  Compass,
  Mic,
  FolderGit2,
  Languages,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle,
  Building2,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTab }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 p-8 sm:p-14 text-center shadow-2xl">
        {/* Background Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered Job & Skill Matching Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t('hero_title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigateTab('jobs')}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>{t('hero_cta_candidate')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab(user?.role === 'employer' ? 'employer' : 'login')}
              className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>{t('hero_cta_employer')}</span>
            </button>
          </div>
        </div>

        {/* Live Platform Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 text-center">
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black text-white">42%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t('stat_unemployment_reduced')}</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">1,240+</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t('stat_verified_badges')}</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">89.4%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t('stat_avg_job_fit')}</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-black text-cyan-400">3,800+</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t('stat_active_learners')}</p>
          </div>
        </div>
      </section>

      {/* Core Innovation Modules Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-white tracking-tight">
            How SkillBridge Solves Youth Unemployment
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Moving beyond resume keywords to verifiable competence, transparent AI explanations, and guided upskilling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => onNavigateTab('jobs')}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-950/30 cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              {t('feature_1_title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature_1_desc')}</p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigateTab('roadmap')}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-950/30 cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {t('feature_2_title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature_2_desc')}</p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigateTab('assessments')}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-950/30 cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              {t('feature_3_title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature_3_desc')}</p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigateTab('interview')}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all hover:shadow-xl hover:shadow-rose-950/30 cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              {t('feature_4_title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature_4_desc')}</p>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => onNavigateTab('portfolio')}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-950/30 cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {t('feature_5_title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature_5_desc')}</p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-950/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t('feature_6_title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('feature_6_desc')}</p>
          </div>
        </div>
      </section>

      {/* Quick Test Drive Banner */}
      <section className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 rounded-3xl border border-indigo-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-white">Ready to test your skills and earn verified badges?</h3>
          <p className="text-xs text-slate-300">
            Take a 10-minute skill assessment and immediately verify your score with employers.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('assessments')}
          className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-black shadow-lg transition-all shrink-0 flex items-center gap-2"
        >
          <span>Take a Skill Assessment</span>
          <ArrowRight className="w-4 h-4 text-indigo-600" />
        </button>
      </section>
    </div>
  );
};
