import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminCategories, deleteAdminCategory } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, Search } from 'lucide-react';
import type { CategoryData } from '../../types';
import { CategoryModal } from '../components/CategoryModal';
import { CategoryIcon } from '../../../../components/ui/CategoryIcon';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { useToast } from '../../../../components/ui/ToastContext';

interface TabCategoriesProps {
  categories: CategoryData[];
  onAddCategory: () => void;
  onEditCategory: (category: CategoryData) => void;
  onDeleteCategory: (id: number) => void;
  isDeletingId?: number | null;
}

export const TabCategories: React.FC<TabCategoriesProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  isDeletingId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.icon?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-orange)" className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-black text-[var(--nb-text-on-accent)]">
            LEVEL 1: KATEGORI UTAMA (GAMES, PULSA, VOUCHER, PLN)
          </CardTitle>
          <Badge variant="cyan" size="sm">
            {categories.length} KATEGORI
          </Badge>
        </div>
        <Button variant="yellow" size="sm" onClick={onAddCategory}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH KATEGORI</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nb-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori berdasarkan nama, slug, atau icon..."
            className="w-full pl-10 pr-4 py-2.5 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[3px_3px_0px_0px_var(--nb-shadow-cyan)] transition-all"
          />
        </div>

        {/* Categories Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">IKON</TableHead>
              <TableHead>NAMA KATEGORI</TableHead>
              <TableHead>SLUG</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="w-10 h-10 flex items-center justify-center bg-[var(--nb-surface-alt)] border-[2.5px] border-[var(--nb-border)] rounded-lg shadow-[2px_2px_0px_0px_var(--nb-shadow-yellow)] shrink-0">
                    <CategoryIcon iconName={c.icon} className="w-5 h-5 text-[var(--nb-text)]" />
                  </div>
                </TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black">{c.name}</span>
                    {c.icon && (
                      <span className="text-[10px] text-[var(--nb-text-muted)] font-mono font-bold">
                        icon: {c.icon}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-[var(--nb-text-muted)] font-mono text-xs">
                  {c.slug}
                </TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? 'mint' : 'pink'} size="sm">
                    {c.isActive ? 'AKTIF' : 'NONAKTIF'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="purple" size="sm" onClick={() => onEditCategory(c)}>
                      <Edit className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">EDIT</span>
                    </Button>
                    <Button
                      variant="pink"
                      size="sm"
                      onClick={() => onDeleteCategory(c.id)}
                      disabled={isDeletingId === c.id}
                      isLoading={isDeletingId === c.id}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[var(--nb-text-muted)] font-bold text-xs uppercase tracking-wider">
                  {searchQuery ? `Tidak ada kategori yang cocok dengan "${searchQuery}"` : 'Belum ada kategori yang ditambahkan.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(null);

  // TanStack Query for categories list
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CategoryData[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await getAdminCategories();
      return res || [];
    },
  });

  // TanStack Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      addToast({ title: 'SUKSES', message: 'Kategori berhasil dihapus!', type: 'success' });
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menghapus kategori', type: 'error' });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat: CategoryData) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const target = categories.find((c) => c.id === id) || null;
    setCategoryToDelete(target || ({ id, name: `ID #${id}` } as any));
  };

  const handleModalSuccess = (msg: string) => {
    addToast({ title: 'SUKSES', message: msg, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <Card variant="white" shadow="md" borderWidth="4" className="p-12 text-center border-brutal">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[var(--nb-yellow)] mb-3 stroke-[3]" />
          <p className="font-black text-sm uppercase tracking-wider text-[var(--nb-text)]">
            Memuat Data Kategori...
          </p>
        </Card>
      )}

      {isError && (
        <Card variant="white" shadow="md" borderWidth="4" className="p-8 text-center border-[4px] border-red-600">
          <AlertCircle className="w-10 h-10 mx-auto text-red-600 mb-3 stroke-[3]" />
          <p className="font-black text-sm text-red-600 uppercase tracking-wider mb-4">
            {(error as any)?.message || 'Gagal memuat daftar kategori.'}
          </p>
          <Button variant="yellow" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2 stroke-[3]" />
            COBA LAGI
          </Button>
        </Card>
      )}

      {!isLoading && !isError && (
        <TabCategories
          categories={categories}
          onAddCategory={handleAdd}
          onEditCategory={handleEdit}
          onDeleteCategory={handleDelete}
          isDeletingId={deletingId}
        />
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        title="HAPUS KATEGORI?"
        description={`Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"? Semua produk & brand terkait mungkin terpengaruh. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="HAPUS"
        cancelLabel="BATAL"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
