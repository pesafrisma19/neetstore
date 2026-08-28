import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { History, Share2, Copy, Check, ArrowRight } from 'lucide-react';

interface UserAccountSummaryProps {
  totalTransactions: number;
  referralCode?: string;
  copiedReff: boolean;
  onCopyReferral: () => void;
  onViewTransactions: () => void;
}

export const UserAccountSummary: React.FC<UserAccountSummaryProps> = ({
  totalTransactions,
  referralCode,
  copiedReff,
  onCopyReferral,
  onViewTransactions,
}) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Metric: Total Pesanan */}
      <Card
        variant="white"
        shadow="md"
        className="p-4 sm:p-5 border-[3px] rounded-2xl flex-1 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--nb-purple)] border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
              <History className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="text-xs font-black uppercase text-[var(--nb-text)]">
              TOTAL PESANAN
            </span>
          </div>
          <button
            type="button"
            onClick={onViewTransactions}
            className="text-[11px] font-black uppercase text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>LIHAT</span>
            <ArrowRight className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        <div className="mt-1">
          <span className="text-2xl sm:text-3xl font-black text-[var(--nb-text)] font-sans block leading-tight">
            {totalTransactions} <span className="text-xs font-bold text-[var(--nb-text-muted)] uppercase">Transaksi</span>
          </span>
          <span className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-1 block">
            Seluruh riwayat transaksi & top up
          </span>
        </div>
      </Card>

      {/* 2. Metric: Kode Referral */}
      <Card
        variant="white"
        shadow="md"
        className="p-4 sm:p-5 border-[3px] rounded-2xl flex-1 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--nb-pink)] border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
              <Share2 className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-xs font-black uppercase text-[var(--nb-text)]">
              KODE REFERRAL
            </span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 border border-black rounded bg-[var(--nb-pink)] text-white shadow-[1px_1px_0px_0px_#000]">
            BAGIKAN
          </span>
        </div>

        <div className="mt-1">
          <div className="flex items-center justify-between gap-2 p-2 bg-[var(--nb-surface-alt)] border-[2px] border-[var(--nb-border)] rounded-xl">
            <span className="font-mono text-base sm:text-lg font-black text-[var(--nb-text)] tracking-wider truncate select-text">
              {referralCode || '-'}
            </span>

            {referralCode && (
              <Button
                type="button"
                variant={copiedReff ? 'mint' : 'yellow'}
                size="sm"
                onClick={onCopyReferral}
                className="py-1 px-2.5 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] shrink-0"
                title="Salin Kode Referral"
              >
                {copiedReff ? (
                  <>
                    <Check className="w-3 h-3 mr-1 stroke-[3]" />
                    <span>DISALIN</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1 stroke-[3]" />
                    <span>SALIN</span>
                  </>
                )}
              </Button>
            )}
          </div>
          <span className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-1.5 block">
            Ajak teman bergabung & dapatkan bonus referral
          </span>
        </div>
      </Card>
    </div>
  );
};
