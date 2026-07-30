import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  DollarSign, 
  RefreshCw, 
  ArrowDownRight, 
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { getAdminMutations } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ReportMutationItem {
  id: number;
  userId?: number;
  type: string; // CREDIT / DEBIT
  amount: number;
  description?: string;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

export const ReportsDepositsPage: React.FC = () => {
  const { addToast } = useToast();
  const [mutations, setMutations] = useState<ReportMutationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInflow = async () => {
    setLoading(true);
    try {
      const data = await getAdminMutations();
      setMutations(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT LAPORAN DEPOSIT',
        message: err.message || 'Gagal mengambil data mutasi deposit dari server.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInflow();
  }, []);

  const creditItems = mutations.filter((m) => m.type === 'CREDIT');
  const debitItems = mutations.filter((m) => m.type === 'DEBIT');

  const totalInflow = creditItems.reduce((sum, m) => sum + (m.amount || 0), 0);
  const totalOutflow = debitItems.reduce((sum, m) => sum + (m.amount || 0), 0);
  const netFlow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              CASH INFLOW & DEPOSITS
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL RECORD: {mutations.length} MUTASI
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>💵</span>
            <span>DEPOSIT & INFLOW REPORT</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Laporan arus kas masuk (cash inflow) dari pengisian saldo pengguna dan keluar-masuk mutasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchInflow}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS ARUS KAS DEPOSIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] bg-gradient-to-br from-white to-green-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-green-700">
              TOTAL KAS MASUK (INFLOW CREDIT)
            </span>
            <ArrowDownRight className="w-5 h-5 stroke-[3] text-green-700" />
          </div>
          <div className="text-3xl font-black text-green-700">
            Rp {totalInflow.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Dari {creditItems.length} transaksi deposit / top-up saldo
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] bg-gradient-to-br from-white to-red-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-red-600">
              TOTAL KELUAR (OUTFLOW DEBIT)
            </span>
            <ArrowUpRight className="w-5 h-5 stroke-[3] text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-600">
            Rp {totalOutflow.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Dari {debitItems.length} pemakaian saldo pengguna
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-neutral-500">
              NET CASH FLOW
            </span>
            <Wallet className="w-5 h-5 stroke-[3] text-black" />
          </div>
          <div
            className={`text-3xl font-black ${
              netFlow >= 0 ? 'text-black' : 'text-red-600'
            }`}
          >
            Rp {netFlow.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Selisih saldo masuk dikurangi saldo keluar
          </div>
        </Card>
      </div>

      {/* 3. TABEL 10 DEPOSIT TERBARU */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <DollarSign className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>RIWAYAT TOP-UP & MUTASI TERAKHIR</span>
          </h3>
          <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
            LATEST INFLOW
          </Badge>
        </div>

        {mutations.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Belum ada riwayat arus kas atau deposit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">ID Mutasi</th>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3 text-right">Nominal (Rp)</th>
                  <th className="p-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {mutations.slice(0, 15).map((m) => (
                  <tr key={m.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 font-mono">#DEP-{m.id}</td>
                    <td className="p-3">
                      <div className="font-black text-black">
                        {m.user?.username || `User #${m.userId || '-'}`}
                      </div>
                    </td>
                    <td className="p-3 text-xs font-bold text-neutral-700">
                      {m.description || 'Top-up / Deposit Saldo'}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={m.type === 'CREDIT' ? 'mint' : 'pink'}
                        size="sm"
                        className="font-black uppercase text-[10px]"
                      >
                        {m.type}
                      </Badge>
                    </td>
                    <td
                      className={`p-3 text-right font-black ${
                        m.type === 'CREDIT' ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {m.type === 'CREDIT' ? '+' : '-'} Rp {(m.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right text-xs font-mono text-neutral-500">
                      {new Date(m.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
