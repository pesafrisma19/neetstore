import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  History, 
  RefreshCw, 
  Search, 
  Eye, 
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { getAdminTransactions } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { TransactionPagination } from '../components/TransactionPagination';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { TransactionSettingsModal } from '../components/TransactionSettingsModal';

export interface TransactionHistoryItem {
  id: number;
  userId?: number | null;
  email?: string | null;
  whatsapp?: string | null;
  invoiceId?: string;
  providerRef?: string;
  targetAccount: string;
  targetZone?: string;
  amount: number;
  feeAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  refundStatus?: string;
  sn?: string;
  createdAt: string;
  product?: {
    name: string;
    sku?: string;
  };
  userLevel?: string | null;
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

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();

  // Local UI State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Modal State for Detail & Audit Log
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filter tab changes
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  // TanStack Query: Read-Only History for All Statuses
  const {
    data: transactionsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.transactions.list({
      page,
      limit,
      search: debouncedSearch,
      orderStatus: filterStatus,
    }),
    queryFn: () =>
      getAdminTransactions({
        page,
        limit,
        search: debouncedSearch,
        orderStatus: filterStatus,
      }),
    placeholderData: keepPreviousData,
  });

  const transactions: TransactionHistoryItem[] = (transactionsResponse as unknown as TransactionHistoryItem[]) || [];
  const _meta = (transactionsResponse as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalPages = _meta.totalPages || 1;
  const totalCount = _meta.totalCount || 0;

  // Navigate to OrdersPage for active items
  const handleOpenInLiveQueue = (tx: TransactionHistoryItem) => {
    const searchVal = tx.invoiceId || tx.providerRef || `TRX-${tx.id}`;
    navigate(`/admin/orders?search=${encodeURIComponent(searchVal)}`);
  };

  // Open Detail Modal
  const handleOpenDetail = (id: number) => {
    setSelectedDetailId(id);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <Card variant="white" shadow="xl" borderWidth="4" className="rounded-3xl overflow-hidden">
        {/* 1. HEADER DENGAN AKSEN NEBRUTALISM */}
        <CardHeader headerBg="#00F0FF" className="border-b-[4px] border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base text-[var(--nb-text)] font-black uppercase">
            <History className="w-5 h-5 stroke-[3]" />
            <span>RIWAYAT TRANSAKSI (TRANSACTIONS)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" className="font-black">
              TOTAL: {totalCount} TRANSAKSI
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
              title="Pengaturan Transaksi"
              aria-label="Pengaturan Transaksi"
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
                { id: 'ALL', label: '📋 SEMUA' },
                { id: 'SUCCESS', label: '🟢 SUKSES' },
                { id: 'PROCESS', label: '🟣 DIPROSES' },
                { id: 'PENDING', label: '🟡 PENDING' },
                { id: 'FAILED', label: '🔴 GAGAL' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  type="button"
                  variant={filterStatus === tab.id ? 'yellow' : 'white'}
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
                placeholder="Cari Invoice / Email / WA / Target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
            </div>
          </div>

          {/* 3. TABEL DESIGN SYSTEM BERIKUTNYA */}
          <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[170px]">TRANSAKSI</TableHead>
                  <TableHead className="min-w-[230px]">PENGGUNA</TableHead>
                  <TableHead className="min-w-[240px]">PRODUK &amp; TARGET</TableHead>
                  <TableHead className="min-w-[170px]">PEMBAYARAN</TableHead>
                  <TableHead className="min-w-[160px]">STATUS</TableHead>
                  <TableHead className="min-w-[150px] text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs uppercase">
                      Memuat data transaksi...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs text-rose-600 uppercase">
                      ⚠️ {(error as any)?.message || 'Gagal mengambil data transaksi'}
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 font-black text-xs text-neutral-500 uppercase">
                      {debouncedSearch
                        ? `Tidak ada transaksi yang cocok dengan pencarian "${debouncedSearch}".`
                        : `Belum ada data transaksi yang tercatat dalam sistem.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                    const displayInvoice = tx.invoiceId || tx.providerRef || `TRX-${tx.id}`;
                    const isActive = tx.orderStatus === 'PENDING' || tx.orderStatus === 'PROCESS';
                    const level = tx.userLevel || tx.user?.level || (tx.userId ? 'MEMBER' : 'GUEST');
                    const email = tx.email || tx.user?.email;
                    const phone = tx.whatsapp || tx.user?.phone;
                    const primaryContact = email || phone || (tx.userId ? `User #${tx.userId}` : 'Guest');
                    const showPhoneSub = Boolean(email && phone);
                    const badgeVariant = level === 'VIP' ? 'pink' : level === 'RESELLER' ? 'purple' : level === 'MEMBER' ? 'mint' : 'white';

                    return (
                      <TableRow key={tx.id}>
                        {/* 1. TRANSAKSI */}
                        <TableCell className="font-mono">
                          <div className="font-black text-xs text-black" title={displayInvoice}>
                            {displayInvoice}
                          </div>
                          <span className="block text-[10px] font-mono text-neutral-500 whitespace-nowrap mt-0.5">
                            {new Date(tx.createdAt).toLocaleString('id-ID', {
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
                              <span className="font-bold text-xs text-black truncate max-w-[180px]" title={primaryContact}>
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

                        {/* 3. PRODUK & TARGET */}
                        <TableCell>
                          <div className="font-black text-xs text-black truncate max-w-[220px]" title={tx.product?.name || `Produk #${tx.id}`}>
                            {tx.product?.name || `Produk #${tx.id}`}
                          </div>
                          <div
                            className="text-[11px] font-mono text-neutral-600 leading-tight mt-0.5 truncate max-w-[220px]"
                            title={`Target: ${tx.targetAccount}${tx.targetZone ? ` (${tx.targetZone})` : ''}`}
                          >
                            Target: {tx.targetAccount} {tx.targetZone ? `(${tx.targetZone})` : ''}
                          </div>
                        </TableCell>

                        {/* 4. PEMBAYARAN */}
                        <TableCell className="whitespace-nowrap">
                          {(() => {
                            const methodName = tx.paymentMethodRel?.name || tx.paymentMethod;
                            const gatewayName = tx.paymentMethodRel?.gateway?.name;
                            const subText = gatewayName ? `${methodName} · ${gatewayName}` : methodName;

                            return (
                              <div className="min-w-0">
                                <div className="font-black text-xs text-black">
                                  Rp {(tx.amount || 0).toLocaleString('id-ID')}
                                </div>
                                <div
                                  className="text-[11px] font-mono text-neutral-500 leading-tight mt-0.5"
                                  title={subText}
                                >
                                  {subText}
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>

                        {/* 5. STATUS (BAYAR & ORDER GABUNG) */}
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <TransactionStatusBadge type="payment" status={tx.paymentStatus} />
                            <TransactionStatusBadge type="order" status={tx.orderStatus} />
                            {tx.refundStatus && tx.refundStatus !== 'NONE' && (
                              <TransactionStatusBadge type="refund" status={tx.refundStatus} />
                            )}
                          </div>
                        </TableCell>

                        {/* 6. AKSI */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 1. Tombol Detail */}
                            <Button
                              variant="white"
                              size="sm"
                              onClick={() => handleOpenDetail(tx.id)}
                              className="text-xs py-1 px-2.5 font-black uppercase shadow-[2px_2px_0px_0px_#000] whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 stroke-[3]" /> DETAIL
                            </Button>

                            {/* 2. Tombol Buka di Antrean (Khusus PENDING / PROCESS) */}
                            {isActive && (
                              <Button
                                variant="yellow"
                                size="sm"
                                onClick={() => handleOpenInLiveQueue(tx)}
                                title="Buka transaksi ini di Antrean Pesanan"
                                className="text-xs py-1 px-2.5 font-black uppercase shadow-[2px_2px_0px_0px_#000] whitespace-nowrap"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1 stroke-[3]" /> ANTREAN
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer Component */}
          <TransactionPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            currentCount={transactions.length}
            isFetching={isFetching}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      {/* 4. MODAL DETAIL TRANSAKSI & LOG AUDIT */}
      <TransactionDetailModal
        transactionId={selectedDetailId}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetailId(null);
        }}
      />

      {/* 5. MODAL PENGATURAN TRANSAKSI */}
      <TransactionSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
};
