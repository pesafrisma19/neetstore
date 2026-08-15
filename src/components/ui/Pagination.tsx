import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="white"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4 stroke-[3]" />
        PREV
      </Button>

      {Array.from({ length: totalPages }).map((_, idx) => {
        const page = idx + 1;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-element)] font-black text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)] -translate-y-0.5'
                : 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:bg-[var(--nb-surface-alt)]'
            }`}
            style={{
              boxShadow: isActive
                ? `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`
                : `var(--nb-shadow-sm-x) var(--nb-shadow-sm-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
            }}
          >
            {page}
          </button>
        );
      })}

      <Button
        variant="white"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        NEXT
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </Button>
    </div>
  );
};
