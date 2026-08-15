import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'warning' | 'danger';
  title?: string;
  icon?: React.ReactNode;
}

export const Callout: React.FC<CalloutProps> = ({
  tone = 'yellow',
  title,
  icon,
  children,
  className = '',
  ...props
}) => {
  const bgStyles: Record<string, string> = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)]',
    pink: 'bg-[var(--nb-pink)] text-[var(--nb-text-on-accent)]',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text-on-accent)]',
    cyan: 'bg-[var(--nb-cyan)] text-[var(--nb-text-on-accent)]',
    warning: 'bg-[var(--nb-orange)] text-[var(--nb-text-on-accent)]',
    danger: 'bg-[var(--nb-danger)] text-[var(--nb-text-on-accent)]',
  };

  const shadowMap: Record<string, string> = {
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    mint: 'var(--nb-shadow-mint)',
    purple: 'var(--nb-shadow-purple)',
    cyan: 'var(--nb-shadow-cyan)',
    warning: 'var(--nb-shadow-yellow)',
    danger: 'var(--nb-shadow-pink)',
  };

  const defaultIcon: Record<string, React.ReactNode> = {
    yellow: <Info className="w-5 h-5 stroke-[3] shrink-0" />,
    pink: <AlertCircle className="w-5 h-5 stroke-[3] shrink-0" />,
    mint: <CheckCircle2 className="w-5 h-5 stroke-[3] shrink-0" />,
    purple: <Info className="w-5 h-5 stroke-[3] shrink-0" />,
    cyan: <Info className="w-5 h-5 stroke-[3] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 stroke-[3] shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 stroke-[3] shrink-0" />,
  };

  return (
    <div
      className={`p-4 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-element)] flex items-start gap-3 text-left ${bgStyles[tone]} ${className}`}
      style={{
        boxShadow: `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) ${shadowMap[tone]}`,
      }}
      {...props}
    >
      {icon || defaultIcon[tone]}
      <div className="flex flex-col gap-1 text-xs font-bold leading-relaxed">
        {title && <span className="font-black text-sm uppercase tracking-tight">{title}</span>}
        <div>{children}</div>
      </div>
    </div>
  );
};
