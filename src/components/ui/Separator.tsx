import React from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  dashed?: boolean;
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  dashed = false,
  className = '',
}) => {
  const borderStyle = dashed ? 'border-dashed' : 'border-solid';

  if (orientation === 'vertical') {
    return <div className={`h-full border-r-[3px] border-[var(--nb-border)] ${borderStyle} ${className}`} />;
  }

  return <div className={`w-full border-b-[3px] border-[var(--nb-border)] ${borderStyle} my-4 ${className}`} />;
};
