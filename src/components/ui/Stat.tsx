import React from 'react';
import { Card } from './Card';

export interface StatProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  badgeTone?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan';
  icon?: React.ReactNode;
  variant?: 'white' | 'cream' | 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan';
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  subtext,
  badge,
  badgeTone = 'yellow',
  icon,
  variant = 'white',
  className = '',
}) => {
  const badgeColors: Record<string, string> = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)]',
    pink: 'bg-[var(--nb-pink)] text-[var(--nb-text-on-accent)]',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text-on-accent)]',
    cyan: 'bg-[var(--nb-cyan)] text-[var(--nb-text-on-accent)]',
  };

  return (
    <Card variant={variant} className={`p-4 md:p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-black uppercase tracking-wider text-[var(--nb-text)]/70">{label}</span>
        {icon && (
          <div
            className="p-1.5 border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] rounded-[var(--nb-radius-badge)]"
            style={{
              boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-black text-[var(--nb-text)] tracking-tight">{value}</span>
        {badge && (
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] ${badgeColors[badgeTone]}`}
            style={{
              boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {subtext && <span className="text-xs font-bold text-[var(--nb-text-muted)] mt-2">{subtext}</span>}
    </Card>
  );
};
