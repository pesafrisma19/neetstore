import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { getAdminTransactionReport } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export const ReportsTransactionsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('all');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.admin.reports.transactions({ period }),
    queryFn: () => getAdminTransactionReport({ period }),
    placeholderData: keepPreviousData,
  });

  const totalCount = data?.total || 0;
  const successCount = data?.success || 0;
  const processCount = data?.process || 0;
  const pendingCount = data?.pending || 0;
  const failedCount = data?.failed || 0;
  const refundedCount = data?.refunded || 0;
  const successRate = data?.successRate || 0;
  const paymentMethods = data?.paymentMethods || [];

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
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📊</span>
            <span>TRANSACTION ANALYTICS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Analitik performa transaksi, rasio keberhasilan (orderStatus = SUCCESS), dan distribusi gateway per-periode.
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
          PILIH RENTANG WAKTU ANALITIK:
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

      {/* 3. STATS KARTU KINERJA TRANSAKSI */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1">
            SUCCESS RATE
          </div>
          <div className="text-2xl font-black text-green-700">{isLoading ? '...' : `${successRate}%`}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Rasio SUCCESS / Total
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-green-600" />
            <span>SUCCESS</span>
          </div>
          <div className="text-2xl font-black text-black">{isLoading ? '...' : successCount}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Order selesai sukses
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4 stroke-[2.5] text-amber-600" />
            <span>PROCESS / PENDING</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {isLoading ? '...' : processCount + pendingCount}
          </div>
          <div className="text-[10px] font-bold text-neutral-500">
            {processCount} Process, {pendingCount} Pending
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <XCircle className="w-4 h-4 stroke-[2.5] text-red-600" />
            <span>FAILED ORDERS</span>
          </div>
          <div className="text-2xl font-black text-red-600">{isLoading ? '...' : failedCount}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            Status order = FAILED
          </div>
        </Card>

        <Card variant="white" className="border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-xs font-black uppercase text-neutral-500 mb-1 flex items-center gap-1">
            <RotateCcw className="w-4 h-4 stroke-[2.5] text-purple-600" />
            <span>REFUNDED</span>
          </div>
          <div className="text-2xl font-black text-purple-600">{isLoading ? '...' : refundedCount}</div>
          <div className="text-[10px] font-bold text-neutral-500">
            RefundStatus = REFUNDED
          </div>
        </Card>
      </div>

      {/* 4. TABEL ANALITIK PER METODE PEMBAYARAN */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <CreditCard className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>DISTRIBUSI TRANSAKSI PER METODE PEMBAYARAN</span>
          </h3>
          <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
            DATABASE FULL RANGE
          </Badge>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Memuat data analitik...
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Belum ada data transaksi yang tercatat pada periode ini.
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
                {paymentMethods.map((m, idx) => (
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
                      {m.share}%
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
