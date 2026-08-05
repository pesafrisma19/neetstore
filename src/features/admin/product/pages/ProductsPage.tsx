import React, { useState, useEffect } from 'react';
import {
  apiFetch,
  getAdminProducts,
  getAdminProductCategories,
  getAdminRegions,
  type ProductCategoryData,
  type RegionData,
} from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Dialog } from '../../../../components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Layers, X } from 'lucide-react';
import type { ProductData, CategoryData, BrandData, ProviderData } from '../../types';
import { ProductModal } from '../components/ProductModal';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProductsPage: React.FC = () => {
  const { addToast } = useToast();

  // Master data
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryData[]>([]);
  const [regions, setRegions] = useState<RegionData[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  // Pagination & filter
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterProductCat, setFilterProductCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Bulk select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'category' | 'region' | 'brand' | 'status' | null>(null);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkRegionId, setBulkRegionId] = useState('');
  const [bulkBrandId, setBulkBrandId] = useState('');
  const [bulkStatus, setBulkStatus] = useState('true');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const loadMetadata = async () => {
    try {
      const [catData, brandData, provData, prodCatData, regionData] = await Promise.all([
        apiFetch<CategoryData[]>('/admin/categories').catch(() => apiFetch<CategoryData[]>('/categories')).catch(() => null),
        apiFetch<BrandData[]>('/admin/brands').catch(() => apiFetch<BrandData[]>('/brands')).catch(() => null),
        apiFetch<ProviderData[]>('/admin/providers').catch(() => apiFetch<ProviderData[]>('/providers')).catch(() => null),
        getAdminProductCategories({ active: true }),
        getAdminRegions({ active: true }),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
      setProviders(Array.isArray(provData) ? provData : []);
      setProductCategories(prodCatData?.items || []);
      setRegions(regionData?.items || []);
    } catch (e) {
      console.error('Failed fetching metadata:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const prodData = await getAdminProducts({
        page: currentPage,
        limit: 50,
        search: searchQuery || undefined,
        categoryId: filterCat,
        brandId: filterBrand,
        productCategoryId: filterProductCat,
        status: filterStatus,
      });
      let list: ProductData[] = prodData || [];

      setProducts(list);
      const meta = (prodData as any)?._meta;
      if (meta) {
        setTotalCount(meta.totalCount || 0);
        setTotalPages(meta.totalPages || 1);
      } else {
        setTotalCount(list.length);
        setTotalPages(1);
      }
    } catch (e) {
      console.error('Failed fetching products:', e);
    }
  };

  useEffect(() => { loadMetadata(); }, []);
  useEffect(() => {
    setSelectedIds(new Set());
    loadProducts();
  }, [currentPage, searchQuery, filterCat, filterBrand, filterProductCat, filterStatus]);

  // Checkbox handlers
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  // Bulk apply
  const handleBulkApply = async () => {
    if (selectedIds.size === 0) return;
    setBulkSubmitting(true);
    try {
      const body: any = { ids: Array.from(selectedIds) };
      if (bulkAction === 'category') body.productCategoryId = bulkCategoryId ? parseInt(bulkCategoryId) : null;
      if (bulkAction === 'region') body.regionId = bulkRegionId ? parseInt(bulkRegionId) : null;
      if (bulkAction === 'brand') body.brandId = bulkBrandId ? parseInt(bulkBrandId) : null;
      if (bulkAction === 'status') body.isActive = bulkStatus === 'true';

      const res: any = await apiFetch('/admin/products/bulk', { method: 'PATCH', body: JSON.stringify(body) });
      addToast({ title: 'SUKSES', message: `${res.updated} produk berhasil diperbarui`, type: 'success' });
      setIsBulkModalOpen(false);
      setBulkAction(null);
      setSelectedIds(new Set());
      loadProducts();
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Bulk update gagal', type: 'error' });
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleAddProduct = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleEditProduct = (product: ProductData) => { setEditingProduct(product); setIsModalOpen(true); };
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch {
      addToast({ title: 'ERROR', message: 'Gagal menghapus produk', type: 'error' });
    }
  };

  const allSelected = products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < products.length;

  return (
    <>
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
          <CardTitle className="text-base text-[var(--nb-text)]">DAFTAR PRODUK</CardTitle>
          <Button variant="yellow" size="sm" onClick={handleAddProduct}>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>TAMBAH PRODUK</span>
          </Button>
        </CardHeader>
        <CardContent>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 mb-4">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
              <Input
                placeholder="Cari produk / SKU..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 text-sm py-1.5"
              />
            </div>

            <Select
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value); setFilterBrand('ALL'); setCurrentPage(1); }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA KATEGORI' },
                ...categories.map(c => ({ value: String(c.id), label: c.name }))
              ]}
            />

            <Select
              value={filterBrand}
              onChange={e => { setFilterBrand(e.target.value); setCurrentPage(1); }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA BRAND' },
                ...brands
                  .filter(b => filterCat === 'ALL' || String(b.categoryId) === filterCat)
                  .map(b => ({ value: String(b.id), label: b.name }))
              ]}
            />

            <Select
              value={filterProductCat}
              onChange={e => { setFilterProductCat(e.target.value); setCurrentPage(1); }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA PRODUCT CATEGORY' },
                { value: 'null', label: '⚠️ Belum ada kategori' },
                ...productCategories.map(pc => ({ value: String(pc.id), label: pc.name }))
              ]}
            />

            <Select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA STATUS' },
                { value: 'active', label: '✅ Aktif' },
                { value: 'inactive', label: '❌ Non-Aktif' },
              ]}
            />
          </div>

          {/* Bulk Action Toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[var(--nb-yellow)] border-2 border-[var(--nb-border)] rounded">
              <Layers className="w-4 h-4 stroke-[3]" />
              <span className="font-black text-sm">{selectedIds.size} PRODUK DIPILIH</span>
              <div className="flex flex-wrap gap-2 ml-2">
                <Button size="sm" variant="dark" onClick={() => { setBulkAction('category'); setIsBulkModalOpen(true); }}>
                  Set Kategori Produk
                </Button>
                <Button size="sm" variant="dark" onClick={() => { setBulkAction('region'); setIsBulkModalOpen(true); }}>
                  Set Region
                </Button>
                <Button size="sm" variant="dark" onClick={() => { setBulkAction('brand'); setIsBulkModalOpen(true); }}>
                  Set Brand
                </Button>
                <Button size="sm" variant="dark" onClick={() => { setBulkAction('status'); setIsBulkModalOpen(true); }}>
                  Set Status
                </Button>
              </div>
              <Button size="sm" variant="pink" onClick={() => setSelectedIds(new Set())} className="ml-auto">
                <X className="w-3.5 h-3.5 stroke-[3]" /> Batal
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected || someSelected}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>NAMA PRODUK</TableHead>
                  <TableHead>BRAND</TableHead>
                  <TableHead>KATEGORI PRODUK</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>MODAL</TableHead>
                  <TableHead>GUEST</TableHead>
                  <TableHead className="text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-[var(--nb-text-muted)] italic">
                      Tidak ada produk ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const prod = p as any;
                    return (
                      <TableRow key={p.id} className={selectedIds.has(p.id) ? 'bg-yellow-50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                          />
                        </TableCell>
                        <TableCell className="font-black text-[var(--nb-text)] text-xs">{p.sku}</TableCell>
                        <TableCell className="font-bold text-[var(--nb-text)]">{p.name}</TableCell>
                        <TableCell className="text-xs font-bold text-[var(--nb-text-muted)]">
                          {prod.brand?.name || <span className="text-orange-500">—</span>}
                        </TableCell>
                        <TableCell className="text-xs">
                          {prod.productCategory?.name
                            ? <Badge variant="mint" size="sm">{prod.productCategory.name}</Badge>
                            : <Badge variant="pink" size="sm">Belum diset</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          {prod.isActive
                            ? <Badge variant="mint" size="sm">Aktif</Badge>
                            : <Badge variant="pink" size="sm">Non-Aktif</Badge>
                          }
                        </TableCell>
                        <TableCell className="font-bold text-[var(--nb-text-muted)]">
                          Rp {p.originalPrice.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="font-black text-pink-600">
                          Rp {p.priceUser.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="yellow" size="sm" onClick={() => handleEditProduct(p)}>
                              <Edit className="w-3.5 h-3.5 stroke-[3]" />
                            </Button>
                            <Button variant="pink" size="sm" onClick={() => handleDeleteProduct(p.id)}>
                              <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-[var(--nb-border)]">
            <div className="text-xs font-bold text-[var(--nb-text-muted)]">
              {selectedIds.size > 0
                ? <span className="text-[var(--nb-text)]">{selectedIds.size} dipilih · </span>
                : null}
              Menampilkan {products.length} dari {totalCount} produk (Hal. {currentPage}/{totalPages})
            </div>
            <div className="flex items-center gap-2">
              <Button variant="white" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </Button>
              <div className="px-4 py-1.5 bg-[var(--nb-yellow)] font-bold text-sm border-2 border-[var(--nb-border)]">
                {currentPage} / {totalPages}
              </div>
              <Button variant="white" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Bulk Action Modal */}
      <Dialog
        isOpen={isBulkModalOpen}
        onClose={() => { setIsBulkModalOpen(false); setBulkAction(null); }}
        title={`BULK: SET ${bulkAction?.toUpperCase()} — ${selectedIds.size} PRODUK`}
      >
        <div className="space-y-4 text-left">
          {bulkAction === 'category' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Pilih Kategori Produk</label>
              <Select
                value={bulkCategoryId}
                onChange={e => setBulkCategoryId(e.target.value)}
                fullWidth
                options={[
                  { value: '', label: '— Hapus kategori (set null) —' },
                  ...productCategories.map(pc => ({ value: String(pc.id), label: pc.name }))
                ]}
              />
            </div>
          )}
          {bulkAction === 'region' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Pilih Region</label>
              <Select
                value={bulkRegionId}
                onChange={e => setBulkRegionId(e.target.value)}
                fullWidth
                options={[
                  { value: '', label: '— Hapus region (set null) —' },
                  ...regions.map(r => ({ value: String(r.id), label: `${r.name}${r.code ? ` (${r.code})` : ''}` }))
                ]}
              />
            </div>
          )}
          {bulkAction === 'brand' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Pilih Brand</label>
              <Select
                value={bulkBrandId}
                onChange={e => setBulkBrandId(e.target.value)}
                fullWidth
                options={[
                  { value: '', label: '— Hapus brand (set null) —' },
                  ...brands.map(b => ({ value: String(b.id), label: b.name }))
                ]}
              />
            </div>
          )}
          {bulkAction === 'status' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Set Status</label>
              <Select
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
                fullWidth
                options={[
                  { value: 'true', label: '✅ Aktif' },
                  { value: 'false', label: '❌ Non-Aktif' },
                ]}
              />
            </div>
          )}
          <p className="text-xs text-[var(--nb-text-muted)]">
            ⚠️ Perubahan ini akan diterapkan ke <strong>{selectedIds.size} produk</strong> sekaligus. Pastikan sudah benar sebelum melanjutkan.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="dark" className="flex-1" onClick={handleBulkApply} disabled={bulkSubmitting}>
              {bulkSubmitting ? 'MEMPROSES...' : `APPLY KE ${selectedIds.size} PRODUK`}
            </Button>
            <Button variant="white" onClick={() => { setIsBulkModalOpen(false); setBulkAction(null); }}>
              Batal
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Single Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        providers={providers}
        onSaved={loadProducts}
      />
    </>
  );
};
