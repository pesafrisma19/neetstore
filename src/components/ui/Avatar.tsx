import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'yellow' | 'pink' | 'mint' | 'purple' | 'cyan' | 'white';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback = 'U',
  size = 'md',
  variant = 'yellow',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  const bgStyles = {
    yellow: 'bg-[var(--nb-yellow)] text-[var(--nb-text)]',
    pink: 'bg-[var(--nb-pink)] text-white',
    mint: 'bg-[var(--nb-mint)] text-[var(--nb-text)]',
    purple: 'bg-[var(--nb-purple)] text-[var(--nb-text)]',
    cyan: 'bg-[var(--nb-cyan)] text-[var(--nb-text)]',
    white: 'bg-[var(--nb-surface)] text-[var(--nb-text)]',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-black uppercase border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] overflow-hidden select-none shrink-0 ${sizeStyles[size]} ${bgStyles[variant]} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center -space-x-3 ${className}`} {...props}>
    {children}
  </div>
);
