import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  DollarSign, 
  RefreshCw, 
  CheckCircle2,
  Clock,
  XCircle,
  Wallet
} from 'lucide-react';
import { getAdminDepositReport } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

export const ReportsDepositsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('all');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.admin.reports.deposits({ period }),
    queryFn: () => getAdminDepositReport({ period }),
    placeholderData: keepPreviousData,
  });

  const totalSuccessfulDeposit = data?.totalSuccessfulDeposit || 0;
  const successfulAmount = data?.successfulAmount || 0;
  const pendingAmount = data?.pendingAmount || 0;
  const failedAmount = data?.failedAmount || 0;
  const countSuccess = data?.countSuccess || 0;
  const countPending = data?.countPending || 0;
  const countFailed = data?.countFailed || 0;
  const totalCount = data?.totalCount || 0;
  const latestDeposits = data?.latestDeposits || [];

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              USER BALANCE DEPOSITS
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL RECORD: {totalCount} DEPOSIT
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>💵</span>
            <span>DEPOSIT & TOP-UP REPORT</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Laporan pengisian saldo pengguna (Deposit Table Source of Truth).
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
          PILIH RENTANG WAKTU DEPOSIT:
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

      {/* 3. STATS ARUS KAS DEPOSIT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          variant="white"
          className="border-[4px] border-black p-5 shadow-[6px_6px_0px_0px_#000] bg-gradient-to-br from-white to-green-50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-green-700">
              SALDO BERHASIL MASUK
            </span>
            <Wallet className="w-5 h-5 stroke-[3] text-green-700" />
          </div>
          <div className="text-2xl font-black text-green-700">
            {isLoading ? '...' : `Rp ${totalSuccessfulDeposit.toLocaleString('id-ID')}`}
          </div>
          <div className="text-[10px] font-bold text-neutral-500 mt-1">
            Total saldo yang masuk ke akun ({countSuccess} Deposit Sukses)
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-5 shadow-[6px_6px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-green-600" />
              <span>TOTAL DIBAYAR USER</span>
            </span>
          </div>
          <div className="text-2xl font-black text-black">
            {isLoading ? '...' : `Rp ${successfulAmount.toLocaleString('id-ID')}`}
          </div>
          <div className="text-[10px] font-bold text-neutral-500 mt-1">
            Termasuk unik kode & fee gateway
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-5 shadow-[6px_6px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1">
              <Clock className="w-4 h-4 stroke-[2.5] text-amber-600" />
              <span>PENDING DEPOSITS</span>
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {isLoading ? '...' : `Rp ${pendingAmount.toLocaleString('id-ID')}`}
          </div>
          <div className="text-[10px] font-bold text-neutral-500 mt-1">
            Dari {countPending} transaksi pending
          </div>
        </Card>

        <Card
          variant="white"
          className="border-[4px] border-black p-5 shadow-[6px_6px_0px_0px_#000]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-neutral-500 flex items-center gap-1">
              <XCircle className="w-4 h-4 stroke-[2.5] text-red-600" />
              <span>FAILED DEPOSITS</span>
            </span>
          </div>
          <div className="text-2xl font-black text-red-600">
            {isLoading ? '...' : `Rp ${failedAmount.toLocaleString('id-ID')}`}
          </div>
          <div className="text-[10px] font-bold text-neutral-500 mt-1">
            Dari {countFailed} deposit expired/gagal
          </div>
        </Card>
      </div>

      {/* 4. TABEL 15 DEPOSIT TERBARU */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <DollarSign className="w-4 h-4 stroke-[2.5] text-[var(--nb-yellow)]" />
            <span>RIWAYAT DEPOSIT TERAKHIR (TABEL DEPOSIT)</span>
          </h3>
          <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
            REAL DATABASE
          </Badge>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Memuat data deposit...
          </div>
        ) : latestDeposits.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-neutral-500">
            Belum ada riwayat deposit pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Metode Pembayaran</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Saldo Bersih (Rp)</th>
                  <th className="p-3 text-right">Total Bayar (Rp)</th>
                  <th className="p-3 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {latestDeposits.map((d) => (
                  <tr key={d.id} className="hover:bg-yellow-50 transition-colors">
                    <td className="p-3 font-mono text-xs">#{d.paymentRef}</td>
                    <td className="p-3">
                      <div className="font-black text-black">
                        {d.username}
                      </div>
                    </td>
                    <td className="p-3 text-xs font-bold text-neutral-700 uppercase">
                      {d.paymentMethod}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={d.status === 'SUCCESS' ? 'mint' : d.status === 'FAILED' ? 'pink' : 'yellow'}
                        size="sm"
                        className="font-black uppercase text-[10px]"
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-black text-green-700">
                      Rp {d.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right font-black text-black">
                      Rp {d.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-right text-xs font-mono text-neutral-500">
                      {new Date(d.createdAt).toLocaleDateString('id-ID', {
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
        )}
      </Card>
    </div>
  );
};
