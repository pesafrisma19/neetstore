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
            className={`w-9 h-9 border-[2.5px] border-[var(--nb-border)] font-black text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-[var(--nb-yellow)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] -translate-y-0.5'
                : 'bg-[var(--nb-surface)] hover:bg-gray-100 shadow-[1.5px_1.5px_0px_0px_#000]'
            }`}
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
