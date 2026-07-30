import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { DollarSign, Wallet, Gamepad2, Users } from 'lucide-react';

interface TabOverviewProps {
  digiflazzBalance?: number;
  categoriesCount?: number;
  brandsCount?: number;
  productsCount?: number;
  usersCount?: number;
  transactionsCount?: number;
  vouchersCount?: number;
  isSyncing?: boolean;
  onSyncDigiflazz?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AdminOverviewPage: React.FC<TabOverviewProps> = ({
  digiflazzBalance = 8450000,
  categoriesCount = 4,
  brandsCount = 2,
  productsCount = 2,
  usersCount = 2,
  transactionsCount = 1,
  vouchersCount = 1,
}) => {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card variant="yellow" shadow="lg" borderWidth="3" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--nb-text)]">TOTAL OMZET HARI INI</span>
            <DollarSign className="w-5 h-5 stroke-[3] text-[var(--nb-text)]" />
          </div>
          <h3 className="text-2xl font-black text-[var(--nb-text)] mt-2 m-0">Rp 14.850.000</h3>
          <span className="text-[10px] font-bold text-black/70 mt-1 block">↗ +18.4% dari kemarin</span>
        </Card>

        <Card variant="mint" shadow="lg" borderWidth="3" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--nb-text)]">SALDO PROVIDER (API)</span>
            <Wallet className="w-5 h-5 stroke-[3] text-[var(--nb-text)]" />
          </div>
          <h3 className="text-2xl font-black text-[var(--nb-text)] mt-2 m-0">
            Rp {(digiflazzBalance || 0).toLocaleString('id-ID')}
          </h3>
          <span className="text-[10px] font-bold text-black/70 mt-1 block">Provider Utama (Active)</span>
        </Card>

        <Card variant="purple" shadow="lg" borderWidth="3" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[var(--nb-text)]">TOTAL BRAND GAME</span>
            <Gamepad2 className="w-5 h-5 stroke-[3] text-[var(--nb-text)]" />
          </div>
          <h3 className="text-2xl font-black text-[var(--nb-text)] mt-2 m-0">{brandsCount} Brands</h3>
          <span className="text-[10px] font-bold text-black/70 mt-1 block">Terhubung {categoriesCount} Kategori ({productsCount} Produk)</span>
        </Card>

        <Card variant="pink" shadow="lg" borderWidth="3" className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-white">PENGGUNA AKTIF</span>
            <Users className="w-5 h-5 stroke-[3] text-white" />
          </div>
          <h3 className="text-2xl font-black text-white mt-2 m-0">{usersCount} Users</h3>
          <span className="text-[10px] font-bold text-white/80 mt-1 block">{transactionsCount} Transaksi ({vouchersCount} Voucher)</span>
        </Card>

      </div>
    </div>
  );
};


