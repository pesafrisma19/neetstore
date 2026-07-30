import React from 'react';

export const Cluster: React.FC<React.HTMLAttributes<HTMLDivElement> & { gap?: string }> = ({
  children,
  gap = 'gap-3',
  className = '',
  ...props
}) => (
  <div className={`flex flex-wrap items-center ${gap} ${className}`} {...props}>
    {children}
  </div>
);
