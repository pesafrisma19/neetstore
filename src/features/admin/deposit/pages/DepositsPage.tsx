import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Wallet, 
  RefreshCw, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { getAdminMutations } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface MutationItem {
  id: number;
  userId?: number;
  type: string; // DEBIT / CREDIT / TOPUP / DEPOSIT
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

export const DepositsPage: React.FC = () => {
  const { addToast } = useToast();
  const [deposits, setDeposits] = useState<MutationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const data = await getAdminMutations();
      setDeposits(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT DEPOSIT',
        message: err.message || 'Gagal mengambil riwayat deposit dan mutasi.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const filteredDeposits = deposits.filter((d) => {
    const query = searchQuery.toLowerCase();
    return (
      `#DEP-${d.id}`.toLowerCase().includes(query) ||
      (d.description || '').toLowerCase().includes(query) ||
      (d.user?.username || '').toLowerCase().includes(query) ||
      (d.referenceId || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              TRANSACTIONS / FINANCE
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL RECORD: {deposits.length}
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>💰</span>
            <span>USER DEPOSITS & MUTATIONS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Riwayat pengisian saldo (top-up) pengguna dan catatan mutasi keluar-masuk dana.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchDeposits}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="flex items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="text-xs font-black uppercase text-neutral-600">
          FILTER RIWAYAT TOP-UP & MUTASI
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Deposit / Username / Ref ID..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. TABEL RIWAYAT DEPOSIT */}
      {filteredDeposits.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <Wallet className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">BELUM ADA RIWAYAT DEPOSIT / MUTASI</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            Belum ada transaksi pengisian saldo atau perubahan mutasi yang tercatat.
          </p>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">ID Mutasi</th>
                  <th className="p-3">Pengguna / User</th>
                  <th className="p-3">Tipe & Keterangan</th>
                  <th className="p-3">Nominal (Rp)</th>
                  <th className="p-3">Saldo Sebelum / Sesudah</th>
                  <th className="p-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {filteredDeposits.map((d) => (
                  <tr key={d.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 font-mono">#DEP-{d.id}</td>
                    <td className="p-3">
                      <div className="font-black text-black">
                        {d.user?.username || `User #${d.userId || '-'}`}
                      </div>
                      <div className="text-xs font-mono text-neutral-500">
                        {d.user?.email || 'System / Merchant'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={d.type === 'CREDIT' ? 'mint' : 'pink'}
                          size="sm"
                          className="font-black uppercase text-[10px]"
                        >
                          {d.type === 'CREDIT' ? (
                            <ArrowDownRight className="w-3 h-3 inline mr-1" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 inline mr-1" />
                          )}
                          {d.type}
                        </Badge>
                        <span className="text-xs font-bold text-neutral-700">
                          {d.description || 'Deposit / Transaksi'}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`p-3 font-black ${
                        d.type === 'CREDIT' ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {d.type === 'CREDIT' ? '+' : '-'} Rp {(d.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 font-mono text-xs text-neutral-600">
                      <div>Awal: Rp {(d.balanceBefore || 0).toLocaleString('id-ID')}</div>
                      <div>Akhir: Rp {(d.balanceAfter || 0).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-3 text-right text-xs font-mono text-neutral-500">
                      {new Date(d.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
