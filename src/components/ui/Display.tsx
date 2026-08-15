import React from 'react';

export interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  highlight?: 'yellow' | 'pink' | 'mint' | 'purple' | 'none';
}

export const Display: React.FC<DisplayProps> = ({
  children,
  size = 'md',
  highlight = 'none',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-5xl md:text-6xl',
  };

  const highlightStyles = {
    none: '',
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)] px-2 py-0.5 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] inline-block -rotate-1',
    pink: 'bg-[var(--nb-pink)] text-[var(--nb-text-on-accent)] px-2 py-0.5 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] inline-block rotate-1',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)] px-2 py-0.5 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] inline-block -rotate-1',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text-on-accent)] px-2 py-0.5 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)] inline-block rotate-1',
  };

  const shadowMap: Record<string, string> = {
    yellow: 'var(--nb-shadow-yellow)',
    pink: 'var(--nb-shadow-pink)',
    mint: 'var(--nb-shadow-mint)',
    purple: 'var(--nb-shadow-purple)',
  };

  return (
    <h1
      className={`font-black uppercase tracking-tight text-[var(--nb-text)] leading-[1.1] ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {highlight !== 'none' ? (
        <span
          className={highlightStyles[highlight]}
          style={{
            boxShadow: `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) ${shadowMap[highlight]}`,
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </h1>
  );
};
