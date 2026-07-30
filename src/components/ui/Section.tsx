import React from 'react';

export const Section: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 border-b-[3px] border-[var(--nb-border)] last:border-b-0 ${className}`} {...props}>
    {children}
  </div>
);
