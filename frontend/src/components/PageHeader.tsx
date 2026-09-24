import React from 'react';

export interface PageHeaderProps {
  badge?: React.ReactNode;
  badgeSubtext?: React.ReactNode;
  badgeVariant?: 'primary' | 'amber' | 'neutral' | 'blue';
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeSubtext,
  badgeVariant = 'primary',
  icon,
  title,
  subtitle,
  actions,
  children,
  className = ''
}) => {
  const badgeClasses = {
    primary: 'bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30',
    amber: 'bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30',
    neutral: 'bg-[var(--bg)] text-[var(--text-secondary)] border-[var(--border)]',
    blue: 'bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30'
  }[badgeVariant];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 shadow-xl transition-colors duration-200 ${className}`}>
      {/* Glow Effect */}
      <div className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-radial from-[var(--accent-secondary)]/10 to-transparent blur-3xl" />

      {/* Main Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          {(badge || badgeSubtext) && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {badge && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${badgeClasses}`}>
                  {badge}
                </span>
              )}
              {badgeSubtext && (
                <span className="text-[var(--text-secondary)] text-xs">
                  {badgeSubtext}
                </span>
              )}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            {icon && <span className="text-[var(--accent-secondary)] shrink-0">{icon}</span>}
            <span>{title}</span>
          </h1>

          {subtitle && (
            <p className="text-[var(--text-secondary)] text-sm mt-1 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Children (e.g. progress bar, alerts) */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};
