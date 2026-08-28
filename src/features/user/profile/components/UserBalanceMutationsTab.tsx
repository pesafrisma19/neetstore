import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Wallet, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserBalanceMutationsTabProps {
  mutations: any[];
  totalMutations: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

export const UserBalanceMutationsTab: React.FC<UserBalanceMutationsTabProps> = ({
  mutations,
  totalMutations,
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

  const startItem = totalMutations === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalMutations);

  return (
    <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl overflow-hidden">
      <CardHeader headerBg="#00F0FF" className="border-b-[3px] border-black flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
          <Wallet className="w-4 h-4 stroke-[3]" />
          RIWAYAT MUTASI SALDO KAS AKUN
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
                <TableHead>TANGGAL</TableHead>
                <TableHead>TIPE</TableHead>
                <TableHead>SALDO AWAL</TableHead>
                <TableHead>NOMINAL</TableHead>
                <TableHead>SALDO AKHIR</TableHead>
                <TableHead>KETERANGAN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 font-black text-xs uppercase">
                    Memuat riwayat mutasi saldo...
                  </TableCell>
                </TableRow>
              ) : mutations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 font-black text-xs text-[var(--nb-text-muted)] uppercase">
                    Belum ada riwayat mutasi saldo.
                  </TableCell>
                </TableRow>
              ) : (
                mutations.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-bold text-[var(--nb-text-muted)]">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.type === 'IN' ? 'mint' : 'pink'} size="sm" className="font-black text-[10px]">
                        {m.type === 'IN' ? '+ MASUK' : '- KELUAR'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[var(--nb-text-muted)]">
                      {formatRupiah(m.startingBalance || 0)}
                    </TableCell>
                    <TableCell className={`font-mono font-black text-xs ${m.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m.type === 'IN' ? '+' : '-'} {formatRupiah(m.amount || 0)}
                    </TableCell>
                    <TableCell className="font-mono font-black text-xs text-[var(--nb-text)]">
                      {formatRupiah(m.endingBalance || 0)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-[var(--nb-text)]">
                      {m.description}
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
              Memuat data mutasi...
            </div>
          ) : mutations.length === 0 ? (
            <div className="text-center py-8 font-black text-xs text-[var(--nb-text-muted)] uppercase">
              Belum ada riwayat mutasi saldo.
            </div>
          ) : (
            mutations.map((m: any) => (
              <div
                key={m.id}
                className="p-3 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] rounded-xl space-y-2 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={m.type === 'IN' ? 'mint' : 'pink'}
                    size="sm"
                    className="font-black text-[9px] py-0.5 px-1.5"
                  >
                    {m.type === 'IN' ? '+ DANA MASUK' : '- DANA KELUAR'}
                  </Badge>
                  <span className="font-mono text-[10px] text-[var(--nb-text-muted)]">
                    {formatDate(m.createdAt)}
                  </span>
                </div>

                <p className="text-xs font-black text-[var(--nb-text)] leading-snug m-0">
                  {m.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--nb-border)]/20 text-xs font-mono">
                  <span className={`font-black ${m.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {m.type === 'IN' ? '+' : '-'} {formatRupiah(m.amount || 0)}
                  </span>
                  <span className="font-bold text-[var(--nb-text-muted)] text-[11px]">
                    Sisa: {formatRupiah(m.endingBalance || 0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        {totalMutations > 0 && (
          <div className="bg-[var(--nb-surface-alt)] border-t-[3px] border-[var(--nb-border)] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="text-[var(--nb-text-muted)]">
              Menampilkan <span className="text-[var(--nb-text)] font-black">{startItem}–{endItem}</span> dari{' '}
              <span className="text-[var(--nb-text)] font-black">{totalMutations}</span> mutasi{' '}
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
