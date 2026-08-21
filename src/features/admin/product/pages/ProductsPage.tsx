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
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Layers, X, RefreshCw, AlertCircle, Download, Filter, RotateCcw } from 'lucide-react';
import type { ProductData, CategoryData, BrandData, ProviderData } from '../../types';
import { ProductModal } from '../components/ProductModal';
import { GetProductModal } from '../components/GetProductModal';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGetProductModalOpen, setIsGetProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  // Pagination & Filter States (Local UI State)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterProvider, setFilterProvider] = useState('ALL');
  const [filterProductCat, setFilterProductCat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const pageSize = 25;

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
      providerId: filterProvider !== 'ALL' ? filterProvider : undefined,
      productCategoryId: filterProductCat,
      status: filterStatus,
    }),
    [currentPage, searchQuery, filterCat, filterBrand, filterProvider, filterProductCat, filterStatus]
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

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const activeExtraFiltersCount = useMemo(() => {
    let count = 0;
    if (filterCat !== 'ALL') count++;
    if (filterBrand !== 'ALL') count++;
    if (filterProductCat !== 'ALL') count++;
    if (filterStatus !== 'ALL') count++;
    return count;
  }, [filterCat, filterBrand, filterProductCat, filterStatus]);

  const hasAnyFilter = searchQuery.trim() !== '' || filterProvider !== 'ALL' || activeExtraFiltersCount > 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterProvider('ALL');
    setFilterCat('ALL');
    setFilterBrand('ALL');
    setFilterProductCat('ALL');
    setFilterStatus('ALL');
    setCurrentPage(1);
  };

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

  // Resolve active provider code from filterProvider
  const selectedProviderObj = useMemo(() => {
    if (filterProvider === 'ALL') return null;
    return providers.find((p) => String(p.id) === filterProvider) || null;
  }, [filterProvider, providers]);

  const selectedProviderCode = selectedProviderObj?.code?.toLowerCase() || '';

  const handleGetProductClick = () => {
    if (filterProvider === 'ALL' || !selectedProviderObj) {
      addToast({
        title: 'PILIH PROVIDER',
        message: 'Silakan pilih Provider spesifik pada filter Provider terlebih dahulu untuk mengambil produk live.',
        type: 'warning',
      });
      return;
    }

    if (selectedProviderCode === 'wartopcoin') {
      setIsGetProductModalOpen(true);
    } else if (selectedProviderCode === 'digiflazz') {
      addToast({
        title: 'DIGIFLAZZ CATALOG',
        message: 'Provider Digiflazz menggunakan sistem sinkronisasi otomatis. Buka menu Admin > Providers untuk melakukan sync.',
        type: 'info',
      });
    } else {
      addToast({
        title: 'KATALOG TIDAK DIDUKUNG',
        message: `Provider '${selectedProviderObj.name || selectedProviderCode}' belum mendukung selective catalog import.`,
        type: 'warning',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#00F0FF" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base text-[var(--nb-text)] font-black uppercase">
              PRODUK
            </CardTitle>
            <p className="text-xs text-[var(--nb-text-muted)] font-bold mt-1 uppercase">
              Kelola produk, kategori, provider, dan status publik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="yellow"
              size="sm"
              onClick={handleGetProductClick}
              className="font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000]"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>GET PRODUCT</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Responsive Filter Bar */}
          <div className="space-y-3">
            {/* Primary Row: Search & Provider (Always Visible) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
                <Input
                  placeholder="Cari produk / SKU..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 text-sm py-1.5 w-full"
                />
              </div>

              {/* Provider Select & Action Buttons */}
              <div className="flex items-center gap-2">
                <Select
                  value={filterProvider}
                  onChange={(e) => {
                    setFilterProvider(e.target.value);
                    setCurrentPage(1);
                  }}
                  fullWidth={false}
                  className="flex-1 sm:w-auto min-w-[170px]"
                  options={[
                    { value: 'ALL', label: 'SEMUA PROVIDER' },
                    ...providers.map((p) => ({ value: String(p.id), label: p.name.toUpperCase() })),
                  ]}
                />

                {/* Mobile Filter Toggle Button */}
                <Button
                  variant={isFilterExpanded || activeExtraFiltersCount > 0 ? "yellow" : "white"}
                  size="sm"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="md:hidden font-black text-xs px-3 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 stroke-[3]" />
                  <span>FILTER</span>
                  {activeExtraFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-black">
                      {activeExtraFiltersCount}
                    </span>
                  )}
                </Button>

                {/* Desktop Reset Button */}
                {hasAnyFilter && (
                  <Button
                    variant="pink"
                    size="sm"
                    onClick={handleResetFilters}
                    className="hidden md:flex font-black text-xs px-2.5 shadow-[2px_2px_0px_0px_#000] items-center gap-1 shrink-0"
                    title="Reset semua filter"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                    <span>RESET</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Secondary Filters: Always visible on desktop, collapsible on mobile */}
            <div className={`${isFilterExpanded ? 'flex' : 'hidden'} md:flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 md:gap-3 p-3 md:p-0 bg-yellow-50/70 md:bg-transparent border-2 md:border-0 border-black rounded-lg`}>
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
                  { value: 'provider_on', label: '⚡ Supplier ON' },
                  { value: 'provider_off', label: '⚠️ Supplier OFF' },
                ]}
              />

              {/* Mobile Reset Button */}
              {hasAnyFilter && (
                <Button
                  variant="pink"
                  size="sm"
                  onClick={handleResetFilters}
                  className="md:hidden font-black text-xs py-2 shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5 w-full mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                  <span>RESET SEMUA FILTER</span>
                </Button>
              )}
            </div>
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
                    const providerLabel = (prod.provider?.name || 'SUPPLIER').toUpperCase();

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
                              <Badge variant="cyan" size="sm">{providerLabel}: ON</Badge>
                            ) : (
                              <Badge variant="purple" size="sm">{providerLabel}: OFF</Badge>
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
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs font-bold text-[var(--nb-text-muted)]">
                {selectedIds.size > 0 ? <span className="text-[var(--nb-text)]">{selectedIds.size} dipilih · </span> : null}
                Menampilkan <span className="text-[var(--nb-text)] font-black">{startItem}–{endItem}</span> dari <span className="text-[var(--nb-text)] font-black">{totalCount}</span> produk {totalPages > 1 ? `(Halaman ${currentPage} dari ${totalPages})` : ''}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="white"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="shadow-[2px_2px_0px_0px_#000]"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    <span>SEBELUMNYA</span>
                  </Button>
                  <div className="px-2.5 py-1 text-xs font-black bg-[var(--nb-surface)] border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="white"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="shadow-[2px_2px_0px_0px_#000]"
                  >
                    <span>SELANJUTNYA</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </Button>
                </div>
              )}
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

      {/* Get Product (Wartopcoin Live Selective Import) Modal */}
      <GetProductModal
        isOpen={isGetProductModalOpen}
        onClose={() => setIsGetProductModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.admin.products.all })}
      />
    </div>
  );
};
