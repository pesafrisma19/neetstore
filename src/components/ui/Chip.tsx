import React from 'react';
import { Badge, type BadgeProps } from './Badge';

export const Chip: React.FC<BadgeProps> = (props) => <Badge {...props} />;
export const ChipGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex flex-wrap items-center gap-2 ${className}`} {...props}>
    {children}
  </div>
);
