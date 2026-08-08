import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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
import { getAdminSalesReport } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export const ReportsSalesPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('all');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.admin.reports.sales({ period }),
    queryFn: () => getAdminSalesReport({ period }),
    placeholderData: keepPreviousData,
  });

  const totalRevenue = data?.revenue || 0;
  const totalGrossProfit = data?.profit || 0;
  const successfulOrders = data?.successfulOrders || 0;
  const totalOrders = data?.totalOrders || 0;
  const topProducts = data?.topProducts || [];

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
              TOTAL TRANSAKSI: {totalOrders}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📈</span>
            <span>SALES & PROFIT REPORT</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Laporan omzet penjualan kotor, margin kotor transaksi, dan produk terlaris (Backend Database Aggregated).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={() => refetch()}
            disabled={isFetching}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${isFetching ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {/* 2. FILTER PERIODE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <span className="text-xs font-black uppercase text-neutral-600">
          PILIH RENTANG WAKTU LAPORAN:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'SEMUA WAKTU' },
            { id: 'this_month', label: 'BULAN INI' },
            { id: '30d', label: '30 HARI TERAKHIR' },
            { id: '7d', label: '7 HARI TERAKHIR' },
            { id: 'today', label: 'HARI INI (WIB)' },
          ].map((item) => (
            <Button
              key={item.id}
              variant={period === item.id ? 'yellow' : 'white'}
              size="sm"
              onClick={() => setPeriod(item.id)}
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
            {isLoading ? '...' : `Rp ${totalRevenue.toLocaleString('id-ID')}`}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Total omzet dari transaksi orderStatus = SUCCESS
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] bg-gradient-to-br from-white to-green-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase text-green-700">
              ESTIMASI LABA KOTOR (GROSS MARGIN)
            </span>
            <TrendingUp className="w-5 h-5 stroke-[3] text-green-700" />
          </div>
          <div className="text-3xl font-black text-green-700">
            {isLoading ? '...' : `Rp ${totalGrossProfit.toLocaleString('id-ID')}`}
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Margin kotor (harga jual vs modal provider, sebelum potongan gateway fee)
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
            {isLoading ? '...' : successfulOrders} <span className="text-sm font-bold text-neutral-500">ORDER</span>
          </div>
          <div className="text-xs font-bold text-neutral-500 mt-1">
            Dari total {totalOrders} transaksi pada periode ini
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
            DATABASE AGGREGATED
          </Badge>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Memuat data penjualan...
          </div>
        ) : topProducts.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Belum ada data penjualan sukses pada periode ini.
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
                  <th className="p-3 text-right">Estimasi Gross Margin (Rp)</th>
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
                        {p.soldQuantity}x TERJUAL
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-black text-black">
                      Rp {p.revenue.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right font-black text-green-700">
                      Rp {p.profit.toLocaleString('id-ID')}
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
