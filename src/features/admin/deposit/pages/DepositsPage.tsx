import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Wallet, 
  RefreshCw, 
  Search, 
  ChevronLeft,
  ChevronRight,
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
    <div className="space-y-6 text-left font-sans">
      <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden">
        {/* 1. HEADER DENGAN AKSEN NEBRUTALISM */}
        <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-[var(--nb-text)] font-black uppercase">
            <Wallet className="w-5 h-5 stroke-[3]" />
            <span>MANAJEMEN DEPOSIT USER</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" className="font-black">
              TOTAL: {totalCount} DEPOSIT
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsModalOpen(true)}
              className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
              title="Pengaturan Deposit"
              aria-label="Pengaturan Deposit"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Pengaturan</span>
            </Button>
            <Button
              variant="white"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
            >
              <RefreshCw className={`w-4 h-4 stroke-[3] ${isFetching ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* 2. FILTER STATUS & PENCARIAN */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                  className="font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Cari Ref / Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
            </div>
          </div>

          {/* 3. TABEL DESIGN SYSTEM BERIKUTNYA */}
          <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
            <Table className="min-w-[1050px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">TRANSAKSI</TableHead>
                  <TableHead className="min-w-[220px]">PENGGUNA</TableHead>
                  <TableHead className="min-w-[170px]">PEMBAYARAN</TableHead>
                  <TableHead className="min-w-[200px]">NOMINAL</TableHead>
                  <TableHead className="min-w-[140px]">STATUS</TableHead>
                  <TableHead className="min-w-[160px] text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs uppercase">
                      Memuat data deposit...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs text-rose-600 uppercase">
                      ⚠️ {(error as any)?.message || 'Gagal mengambil data deposit'}
                    </TableCell>
                  </TableRow>
                ) : deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs text-neutral-500 uppercase">
                      Belum ada data deposit ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((d) => {
                    const level = d.user?.level || (d.userId ? 'MEMBER' : 'GUEST');
                    const email = d.user?.email;
                    const phone = d.user?.phone;
                    const primaryContact = email || phone || (d.userId ? `User #${d.userId}` : '-');
                    const showPhoneSub = Boolean(email && phone);
                    const badgeVariant = level === 'VIP' ? 'pink' : level === 'RESELLER' ? 'purple' : level === 'MEMBER' ? 'mint' : 'white';
                    const methodName = d.paymentMethodRel?.name || d.paymentMethod;
                    const gatewayName = d.paymentMethodRel?.gateway?.name;

                    return (
                      <TableRow key={d.id}>
                        {/* 1. TRANSAKSI */}
                        <TableCell className="font-mono">
                          <div className="font-black text-xs text-black" title={d.paymentRef}>
                            {d.paymentRef}
                          </div>
                          <span className="block text-[10px] font-mono text-neutral-500 whitespace-nowrap mt-0.5">
                            {new Date(d.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCell>

                        {/* 2. PENGGUNA */}
                        <TableCell>
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
                        </TableCell>

                        {/* 3. PEMBAYARAN */}
                        <TableCell>
                          <div className="min-w-0">
                            <div className="font-black text-xs text-black" title={methodName}>
                              {methodName}
                            </div>
                            <div
                              className="text-[11px] font-mono text-neutral-500 whitespace-nowrap mt-0.5"
                              title={gatewayName || '-'}
                            >
                              {gatewayName || '-'}
                            </div>
                          </div>
                        </TableCell>

                        {/* 4. NOMINAL */}
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          <div className="font-black text-green-700">
                            Saldo: Rp {d.amount.toLocaleString('id-ID')}
                          </div>
                          <div
                            className="text-[11px] text-neutral-600 font-sans font-bold mt-0.5"
                            title={`Bayar: Rp ${d.totalAmount.toLocaleString('id-ID')}${d.fee > 0 ? ` (Fee: Rp ${d.fee.toLocaleString('id-ID')})` : ''}${d.uniqueCode > 0 ? ` +${d.uniqueCode}` : ''}`}
                          >
                            Bayar: <span className="text-black font-black">Rp {d.totalAmount.toLocaleString('id-ID')}</span>
                            {d.fee > 0 && <span className="text-neutral-500 font-normal"> (Fee {d.fee.toLocaleString('id-ID')})</span>}
                            {d.uniqueCode > 0 && <span className="text-purple-700 font-bold"> +{d.uniqueCode}</span>}
                          </div>
                        </TableCell>

                        {/* 5. STATUS */}
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge
                              variant={d.status === 'SUCCESS' ? 'mint' : d.status === 'PENDING' ? 'yellow' : 'pink'}
                              size="sm"
                              className="font-black uppercase text-[10px] whitespace-nowrap"
                            >
                              {d.status === 'SUCCESS' && <CheckCircle className="w-3 h-3 inline mr-1 stroke-[3]" />}
                              {d.status === 'PENDING' && <Clock className="w-3 h-3 inline mr-1 stroke-[3]" />}
                              {d.status === 'FAILED' && <XCircle className="w-3 h-3 inline mr-1 stroke-[3]" />}
                              {d.status}
                            </Badge>
                          </div>
                          {d.failureReason && (
                            <div className="text-[10px] font-mono text-rose-600 mt-0.5 truncate max-w-[130px]" title={d.failureReason}>
                              {d.failureReason}
                            </div>
                          )}
                        </TableCell>

                        {/* 6. AKSI */}
                        <TableCell className="text-right whitespace-nowrap">
                          {d.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="mint"
                                size="sm"
                                onClick={() => handleConfirm(d.id)}
                                disabled={processingId === d.id}
                                className="text-xs py-1 px-2.5 font-black uppercase shadow-[2px_2px_0px_0px_#000] whitespace-nowrap"
                              >
                                KONFIRMASI
                              </Button>
                              <Button
                                variant="pink"
                                size="sm"
                                onClick={() => handleReject(d.id)}
                                disabled={processingId === d.id}
                                className="text-xs py-1 px-2.5 font-black uppercase shadow-[2px_2px_0px_0px_#000] whitespace-nowrap"
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
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="bg-neutral-100 border-[3px] border-black rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
            <div className="text-neutral-600">
              Menampilkan {deposits.length} dari {totalCount} deposit (Halaman {page} dari {totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isFetching}
                className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                <ChevronLeft className="w-4 h-4 mr-1 stroke-[3]" /> SEBELUMNYA
              </Button>
              <span className="px-2.5 py-1 bg-white border-[2px] border-black rounded-lg font-mono font-black shadow-[1px_1px_0px_0px_#000]">
                {page} / {totalPages}
              </span>
              <Button
                variant="white"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isFetching}
                className="font-black uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                SELANJUTNYA <ChevronRight className="w-4 h-4 ml-1 stroke-[3]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL PENGATURAN DEPOSIT */}
      <DepositSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};
