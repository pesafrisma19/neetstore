import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  apiFetch,
  getAdminProducts,
  getAdminProductCategories,
  getAdminRegions,
  getAdminBrands,
  deleteAdminProduct,
  type ProductCategoryData,
  type RegionData,
} from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Dialog } from '../../../../components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Layers, X, RefreshCw, AlertCircle } from 'lucide-react';
import type { ProductData, CategoryData, BrandData, ProviderData } from '../../types';
import { ProductModal } from '../components/ProductModal';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  // Pagination & Filter States (Local UI State)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterProductCat, setFilterProductCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const pageSize = 50;

  // Bulk select States (Local UI State)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'category' | 'region' | 'brand' | 'status' | null>(null);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [bulkRegionId, setBulkRegionId] = useState('');
  const [bulkBrandId, setBulkBrandId] = useState('');
  const [bulkStatus, setBulkStatus] = useState('true');

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 1. Metadata Queries using existing Query Keys & helpers
  const { data: categoriesRaw = [] } = useQuery({
    queryKey: queryKeys.admin.categories.all,
    queryFn: async () => {
      const res = await apiFetch<CategoryData[]>('/admin/categories').catch(() => apiFetch<CategoryData[]>('/categories'));
      return Array.isArray(res) ? res : [];
    },
  });
  const categories: CategoryData[] = useMemo(() => (Array.isArray(categoriesRaw) ? categoriesRaw : []), [categoriesRaw]);

  const { data: brandsRaw = [] } = useQuery({
    queryKey: queryKeys.admin.brands.all,
    queryFn: getAdminBrands,
  });
  const brands: BrandData[] = useMemo(() => (Array.isArray(brandsRaw) ? (brandsRaw as any) : []), [brandsRaw]);

  const { data: providersRaw = [] } = useQuery({
    queryKey: queryKeys.admin.providers.all,
    queryFn: async () => {
      const res = await apiFetch<ProviderData[]>('/admin/providers').catch(() => apiFetch<ProviderData[]>('/providers'));
      return Array.isArray(res) ? res : [];
    },
  });
  const providers: ProviderData[] = useMemo(() => (Array.isArray(providersRaw) ? providersRaw : []), [providersRaw]);

  const { data: prodCatRes } = useQuery({
    queryKey: queryKeys.admin.productCategories.list({ active: true }),
    queryFn: () => getAdminProductCategories({ active: true }),
  });
  const productCategories: ProductCategoryData[] = prodCatRes?.items || [];

  const { data: regionRes } = useQuery({
    queryKey: queryKeys.admin.regions.list({ active: true }),
    queryFn: () => getAdminRegions({ active: true }),
  });
  const regions: RegionData[] = regionRes?.items || [];

  // 2. Products Query (Server-State List)
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      search: searchQuery.trim() || undefined,
      categoryId: filterCat,
      brandId: filterBrand,
      productCategoryId: filterProductCat,
      status: filterStatus,
    }),
    [currentPage, searchQuery, filterCat, filterBrand, filterProductCat, filterStatus]
  );

  const {
    data: prodResult,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.admin.products.list(queryParams),
    queryFn: () => getAdminProducts(queryParams),
    placeholderData: keepPreviousData,
  });

  const products: ProductData[] = useMemo(() => {
    if (Array.isArray(prodResult)) return prodResult;
    return [];
  }, [prodResult]);

  const totalCount = (prodResult as any)?._meta?.totalCount || products.length;
  const totalPages = (prodResult as any)?._meta?.totalPages || 1;

  // Auto-adjust currentPage if bounds change due to deletion or filtering
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // 3. TanStack Mutation for Bulk Update
  const bulkMutation = useMutation({
    mutationFn: async () => {
      const body: any = { ids: Array.from(selectedIds) };
      if (bulkAction === 'category') body.productCategoryId = bulkCategoryId ? parseInt(bulkCategoryId) : null;
      if (bulkAction === 'region') body.regionId = bulkRegionId ? parseInt(bulkRegionId) : null;
      if (bulkAction === 'brand') body.brandId = bulkBrandId ? parseInt(bulkBrandId) : null;
      if (bulkAction === 'status') body.isActive = bulkStatus === 'true';

      return apiFetch<{ updated: number }>('/admin/products/bulk', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      addToast({ title: 'SUKSES', message: `${res?.updated || 0} produk berhasil diperbarui`, type: 'success' });
      setIsBulkModalOpen(false);
      setBulkAction(null);
      setSelectedIds(new Set());
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Bulk update gagal', type: 'error' });
    },
  });

  // 4. TanStack Mutation for Delete Product
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminProduct(id),
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all });
      addToast({ title: 'SUKSES', message: 'Produk berhasil dihapus', type: 'success' });
    },
    onError: () => {
      addToast({
        title: 'TIDAK DAPAT DIHAPUS',
        message: 'Produk tidak dapat dihapus karena sudah memiliki riwayat terkait. Nonaktifkan produk sebagai gantinya.',
        type: 'error',
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Checkbox handlers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
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
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleEditProduct = (product: ProductData) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    deleteMutation.mutate(id);
  };

  const allSelected = products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < products.length;

  return (
    <div className="space-y-6">
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-[var(--nb-text)] font-black uppercase">
              LEVEL 5: DAFTAR VARIAN PRODUK (SKU PROVIDER & PRICES)
            </CardTitle>
            <p className="text-xs text-[var(--nb-text-muted)] font-bold mt-1 uppercase">
              Kelola penataan Kategori, Region, dan Status Aktif untuk varian produk provider
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
              <Input
                placeholder="Cari produk / SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-sm py-1.5"
              />
            </div>

            <Select
              value={filterCat}
              onChange={(e) => {
                setFilterCat(e.target.value);
                setFilterBrand('ALL');
                setCurrentPage(1);
              }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA KATEGORI UTAMA' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />

            <Select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setCurrentPage(1);
              }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA BRAND' },
                ...brands
                  .filter((b) => filterCat === 'ALL' || String(b.categoryId) === filterCat)
                  .map((b) => ({ value: String(b.id), label: b.name })),
              ]}
            />

            <Select
              value={filterProductCat}
              onChange={(e) => {
                setFilterProductCat(e.target.value);
                setCurrentPage(1);
              }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA PRODUCT CATEGORY' },
                { value: 'null', label: '⚠️ Belum ada kategori' },
                ...productCategories.map((pc) => ({ value: String(pc.id), label: pc.name })),
              ]}
            />

            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              fullWidth={false}
              className="w-full md:w-auto"
              options={[
                { value: 'ALL', label: 'SEMUA STATUS' },
                { value: 'active', label: '✅ Web Aktif' },
                { value: 'inactive', label: '❌ Web Non-Aktif' },
                { value: 'provider_on', label: '⚡ Digiflazz ON' },
                { value: 'provider_off', label: '⚠️ Digiflazz OFF' },
              ]}
            />
          </div>

          {/* Bulk Action Toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-[var(--nb-yellow)] border-2 border-[var(--nb-border)] rounded">
              <Layers className="w-4 h-4 stroke-[3]" />
              <span className="font-black text-sm">{selectedIds.size} PRODUK DIPILIH</span>
              <div className="flex flex-wrap gap-2 ml-2">
                <Button size="sm" variant="outline" onClick={() => { setBulkAction('category'); setIsBulkModalOpen(true); }}>
                  Set Kategori Produk
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setBulkAction('region'); setIsBulkModalOpen(true); }}>
                  Set Region
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setBulkAction('brand'); setIsBulkModalOpen(true); }}>
                  Set Brand
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setBulkAction('status'); setIsBulkModalOpen(true); }}>
                  Set Status
                </Button>
              </div>
              <Button size="sm" variant="pink" onClick={() => setSelectedIds(new Set())} className="ml-auto">
                <X className="w-3.5 h-3.5 stroke-[3]" /> Batal
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border-2 border-black rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected || someSelected} onChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>NAMA PRODUK</TableHead>
                  <TableHead>BRAND</TableHead>
                  <TableHead>KATEGORI PRODUK</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>MODAL</TableHead>
                  <TableHead>GUEST (PUBLIK)</TableHead>
                  <TableHead className="text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 font-black uppercase text-[var(--nb-text-muted)]">
                      <RefreshCw className="w-6 h-6 animate-spin inline-block mr-2 text-[var(--nb-cyan)] stroke-[3]" />
                      Memuat daftar produk...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 font-bold text-red-600 uppercase">
                      <AlertCircle className="w-6 h-6 inline-block mr-2 stroke-[3]" />
                      {(error as any)?.message || 'Gagal memuat daftar produk'}
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 font-bold text-[var(--nb-text-muted)] italic">
                      Tidak ada produk ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const prod = p as any;
                    const isDeleting = deletingId === p.id;

                    return (
                      <TableRow key={p.id} className={selectedIds.has(p.id) ? 'bg-yellow-50' : ''}>
                        <TableCell>
                          <Checkbox checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-[var(--nb-text)]">{p.sku}</TableCell>
                        <TableCell className="font-bold text-[var(--nb-text)]">{p.name}</TableCell>
                        <TableCell className="text-xs font-bold text-[var(--nb-text-muted)]">
                          {prod.brand?.name || <span className="text-orange-500">—</span>}
                        </TableCell>
                        <TableCell className="text-xs">
                          {prod.productCategory?.name ? (
                            <Badge variant="mint" size="sm">{prod.productCategory.name}</Badge>
                          ) : (
                            <Badge variant="pink" size="sm">Belum diset</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {prod.isActive ? (
                              <Badge variant="mint" size="sm">WEB: AKTIF</Badge>
                            ) : (
                              <Badge variant="pink" size="sm">WEB: NON-AKTIF</Badge>
                            )}
                            {prod.providerActive !== false ? (
                              <Badge variant="cyan" size="sm">DIGIFLAZZ: ON</Badge>
                            ) : (
                              <Badge variant="purple" size="sm">DIGIFLAZZ: OFF</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-[var(--nb-text-muted)]">
                          Rp {p.originalPrice?.toLocaleString('id-ID') || 0}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-black text-pink-600">
                          Rp {p.priceUser?.toLocaleString('id-ID') || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="yellow" size="sm" onClick={() => handleEditProduct(p)}>
                              <Edit className="w-3.5 h-3.5 stroke-[3]" />
                            </Button>
                            <Button
                              variant="pink"
                              size="sm"
                              onClick={() => handleDeleteProduct(p.id)}
                              disabled={isDeleting}
                              isLoading={isDeleting}
                            >
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
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs font-bold text-[var(--nb-text-muted)]">
                {selectedIds.size > 0 ? <span className="text-[var(--nb-text)]">{selectedIds.size} dipilih · </span> : null}
                Menampilkan {products.length} dari {totalCount} produk (Halaman {currentPage} dari {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="white"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  <span>SEBELUMNYA</span>
                </Button>
                <Button
                  variant="white"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  <span>SELANJUTNYA</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>
          )}
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
                onChange={(e) => setBulkCategoryId(e.target.value)}
                fullWidth
                options={[
                  { value: '', label: '— Hapus kategori (set null) —' },
                  ...productCategories.map((pc) => ({ value: String(pc.id), label: pc.name })),
                ]}
              />
            </div>
          )}
          {bulkAction === 'region' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Pilih Region</label>
              <Select
                value={bulkRegionId}
                onChange={(e) => setBulkRegionId(e.target.value)}
                fullWidth
                options={[
                  { value: '', label: '— Hapus region (set null) —' },
                  ...regions.map((r) => ({ value: String(r.id), label: `${r.name}${r.code ? ` (${r.code})` : ''}` })),
                ]}
              />
            </div>
          )}
          {bulkAction === 'brand' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Pilih Brand</label>
              <Select
                value={bulkBrandId}
                onChange={(e) => setBulkBrandId(e.target.value)}
                fullWidth
                options={[
                  { value: '', label: '— Hapus brand (set null) —' },
                  ...brands.map((b) => ({ value: String(b.id), label: b.name })),
                ]}
              />
            </div>
          )}
          {bulkAction === 'status' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1.5">Set Status</label>
              <Select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                fullWidth
                options={[
                  { value: 'true', label: '✅ Aktif' },
                  { value: 'false', label: '❌ Non-Aktif' },
                ]}
              />
            </div>
          )}
          <p className="text-xs text-[var(--nb-text-muted)] font-bold">
            ⚠️ Perubahan ini akan diterapkan ke <strong>{selectedIds.size} produk</strong> sekaligus. Pastikan pilihan Anda sudah sesuai.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              className="flex-1 font-black"
              onClick={() => bulkMutation.mutate()}
              isLoading={bulkMutation.isPending}
              disabled={bulkMutation.isPending}
            >
              {bulkMutation.isPending ? 'MEMPROSES...' : `APPLY KE ${selectedIds.size} PRODUK`}
            </Button>
            <Button variant="white" onClick={() => { setIsBulkModalOpen(false); setBulkAction(null); }}>
              BATAL
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Single Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        providers={providers}
        onSaved={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all })}
      />
    </div>
  );
};
