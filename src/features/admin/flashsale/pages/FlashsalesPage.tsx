import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { 
  Trash2, 
  Calendar,
  Clock,
  Plus,
  Search,
  Edit2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';
import { 
  getAdminFlashsales, 
  createAdminFlashsale, 
  updateAdminFlashsale, 
  deleteAdminFlashsale 
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { FlashsaleFormModal } from '../components/FlashsaleFormModal';

export const FlashsalesPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // 1. Fetch Flashsales via TanStack Query
  const { data: flashsales = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.flashsales.list({ page, limit: 12, search, status: statusFilter }),
    queryFn: () => getAdminFlashsales({ page, limit: 12, search, status: statusFilter }),
    staleTime: 10 * 1000,
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: createAdminFlashsale,
    onSuccess: () => {
      addToast({
        title: 'FLASHSALE DITAMBAHKAN ⚡',
        message: 'Promo Flashsale baru berhasil disimpan.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.flashsales.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.public.banners.all });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateAdminFlashsale(id, data),
    onSuccess: () => {
      addToast({
        title: 'FLASHSALE DIPERBARUI ✏️',
        message: 'Data promo Flashsale berhasil diperbarui.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.flashsales.all });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFlashsale,
    onSuccess: () => {
      addToast({
        title: 'FLASHSALE DIHAPUS 🗑️',
        message: 'Promo Flashsale telah dihapus dari sistem.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.flashsales.all });
    },
  });

  const handleCreateOrUpdate = async (data: any) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleToggleActive = (id: number, current: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !current } });
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus promo Flashsale "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              PROMOTION & CAMPAIGN
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL: {(Array.isArray(flashsales) ? flashsales : []).length} PROMO
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>⚡</span>
            <span>FLASHSALE CAMPAIGNS (DISPLAY PROMO)</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Manajemen promo diskon tampilan Homepage (Display-Only). Harga checkout tetap menggunakan harga nyata resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="purple"
            size="md"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ BUAT PROMO BARU</span>
          </Button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 stroke-[3]" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama produk / brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-black">STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="p-2 bg-white border-[2.5px] border-black font-mono font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">SEMUA STATUS</option>
            <option value="active">AKTIF SAJA 🟢</option>
            <option value="inactive">NONAKTIF SAJA 🔴</option>
          </select>

          <Button
            variant="white"
            size="sm"
            onClick={() => refetch()}
            className="border-2 border-black"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      {/* 3. DAFTAR KAMPANYE FLASHSALE */}
      {isLoading ? (
        <div className="p-8 text-center bg-white border-[3px] border-black font-black uppercase animate-pulse">
          ⚡ MEMUAT DATA FLASHSALE...
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-100 border-[3px] border-black text-red-700 font-black uppercase">
          ❌ GAGAL MEMUAT DATA FLASHSALE. SILAKAN REFRESH HALAMAN.
        </div>
      ) : !Array.isArray(flashsales) || flashsales.length === 0 ? (
        <div className="p-8 text-center bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="font-black text-lg text-neutral-600 uppercase mb-2">BELUM ADA PROMO FLASHSALE</p>
          <p className="text-xs font-bold text-neutral-500 mb-4">
            Klik tombol "+ BUAT PROMO BARU" di atas untuk menambahkan promo tampilan homepage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Array.isArray(flashsales) ? flashsales : []).map((fs: any) => {
            const prod = fs.product || {};
            const brand = prod.brand || {};
            const realPrice = prod.priceUser || 0;
            const displayOriginalPrice = Math.round(realPrice / (1 - fs.displayPercent / 100));
            const now = new Date();
            const isLive = fs.isActive && new Date(fs.startTime) <= now && new Date(fs.endTime) > now;

            return (
              <Card
                key={fs.id}
                variant="white"
                className={`border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden transition-all ${
                  !fs.isActive ? 'opacity-60 bg-neutral-100' : ''
                }`}
              >
                {/* Header / Brand Banner */}
                <div className="relative w-full h-36 bg-neutral-900 border-b-[4px] border-black overflow-hidden flex items-center justify-center">
                  {brand.bannerUrl || brand.thumbnail ? (
                    <img
                      src={brand.bannerUrl || brand.thumbnail}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white font-black text-xl uppercase tracking-wider">
                      {brand.name || 'GAME PROMO'}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
                      {brand.name || 'BRAND'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Badge
                      variant={isLive ? 'mint' : fs.isActive ? 'yellow' : 'pink'}
                      size="sm"
                      className="border-2 font-black uppercase shadow-[2px_2px_0px_0px_#000]"
                    >
                      {isLive ? 'LIVE NOW ⚡' : fs.isActive ? 'SCHEDULED ⏳' : 'NONAKTIF 🔴'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-black uppercase text-black leading-tight">
                      {prod.name || `Produk #${fs.productId}`}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 mt-1">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>
                        {new Date(fs.startTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} -{' '}
                        {new Date(fs.endTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Simulasi Diskon Display */}
                  <div className="flex items-center justify-between p-2.5 bg-yellow-50 border-[2px] border-black text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-neutral-500 font-mono text-[11px]">
                        Rp{displayOriginalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-black font-black font-mono">
                        Rp{realPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <Badge variant="pink" size="sm" className="font-mono font-black">
                      -{fs.displayPercent}%
                    </Badge>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-between pt-2 border-t-[2px] border-black">
                    <span className="text-[10px] font-mono text-neutral-500">
                      Sort: #{fs.sortOrder}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={fs.isActive ? 'pink' : 'mint'}
                        size="sm"
                        onClick={() => handleToggleActive(fs.id, fs.isActive)}
                        className="font-black uppercase text-[11px] px-2.5 py-1"
                        title={fs.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{fs.isActive ? 'OFF' : 'ON'}</span>
                      </Button>

                      <Button
                        variant="white"
                        size="sm"
                        onClick={() => {
                          setEditingItem(fs);
                          setIsModalOpen(true);
                        }}
                        className="font-black uppercase text-[11px] px-2.5 py-1"
                        title="Edit Promo"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </Button>

                      <Button
                        variant="white"
                        size="sm"
                        onClick={() => handleDelete(fs.id, prod.name || 'Promo')}
                        className="font-black uppercase text-[11px] px-2.5 py-1 text-red-600 hover:bg-red-50"
                        title="Hapus Promo"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Form Create & Edit */}
      <FlashsaleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
