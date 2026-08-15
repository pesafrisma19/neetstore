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
              <span
                className="bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)] px-2 py-0.5 border-[length:var(--nb-border-width-sm)] border-[var(--nb-border)] rounded-[var(--nb-radius-badge)]"
                style={{
                  boxShadow: `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
                }}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href || '#'}
                className="text-[var(--nb-text)] hover:underline hover:text-[var(--nb-pink)] transition-colors"
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
