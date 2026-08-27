import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Zap, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  RotateCcw,
  X
} from 'lucide-react';
import { 
  getAdminTransactions, 
  updateAdminTransaction, 
  checkAdminTransactionStatus,
  markAdminGuestRefunded
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { useToast } from '../../../../components/ui/ToastContext';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { TransactionPagination } from '../components/TransactionPagination';
import { TransactionDetailModal } from '../components/TransactionDetailModal';

export interface OrderItem {
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
}

export const OrdersPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Local UI State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Initial load search param from URL (e.g. ?search=TRX-123)
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setDebouncedSearch(searchFromUrl);
    }
  }, [searchParams]);

  // Modal State for Manual Status Update
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [modalAction, setModalAction] = useState<'SUCCESS' | 'FAILED' | null>(null);
  const [manualReason, setManualReason] = useState<string>('');
  const [manualSn, setManualSn] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');

  // Modal State for Detail & Audit Log
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  // Track buttons loading for individual items
  const [checkingIds, setCheckingIds] = useState<Set<number>>(new Set());

  // Debounce Search Query Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // TanStack Query: Orders ALWAYS enforced to 'ALL_ACTIVE' (PENDING & PROCESS)
  const {
    data: ordersResponse,
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
      orderStatus: 'ALL_ACTIVE',
    }),
    queryFn: () =>
      getAdminTransactions({
        page,
        limit,
        search: debouncedSearch,
        orderStatus: 'ALL_ACTIVE',
      }),
    placeholderData: keepPreviousData,
  });

  const orders: OrderItem[] = (ordersResponse as unknown as OrderItem[]) || [];
  const _meta = (ordersResponse as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalPages = _meta.totalPages || 1;
  const totalCount = _meta.totalCount || 0;

  // Mutation: Manual Update Order Status (SUCCESS / FAILED)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { orderStatus: 'SUCCESS' | 'FAILED'; reason: string; sn?: string } }) =>
      updateAdminTransaction(id, data),
    onSuccess: (_, variables) => {
      addToast({
        title: `PESANAN #${variables.id} BERHASIL DIUPDATE`,
        message: `Status pesanan diubah menjadi ${variables.data.orderStatus}.`,
        type: 'success',
      });
      closeStatusModal();
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions.all });
    },
    onError: (err: any) => {
      setModalError(err.message || 'Gagal memperbarui status pesanan.');
    },
  });

  // Mutation: Check Provider Status (Digiflazz)
  const checkMutation = useMutation({
    mutationFn: (id: number) => checkAdminTransactionStatus(id),
    onMutate: (id) => {
      setCheckingIds((prev) => new Set(prev).add(id));
    },
    onSuccess: (res, id) => {
      const newStatus = res?.orderStatus || res?.data?.orderStatus;
      addToast({
        title: newStatus === 'SUCCESS' ? '✅ PESANAN SUKSES' : newStatus === 'FAILED' ? '❌ PESANAN GAGAL' : '🔄 MASIH PENDING',
        message: `Status pesanan #${id}: ${newStatus || 'PROCESS'}`,
        type: newStatus === 'SUCCESS' ? 'success' : newStatus === 'FAILED' ? 'error' : 'info',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions.all });
    },
    onError: (err: any, id) => {
      addToast({
        title: `GAGAL CEK STATUS #${id}`,
        message: err.message || 'Gagal menghubungi provider.',
        type: 'error',
      });
    },
    onSettled: (_, __, id) => {
      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  // Mutation: Mark Guest Refunded (PENDING -> REFUNDED)
  const markRefundedMutation = useMutation({
    mutationFn: (id: number) => markAdminGuestRefunded(id),
    onSuccess: (_, id) => {
      addToast({
        title: `REFUND TRANSAKSI #${id} SELESAI`,
        message: 'Status refund guest berhasil diubah menjadi REFUNDED.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions.all });
    },
    onError: (err: any) => {
      addToast({
        title: 'GAGAL TANDAI REFUND',
        message: err.message || 'Gagal memperbarui status refund.',
        type: 'error',
      });
    },
  });

  // Handlers for modal
  const openStatusModal = (order: OrderItem, action: 'SUCCESS' | 'FAILED') => {
    setSelectedOrder(order);
    setModalAction(action);
    setManualReason('');
    setManualSn(order.sn || '');
    setModalError('');
  };

  const closeStatusModal = () => {
    setSelectedOrder(null);
    setModalAction(null);
    setManualReason('');
    setManualSn('');
    setModalError('');
  };

  const handleConfirmStatusModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !modalAction) return;

    if (!manualReason.trim()) {
      setModalError('Alasan perubahan status wajib diisi.');
      return;
    }

    updateMutation.mutate({
      id: selectedOrder.id,
      data: {
        orderStatus: modalAction,
        reason: manualReason.trim(),
        sn: modalAction === 'SUCCESS' ? manualSn.trim() : undefined,
      },
    });
  };

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
            <Zap className="w-5 h-5 stroke-[3]" />
            <span>ANTREAN PESANAN AKTIF (ORDERS)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm" className="font-black">
              TOTAL ANTREAN: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
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
          {/* 2. BAR PENCARIAN & INFO ANTREAN */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs font-black uppercase text-neutral-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 stroke-[3]" />
              <span>FOKUS ANTREAN AKTIF (PENDING &amp; PROCESS)</span>
            </div>

            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Cari Invoice TRX-... / Target / Produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[3]" />
            </div>
          </div>

          {/* 3. TABEL ANTREAN PESANAN */}
          <div className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000]">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Invoice / ID</TableHead>
                  <TableHead className="min-w-[220px]">Pengguna</TableHead>
                  <TableHead className="min-w-[220px]">Produk &amp; Target</TableHead>
                  <TableHead className="min-w-[150px]">Nominal</TableHead>
                  <TableHead className="min-w-[130px]">Bayar</TableHead>
                  <TableHead className="min-w-[130px]">Status Order</TableHead>
                  <TableHead className="min-w-[220px] text-right">Aksi Operasional</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-black text-xs uppercase">
                      Memuat antrean pesanan...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-black text-xs text-rose-600 uppercase">
                      ⚠️ {(error as any)?.message || 'Gagal mengambil antrean'}
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 font-black text-xs text-neutral-500 uppercase">
                      {debouncedSearch
                        ? `Tidak ada transaksi aktif (PENDING/PROCESS) yang cocok dengan pencarian "${debouncedSearch}".`
                        : `Semua pesanan saat ini sudah selesai diproses atau belum ada pesanan baru.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((ord) => {
                    const isChecking = checkingIds.has(ord.id);
                    const displayInvoice = ord.invoiceId || ord.providerRef || `TRX-${ord.id}`;
                    const level = ord.userLevel || ord.user?.level || (ord.userId ? 'MEMBER' : 'GUEST');
                    const email = ord.email || ord.user?.email;
                    const phone = ord.whatsapp || ord.user?.phone;
                    const primaryContact = email || phone || (ord.userId ? `User #${ord.userId}` : 'Guest');
                    const showPhoneSub = Boolean(email && phone);
                    const badgeVariant = level === 'VIP' ? 'pink' : level === 'RESELLER' ? 'purple' : level === 'MEMBER' ? 'mint' : 'white';

                    return (
                      <TableRow key={ord.id}>
                        {/* 1. INVOICE / ID */}
                        <TableCell className="font-mono">
                          <span className="font-black text-black">{displayInvoice}</span>
                          <div className="text-[10px] text-neutral-500 font-mono whitespace-nowrap mt-0.5">
                            {new Date(ord.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
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
                          <div className="font-black text-black truncate max-w-[200px]" title={ord.product?.name || `Produk #${ord.id}`}>
                            {ord.product?.name || `Produk #${ord.id}`}
                          </div>
                          <div className="text-xs font-mono text-neutral-600 truncate max-w-[200px]" title={`Target: ${ord.targetAccount}${ord.targetZone ? ` (${ord.targetZone})` : ''}`}>
                            Target: {ord.targetAccount} {ord.targetZone ? `(${ord.targetZone})` : ''}
                          </div>
                        </TableCell>

                        {/* 4. NOMINAL */}
                        <TableCell className="font-black text-black whitespace-nowrap font-mono text-xs">
                          <div>Rp {(ord.amount || 0).toLocaleString('id-ID')}</div>
                          {(ord.refundStatus === 'PENDING' || ord.refundStatus === 'REFUNDED') && (
                            <div className="text-[10px] text-purple-700 font-extrabold font-mono mt-0.5">
                              Refund: Rp {Math.max(0, (ord.amount || 0) - (ord.feeAmount || 0)).toLocaleString('id-ID')}
                            </div>
                          )}
                        </TableCell>

                        {/* 5. BAYAR */}
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <TransactionStatusBadge type="payment" status={ord.paymentStatus} />
                            {ord.refundStatus && ord.refundStatus !== 'NONE' && (
                              <TransactionStatusBadge type="refund" status={ord.refundStatus} />
                            )}
                          </div>
                        </TableCell>

                        {/* 6. STATUS ORDER */}
                        <TableCell>
                          <TransactionStatusBadge type="order" status={ord.orderStatus} />
                        </TableCell>

                        {/* 7. AKSI OPERASIONAL */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* 1. Tombol Detail */}
                            <Button
                              variant="white"
                              size="sm"
                              onClick={() => handleOpenDetail(ord.id)}
                              title="Lihat Detail & Log Audit"
                              className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                              <span>DETAIL</span>
                            </Button>

                            {/* 2. Tombol Cek Provider */}
                            <Button
                              variant="cyan"
                              size="sm"
                              onClick={() => checkMutation.mutate(ord.id)}
                              disabled={isChecking}
                              title="Cek Status Provider Digiflazz"
                              className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 mr-1 stroke-[3] ${isChecking ? 'animate-spin' : ''}`} />
                              <span>CEK</span>
                            </Button>

                            {/* 3. Tombol Tandai Sukses */}
                            <Button
                              variant="mint"
                              size="sm"
                              onClick={() => openStatusModal(ord, 'SUCCESS')}
                              className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                              <span>SUKSES</span>
                            </Button>

                            {/* 4. Tombol Tandai Gagal */}
                            <Button
                              variant="pink"
                              size="sm"
                              onClick={() => openStatusModal(ord, 'FAILED')}
                              className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                              <span>GAGAL</span>
                            </Button>

                            {/* 5. Tombol Tandai Sudah Refund (Guest PENDING) */}
                            {(!ord.user?.username || ord.user.username === 'GUEST') && ord.orderStatus === 'FAILED' && ord.refundStatus === 'PENDING' && (
                              <Button
                                variant="purple"
                                size="sm"
                                onClick={() => {
                                  const refundAmt = Math.max(0, (ord.amount || 0) - (ord.feeAmount || 0));
                                  if (window.confirm(`Konfirmasi: Tandai transaksi #${ord.id} sudah direfund manual ke Guest sebesar Rp ${refundAmt.toLocaleString('id-ID')}? (Biaya admin Rp ${(ord.feeAmount || 0).toLocaleString('id-ID')} tidak termasuk refund)`)) {
                                    markRefundedMutation.mutate(ord.id);
                                  }
                                }}
                                disabled={markRefundedMutation.isPending}
                                title={`Tandai Sudah Direfund Manual ke Guest: Rp ${Math.max(0, (ord.amount || 0) - (ord.feeAmount || 0)).toLocaleString('id-ID')}`}
                                className="font-black text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#000]"
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                                <span>REFUND GUEST</span>
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
            currentCount={orders.length}
            isFetching={isFetching}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      {/* 4. MODAL KONFIRMASI PERUBAHAN STATUS MANUAL (REASON & SN) */}
      {selectedOrder && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card variant="white" className="w-full max-w-md border-[4px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
            <div className={`p-4 border-b-[3px] border-black flex items-center justify-between ${modalAction === 'SUCCESS' ? 'bg-[var(--nb-mint)]' : 'bg-[var(--nb-pink)]'}`}>
              <h3 className="text-base font-black uppercase text-black flex items-center gap-2">
                {modalAction === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span>TANDAI {modalAction === 'SUCCESS' ? 'SUKSES' : 'GAGAL'} MANUAL</span>
              </h3>
              <button onClick={closeStatusModal} className="p-1 text-black hover:bg-black/10 rounded">
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            <form onSubmit={handleConfirmStatusModal} className="p-5 space-y-4 text-left">
              <div className="bg-neutral-100 p-3 border-[2px] border-black text-xs font-bold space-y-1">
                <div>Invoice ID: <span className="font-mono font-black">{selectedOrder.invoiceId || selectedOrder.providerRef || `TRX-${selectedOrder.id}`}</span></div>
                <div>Produk: <span className="font-black">{selectedOrder.product?.name || `Produk #${selectedOrder.id}`}</span></div>
                <div>Target: <span className="font-mono">{selectedOrder.targetAccount}</span></div>
              </div>

              {modalError && (
                <div className="bg-red-100 border-[2px] border-red-600 text-red-700 p-3 text-xs font-black uppercase">
                  ⚠️ {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  ALASAN PERUBAHAN STATUS <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Contoh: Webhook provider terlambat / SN tervalidasi manual"
                  className="w-full bg-white border-[2px] border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
                  required
                />
              </div>

              {modalAction === 'SUCCESS' && (
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    PROVIDER SN / NO VOUCHER <span className="text-neutral-500 font-normal">(OPSIONAL)</span>
                  </label>
                  <input
                    type="text"
                    value={manualSn}
                    onChange={(e) => setManualSn(e.target.value)}
                    placeholder="Masukkan SN dari provider jika ada"
                    className="w-full bg-white border-[2px] border-black p-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t-[2px] border-neutral-200">
                <Button type="button" variant="white" size="sm" onClick={closeStatusModal} disabled={updateMutation.isPending} className="font-black uppercase">
                  BATAL
                </Button>
                <Button type="submit" variant={modalAction === 'SUCCESS' ? 'mint' : 'pink'} size="sm" disabled={updateMutation.isPending} className="font-black uppercase">
                  {updateMutation.isPending ? 'MENYIMPAN...' : `PROSES ${modalAction}`}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 5. MODAL DETAIL TRANSAKSI & AUDIT LOG */}
      <TransactionDetailModal
        transactionId={selectedDetailId}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetailId(null);
        }}
      />
    </div>
  );
};
