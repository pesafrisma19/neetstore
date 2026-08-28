import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import {
  Coins,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import type { UserPointMutationItem } from '../../../../utils/api';

interface UserPointMutationsTabProps {
  pointMutations: UserPointMutationItem[];
  totalMutations: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

export const UserPointMutationsTab: React.FC<UserPointMutationsTabProps> = ({
  pointMutations,
  totalMutations,
  totalPages,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onRefetch,
}) => {
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

  const getMutationConfig = (type: string, amount: number) => {
    switch (type) {
      case 'EARN':
        return {
          label: 'DAPAT POIN',
          badgeVariant: 'mint' as const,
          sign: '+',
          amountClass: 'text-emerald-700 dark:text-emerald-400',
          icon: <ArrowDownLeft className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[3]" />,
          bgTone: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800',
        };
      case 'REDEEM':
        return {
          label: 'DIGUNAKAN',
          badgeVariant: 'pink' as const,
          sign: '-',
          amountClass: 'text-rose-600 dark:text-rose-400',
          icon: <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[3]" />,
          bgTone: 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800',
        };
      case 'REFUND':
        return {
          label: 'DIKEMBALIKAN',
          badgeVariant: 'cyan' as const,
          sign: '+',
          amountClass: 'text-cyan-700 dark:text-cyan-400',
          icon: <RotateCcw className="w-4 h-4 text-cyan-700 dark:text-cyan-400 stroke-[3]" />,
          bgTone: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800',
        };
      case 'ADJUSTMENT':
      default:
        return {
          label: 'PENYESUAIAN',
          badgeVariant: 'yellow' as const,
          sign: amount >= 0 ? '+' : '',
          amountClass: amount >= 0 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-600',
          icon: <SlidersHorizontal className="w-4 h-4 text-amber-700 stroke-[2.5]" />,
          bgTone: 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800',
        };
    }
  };

  return (
    <Card variant="white" shadow="lg" borderWidth="3" className="mt-4 rounded-2xl overflow-hidden">
      <CardHeader headerBg="var(--nb-yellow)" className="border-b-[3px] border-black flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-black">
          <Coins className="w-4 h-4 text-black stroke-[3]" />
          RIWAYAT POIN REWARD & POTONGAN
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

      <CardContent className="p-3 sm:p-5">
        {/* Single Unified Responsive Activity List */}
        {isLoading ? (
          <div className="text-center py-10 font-black text-xs uppercase text-[var(--nb-text-muted)]">
            Memuat riwayat mutasi poin...
          </div>
        ) : pointMutations.length === 0 ? (
          <div className="text-center py-10 font-black text-xs uppercase text-[var(--nb-text-muted)]">
            Belum ada riwayat perolehan atau penggunaan poin reward.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pointMutations.map((item) => {
              const cfg = getMutationConfig(item.type, item.amount);
              const txRef = item.transaction?.transactionRef || (item.transactionId ? `TRX-${item.transactionId}` : null);

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 rounded-xl border-[2px] ${cfg.bgTone} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all`}
                >
                  {/* Left: Icon + Type Badge + Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-white dark:bg-black/40 border-[2px] border-[var(--nb-border)] rounded-xl shadow-[1.5px_1.5px_0px_0px_var(--nb-shadow)] shrink-0 mt-0.5">
                      {cfg.icon}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={cfg.badgeVariant} size="sm" className="font-black text-[10px] py-0.5 px-2">
                          {cfg.label}
                        </Badge>
                        {txRef ? (
                          <span className="font-mono font-black text-xs text-[var(--nb-text)]">
                            {txRef}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] font-bold text-[var(--nb-text-muted)]">
                            Referensi tidak tersedia
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-[var(--nb-text)] leading-snug m-0">
                        {item.description || (item.type === 'EARN' ? 'Poin reward dari transaksi sukses' : item.type === 'REDEEM' ? 'Potongan harga transaksi' : 'Pengembalian poin reward')}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[var(--nb-text-muted)] pt-0.5">
                        <span>{formatDate(item.createdAt)}</span>
                        <span>•</span>
                        <span className="font-bold text-[var(--nb-text)]">
                          Saldo Akhir: {(item.balanceAfter || 0).toLocaleString('id-ID')} Pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Mutation Amount */}
                  <div className="self-end sm:self-center shrink-0 text-right">
                    <span className={`text-base sm:text-lg font-black font-sans ${cfg.amountClass} whitespace-nowrap`}>
                      {cfg.sign}{(item.amount || 0).toLocaleString('id-ID')} <span className="text-xs font-bold">Poin</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalMutations > 0 && (
          <div className="bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] rounded-xl p-3 sm:p-4 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="text-[var(--nb-text-muted)]">
              Menampilkan <span className="text-[var(--nb-text)] font-black">{startItem}–{endItem}</span> dari{' '}
              <span className="text-[var(--nb-text)] font-black">{totalMutations}</span> mutasi poin{' '}
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
