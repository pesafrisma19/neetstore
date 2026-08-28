import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Wallet, Coins, PlusCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserWalletOverviewProps {
  balance: number;
  points: number;
  onOpenDeposit: () => void;
}

export const UserWalletOverview: React.FC<UserWalletOverviewProps> = ({
  balance,
  points,
  onOpenDeposit,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Card
      variant="white"
      shadow="xl"
      className="p-5 sm:p-6 border-[3.5px] rounded-3xl flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--nb-yellow)] border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
            <Wallet className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--nb-text-muted)] block">
              DOMPET UTAMA
            </span>
            <span className="text-xs font-black uppercase text-[var(--nb-text)]">
              SALDO & POIN NEETSTORE
            </span>
          </div>
        </div>
        <Badge variant="mint" size="sm" className="font-black text-[10px] py-0.5 px-2">
          INSTAN TRANSAKSI
        </Badge>
      </div>

      {/* Main Balances Section (Wallet First) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
        {/* Dominant: Saldo Uang */}
        <div className="p-3.5 bg-[var(--nb-surface-alt)] border-[2.5px] border-[var(--nb-border)] rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider">
            SALDO KAS
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--nb-text)] font-sans break-words block leading-tight">
              {formatRupiah(balance)}
            </span>
            <span className="text-[10px] font-bold text-[var(--nb-text-muted)] mt-0.5 block">
              Tersedia untuk pembayaran instan
            </span>
          </div>
        </div>

        {/* Secondary: Poin Reward */}
        <div className="p-3.5 bg-[var(--nb-surface-alt)] border-[2.5px] border-[var(--nb-border)] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-[var(--nb-text-muted)] tracking-wider">
              POIN REWARD
            </span>
            <Coins className="w-4 h-4 text-amber-500 stroke-[2.5]" />
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 font-sans break-words block leading-tight">
              {(points || 0).toLocaleString('id-ID')} <span className="text-sm font-black text-[var(--nb-text)]">Poin</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
              Nilai potongan ≈ {formatRupiah(points || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-1 border-t-[2px] border-[var(--nb-border)]/20">
        <Button
          type="button"
          variant="pink"
          size="md"
          onClick={onOpenDeposit}
          className="font-black text-xs py-3 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px]"
        >
          <PlusCircle className="w-4 h-4 mr-1.5 stroke-[3]" />
          <span>ISI SALDO / DEPOSIT</span>
        </Button>

        <Link to="/" className="w-full">
          <Button
            type="button"
            variant="yellow"
            size="md"
            className="w-full font-black text-xs py-3 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Zap className="w-4 h-4 mr-1.5 fill-black stroke-[2]" />
            <span>TOP UP GAME BARU</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
};
