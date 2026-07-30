import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { X, Save } from 'lucide-react';
import type { ProductData, CategoryData, BrandData, ProviderData } from '../../types';

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
    priceReseller: 0,
    priceVip: 0,
    pricePublic: 0,
    isActive: true,
    categoryId: '',
    brandId: '',
    providerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        priceReseller: product.priceReseller || 0,
        priceVip: product.priceVip || 0,
        pricePublic: product.pricePublic || 0,
        isActive: product.isActive ?? true,
        categoryId: product.categoryId ? String(product.categoryId) : '',
        brandId: product.brandId ? String(product.brandId) : '',
        providerId: product.providerId ? String(product.providerId) : '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        priceReseller: 0,
        priceVip: 0,
        pricePublic: 0,
        isActive: true,
        categoryId: '',
        brandId: '',
        providerId: '',
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        priceReseller: Number(formData.priceReseller),
        priceVip: Number(formData.priceVip),
        pricePublic: Number(formData.pricePublic),
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        brandId: formData.brandId ? Number(formData.brandId) : undefined,
        providerId: formData.providerId ? Number(formData.providerId) : undefined,
      };

      if (product) {
        await apiFetch(`/admin/products/${product.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Gagal menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card variant="white" shadow="xl" borderWidth="4" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader headerBg="#00F0FF" className="flex items-center justify-between sticky top-0 z-10">
          <CardTitle className="text-xl text-[var(--nb-text)]">
            {product ? 'EDIT PRODUK' : 'TAMBAH PRODUK BARU'}
          </CardTitle>
          <Button variant="pink" size="sm" onClick={onClose}>
            <X className="w-5 h-5 stroke-[3]" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">NAMA PRODUK</label>
                <Input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: 86 Diamonds"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">SKU (KODE PRODUK)</label>
                <Input 
                  required
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Contoh: ml86"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">HARGA RESELLER</label>
                <Input 
                  type="number"
                  required
                  value={formData.priceReseller}
                  onChange={e => setFormData({ ...formData, priceReseller: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">HARGA VIP</label>
                <Input 
                  type="number"
                  required
                  value={formData.priceVip}
                  onChange={e => setFormData({ ...formData, priceVip: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">HARGA PUBLIC</label>
                <Input 
                  type="number"
                  required
                  value={formData.pricePublic}
                  onChange={e => setFormData({ ...formData, pricePublic: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">KATEGORI</label>
                <Select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  options={[
                    { value: '', label: '-- Pilih Kategori --' },
                    ...categories.map(c => ({ value: String(c.id), label: c.name }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">BRAND</label>
                <Select
                  value={formData.brandId}
                  onChange={e => setFormData({ ...formData, brandId: e.target.value })}
                  options={[
                    { value: '', label: '-- Pilih Brand --' },
                    ...brands.map(b => ({ value: String(b.id), label: b.name }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">PROVIDER</label>
                <Select
                  value={formData.providerId}
                  onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                  options={[
                    { value: '', label: '-- Pilih Provider --' },
                    ...providers.map(p => ({ value: String(p.id), label: p.name }))
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">STATUS</label>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                options={[
                  { value: 'true', label: 'AKTIF (Tampil)' },
                  { value: 'false', label: 'TIDAK AKTIF (Sembunyi)' }
                ]}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="white" onClick={onClose} disabled={isSubmitting}>
                BATAL
              </Button>
              <Button type="submit" variant="yellow" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN PRODUK'}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
