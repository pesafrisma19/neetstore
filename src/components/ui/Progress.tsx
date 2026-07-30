import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  tone?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  tone = 'yellow',
  label,
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const toneBg = {
    yellow: 'bg-[var(--nb-yellow)]',
    pink: 'bg-[var(--nb-pink)]',
    mint: 'bg-[var(--nb-mint)]',
    purple: 'bg-[var(--nb-purple)]',
    cyan: 'bg-[var(--nb-cyan)]',
  };

  return (
    <div className={`flex flex-col gap-1 w-full text-left ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--nb-text)]">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-5 border-[3px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-0.5 shadow-[3px_3px_0px_0px_var(--nb-shadow)] overflow-hidden">
        <div
          className={`h-full border-[1.5px] border-[var(--nb-border)] transition-all duration-300 ${toneBg[tone]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
