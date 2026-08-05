import React, { useState, useEffect } from 'react';
import {
  getAdminProductCategories,
  createAdminProductCategory,
  updateAdminProductCategory,
  deleteAdminProductCategory,
  type ProductCategoryData,
} from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Dialog } from '../../../../components/ui/Dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';

export const ProductCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryData | null>(null);
  const [formName, setFormName] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toast Context
  const { addToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminProductCategories({
        search: search.trim() || undefined,
        page: currentPage,
        pageSize,
      });

      if (res && Array.isArray(res.items)) {
        setCategories(res.items);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalCount(res.items.length);
        }
      } else {
        setCategories([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal memuat daftar Kategori Produk', type: 'error' });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, search]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSortOrder(0);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: ProductCategoryData) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSortOrder(cat.sortOrder || 0);
    setFormIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ title: 'VALIDASI', message: 'Nama Kategori Produk wajib diisi', type: 'error' });
      return;
    }
    if (!formBrandId) {
      addToast({ title: 'VALIDASI', message: 'Brand wajib dipilih', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        sortOrder: Number(formSortOrder) || 0,
        isActive: formIsActive,
      };

      if (editingCategory) {
        await updateAdminProductCategory(editingCategory.id, payload);
        addToast({ title: 'SUKSES', message: `Kategori Produk "${formName}" berhasil diperbarui`, type: 'success' });
      } else {
        await createAdminProductCategory(payload);
        addToast({ title: 'SUKSES', message: `Kategori Produk "${formName}" berhasil ditambahkan`, type: 'success' });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menyimpan Kategori Produk', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Kategori Produk "${name}"?`)) {
      return;
    }

    try {
      await deleteAdminProductCategory(id);
      addToast({ title: 'SUKSES', message: `Kategori Produk "${name}" berhasil dihapus`, type: 'success' });
      fetchCategories();
    } catch (err: any) {
      addToast({
        title: 'GAGAL HAPUS',
        message: err.message || 'Tidak dapat menghapus Kategori Produk yang masih terhubung ke produk',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
        <CardHeader headerBg="#FF9F1C" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base text-[var(--nb-text)] uppercase font-black">
              LEVEL 4: KATEGORI PRODUK WEB (DIAMOND, WEEKLY PASS, MEMBERSHIP, BUNDLE)
            </CardTitle>
            <p className="text-xs text-[var(--nb-text-muted)] font-bold mt-1 uppercase">
              Kelola kategori varian produk yang akan tampil sebagai Tab Filter di Checkout
            </p>
          </div>
          <Button variant="yellow" size="sm" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>TAMBAH KATEGORI PRODUK</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]" />
              <Input
                placeholder="Cari kategori produk..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 text-sm py-1.5"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border-2 border-black rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>NAMA KATEGORI PRODUK</TableHead>
                  <TableHead className="text-center">URUTAN (SORT)</TableHead>
                  <TableHead className="text-center">STATUS</TableHead>
                  <TableHead className="text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 font-black uppercase text-[var(--nb-text-muted)]">
                      Memuat data kategori produk...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 font-bold text-[var(--nb-text-muted)]">
                      Belum ada Kategori Produk yang ditambahkan.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat, idx) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-mono text-xs font-bold">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="font-black text-[var(--nb-text)]">
                        {cat.name}
                        <span className="block text-[10px] font-mono text-[var(--nb-text-muted)] font-normal">
                          slug: {cat.slug}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold">
                        {cat.sortOrder}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cat.isActive ? 'mint' : 'pink'} size="sm">
                          {cat.isActive ? 'AKTIF' : 'NON-AKTIF'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="purple" size="sm" onClick={() => handleOpenEditModal(cat)}>
                            <Edit className="w-3.5 h-3.5 stroke-[3]" />
                            <span>EDIT</span>
                          </Button>
                          <Button variant="pink" size="sm" onClick={() => handleDelete(cat.id, cat.name)}>
                            <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs font-bold text-[var(--nb-text-muted)]">
                Menampilkan {categories.length} dari {totalCount} Kategori (Halaman {currentPage} dari {totalPages})
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

      {/* Modal Dialog Form Create / Edit ProductCategory */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'EDIT KATEGORI PRODUK' : 'TAMBAH KATEGORI PRODUK BARU'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              NAMA KATEGORI PRODUK <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: Diamond, Weekly Pass, Membership, Bundle"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <span className="text-[10px] text-[var(--nb-text-muted)] font-bold mt-1 block">
              Slug URL akan di-generate otomatis oleh sistem backend.
            </span>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1.5">
              URUTAN TAMPIL (SORT ORDER)
            </label>
            <Input
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
            />
            <span className="text-[10px] text-[var(--nb-text-muted)] font-bold mt-1 block">
              Angka lebih kecil akan tampil lebih awal di Tab Filter Checkout.
            </span>
          </div>

          <div className="pt-2">
            <Checkbox
              label="STATUS KATEGORI AKTIF (Tampil sebagai Tab di Checkout)"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
            <Button variant="white" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              BATAL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'MENYIMPAN...' : editingCategory ? 'SIMPAN PERUBAHAN' : 'TAMBAH KATEGORI'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
