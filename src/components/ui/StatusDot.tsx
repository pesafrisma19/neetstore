import React from 'react';

export interface StatusDotProps {
  status?: 'success' | 'warning' | 'error' | 'info';
  label?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'success',
  label,
  pulse = true,
  className = '',
}) => {
  const statusColors = {
    success: 'bg-[var(--nb-mint)]',
    warning: 'bg-[var(--nb-yellow)]',
    error: 'bg-[var(--nb-pink)]',
    info: 'bg-[var(--nb-cyan)]',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-3 w-3">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColors[status]}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] ${statusColors[status]}`}
        />
      </span>
      {label && <span className="text-xs font-black uppercase tracking-wide text-[var(--nb-text)]">{label}</span>}
    </div>
  );
};
