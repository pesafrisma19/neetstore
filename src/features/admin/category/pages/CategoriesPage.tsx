import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminCategories, deleteAdminCategory } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import type { CategoryData } from '../../types';
import { CategoryModal } from '../components/CategoryModal';
import { CategoryIcon } from '../../../../components/ui/CategoryIcon';
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
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#FF9F1C" className="flex items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-base text-[var(--nb-text)]">
          LEVEL 1: KATEGORI UTAMA (GAMES, PULSA, VOUCHER, PLN)
        </CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddCategory}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH KATEGORI</span>
        </Button>
      </CardHeader>
      <CardContent>
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
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="w-9 h-9 flex items-center justify-center bg-[var(--nb-surface-alt)] border-2 border-[var(--nb-border)] rounded-lg shadow-[2px_2px_0px_0px_var(--nb-shadow)]">
                    <CategoryIcon iconName={c.icon} className="w-5 h-5 text-[var(--nb-text)]" />
                  </div>
                </TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">
                  <div className="flex flex-col">
                    <span>{c.name}</span>
                    {c.icon && (
                      <span className="text-[10px] text-[var(--nb-text-muted)] font-mono font-normal">
                        icon: {c.icon}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-[var(--nb-text-muted)] font-mono">
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
                      <span>EDIT</span>
                    </Button>
                    <Button
                      variant="pink"
                      size="sm"
                      onClick={() => onDeleteCategory(c.id)}
                      disabled={isDeletingId === c.id}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[var(--nb-text-muted)] font-bold">
                  Belum ada kategori yang ditambahkan.
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
    if (!window.confirm('Yakin ingin menghapus kategori ini? Semua produk & brand terkait mungkin terpengaruh.')) return;
    deleteMutation.mutate(id);
  };

  const handleModalSuccess = (msg: string) => {
    addToast({ title: 'SUKSES', message: msg, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <Card variant="white" shadow="md" className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[var(--nb-yellow)] mb-3" />
          <p className="font-bold text-sm text-[var(--nb-text)]">Memuat data kategori...</p>
        </Card>
      )}

      {isError && (
        <Card variant="white" shadow="md" className="p-6 text-center border-2 border-red-500">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <p className="font-bold text-sm text-red-600 mb-4">
            {(error as any)?.message || 'Gagal memuat daftar kategori.'}
          </p>
          <Button variant="yellow" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
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
    </div>
  );
};
