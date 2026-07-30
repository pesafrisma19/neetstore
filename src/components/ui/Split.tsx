import React from 'react';

export const Split: React.FC<React.HTMLAttributes<HTMLDivElement> & { cols?: string }> = ({
  children,
  cols = 'grid-cols-1 md:grid-cols-2',
  className = '',
  ...props
}) => (
  <div className={`grid ${cols} gap-4 ${className}`} {...props}>
    {children}
  </div>
);
