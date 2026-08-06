import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Dialog } from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { 
  ShoppingCart, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Search,
  Lock,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  getAdminTransactions, 
  updateAdminTransaction, 
  checkAdminTransactionStatus,
  OrderItem 
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { useToast } from '../../../../components/ui/ToastContext';

export const OrdersPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Local UI State
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [filterStatus, setFilterStatus] = useState<string>('ALL_ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filter tab change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  // TanStack Query: Load Orders
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

  const orders: OrderItem[] = ordersResponse || [];
  const _meta = (ordersResponse as any)?._meta || { totalCount: 0, totalPages: 1 };
  const totalPages = _meta.totalPages || 1;
  const totalCount = _meta.totalCount || 0;

  // Modal State untuk Tandai Status Manual
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [targetOrder, setTargetOrder] = useState<OrderItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [reason, setReason] = useState<string>('');
  const [sn, setSn] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  // TanStack Mutation: Update Status Manual
  const updateMutation = useMutation({
    mutationFn: (variables: { id: number; orderStatus: 'SUCCESS' | 'FAILED'; reason: string; sn?: string }) =>
      updateAdminTransaction(variables.id, {
        orderStatus: variables.orderStatus,
        reason: variables.reason,
        sn: variables.sn || undefined,
      }),
    onSuccess: (_, variables) => {
      addToast({
        title: variables.orderStatus === 'SUCCESS' ? 'PESANAN DITANDAI SUKSES ✅' : 'PESANAN DITANDAI GAGAL ❌',
        message: `Pesanan #ORD-${variables.id} berhasil diubah menjadi ${variables.orderStatus}.`,
        type: 'success',
      });
      setUpdateModalOpen(false);
      setTargetOrder(null);
      setReason('');
      setSn('');
      setModalError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions.all });
    },
    onError: (err: any) => {
      const errMsg = err.message || 'Terjadi kesalahan saat mengubah status pesanan.';
      setModalError(errMsg);
      addToast({
        title: 'GAGAL MEMPERBARUI STATUS',
        message: errMsg,
        type: 'error',
      });
    },
  });

  // TanStack Mutation: Cek Status Provider
  const checkMutation = useMutation({
    mutationFn: (id: number) => checkAdminTransactionStatus(id),
    onSuccess: (result, id) => {
      const newStatus =
        result?.orderStatus ||
        (result?.data?.status === 'Sukses' ? 'SUCCESS' : result?.data?.status === 'Gagal' ? 'FAILED' : 'PROCESS');

      addToast({
        title:
          newStatus === 'SUCCESS'
            ? '✅ TRANSAKSI SUKSES'
            : newStatus === 'FAILED'
            ? '❌ TRANSAKSI GAGAL'
            : '🔄 MASIH PENDING / PROCESS',
        message: result?.message || `Pesanan #ORD-${id} berstatus ${newStatus}.`,
        type: newStatus === 'SUCCESS' ? 'success' : newStatus === 'FAILED' ? 'error' : 'info',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.transactions.all });
    },
    onError: (err: any, id) => {
      addToast({
        title: 'GAGAL CEK STATUS',
        message: err.message || `Gagal mengecek status pesanan #ORD-${id} ke provider.`,
        type: 'error',
      });
    },
  });

  const openUpdateModal = (order: OrderItem, status: 'SUCCESS' | 'FAILED') => {
    setTargetOrder(order);
    setTargetStatus(status);
    setReason('');
    setSn(order.sn || '');
    setModalError(null);
    setUpdateModalOpen(true);
  };

  const handleConfirmUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrder) return;
    if (!reason.trim()) {
      setModalError('Alasan perubahan status wajib diisi untuk pencatatan activity log.');
      return;
    }
    setModalError(null);
    updateMutation.mutate({
      id: targetOrder.id,
      orderStatus: targetStatus,
      reason: reason.trim(),
      sn: sn.trim(),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & STATS */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              TRANSACTIONS QUEUE
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL FOUND: {totalCount}
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="pink" size="sm" className="border-2 font-mono animate-pulse">
                REFRESHING...
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>🛒</span>
            <span>ORDERS (LIVE QUEUE)</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Antrean pesanan aktif & riwayat transaksi dengan sinkronisasi provider Digiflazz.
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

      {/* 2. TAB FILTER & CARI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL_ACTIVE', label: '⚡ LIVE QUEUE (PENDING/PROCESS)' },
            { id: 'PENDING', label: '🕒 PENDING' },
            { id: 'PROCESS', label: '🔄 PROCESS' },
            { id: 'SUCCESS', label: '✅ SUCCESS' },
            { id: 'FAILED', label: '❌ FAILED' },
            { id: 'ALL', label: '📋 SEMUA PESANAN' },
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

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Order / No Tujuan / SN..."
            className="w-full bg-white border-[2px] border-black px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
          />
          <Search className="w-4 h-4 stroke-[2.5] text-neutral-400 absolute right-2.5 top-2" />
        </div>
      </div>

      {/* 3. BODY CONTENT: LOADING / ERROR / EMPTY / TABLE */}
      {isLoading ? (
        <Card variant="white" className="p-12 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <RefreshCw className="w-10 h-10 stroke-[2] mx-auto mb-3 animate-spin text-neutral-400" />
          <h3 className="text-lg font-black uppercase">MEMUAT ANTREAN PESANAN...</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">Mengambil data transaksi server real-time.</p>
        </Card>
      ) : isError ? (
        <Card variant="white" className="p-8 text-center border-[4px] border-black shadow-[6px_6px_0px_0px_#000]">
          <AlertTriangle className="w-12 h-12 stroke-[2] mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-black uppercase text-red-600">GAGAL MEMUAT ANTREAN PESANAN</h3>
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
          <ShoppingCart className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">
            {debouncedSearch ? 'TIDAK DITEMUKAN HASIL PENCARIAN' : 'TIDAK ADA PESANAN DALAM ANTREAN'}
          </h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            {debouncedSearch
              ? `Tidak ada pesanan yang cocok dengan pencarian "${debouncedSearch}".`
              : `Saat ini tidak ada pesanan dengan filter ${filterStatus} yang tercatat.`}
          </p>
        </Card>
      ) : (
        <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white border-b-[3px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3">ID Order</th>
                  <th className="p-3">Produk & Tujuan</th>
                  <th className="p-3">Total (Rp)</th>
                  <th className="p-3">Metode Bayar</th>
                  <th className="p-3">Status Bayar</th>
                  <th className="p-3">Status Order</th>
                  <th className="p-3 text-right">Aksi Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {orders.map((o) => {
                  const isFinal = o.orderStatus === 'SUCCESS' || o.orderStatus === 'FAILED';
                  const isChecking = checkMutation.isPending && checkMutation.variables === o.id;

                  return (
                    <tr key={o.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="p-3 font-mono">#ORD-{o.id}</td>
                      <td className="p-3">
                        <div className="font-black text-black">{o.product?.name || `Produk #${o.productId}`}</div>
                        <div className="text-xs font-mono text-neutral-500">
                          Tujuan: {o.targetAccount || '-'} {o.targetZone ? `(${o.targetZone})` : ''}
                        </div>
                        {o.sn && (
                          <div className="text-[11px] font-mono text-[var(--nb-purple)] mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span>SN: {o.sn}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-black">
                        Rp {(o.amount || o.totalPrice || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 uppercase">
                        <Badge variant="cyan" size="sm" className="font-bold">
                          {o.paymentMethod}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={o.paymentStatus === 'PAID' ? 'mint' : o.paymentStatus === 'REFUND' ? 'pink' : 'yellow'}
                          size="sm"
                          className="font-black uppercase"
                        >
                          {o.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            o.orderStatus === 'SUCCESS'
                              ? 'mint'
                              : o.orderStatus === 'FAILED'
                              ? 'pink'
                              : 'yellow'
                          }
                          size="sm"
                          className="font-black uppercase"
                        >
                          {o.orderStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {isFinal ? (
                          <Badge variant="white" size="sm" className="border-2 border-black font-black uppercase text-[10px]">
                            <Lock className="w-3 h-3 inline mr-1 text-neutral-500" /> STATUS FINAL
                          </Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {o.orderStatus === 'PROCESS' && (
                              <Button
                                variant="yellow"
                                size="sm"
                                onClick={() => checkMutation.mutate(o.id)}
                                disabled={isChecking}
                                className="font-black uppercase text-[10px] px-2 py-1"
                                title="Cek Status ke Digiflazz"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 stroke-[3] ${isChecking ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline ml-1">{isChecking ? 'CEK...' : 'CEK STATUS'}</span>
                              </Button>
                            )}
                            <Button
                              variant="mint"
                              size="sm"
                              onClick={() => openUpdateModal(o, 'SUCCESS')}
                              className="font-black uppercase text-[10px] px-2 py-1"
                              title="Tandai Sukses Manual"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                              <span className="hidden sm:inline ml-1">SUKSES</span>
                            </Button>
                            <Button
                              variant="pink"
                              size="sm"
                              onClick={() => openUpdateModal(o, 'FAILED')}
                              className="font-black uppercase text-[10px] px-2 py-1"
                              title="Tandai Gagal Manual"
                            >
                              <XCircle className="w-3.5 h-3.5 stroke-[3]" />
                              <span className="hidden sm:inline ml-1">GAGAL</span>
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="bg-neutral-100 border-t-[3px] border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
            <div className="text-neutral-600">
              Menampilkan {orders.length} dari {totalCount} pesanan (Halaman {page} dari {totalPages})
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

      {/* MODAL TANDAI STATUS MANUAL */}
      {targetOrder && (
        <Dialog
          isOpen={updateModalOpen}
          onClose={() => {
            if (!updateMutation.isPending) {
              setUpdateModalOpen(false);
            }
          }}
          title={`TANDAI PESANAN #ORD-${targetOrder.id} ${targetStatus}`}
          className="max-w-md"
        >
          <form onSubmit={handleConfirmUpdateStatus} className="text-left font-sans space-y-4">
            {modalError && (
              <div className="bg-red-100 border-[2px] border-red-600 p-2.5 rounded text-xs font-bold text-red-700">
                ⚠️ {modalError}
              </div>
            )}

            <div className="bg-[var(--nb-yellow)] border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000] text-xs font-bold text-black">
              <div>Produk: <b>{targetOrder.product?.name || `ID #${targetOrder.productId}`}</b></div>
              <div>Tujuan: <b>{targetOrder.targetAccount} {targetOrder.targetZone ? `(${targetOrder.targetZone})` : ''}</b></div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Alasan Perubahan Status <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  targetStatus === 'SUCCESS'
                    ? 'Contoh: Webhook Digiflazz terlambat, transaksi sudah terkonfirmasi sukses di dasbor provider.'
                    : 'Contoh: Nomor tujuan tidak ditemukan atau provider mengalami gangguan.'
                }
                rows={3}
                required
                disabled={updateMutation.isPending}
                className="w-full bg-white border-[2px] border-black p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
              />
              <p className="text-[10px] font-bold text-neutral-500 mt-1">
                *Wajib diisi untuk catatan Audit Activity Log admin.
              </p>
            </div>

            <div>
              <Input
                label="Serial Number (SN) / Kode Voucher (Opsional)"
                type="text"
                value={sn}
                onChange={(e) => setSn(e.target.value)}
                placeholder="Contoh: 1234567890 / VCH-9876"
                disabled={updateMutation.isPending}
              />
              <p className="text-[10px] font-bold text-neutral-500 mt-1">
                *Kosongkan jika produk top-up game tidak membutuhkan SN.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t-[3px] border-black">
              <Button
                type="button"
                variant="white"
                size="md"
                onClick={() => setUpdateModalOpen(false)}
                disabled={updateMutation.isPending}
              >
                BATAL
              </Button>
              <Button
                type="submit"
                variant={targetStatus === 'SUCCESS' ? 'mint' : 'pink'}
                size="md"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'MENYIMPAN...' : `SIMPAN AS ${targetStatus}`}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
};


