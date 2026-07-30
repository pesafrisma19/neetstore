import React from 'react';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'bold' | 'black';
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  weight = 'bold',
  muted = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
    black: 'font-black uppercase tracking-wider',
  };

  return (
    <p
      className={`${sizeStyles[size]} ${weightStyles[weight]} ${
        muted ? 'text-[var(--nb-text-muted)]' : 'text-[var(--nb-text)]'
      } ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};
