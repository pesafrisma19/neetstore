import React from 'react';

export const Stack: React.FC<React.HTMLAttributes<HTMLDivElement> & { gap?: string }> = ({
  children,
  gap = 'gap-4',
  className = '',
  ...props
}) => (
  <div className={`flex flex-col ${gap} ${className}`} {...props}>
    {children}
  </div>
);
