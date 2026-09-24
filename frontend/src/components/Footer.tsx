import React from 'react';
import { SkillBridgeLogo } from './SkillBridgeLogo.js';

const FooterColumn: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
  <div>
    <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">{title}</h2>
    <ul className="mt-3.5 space-y-2.5 text-sm">
      {links.map(link => (
        <li key={link}>
          <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] transition-colors duration-150">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer: React.FC = () => (
  <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-[var(--text-secondary)] sm:px-6 transition-colors duration-200">
    <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="flex items-center gap-2.5">
          <SkillBridgeLogo size="sm" />
          <span className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">SkillBridge</span>
        </div>
        <p className="mt-3.5 text-sm leading-6 text-[var(--text-secondary)]">
          A skill-first platform for candidates to grow and employers to hire with confidence.
        </p>
      </div>
      <FooterColumn title="Platform" links={['Jobs', 'Assessments', 'AI Mock Interview', 'Career Roadmap']} />
      <FooterColumn title="For recruiters" links={['Recruiter Platform', 'Post a Job']} />
      <FooterColumn title="Company" links={['About', 'Contact']} />
    </div>
    <div className="mx-auto mt-10 max-w-7xl border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
      <p>© 2026 SkillBridge. Skill-first hiring for meaningful work.</p>
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center gap-1.5 text-[var(--success)]">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
          All Systems Operational
        </span>
      </div>
    </div>
  </footer>
);
