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
    yellow: 'bg-[var(--nb-yellow)] px-2 py-0.5 border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] inline-block -rotate-1',
    pink: 'bg-[var(--nb-pink)] text-white px-2 py-0.5 border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] inline-block rotate-1',
    mint: 'bg-[var(--nb-mint)] px-2 py-0.5 border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] inline-block -rotate-1',
    purple: 'bg-[var(--nb-purple)] px-2 py-0.5 border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] inline-block rotate-1',
  };

  return (
    <h1
      className={`font-black uppercase tracking-tight text-[var(--nb-text)] leading-[1.1] ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {highlight !== 'none' ? <span className={highlightStyles[highlight]}>{children}</span> : children}
    </h1>
  );
};
