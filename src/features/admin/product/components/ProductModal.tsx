import React, { useState, useEffect } from 'react';
import { updateAdminProduct } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { X, Save, Lock, Info } from 'lucide-react';
import type { ProductData, CategoryData, BrandData, ProviderData, UpdateAdminProductInput } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductData | null;
  categories: CategoryData[];
  brands: BrandData[];
  providers: ProviderData[];
  onSaved: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  brands,
  providers,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    isActive: true,
    categoryId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        isActive: product.isActive ?? true,
        categoryId: product.categoryId ? String(product.categoryId) : '',
      });
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Minimal PATCH payload typed strictly as UpdateAdminProductInput
      const payload: UpdateAdminProductInput = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        isActive: formData.isActive,
      };

      await updateAdminProduct(product.id, payload);
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.message || 'Gagal menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerName = product.provider?.name || providers.find((p) => String(p.id) === String(product.providerId))?.name || 'Digiflazz';
  const brandName = product.brand?.name || brands.find((b) => String(b.id) === String(product.brandId))?.name || 'Umum';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card variant="white" shadow="xl" borderWidth="4" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto text-left">
        <CardHeader headerBg="#00F0FF" className="flex items-center justify-between sticky top-0 z-10">
          <CardTitle className="text-lg text-[var(--nb-text)] font-black uppercase">
            EDIT METADATA PRODUK #{product.id}
          </CardTitle>
          <Button variant="pink" size="sm" onClick={onClose}>
            <X className="w-5 h-5 stroke-[3]" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header info SKU, Provider & Brand */}
            <div className="p-3 bg-[var(--nb-surface-alt)] border-2 border-black rounded flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[var(--nb-text-muted)] block">SKU PROVIDER (DIGIFLAZZ)</span>
                <span className="font-mono text-xs font-bold text-[var(--nb-text)]">{product.digiflazzSku || product.sku}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="sm" className="flex items-center gap-1 font-black">
                  <Lock className="w-3 h-3 stroke-[3]" />
                  <span>BRAND: {brandName}</span>
                </Badge>
                <Badge variant="cyan" size="sm" className="flex items-center gap-1 font-black">
                  <Lock className="w-3 h-3 stroke-[3]" />
                  <span>PROVIDER: {providerName}</span>
                </Badge>
                {product.providerActive !== false ? (
                  <Badge variant="mint" size="sm" className="font-black">SUPPLIER: ON</Badge>
                ) : (
                  <Badge variant="pink" size="sm" className="font-black">SUPPLIER: OFF</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">NAMA PRODUK <span className="text-red-500">*</span></label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: 86 Diamonds"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">SKU PRODUK SISTEM <span className="text-red-500">*</span></label>
                <Input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Contoh: ml86"
                />
              </div>
            </div>

            {/* Banner Read-Only Harga & Pricing Rules */}
            <div className="p-3 bg-yellow-50 border-2 border-black rounded space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--nb-text)]">
                <Info className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>INFORMASI HARGA & PRICING RULES (READ-ONLY)</span>
              </div>
              <p className="text-[11px] text-[var(--nb-text-muted)] font-bold">
                Harga modal & harga jual dikendalikan secara otomatis oleh Provider Sync & aturan <strong>Pricing Rules</strong>. Mengubah margin dilakukan via menu Pricing Rules.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="p-1.5 bg-white border border-black rounded">
                  <span className="text-[9px] block text-[var(--nb-text-muted)] font-bold uppercase">MODAL PROVIDER</span>
                  <span className="font-bold">Rp {(product.originalPrice || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  <span className="text-[9px] block text-pink-600 font-bold uppercase">GUEST (PUBLIK)</span>
                  <span className="font-black text-pink-600">Rp {(product.priceUser || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  <span className="text-[9px] block text-purple-600 font-bold uppercase">MEMBER</span>
                  <span className="font-bold">Rp {(product.priceMember || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="p-1.5 bg-white border border-black rounded">
                  <span className="text-[9px] block text-emerald-600 font-bold uppercase">RESELLER / VIP</span>
                  <span className="font-bold">Rp {(product.priceReseller || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">KATEGORI UTAMA (LEVEL 1)</label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={[
                  { value: '', label: '-- Pilih Kategori --' },
                  ...categories.map((c) => ({ value: String(c.id), label: c.name })),
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">STATUS WEB (ADMIN CONTROL)</label>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                options={[
                  { value: 'true', label: 'AKTIF (Dapat ditampilkan di Checkout jika diset Kategori & Region)' },
                  { value: 'false', label: 'NON-AKTIF (Disembunyikan)' },
                ]}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t-2 border-black">
              <Button type="button" variant="white" onClick={onClose} disabled={isSubmitting}>
                BATAL
              </Button>
              <Button type="submit" variant="yellow" disabled={isSubmitting} isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-2 stroke-[3]" />
                <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
