import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { X, Save, Zap, AlertCircle } from 'lucide-react';
import { getAdminBrands, getAdminProducts } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

interface FlashsaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isSubmitting?: boolean;
}

export const FlashsaleFormModal: React.FC<FlashsaleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [productId, setProductId] = useState<number | ''>('');
  const [displayPercent, setDisplayPercent] = useState<number>(10);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper date string formatter untuk <input type="datetime-local" />
  const formatDateForInput = (d?: string | Date) => {
    if (!d) return '';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    // Format YYYY-MM-DDTHH:mm lokal
    const pad = (num: number) => String(num).padStart(2, '0');
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 1. Fetch Brands untuk Helper Selector Filter
  const { data: brands = [] } = useQuery({
    queryKey: queryKeys.admin.brands.all,
    queryFn: getAdminBrands,
    enabled: isOpen,
  });

  // 2. Fetch Products filtered by Brand
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: queryKeys.admin.products.list({ brandId: selectedBrandId ? String(selectedBrandId) : undefined, limit: 100 }),
    queryFn: async () => {
      const res = await getAdminProducts({ brandId: selectedBrandId ? String(selectedBrandId) : undefined, limit: 100 });
      return Array.isArray(res) ? res : [];
    },
    enabled: isOpen && !!selectedBrandId,
  });

  useEffect(() => {
    if (initialData) {
      const prod = initialData.product;
      setSelectedBrandId(prod?.brandId || prod?.brand?.id || '');
      setProductId(initialData.productId || prod?.id || '');
      setDisplayPercent(initialData.displayPercent || 10);
      setStartTime(formatDateForInput(initialData.startTime));
      setEndTime(formatDateForInput(initialData.endTime));
      setIsActive(initialData.isActive ?? true);
      setSortOrder(initialData.sortOrder ?? 0);
    } else {
      setSelectedBrandId('');
      setProductId('');
      setDisplayPercent(10);

      // Default start time: Now, End time: 24 jam ke depan
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setStartTime(formatDateForInput(now));
      setEndTime(formatDateForInput(tomorrow));

      setIsActive(true);
      setSortOrder(0);
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productId) {
      setErrorMsg('Pilih produk yang akan diikutsertakan dalam Flashsale.');
      return;
    }
    if (displayPercent < 1 || displayPercent > 99) {
      setErrorMsg('Persentase diskon tampilan harus di antara 1% sampai 99%.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg('Waktu mulai dan waktu selesai wajib diisi.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setErrorMsg('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    try {
      await onSubmit({
        productId: Number(productId),
        displayPercent: Number(displayPercent),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        isActive,
        sortOrder: Number(sortOrder),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan Flashsale.');
    }
  };

  const selectedProductObj = products.find((p: any) => p.id === Number(productId)) || initialData?.product;
  const sampleRealPrice = selectedProductObj?.priceUser || 20000;
  const sampleDisplayOriginalPrice = Math.round(sampleRealPrice / (1 - (displayPercent || 10) / 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg bg-[#FAF7EE] border-[4px] border-black shadow-[10px_10px_0px_0px_#000] p-6 text-left my-8">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="md" className="border-2 font-black uppercase">
              <Zap className="w-4 h-4 fill-current text-yellow-300" />
              <span>{initialData ? 'EDIT KAMPANYE FLASHSALE' : 'BUAT PROMO FLASHSALE'}</span>
            </Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded border-2 border-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border-[3px] border-black text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Selector Helper: Brand */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              1. FILTER BRAND GAME (HELPER SELECTOR)
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setSelectedBrandId(val);
                setProductId('');
              }}
              className="w-full p-2.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Brand Game --</option>
              {(Array.isArray(brands) ? brands : []).map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.publisher || 'Official'})
                </option>
              ))}
            </select>
            <p className="text-[10px] font-bold text-neutral-500 mt-1">
              *Pilih Brand untuk memfilter daftar item produk di bawah.
            </p>
          </div>

          {/* 2. Selector Utama: Product */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              2. PILIH PRODUK ITEM <span className="text-red-600">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : '')}
              disabled={!selectedBrandId && !initialData}
              className="w-full p-2.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] text-sm font-bold focus:outline-none cursor-pointer disabled:bg-neutral-200 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedBrandId && !initialData
                  ? '-- Pilih Brand Terlebih Dahulu --'
                  : loadingProducts
                  ? 'Memuat produk...'
                  : '-- Pilih Item Produk --'}
              </option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Rp{p.priceUser?.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Harga Display */}
          {selectedProductObj && (
            <div className="p-3 bg-yellow-100 border-[3px] border-black text-xs font-bold space-y-1">
              <div className="text-[10px] uppercase font-black text-yellow-900 flex items-center gap-1">
                <span>🔍 PREVIEW SIMULASI TAMPILAN HOMEPAGE:</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="line-through text-neutral-500 font-mono">
                  Rp{sampleDisplayOriginalPrice.toLocaleString('id-ID')}
                </span>
                <span className="text-black font-black text-sm font-mono">
                  Rp{sampleRealPrice.toLocaleString('id-ID')}
                </span>
                <Badge variant="pink" size="sm" className="font-black">
                  -{displayPercent}%
                </Badge>
              </div>
              <p className="text-[10px] text-neutral-700 font-bold italic">
                *Harga nyata transaksi tetap Rp{sampleRealPrice.toLocaleString('id-ID')} (TIDAK BERUBAH saat checkout).
              </p>
            </div>
          )}

          {/* 3. Input Display Percent */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              3. PERSENTASE DISKON TAMPILAN (%) <span className="text-red-600">*</span>
            </label>
            <Input
              type="number"
              min={1}
              max={99}
              value={displayPercent}
              onChange={(e) => setDisplayPercent(Number(e.target.value))}
              placeholder="Contoh: 10"
              required
            />
            <p className="text-[10px] font-bold text-neutral-500 mt-1">
              *Hanya digunakan untuk menghitung label badge `-X%` dan harga coret buatan di UI Homepage.
            </p>
          </div>

          {/* 4. Input Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                WAKTU MULAI <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] text-xs font-mono font-bold focus:outline-none cursor-pointer"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                WAKTU SELESAI <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] text-xs font-mono font-bold focus:outline-none cursor-pointer"
                required
              />
            </div>
          </div>

          {/* 5. Sort Order & Is Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                URUTAN (SORT ORDER)
              </label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isActiveSwitch"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 accent-black border-2 border-black cursor-pointer"
              />
              <label htmlFor="isActiveSwitch" className="text-xs font-black uppercase text-black cursor-pointer">
                AKTIFKAN FLASHSALE
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-[3px] border-black">
            <Button
              type="button"
              variant="white"
              onClick={onClose}
              disabled={isSubmitting}
              className="font-black uppercase text-xs"
            >
              BATAL
            </Button>
            <Button
              type="submit"
              variant="yellow"
              disabled={isSubmitting}
              className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
            >
              <Save className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PROMO'}</span>
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
