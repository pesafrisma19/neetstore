import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: 'yellow' | 'pink' | 'mint' | 'purple';
}

export const ImageCard: React.FC<ImageCardProps> = ({
  src,
  alt = 'Image Card',
  title,
  subtitle,
  badge,
  badgeTone = 'pink',
  className = '',
  ...props
}) => {
  return (
    <Card variant="white" shadow="lg" className={`group cursor-pointer text-left ${className}`} {...props}>
      <div className="relative h-44 w-full bg-[var(--nb-surface-alt)] border-b-[3px] border-[var(--nb-border)] overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <div className="absolute top-2 right-2">
            <Badge variant={badgeTone} size="sm">
              {badge}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h4 className="font-black text-base uppercase text-[var(--nb-text)] m-0 leading-tight">{title}</h4>
        {subtitle && <p className="text-xs font-semibold text-[var(--nb-text-muted)] m-0">{subtitle}</p>}
      </div>
    </Card>
  );
};
