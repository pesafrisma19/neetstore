import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { getAdminTransactions } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ReportTxItem {
  id: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  amount?: number;
  totalPrice?: number;
  createdAt: string;
}

export const ReportsTransactionsPage: React.FC = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<ReportTxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT DATA ANALITIK',
        message: err.message || 'Gagal mengambil data analitik transaksi.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalCount = transactions.length;
  const successCount = transactions.filter(
    (t) => t.orderStatus === 'SUCCESS' || t.paymentStatus === 'PAID'
  ).length;
  const failedCount = transactions.filter(
    (t) => t.orderStatus === 'FAILED'
  ).length;
  const pendingCount = transactions.filter(
    (t) => t.orderStatus === 'PENDING' || t.orderStatus === 'PROCESS'
  ).length;

  const successRate =
    totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0.0';

  // Analitik berdasarkan Metode Pembayaran
  const methodMap: Record<string, { name: string; count: number; volume: number }> =
    {};

  transactions.forEach((t) => {
    const key = (t.paymentMethod || 'OTHER').toUpperCase();
    if (!methodMap[key]) {
      methodMap[key] = { name: key, count: 0, volume: 0 };
    }
    methodMap[key].count += 1;
    methodMap[key].volume += t.amount || t.totalPrice || 0;
  });

  const methodList = Object.values(methodMap).sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              ANALYTICS & METRICS
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL RECORD: {totalCount} TX
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📊</span>
            <span>TRANSACTION ANALYTICS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Analitik performa transaksi, rasio keberhasilan (success rate), dan distribusi payment gateway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchAnalytics}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS KARTU KINERJA TRANSAKSI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1">
            SUCCESS RATE
          </div>
          <div className="text-2xl font-black text-green-700">{successRate}%</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Rasio order berhasil
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-green-600" />
            <span>SUCCESS ORDERS</span>
          </div>
          <div className="text-2xl font-black text-black">{successCount}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Pesanan selesai / terbayar
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4 stroke-[2.5] text-amber-600" />
            <span>PENDING / PROCESS</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Sedang diproses sistem
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <XCircle className="w-4 h-4 stroke-[2.5] text-red-600" />
            <span>FAILED ORDERS</span>
          </div>
          <div className="text-2xl font-black text-red-600">{failedCount}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Gagal dari provider / batal
          </div>
        </Card>
      </div>

      {/* 3. TABEL ANALITIK PER METODE PEMBAYARAN */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <CreditCard className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>DISTRIBUSI TRANSAKSI PER METODE PEMBAYARAN</span>
          </h3>
          <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
            GATEWAY STATS
          </Badge>
        </div>

        {methodList.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Belum ada data transaksi yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">Metode Pembayaran (Payment Method)</th>
                  <th className="p-3 text-center">Jumlah Transaksi (Count)</th>
                  <th className="p-3 text-right">Volume Rupiah (Rp)</th>
                  <th className="p-3 text-right">Proporsi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {methodList.map((m, idx) => {
                  const totalVolume = methodList.reduce((acc, el) => acc + el.volume, 0);
                  const share =
                    totalVolume > 0 ? ((m.volume / totalVolume) * 100).toFixed(1) : '0';

                  return (
                    <tr key={idx} className="hover:bg-yellow-50 transition-colors">
                      <td className="p-3 font-black text-black flex items-center gap-2">
                        <Badge variant="cyan" size="sm" className="font-bold">
                          {m.name}
                        </Badge>
                      </td>
                      <td className="p-3 text-center font-mono font-black">{m.count} TX</td>
                      <td className="p-3 text-right font-black text-green-700">
                        Rp {m.volume.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
