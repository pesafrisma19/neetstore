import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { History, RefreshCw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserTransactionItem } from '../../../../utils/api';

interface UserTransactionsTabProps {
  transactions: UserTransactionItem[];
  totalTransactions: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

export const UserTransactionsTab: React.FC<UserTransactionsTabProps> = ({
  transactions,
  totalTransactions,
  totalPages,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onRefetch,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  };

  const startItem = totalTransactions === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalTransactions);

  return (
    <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl overflow-hidden">
      <CardHeader headerBg="#6EE7B7" className="border-b-[3px] border-black flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
          <History className="w-4 h-4 stroke-[3]" />
          RIWAYAT PEMBELIAN & TOP UP PESANAN
        </CardTitle>
        <button
          type="button"
          onClick={onRefetch}
          className="p-1 hover:bg-black/10 rounded transition-transform active:rotate-180 text-black cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4 stroke-[3]" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        {/* DESKTOP VIEW: Table (Hidden on Mobile) */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>INVOICE ID</TableHead>
                <TableHead>PRODUK</TableHead>
                <TableHead>TANGGAL</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>PEMBAYARAN</TableHead>
                <TableHead>STATUS PESANAN</TableHead>
                <TableHead className="text-right">STRUK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 font-black text-xs uppercase">
                    Memuat data transaksi dari server...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 font-black text-xs text-[var(--nb-text-muted)] uppercase">
                    Belum ada riwayat transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono font-black text-xs text-[var(--nb-text)]">
                      {tx.providerRef || `TRX-${tx.id}`}
                    </TableCell>
                    <TableCell className="font-bold text-xs uppercase">
                      {tx.product?.name || `Produk #${tx.productId}`}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[var(--nb-text-muted)]">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono font-black text-xs text-[var(--nb-text)]">
                      {formatRupiah(tx.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase font-bold text-[var(--nb-text-muted)]">
                      {tx.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.orderStatus === 'SUCCESS' ? 'mint' : tx.orderStatus === 'PROCESS' ? 'yellow' : 'pink'}
                        size="sm"
                        className="font-black text-[10px]"
                      >
                        {tx.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/invoice/${tx.providerRef || tx.id}`}>
                        <Button
                          variant="yellow"
                          size="sm"
                          className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                        >
                          STRUK
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE VIEW: Responsive Cards (Shown only on Mobile < 640px) */}
        <div className="block sm:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 font-black text-xs uppercase text-[var(--nb-text-muted)]">
              Memuat data transaksi...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 font-black text-xs text-[var(--nb-text-muted)] uppercase">
              Belum ada riwayat transaksi.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] rounded-xl space-y-2 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-xs text-[var(--nb-text)] truncate">
                    {tx.providerRef || `TRX-${tx.id}`}
                  </span>
                  <Badge
                    variant={tx.orderStatus === 'SUCCESS' ? 'mint' : tx.orderStatus === 'PROCESS' ? 'yellow' : 'pink'}
                    size="sm"
                    className="font-black text-[9px] py-0.5 px-1.5 shrink-0"
                  >
                    {tx.orderStatus}
                  </Badge>
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase text-[var(--nb-text)] leading-tight">
                    {tx.product?.name || `Produk #${tx.productId}`}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--nb-text-muted)] mt-0.5">
                    {formatDate(tx.createdAt)} • {tx.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--nb-border)]/20">
                  <span className="font-mono font-black text-xs text-[var(--nb-text)]">
                    {formatRupiah(tx.amount)}
                  </span>
                  <Link to={`/invoice/${tx.providerRef || tx.id}`}>
                    <Button
                      variant="yellow"
                      size="sm"
                      className="font-black text-[10px] py-1 px-2.5 shadow-[1.5px_1.5px_0px_0px_#000]"
                    >
                      <FileText className="w-3 h-3 mr-1 stroke-[2.5]" />
                      <span>STRUK</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {totalTransactions > 0 && (
          <div className="bg-[var(--nb-surface-alt)] border-t-[3px] border-[var(--nb-border)] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="text-[var(--nb-text-muted)]">
              Menampilkan <span className="text-[var(--nb-text)] font-black">{startItem}–{endItem}</span> dari{' '}
              <span className="text-[var(--nb-text)] font-black">{totalTransactions}</span> transaksi{' '}
              {totalPages > 1 ? `(Halaman ${currentPage} dari ${totalPages})` : ''}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="white"
                  size="sm"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className="font-black uppercase shadow-[2px_2px_0px_0px_#000] text-[11px] py-1 px-2.5"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  <span>PREV</span>
                </Button>

                <span className="px-2.5 py-1 bg-white dark:bg-black/30 border-2 border-black font-mono font-black rounded shadow-[2px_2px_0px_0px_#000] text-[11px]">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  variant="white"
                  size="sm"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className="font-black uppercase shadow-[2px_2px_0px_0px_#000] text-[11px] py-1 px-2.5"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
