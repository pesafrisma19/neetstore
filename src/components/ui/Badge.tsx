import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'white' | 'dark' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  rotate?: boolean;
  angle?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  rotate = false,
  angle = '-rotate-2',
  className = '',
  style,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-wider border-[2px] border-[var(--nb-border)] select-none';

  const variantStyles: Record<string, string> = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)]',
    pink: 'bg-[var(--nb-pink)] text-white',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text-on-accent)]',
    cyan: 'bg-[var(--nb-cyan)] text-[var(--nb-text-on-accent)]',
    white: 'bg-[var(--nb-surface)] text-[var(--nb-text)]',
    dark: 'bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)]',
    orange: 'bg-[var(--nb-orange)] text-[var(--nb-text-on-accent)]',
  };

  const shadowColorMap: Record<string, string> = {
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    mint: 'var(--nb-shadow-mint)',
    purple: 'var(--nb-shadow-purple)',
    cyan: 'var(--nb-shadow-cyan)',
    white: 'var(--nb-shadow)',
    dark: 'var(--nb-shadow)',
    orange: 'var(--nb-shadow-yellow)',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  };

  const rotationClass = rotate ? `${angle} transform transition-transform hover:rotate-0` : '';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${rotationClass} ${className}`}
      style={{ boxShadow: `2px 2px 0px 0px ${shadowColorMap[variant]}`, ...style }}
      {...props}
    >
      {children}
    </span>
  );
};
