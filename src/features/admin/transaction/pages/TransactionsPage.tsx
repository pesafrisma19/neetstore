import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  History, 
  RefreshCw, 
  Search, 
  Eye, 
  ExternalLink,
  AlertTriangle,
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
  user?: {
    id?: number;
    username?: string;
    email?: string;
    phone?: string | null;
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
    <div className="space-y-6 w-full text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              READ-ONLY HISTORI
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL TRANSAKSI: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <History className="w-8 h-8 text-black" />
            <span>RIWAYAT TRANSAKSI (TRANSACTIONS)</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Arsip lengkap seluruh riwayat transaksi top-up (Sukses, Gagal, Pending, & Proses).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setSettingsModalOpen(true)}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
            title="Pengaturan Transaksi"
            aria-label="Pengaturan Transaksi"
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

      {/* 2. TAB FILTER & PENCARIAN HISTORI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: '📋 SEMUA STATUS' },
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
            placeholder="Cari Invoice / Email / WA / Target..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. TABEL RIWAYAT TRANSAKSI */}
      {isLoading ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
          <h3 className="text-lg font-black uppercase">MEMUAT RIWAYAT TRANSAKSI...</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">Mengambil arsip transaksi dari server.</p>
        </Card>
      ) : isError ? (
        <Card variant="white" className="p-8 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <AlertTriangle className="w-12 h-12 stroke-[2] mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-black uppercase text-red-600">GAGAL MEMUAT HISTORI</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            {(error as any)?.message || 'Terjadi kesalahan saat terhubung ke server backend.'}
          </p>
          <div className="mt-4">
            <Button variant="yellow" size="sm" onClick={() => refetch()} className="font-black uppercase">
              <RefreshCw className="w-4 h-4 mr-2" /> COBA LAGI
            </Button>
          </div>
        </Card>
      ) : transactions.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <History className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">
            {debouncedSearch ? 'TIDAK DITEMUKAN HASIL PENCARIAN' : 'BELUM ADA RIWAYAT TRANSAKSI'}
          </h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            {debouncedSearch
              ? `Tidak ada transaksi yang cocok dengan pencarian "${debouncedSearch}".`
              : `Belum ada data transaksi yang tercatat dalam sistem.`}
          </p>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3 w-[16%]">Transaksi</th>
                  <th className="p-3 w-[20%]">Pengguna</th>
                  <th className="p-3 w-[22%]">Produk &amp; Target</th>
                  <th className="p-3 w-[16%]">Pembayaran</th>
                  <th className="p-3 w-[16%]">Status</th>
                  <th className="p-3 w-[10%] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {transactions.map((tx) => {
                  const displayInvoice = tx.invoiceId || tx.providerRef || `TRX-${tx.id}`;
                  const isActive = tx.orderStatus === 'PENDING' || tx.orderStatus === 'PROCESS';
                  const isMember = Boolean(tx.userId);
                  const email = tx.email || tx.user?.email;
                  const phone = tx.whatsapp || tx.user?.phone;
                  const primaryContact = email || phone || (isMember ? `User #${tx.userId}` : 'Guest');
                  const showPhoneSub = Boolean(email && phone);

                  return (
                    <tr key={tx.id} className="hover:bg-yellow-50 transition-colors">
                      {/* 1. TRANSAKSI */}
                      <td className="p-3 font-mono">
                        <div className="font-black text-xs text-black truncate" title={displayInvoice}>
                          {displayInvoice}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 leading-tight mt-0.5">
                          {new Date(tx.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 2. PENGGUNA */}
                      <td className="p-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                            <Badge
                              variant={isMember ? 'cyan' : 'white'}
                              size="sm"
                              className="text-[9px] px-1.5 py-0 font-black uppercase tracking-wider shrink-0"
                            >
                              {isMember ? 'MEMBER' : 'GUEST'}
                            </Badge>
                            <span className="font-bold text-xs text-black truncate" title={primaryContact}>
                              {primaryContact}
                            </span>
                          </div>
                          {showPhoneSub && (
                            <div className="text-[11px] font-mono text-neutral-500 truncate" title={phone!}>
                              {phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. PRODUK & TARGET */}
                      <td className="p-3">
                        <div className="font-black text-xs text-black truncate" title={tx.product?.name || `Produk #${tx.id}`}>
                          {tx.product?.name || `Produk #${tx.id}`}
                        </div>
                        <div
                          className="text-[11px] font-mono text-neutral-600 leading-tight mt-0.5 truncate"
                          title={`Target: ${tx.targetAccount}${tx.targetZone ? ` (${tx.targetZone})` : ''}`}
                        >
                          Target: {tx.targetAccount} {tx.targetZone ? `(${tx.targetZone})` : ''}
                        </div>
                      </td>

                      {/* 4. PEMBAYARAN */}
                      <td className="p-3">
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
                                className="text-[11px] font-mono text-neutral-600 leading-tight mt-0.5 truncate"
                                title={subText}
                              >
                                {subText}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* 5. STATUS (BAYAR & ORDER GABUNG) */}
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <TransactionStatusBadge type="payment" status={tx.paymentStatus} />
                          <TransactionStatusBadge type="order" status={tx.orderStatus} />
                          {tx.refundStatus && tx.refundStatus !== 'NONE' && (
                            <TransactionStatusBadge type="refund" status={tx.refundStatus} />
                          )}
                        </div>
                      </td>

                      {/* 6. AKSI */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. Tombol Detail */}
                          <Button
                            variant="white"
                            size="sm"
                            onClick={() => handleOpenDetail(tx.id)}
                            className="text-[10px] py-1 px-2 font-black uppercase"
                          >
                            <Eye className="w-3 h-3 mr-1" /> DETAIL
                          </Button>

                          {/* 2. Tombol Buka di Antrean (Khusus PENDING / PROCESS) */}
                          {isActive && (
                            <Button
                              variant="yellow"
                              size="sm"
                              onClick={() => handleOpenInLiveQueue(tx)}
                              title="Buka transaksi ini di Antrean Pesanan"
                              className="text-[10px] py-1 px-2 font-black uppercase"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" /> ANTREAN
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        </Card>
      )}

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
