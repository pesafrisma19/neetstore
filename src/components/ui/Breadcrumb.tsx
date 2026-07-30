import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center flex-wrap gap-2 text-xs font-black uppercase ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--nb-text)] stroke-[3]" />}
            {isLast ? (
              <span className="bg-[var(--nb-yellow)] px-2 py-0.5 border-[2px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000]">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href || '#'}
                className="text-[var(--nb-text)] hover:underline hover:text-[#FF4D79] transition-colors"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
