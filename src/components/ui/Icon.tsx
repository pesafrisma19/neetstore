import React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const Icon: React.FC<IconProps> = ({
  children,
  tone = 'yellow',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-7 h-7 p-1 text-xs shadow-[1.5px_1.5px_0px_0px_#000]',
    md: 'w-9 h-9 p-1.5 text-sm shadow-[2px_2px_0px_0px_var(--nb-shadow)]',
    lg: 'w-12 h-12 p-2 text-lg shadow-[3px_3px_0px_0px_var(--nb-shadow)]',
  };

  const toneStyles = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text)]',
    pink: 'bg-[var(--nb-pink)] text-white',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text)]',
    cyan: 'bg-[var(--nb-cyan)] text-[var(--nb-text)]',
    white: 'bg-[var(--nb-surface)] text-[var(--nb-text)]',
    dark: 'bg-black text-white',
  };

  return (
    <div
      className={`inline-flex items-center justify-center border-[2.5px] border-[var(--nb-border)] shrink-0 ${sizeStyles[size]} ${toneStyles[tone]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
