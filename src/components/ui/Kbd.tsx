import React from 'react';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'md';
}

export const Kbd: React.FC<KbdProps> = ({
  children,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 min-w-[20px]',
    md: 'text-xs px-2.5 py-1 min-w-[28px]',
  };

  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono font-black uppercase text-[var(--nb-text)] bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] rounded-none select-none ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </kbd>
  );
};
