import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../../../components/ui/Card';
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
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  getAdminTransactions, 
  updateAdminTransaction, 
  checkAdminTransactionStatus 
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { useToast } from '../../../../components/ui/ToastContext';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { TransactionPagination } from '../components/TransactionPagination';
import { TransactionDetailModal } from '../components/TransactionDetailModal';

export interface OrderItem {
  id: number;
  invoiceId?: string;
  providerRef?: string;
  targetAccount: string;
  targetZone?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  sn?: string;
  createdAt: string;
  product?: {
    name: string;
    sku?: string;
  };
  user?: {
    username: string;
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
    onSuccess: (res, variables) => {
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

  // Modal Handlers
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

    setModalError('');
    updateMutation.mutate({
      id: selectedOrder.id,
      data: {
        orderStatus: modalAction,
        reason: manualReason.trim(),
        sn: manualSn.trim() ? manualSn.trim() : undefined,
      },
    });
  };

  // Open Detail Modal
  const handleOpenDetail = (id: number) => {
    setSelectedDetailId(id);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="pink" size="sm" className="border-2 font-black uppercase tracking-wider animate-pulse">
              LIVE QUEUE OPERASIONAL
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              PENDING / PROCESS: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="cyan" size="sm" className="border-2 font-mono">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <Zap className="w-8 h-8 fill-black" />
            <span>ANTREAN PESANAN (ORDERS)</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Antrean operasional terdepan untuk memantau & memproses pesanan top-up aktif.
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

      {/* 2. BAR PENCARIAN ANTREAN */}
      <div className="flex items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="text-xs font-black uppercase text-neutral-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>FOKUS ANTREAN AKTIF (PENDING & PROCESS)</span>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Invoice TRX-... / Target / Produk..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. TABEL ANTREAN PESANAN */}
      {isLoading ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
          <h3 className="text-lg font-black uppercase">MEMUAT ANTREAN PESANAN...</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">Mengambil data transaksi aktif dari server.</p>
        </Card>
      ) : isError ? (
        <Card variant="white" className="p-8 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <AlertTriangle className="w-12 h-12 stroke-[2] mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-black uppercase text-red-600">GAGAL MEMUAT ANTREAN</h3>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            {(error as any)?.message || 'Terjadi kesalahan saat terhubung ke server backend.'}
          </p>
          <div className="mt-4">
            <Button variant="yellow" size="sm" onClick={() => refetch()} className="font-black uppercase">
              <RefreshCw className="w-4 h-4 mr-2" /> COBA LAGI
            </Button>
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <CheckCircle2 className="w-12 h-12 stroke-[2] mx-auto mb-3 text-green-500" />
          <h3 className="text-lg font-black uppercase">
            {debouncedSearch ? 'TIDAK DITEMUKAN PADA ANTREAN AKTIF' : 'ANTREAN KOSONG / TIDAK ADA PESANAN AKTIF'}
          </h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            {debouncedSearch
              ? `Tidak ada transaksi aktif (PENDING/PROCESS) yang cocok dengan pencarian "${debouncedSearch}". Pesanan mungkin sudah selesai/gagal di Riwayat Transaksi.`
              : `Semua pesanan saat ini sudah selesai diproses atau belum ada pesanan baru.`}
          </p>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">Invoice / ID</th>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Produk & Target</th>
                  <th className="p-3">Nominal</th>
                  <th className="p-3">Bayar</th>
                  <th className="p-3">Status Order</th>
                  <th className="p-3 text-right">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {orders.map((ord) => {
                  const isChecking = checkingIds.has(ord.id);
                  const displayInvoice = ord.invoiceId || ord.providerRef || `TRX-${ord.id}`;

                  return (
                    <tr key={ord.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-black text-black">{displayInvoice}</span>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {new Date(ord.createdAt).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-black text-black">
                          {ord.user?.username || 'GUEST'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-black text-black">
                          {ord.product?.name || `Produk #${ord.id}`}
                        </div>
                        <div className="text-xs font-mono text-neutral-600">
                          Target: {ord.targetAccount} {ord.targetZone ? `(${ord.targetZone})` : ''}
                        </div>
                      </td>
                      <td className="p-3 font-black text-black">
                        Rp {(ord.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        <TransactionStatusBadge type="payment" status={ord.paymentStatus} />
                      </td>
                      <td className="p-3">
                        <TransactionStatusBadge type="order" status={ord.orderStatus} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Tombol Detail */}
                          <Button
                            variant="white"
                            size="sm"
                            onClick={() => handleOpenDetail(ord.id)}
                            title="Lihat Detail & Log Audit"
                            className="text-[10px] py-1 px-2"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* 2. Tombol Cek Provider */}
                          <Button
                            variant="cyan"
                            size="sm"
                            onClick={() => checkMutation.mutate(ord.id)}
                            disabled={isChecking}
                            title="Cek Status Provider Digiflazz"
                            className="text-[10px] py-1 px-2 font-black"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                          </Button>

                          {/* 3. Tombol Tandai Sukses */}
                          <Button
                            variant="mint"
                            size="sm"
                            onClick={() => openStatusModal(ord, 'SUCCESS')}
                            className="text-[10px] py-1 px-2 font-black"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> SUKSES
                          </Button>

                          {/* 4. Tombol Tandai Gagal */}
                          <Button
                            variant="pink"
                            size="sm"
                            onClick={() => openStatusModal(ord, 'FAILED')}
                            className="text-[10px] py-1 px-2 font-black"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> GAGAL
                          </Button>
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
            currentCount={orders.length}
            isFetching={isFetching}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </Card>
      )}

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
