import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  RefreshCw, 
  Award 
} from 'lucide-react';
import { getAdminTransactions } from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ReportTxItem {
  id: number;
  productId: number;
  amount?: number;
  totalPrice?: number;
  profit?: number;
  basePrice?: number;
  providerPrice?: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  product?: {
    name: string;
    sku: string;
  };
}

export const ReportsSalesPage: React.FC = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<ReportTxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'ALL' | '7D' | '30D'>('ALL');

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT LAPORAN',
        message: err.message || 'Gagal mengambil data transaksi dari server.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const filteredTx = transactions.filter((t) => {
    if (period === 'ALL') return true;
    const txDate = new Date(t.createdAt).getTime();
    const now = Date.now();
    const daysDiff = (now - txDate) / (1000 * 3600 * 24);
    if (period === '7D') return daysDiff <= 7;
    if (period === '30D') return daysDiff <= 30;
    return true;
  });

  const successTx = filteredTx.filter(
    (t) => t.orderStatus === 'SUCCESS' || t.paymentStatus === 'PAID'
  );

  const totalRevenue = successTx.reduce(
    (sum, t) => sum + (t.amount || t.totalPrice || 0),
    0
  );

  const totalNetProfit = successTx.reduce((sum, t) => {
    if (t.profit && t.profit > 0) return sum + t.profit;
    const rev = t.amount || t.totalPrice || 0;
    const cost = t.providerPrice || t.basePrice || 0;
    return sum + Math.max(0, rev - cost);
  }, 0);

  // Top Products Ranking
  const productSalesMap: Record<
    string,
    { name: string; count: number; revenue: number }
  > = {};

  successTx.forEach((t) => {
    const key = t.product?.name || `Produk #${t.productId}`;
    if (!productSalesMap[key]) {
      productSalesMap[key] = { name: key, count: 0, revenue: 0 };
    }
    productSalesMap[key].count += 1;
    productSalesMap[key].revenue += t.amount || t.totalPrice || 0;
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & FILTER PERIODE */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              FINANCE / REVENUE
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL TRANSAKSI: {filteredTx.length}
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📈</span>
            <span>SALES & PROFIT REPORT</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Laporan omzet penjualan kotor, laba bersih (net profit), dan produk terlaris.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchSalesData}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. FILTER PERIODE */}
      <div className="flex items-center justify-between bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <span className="text-xs font-black uppercase text-neutral-600">
          PILIH RENTANG WAKTU LAPORAN:
        </span>
        <div className="flex gap-2">
          {[
            { id: 'ALL', label: 'SEMUA WAKTU' },
            { id: '30D', label: '30 HARI TERAKHIR' },
            { id: '7D', label: '7 HARI TERAKHIR' },
          ].map((item) => (
            <Button
              key={item.id}
              variant={period === item.id ? 'yellow' : 'white'}
              size="sm"
              onClick={() => setPeriod(item.id as any)}
              className="font-black uppercase text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 3. KARTU STATISTIK KEUANGAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] bg-gradient-to-br from-white to-yellow-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-neutral-500">
              OMZET KOTOR (REVENUE)
            </span>
            <DollarSign className="w-5 h-5 stroke-[3] text-black" />
          </div>
          <div className="text-3xl font-black text-black">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Total akumulasi penjualan sukses
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] bg-gradient-to-br from-white to-green-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-green-700">
              ESTIMASI LABA BERSIH (PROFIT)
            </span>
            <TrendingUp className="w-5 h-5 stroke-[3] text-green-700" />
          </div>
          <div className="text-3xl font-black text-green-700">
            Rp {totalNetProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Selisih harga jual vs modal provider
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-neutral-500">
              TRANSAKSI BERHASIL
            </span>
            <ShoppingBag className="w-5 h-5 stroke-[3] text-black" />
          </div>
          <div className="text-3xl font-black text-black">
            {successTx.length} <span className="text-sm font-bold text-neutral-500">ORDER</span>
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Dari total {filteredTx.length} transaksi
          </div>
        </Card>
      </div>

      {/* 4. TABEL PRODUK TERLARIS (TOP SELLING SKU) */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <Award className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>TOP 10 PRODUK DENGAN PENJUALAN TERTINGGI</span>
          </h3>
          <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
            RANKING TERLARIS
          </Badge>
        </div>

        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Belum ada data penjualan pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3 w-12 text-center">Peringkat</th>
                  <th className="p-3">Nama Produk / Layanan</th>
                  <th className="p-3 text-center">Terjual (Count)</th>
                  <th className="p-3 text-right">Total Omzet (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 text-center font-mono font-black">
                      #{idx + 1}
                    </td>
                    <td className="p-3 font-black text-black">{p.name}</td>
                    <td className="p-3 text-center">
                      <Badge variant="cyan" size="sm" className="font-bold">
                        {p.count}x TERJUAL
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-black text-green-700">
                      Rp {p.revenue.toLocaleString('id-ID')}
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
