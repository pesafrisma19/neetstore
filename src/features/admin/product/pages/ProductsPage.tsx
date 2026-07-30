import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductData, CategoryData, BrandData, ProviderData } from '../../types';
import { ProductModal } from '../components/ProductModal';

interface TabProductsProps {
  products: ProductData[];
  categories: CategoryData[];
  brands: BrandData[];
  onAddProduct: () => void;
  onEditProduct: (product: ProductData) => void;
  onDeleteProduct: (id: number) => void;
}

export const TabProducts: React.FC<TabProductsProps> = ({
  products,
  categories,
  brands,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logika
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCat === 'ALL' || String(p.categoryId) === filterCat;
    const matchBrand = filterBrand === 'ALL' || String(p.brandId) === filterBrand;
    return matchSearch && matchCat && matchBrand;
  });

  // Pagination logika
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#00F0FF" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">LEVEL 4: DAFTAR PRODUK (86 DIAMONDS, 172 DIAMONDS, DLL)</CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddProduct}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH PRODUK</span>
        </Button>
      </CardHeader>
      <CardContent>
        
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>NAMA PRODUK</TableHead>
                <TableHead>MODAL</TableHead>
                <TableHead>GUEST</TableHead>
                <TableHead>MEMBER</TableHead>
                <TableHead>RESELLER</TableHead>
                <TableHead>VIP</TableHead>
                <TableHead className="text-right">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-[var(--nb-text-muted)] italic">Tidak ada produk ditemukan.</TableCell>
                </TableRow>
              ) : (
                currentProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-black text-[var(--nb-text)]">{p.sku}</TableCell>
                    <TableCell className="font-bold text-[var(--nb-text)]">{p.name}</TableCell>
                    <TableCell className="font-bold text-[var(--nb-text-muted)]">Rp {p.originalPrice.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-black text-pink-600">Rp {p.priceUser.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-bold text-yellow-600">Rp {p.priceMember.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-bold text-teal-600">Rp {p.priceReseller.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-bold text-purple-600">Rp {p.priceVip.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="yellow" size="sm" onClick={() => onEditProduct(p)}>
                        <Edit className="w-3.5 h-3.5 stroke-[3]" />
                      </Button>
                      <Button variant="pink" size="sm" onClick={() => onDeleteProduct(p.id)}>
                        <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-[var(--nb-border)]">
          <div className="text-xs font-bold text-[var(--nb-text-muted)]">
            Menampilkan {currentProducts.length} dari {filteredProducts.length} produk
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="white" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </Button>
            <div className="px-4 py-1.5 bg-[var(--nb-yellow)] font-bold text-sm border-2 border-[var(--nb-border)]">
              {currentPage} / {totalPages}
            </div>
            <Button 
              variant="white" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const loadAll = async () => {
    try {
      const [prodData, catData, brandData, provData] = await Promise.all([
        apiFetch<ProductData[]>('/admin/products').catch(() => apiFetch<ProductData[]>('/products')),
        apiFetch<CategoryData[]>('/admin/categories').catch(() => apiFetch<CategoryData[]>('/categories')),
        apiFetch<BrandData[]>('/admin/brands').catch(() => apiFetch<BrandData[]>('/brands')),
        apiFetch<ProviderData[]>('/admin/providers').catch(() => apiFetch<ProviderData[]>('/providers')),
      ]);
      setProducts(prodData || []);
      setCategories(catData || []);
      setBrands(brandData || []);
      setProviders(provData || []);
    } catch (e) {
      console.error('Failed fetching products data:', e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductData) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      loadAll();
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Gagal menghapus produk');
    }
  };

  return (
    <>
      <TabProducts
        products={products}
        categories={categories}
        brands={brands}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        providers={providers}
        onSaved={loadAll}
      />
    </>
  );
};
