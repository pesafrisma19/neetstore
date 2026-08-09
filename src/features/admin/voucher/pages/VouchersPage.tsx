import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminVouchers, updateAdminVoucher, deleteAdminVoucher } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Dialog } from '../../../../components/ui/Dialog';
import { Pagination } from '../../../../components/ui/Pagination';
import { Switch } from '../../../../components/ui/Switch';
import { useToast } from '../../../../components/ui/ToastContext';
import { VoucherFormModal } from '../components/VoucherFormModal';
import { Plus, Edit, Trash2, Search, Ticket, Tag, RefreshCw } from 'lucide-react';
import type { VoucherData } from '../../types';

export const VouchersPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);

  const [voucherToDelete, setVoucherToDelete] = useState<VoucherData | null>(null);

  // 1. TanStack Query: Fetch Vouchers dengan Server Pagination & Search
  const {
    data: voucherResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.vouchers.list({ page, limit, search, status: statusFilter }),
    queryFn: async () => {
      const res = await getAdminVouchers({ page, limit, search, status: statusFilter });
      return res;
    },
  });

  const vouchers: VoucherData[] = Array.isArray(voucherResponse) ? voucherResponse : [];
  const meta = (voucherResponse as any)?._meta;
  const totalCount = meta?.totalCount ?? vouchers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // 2. Mutation Toggle Active
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return updateAdminVoucher(id, { isActive });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vouchers.all });
      addToast({
        type: 'success',
        title: 'STATUS DISIMPAN',
        message: `Voucher berhasil ${variables.isActive ? 'diaktifkan' : 'dinonaktifkan'}!`,
      });
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'GAGAL UBAH STATUS',
        message: err.message || err.response?.data?.error || 'Gagal memperbarui status voucher',
      });
    },
  });

  // 3. Mutation Delete Voucher
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return deleteAdminVoucher(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vouchers.all });
      addToast({
        type: 'success',
        title: 'VOUCHER DIHAPUS',
        message: 'Data kode voucher berhasil dihapus!',
      });
      setVoucherToDelete(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.message || 'Gagal menghapus voucher';
      addToast({
        type: 'error',
        title: 'TIDAK DAPAT DIHAPUS',
        message: msg,
      });
    },
  });

  const handleOpenAddModal = () => {
    setSelectedVoucher(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VoucherData) => {
    setSelectedVoucher(v);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (voucherToDelete?.id) {
      deleteMutation.mutate(voucherToDelete.id);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Card Utama Header & Table */}
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#00F0FF" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 stroke-[3] text-black" />
            <CardTitle className="text-base sm:text-lg text-[var(--nb-text)] uppercase font-black tracking-tight">
              MANAJEMEN KODE VOUCHER & PROMO DISKON
            </CardTitle>
          </div>
          <Button variant="yellow" size="md" onClick={handleOpenAddModal} className="font-black uppercase shadow-[3px_3px_0px_0px_#000]">
            <Plus className="w-4 h-4 mr-1 stroke-[3]" />
            <span>TAMBAH VOUCHER</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Controls: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nb-text-muted)] pointer-events-none stroke-[2.5]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kode voucher..."
                className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[2px_2px_0px_0px_var(--nb-shadow)]"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-[var(--nb-text-muted)]">STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="p-2 font-black text-xs uppercase bg-white border-[3px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] outline-none cursor-pointer"
              >
                <option value="all">SEMUA STATUS</option>
                <option value="active">AKTIF</option>
                <option value="inactive">NONAKTIF</option>
              </select>

              <Button variant="white" size="sm" onClick={() => refetch()} title="Refresh Data">
                <RefreshCw className={`w-3.5 h-3.5 stroke-[3] ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Table / Loading / Empty / Error State */}
          {isLoading ? (
            <div className="py-12 text-center font-black text-sm uppercase text-[var(--nb-text-muted)] animate-pulse">
              MEMUAT DAFTAR VOUCHER...
            </div>
          ) : isError ? (
            <div className="p-6 bg-red-50 border-[3px] border-black text-center space-y-3">
              <span className="font-black text-sm text-red-600 uppercase block">GAGAL MEMUAT DATA VOUCHER</span>
              <Button variant="yellow" size="sm" onClick={() => refetch()} className="font-black">
                <RefreshCw className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                COBA LAGI
              </Button>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="py-12 border-[3px] border-dashed border-black text-center bg-yellow-50/50 p-6 space-y-2">
              <Tag className="w-10 h-10 mx-auto text-neutral-400 stroke-[2]" />
              <h4 className="font-black text-sm uppercase text-black">BELUM ADA KODE VOUCHER</h4>
              <p className="text-xs font-bold text-neutral-600">
                {search ? `Tidak ada voucher yang cocok dengan pencarian "${search}".` : 'Belum ada data kode promo yang dibuat.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-[3px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--nb-surface-alt)]">
                    <TableHead className="font-black uppercase text-xs">KODE</TableHead>
                    <TableHead className="font-black uppercase text-xs">TIPE DISKON</TableHead>
                    <TableHead className="font-black uppercase text-xs">NILAI DISKON</TableHead>
                    <TableHead className="font-black uppercase text-xs">MIN. PEMBELIAN</TableHead>
                    <TableHead className="font-black uppercase text-xs">PENGGUNAAN</TableHead>
                    <TableHead className="font-black uppercase text-xs">KEDALUWARSA</TableHead>
                    <TableHead className="font-black uppercase text-xs">STATUS</TableHead>
                    <TableHead className="font-black uppercase text-xs text-right">AKSI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((v) => {
                    const isExpired = v.expiredAt && new Date() > new Date(v.expiredAt);
                    const isQuotaFull = v.usedCount >= (v.maxUsage || 100);

                    return (
                      <TableRow key={v.id} className="hover:bg-yellow-50/60 transition-colors">
                        {/* Kode */}
                        <TableCell className="font-mono font-black text-sm text-[var(--nb-text)]">
                          <span className="px-2 py-0.5 bg-yellow-200 border-[1.5px] border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                            {v.code}
                          </span>
                        </TableCell>

                        {/* Tipe DisKON */}
                        <TableCell>
                          <Badge variant={v.discountType === 'PERCENT' ? 'pink' : 'cyan'} size="sm" className="font-black uppercase text-[10px]">
                            {v.discountType}
                          </Badge>
                        </TableCell>

                        {/* Nilai Diskon */}
                        <TableCell className="font-black text-xs text-[var(--nb-text)]">
                          {v.discountType === 'FLAT' ? (
                            <span>Rp {(v.discountValue || 0).toLocaleString('id-ID')}</span>
                          ) : (
                            <span>
                              {v.discountValue}%
                              {v.maxDiscount > 0 && (
                                <span className="block text-[9px] font-bold text-neutral-500">
                                  Max: Rp {v.maxDiscount.toLocaleString('id-ID')}
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>

                        {/* Min Purchase */}
                        <TableCell className="font-bold text-xs text-[var(--nb-text-muted)]">
                          {v.minPurchase > 0 ? `Rp ${v.minPurchase.toLocaleString('id-ID')}` : 'Tanpa Min.'}
                        </TableCell>

                        {/* Penggunaan */}
                        <TableCell className="font-bold text-xs">
                          <span className={isQuotaFull ? 'text-red-600 font-black' : 'text-neutral-700'}>
                            {v.usedCount} / {v.maxUsage}
                          </span>
                        </TableCell>

                        {/* Kedaluwarsa */}
                        <TableCell className="font-mono text-xs">
                          {v.expiredAt ? (
                            <span className={isExpired ? 'text-red-600 font-black' : 'text-neutral-700 font-bold'}>
                              {new Date(v.expiredAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-bold">Selamanya</span>
                          )}
                        </TableCell>

                        {/* Status Active Switch */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!v.isActive}
                              onChange={(checked) => toggleActiveMutation.mutate({ id: v.id, isActive: checked })}
                              disabled={toggleActiveMutation.isPending}
                            />
                            <Badge variant={v.isActive ? 'mint' : 'yellow'} size="sm" className="text-[9px] font-black uppercase">
                              {v.isActive ? 'AKTIF' : 'NONAKTIF'}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Aksi */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="yellow" size="sm" onClick={() => handleOpenEditModal(v)} title="Edit Voucher" className="font-black text-xs">
                              <Edit className="w-3.5 h-3.5 stroke-[3]" />
                              <span className="hidden sm:inline">EDIT</span>
                            </Button>

                            <Button variant="white" size="sm" onClick={() => setVoucherToDelete(v)} title="Hapus Voucher" className="font-black text-xs text-red-600 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && vouchers.length > 0 && (
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-neutral-600">
                Menampilkan <span className="font-black text-black">{vouchers.length}</span> dari <span className="font-black text-black">{totalCount}</span> voucher
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal Create & Edit */}
      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        voucher={selectedVoucher}
        onSuccess={(msg) => {
          addToast({
            type: 'success',
            title: 'BERHASIL',
            message: msg,
          });
        }}
      />

      {/* Confirmation Dialog Delete */}
      <Dialog
        isOpen={!!voucherToDelete}
        onClose={() => setVoucherToDelete(null)}
        title="KONFIRMASI HAPUS VOUCHER"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs font-bold text-neutral-800">
            Apakah Anda yakin ingin menghapus kode voucher{' '}
            <span className="font-mono font-black uppercase underline bg-yellow-200 px-1">{voucherToDelete?.code}</span>?
          </p>
          <div className="p-3 bg-red-50 border-[2.5px] border-red-600 text-[11px] font-bold text-red-900">
            ⚠️ Perhatian: Jika voucher ini sudah pernah digunakan pada transaksi histori, backend akan menolak penghapusan untuk menjaga integritas data transaksi. Gunakan toggle NONAKTIFKAN sebagai gantinya.
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-[3px] border-black">
            <Button variant="white" size="md" onClick={() => setVoucherToDelete(null)} disabled={deleteMutation.isPending}>
              BATAL
            </Button>
            <Button
              variant="pink"
              size="md"
              onClick={handleConfirmDelete}
              isLoading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              className="font-black text-xs uppercase"
            >
              <Trash2 className="w-4 h-4 mr-1 stroke-[3]" />
              {deleteMutation.isPending ? 'MENGHAPUS...' : 'YA, HAPUS VOUCHER'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
