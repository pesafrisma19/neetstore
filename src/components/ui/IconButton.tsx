import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const sizeMap = {
    sm: { dim: 'w-8 h-8 p-1', shadow: '2px', hoverShadow: '3px', move: '1px' },
    md: { dim: 'w-11 h-11 p-2', shadow: '3px', hoverShadow: '5px', move: '2px' },
    lg: { dim: 'w-14 h-14 p-3', shadow: '4px', hoverShadow: '6px', move: '2px' },
  };

  const variantStyles: Record<string, string> = {
    yellow: `bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)] hover:bg-[var(--nb-yellow-hover)]`,
    pink: 'bg-[var(--nb-pink)] text-white hover:bg-[var(--nb-pink-hover)]',
    mint: `bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)] hover:bg-[var(--nb-mint-hover)]`,
    purple: `bg-[var(--nb-purple)] text-[var(--nb-text-on-accent)] hover:bg-[var(--nb-purple-hover)]`,
    cyan: `bg-[var(--nb-cyan)] text-[var(--nb-text-on-accent)] hover:bg-[var(--nb-cyan-hover)]`,
    white: 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:opacity-90',
    dark: 'bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] hover:opacity-90',
  };

  const shadowColorMap: Record<string, string> = {
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    mint: 'var(--nb-shadow-mint)',
    purple: 'var(--nb-shadow-purple)',
    cyan: 'var(--nb-shadow-cyan)',
    white: 'var(--nb-shadow)',
    dark: 'var(--nb-shadow)',
  };

  const s = sizeMap[size];
  const sc = shadowColorMap[variant] || 'var(--nb-shadow)';

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center border-[3px] border-[var(--nb-border)] transition-all cursor-pointer select-none rounded-none active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${s.dim} ${variantStyles[variant]} ${className}`}
      style={{ boxShadow: `${s.shadow} ${s.shadow} 0px 0px ${sc}` }}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = `translate(-${s.move}, -${s.move})`;
          e.currentTarget.style.boxShadow = `${s.hoverShadow} ${s.hoverShadow} 0px 0px ${sc}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `${s.shadow} ${s.shadow} 0px 0px ${sc}`;
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translate(1px, 1px)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = `translate(-${s.move}, -${s.move})`;
          e.currentTarget.style.boxShadow = `${s.hoverShadow} ${s.hoverShadow} 0px 0px ${sc}`;
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};
