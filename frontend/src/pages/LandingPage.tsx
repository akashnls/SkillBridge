import React from 'react';
import { ArrowRight, Award, BriefcaseBusiness, CheckCircle2, Compass, Mic, Search, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface LandingPageProps { onNavigateTab: (tab: string) => void; }
const steps = [['Build your profile', 'Show employers the skills and projects behind your potential.'], ['Verify your skills', 'Turn assessments into credentials you can share with confidence.'], ['Discover matched jobs', 'Explore opportunities with a clear view of your skill fit.'], ['Prepare with AI', 'Practice interviews and use focused feedback to improve.'], ['Apply and get hired', 'Track every application in one focused workspace.']];
const features: Array<[React.ElementType, string, string]> = [[Award, 'Verified skills', 'Earn credentials that show what you know.'], [Compass, 'Career roadmap', 'See the next practical step forward.'], [BriefcaseBusiness, 'Job matching', 'Find roles that fit your strengths.'], [Mic, 'AI mock interview', 'Practise before the real conversation.']];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const recruiterAction = () => onNavigateTab(user?.role === 'employer' ? 'employer' : 'login');

  return (
    <div className="sb-landing space-y-24 py-4 sm:py-8">
      {/* 1. HERO SECTION */}
      <section className="sb-hero relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] p-8 sm:p-14 lg:p-16 shadow-2xl">
        <div className="sb-hero-orb sb-hero-orb-one" />
        <div className="sb-hero-orb sb-hero-orb-two" />
        <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/40 text-xs font-semibold text-[var(--text-primary)]/90 shadow-sm backdrop-blur-md">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
            <span>Skill-first hiring, made human</span>
          </div>

          {/* Massive Headline */}
          <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.08]">
            Find work that fits your <span className="text-[var(--accent-primary)] drop-shadow-[0_0_20px_rgba(182,255,59,0.3)]">strengths.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            Build verified skills, discover more meaningful opportunities, and prepare with clarity for every next step.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigateTab('jobs')}
              className="sb-btn-primary px-7 py-3.5 text-sm font-bold shadow-[0_0_25px_rgba(182,255,59,0.35)]"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              <span>Explore jobs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigateTab(user ? 'candidate-dashboard' : 'register')}
              className="sb-btn-hero-secondary px-7 py-3.5 text-sm font-semibold"
            >
              <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
              <span>Build your profile</span>
            </button>
          </div>
        </div>

        {/* Hero Interactive Search Bar Widget */}
        <div className="sb-hero-search mx-auto max-w-2xl">
          <Search className="h-5 w-5 text-[var(--accent-primary)] shrink-0" />
          <span className="text-sm text-[var(--text-secondary)]">What skill or role are you looking for?</span>
          <button onClick={() => onNavigateTab('jobs')} className="text-sm">
            <span>Find opportunities</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="scroll-mt-24">
        <div className="sb-section-heading">
          <p className="sb-eyebrow">A simple, focused path</p>
          <h2>Turn your abilities into opportunity.</h2>
          <p>Everything you need to grow, prove your work, and make the next move with confidence.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([title, description], index) => (
            <article key={title} className="sb-card p-6 flex flex-col justify-between">
              <div>
                <span className="sb-number text-sm">{index + 1}</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-4">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. CANDIDATE & FEATURES SECTION */}
      <section className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="sb-eyebrow">Made for candidates</p>
          <h2 className="sb-display-heading">Make your skills visible.</h2>
          <p className="sb-body-copy">
            Build a profile that goes beyond keywords. Use assessments, a portfolio, a career roadmap, and interview practice to show what you can do.
          </p>
          <button
            onClick={() => onNavigateTab(user ? 'candidate-dashboard' : 'register')}
            className="sb-btn-primary mt-8 px-6 py-3 text-sm font-bold"
          >
            <span>Start your profile</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(([Icon, label, description]) => (
            <article key={label} className="sb-card sb-feature-card">
              <span className="sb-feature-icon">
                <Icon className="h-5 w-5 text-[var(--accent-primary)]" />
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">{label}</h3>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. RECRUITERS SECTION */}
      <section id="recruiters" className="sb-recruiter-panel">
        <div className="sb-recruiter-workspace">
          <div className="flex items-center gap-3">
            <span className="sb-feature-icon">
              <UserRound className="h-5 w-5 text-[var(--accent-primary)]" />
            </span>
            <div>
              <p className="font-bold text-[var(--text-primary)] text-base">Recruiter workspace</p>
              <p className="text-xs text-[var(--text-secondary)]">A calm, clear hiring pipeline</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-[var(--text-primary)]">
            <span className="flex items-center justify-between">Post jobs <ArrowRight className="h-3 w-3 text-[var(--accent-primary)]" /></span>
            <span className="flex items-center justify-between">Find candidates <ArrowRight className="h-3 w-3 text-[var(--accent-primary)]" /></span>
            <span className="flex items-center justify-between">Shortlist talent <ArrowRight className="h-3 w-3 text-[var(--accent-primary)]" /></span>
            <span className="flex items-center justify-between">Schedule interviews <ArrowRight className="h-3 w-3 text-[var(--accent-primary)]" /></span>
          </div>
        </div>
        <div>
          <p className="sb-eyebrow">For recruiters</p>
          <h2 className="sb-display-heading">Hire for demonstrated capability.</h2>
          <p className="sb-body-copy">
            Create roles, discover candidates, review applications, and manage interviews from one connected workspace.
          </p>
          <button onClick={recruiterAction} className="sb-btn-primary mt-8 px-6 py-3 text-sm font-bold">
            <span>Explore recruiter tools</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 5. AI MOCK INTERVIEW CALLOUT */}
      <section className="sb-callout">
        <div className="max-w-xl">
          <p className="sb-eyebrow">AI mock interview</p>
          <h2 className="sb-display-heading">Practice with purposeful feedback.</h2>
          <p className="sb-body-copy">
            Choose a role and difficulty, respond to interview questions, then use practical feedback to make the next round better.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab(user ? 'interview' : 'login')}
          className="sb-btn-secondary shrink-0 px-6 py-3.5 text-sm font-semibold"
        >
          <Mic className="h-4 w-4 text-[var(--accent-primary)]" />
          <span>Try interview practice</span>
        </button>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="py-12 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center shadow-[0_0_20px_rgba(182,255,59,0.2)]">
          <ShieldCheck className="h-7 w-7 text-[var(--accent-primary)]" />
        </div>
        <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Ready to bridge the gap?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-[var(--text-secondary)]">
          Start building a skill-first path to your next opportunity.
        </p>
        <button
          onClick={() => onNavigateTab(user ? 'candidate-dashboard' : 'register')}
          className="sb-btn-primary mt-8 px-7 py-3.5 text-sm font-bold shadow-[0_0_25px_rgba(182,255,59,0.35)]"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Get started</span>
        </button>
      </section>
    </div>
  );
};
