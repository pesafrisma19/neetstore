import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Wallet, 
  RefreshCw, 
  Search, 
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  SlidersHorizontal
} from 'lucide-react';
import { getAdminDeposits, confirmAdminDeposit, rejectAdminDeposit } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { DepositSettingsModal } from '../components/DepositSettingsModal';

export interface DepositItem {
  id: number;
  userId: number;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: string;
  paymentRef: string;
  paymentUrl: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  user?: {
    id?: number;
    username?: string;
    email?: string;
    phone?: string | null;
    level?: string | null;
  };
  paymentMethodRel?: {
    id?: number;
    name?: string;
    code?: string;
    type?: string;
    gateway?: {
      id?: number;
      name?: string;
      code?: string;
    } | null;
  } | null;
}

export const DepositsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const {
    data: depositsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.deposits.list({
      page,
      limit,
      search: debouncedSearch,
      status: statusFilter,
    }),
    queryFn: () =>
      getAdminDeposits({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
      }),
    placeholderData: keepPreviousData,
  });

  const deposits: DepositItem[] = (depositsResponse as any)?.data || [];
  const _meta = (depositsResponse as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalPages = _meta.totalPages || 1;
  const totalCount = _meta.totalCount || 0;

  const handleConfirm = async (id: number) => {
    if (!window.confirm('Konfirmasi pembayaran deposit ini? Saldo user akan bertambah otomatis.')) return;
    setProcessingId(id);
    try {
      await confirmAdminDeposit(id);
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Gagal mengonfirmasi deposit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Alasan penolakan deposit:', 'Bukti transfer tidak sesuai');
    if (reason === null) return;
    setProcessingId(id);
    try {
      await rejectAdminDeposit(id, reason);
      refetch();
    } catch (err: any) {
      alert(err?.message || 'Gagal menolak deposit');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & STATS */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              DEPOSITS MANAGEMENT
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL DEPOSITS: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>💰</span>
            <span>MANAJEMEN DEPOSIT USER</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Riwayat tiket pengisian saldo user, verifikasi manual, dan status pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setSettingsModalOpen(true)}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
            title="Pengaturan Deposit"
            aria-label="Pengaturan Deposit"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Pengaturan</span>
          </Button>

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

      {/* 2. TAB FILTER & CARI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'SEMUA' },
            { id: 'PENDING', label: '⏳ PENDING' },
            { id: 'SUCCESS', label: '✅ SUCCESS' },
            { id: 'FAILED', label: '❌ FAILED' },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={statusFilter === tab.id ? 'yellow' : 'white'}
              size="sm"
              onClick={() => handleFilterChange(tab.id)}
              className="font-black uppercase text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Ref / Email..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. TABEL RIWAYAT DEPOSIT */}
      {isLoading ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
          <h3 className="text-lg font-black uppercase">MEMUAT DAFTAR DEPOSIT...</h3>
        </Card>
      ) : isError ? (
        <Card variant="white" className="p-8 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <AlertTriangle className="w-12 h-12 stroke-[2] mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-black uppercase text-red-600">GAGAL MEMUAT DEPOSIT</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            {(error as any)?.message || 'Terjadi kesalahan sistem.'}
          </p>
        </Card>
      ) : deposits.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <Wallet className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">BELUM ADA DATA DEPOSIT</h3>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3 min-w-[180px]">Transaksi</th>
                  <th className="p-3 min-w-[220px]">Pengguna</th>
                  <th className="p-3 min-w-[170px]">Pembayaran</th>
                  <th className="p-3 min-w-[200px]">Nominal</th>
                  <th className="p-3 min-w-[140px]">Status</th>
                  <th className="p-3 min-w-[160px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-yellow-50 transition-colors">
                      {/* 1. TRANSAKSI */}
                      <td className="p-3 font-mono">
                        <div className="font-black text-xs text-black" title={d.paymentRef}>
                          {d.paymentRef}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 leading-tight mt-0.5 whitespace-nowrap">
                          {new Date(d.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 2. PENGGUNA */}
                      <td className="p-3">
                        {(() => {
                          const level = d.user?.level || (d.userId ? 'MEMBER' : 'GUEST');
                          const email = d.user?.email;
                          const phone = d.user?.phone;
                          const primaryContact = email || phone || (d.userId ? `User #${d.userId}` : '-');
                          const showPhoneSub = Boolean(email && phone);
                          const badgeVariant = level === 'VIP' ? 'purple' : level === 'RESELLER' ? 'orange' : level === 'MEMBER' ? 'cyan' : 'white';

                          return (
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                                <Badge
                                  variant={badgeVariant}
                                  size="sm"
                                  className="text-[9px] px-1.5 py-0 font-black uppercase tracking-wider shrink-0"
                                >
                                  {level}
                                </Badge>
                                <span
                                  className="font-bold text-xs text-black truncate max-w-[180px]"
                                  title={primaryContact}
                                >
                                  {primaryContact}
                                </span>
                              </div>
                              {showPhoneSub && (
                                <div className="text-[11px] font-mono text-neutral-500 whitespace-nowrap select-text" title={phone!}>
                                  {phone}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* 3. PEMBAYARAN */}
                      <td className="p-3">
                        {(() => {
                          const methodName = d.paymentMethodRel?.name || d.paymentMethod;
                          const gatewayName = d.paymentMethodRel?.gateway?.name;

                          return (
                            <div className="min-w-0">
                              <div className="font-black text-xs text-black" title={methodName}>
                                {methodName}
                              </div>
                              <div
                                className="text-[11px] font-mono text-neutral-600 leading-tight mt-0.5 whitespace-nowrap"
                                title={gatewayName || '-'}
                              >
                                {gatewayName || '-'}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* 4. NOMINAL */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-black text-xs text-green-700">
                          Saldo: Rp {d.amount.toLocaleString('id-ID')}
                        </div>
                        <div
                          className="text-[11px] font-mono text-neutral-600 leading-tight mt-0.5"
                          title={`Bayar: Rp ${d.totalAmount.toLocaleString('id-ID')}${d.fee > 0 ? ` (Fee: Rp ${d.fee.toLocaleString('id-ID')})` : ''}${d.uniqueCode > 0 ? ` +${d.uniqueCode}` : ''}`}
                        >
                          Bayar: <span className="font-bold text-black">Rp {d.totalAmount.toLocaleString('id-ID')}</span>
                          {d.fee > 0 && <span className="text-neutral-500"> (Fee {d.fee.toLocaleString('id-ID')})</span>}
                          {d.uniqueCode > 0 && <span className="text-purple-700 font-bold"> +{d.uniqueCode}</span>}
                        </div>
                      </td>

                      {/* 5. STATUS */}
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge
                            variant={d.status === 'SUCCESS' ? 'mint' : d.status === 'PENDING' ? 'yellow' : 'pink'}
                            size="sm"
                            className="font-black uppercase text-[10px] whitespace-nowrap"
                          >
                            {d.status === 'SUCCESS' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {d.status === 'PENDING' && <Clock className="w-3 h-3 inline mr-1" />}
                            {d.status === 'FAILED' && <XCircle className="w-3 h-3 inline mr-1" />}
                            {d.status}
                          </Badge>
                        </div>
                        {d.failureReason && (
                          <div className="text-[10px] font-mono text-red-600 mt-0.5" title={d.failureReason}>
                            {d.failureReason}
                          </div>
                        )}
                      </td>

                      {/* 6. AKSI */}
                      <td className="p-3 text-right whitespace-nowrap">
                        {d.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="mint"
                              size="sm"
                              onClick={() => handleConfirm(d.id)}
                              disabled={processingId === d.id}
                              className="text-[10px] py-1 px-2.5 font-black uppercase whitespace-nowrap"
                            >
                              KONFIRMASI
                            </Button>
                            <Button
                              variant="pink"
                              size="sm"
                              onClick={() => handleReject(d.id)}
                              disabled={processingId === d.id}
                              className="text-[10px] py-1 px-2.5 font-black uppercase whitespace-nowrap"
                            >
                              TOLAK
                            </Button>
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                            {new Date(d.paidAt || d.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="bg-neutral-100 border-t-[3px] border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="text-neutral-600">
              Menampilkan {deposits.length} dari {totalCount} deposit (Halaman {page} dari {totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isFetching}
                className="font-black uppercase"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> SEBELUMNYA
              </Button>
              <span className="px-2 py-1 bg-white border-[2px] border-black font-mono font-black">
                {page} / {totalPages}
              </span>
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isFetching}
                className="font-black uppercase"
              >
                SELANJUTNYA <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL PENGATURAN DEPOSIT */}
      <DepositSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};
