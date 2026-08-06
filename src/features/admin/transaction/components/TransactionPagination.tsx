import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  currentCount: number;
  isFetching?: boolean;
  onPageChange: (newPage: number) => void;
}

export const TransactionPagination: React.FC<TransactionPaginationProps> = ({
  page,
  totalPages,
  totalCount,
  currentCount,
  isFetching = false,
  onPageChange,
}) => {
  return (
    <div className="bg-neutral-100 border-t-[3px] border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
      <div className="text-neutral-600">
        Menampilkan {currentCount} dari {totalCount} transaksi (Halaman {page} dari {totalPages})
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="white"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1 || isFetching}
          className="font-black uppercase"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> SEBELUMNYA
        </Button>
        <span className="px-2 py-1 bg-white border-[2px] border-black font-mono font-black">
          {page} / {totalPages}
        </span>
        <Button
          variant="white"
          size="sm"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages || isFetching}
          className="font-black uppercase"
        >
          SELANJUTNYA <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
