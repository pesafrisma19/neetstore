import React, { useState, useEffect } from 'react';
import { apiFetch, deleteAdminCategory } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { CategoryData } from '../../types';
import { CategoryModal } from '../components/CategoryModal';
import { useToast } from '../../../../components/ui/ToastContext';

interface TabCategoriesProps {
  categories: CategoryData[];
  onAddCategory: () => void;
  onEditCategory: (category: CategoryData) => void;
  onEditCategoryMargin?: (category: CategoryData) => void;
  onDeleteCategory: (id: number) => void;
}

export const TabCategories: React.FC<TabCategoriesProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onEditCategoryMargin,
  onDeleteCategory,
}) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#FF9F1C" className="flex items-center justify-between">
        <CardTitle className="text-base text-[var(--nb-text)]">LEVEL 1: KATEGORI UTAMA (GAMES, PULSA, VOUCHER, PLN)</CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddCategory}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH KATEGORI</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IKON</TableHead>
              <TableHead>NAMA KATEGORI</TableHead>
              <TableHead>SLUG</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-xl">{c.icon}</TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">{c.name}</TableCell>
                <TableCell className="font-bold text-[var(--nb-text-muted)]">{c.slug}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? 'mint' : 'pink'} size="sm">
                    {c.isActive ? 'AKTIF' : 'NONAKTIF'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  {onEditCategoryMargin && (
                    <Button variant="yellow" size="sm" onClick={() => onEditCategoryMargin(c)}>
                      <span>EDIT MARGIN KATEGORI</span>
                    </Button>
                  )}
                  <Button variant="purple" size="sm" onClick={() => onEditCategory(c)}>
                    <Edit className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EDIT</span>
                  </Button>
                  <Button variant="pink" size="sm" onClick={() => onDeleteCategory(c.id)}>
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-[var(--nb-text-muted)] font-bold">
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
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const { addToast } = useToast();

  const fetchCategories = async () => {
    try {
      const data = await apiFetch<CategoryData[]>('/admin/categories');
      setCategories(data || []);
    } catch (e) {
      addToast({ title: 'ERROR', message: 'Gagal memuat kategori', type: 'error' });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat: CategoryData) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini? Semua brand di dalamnya mungkin akan terpengaruh.')) return;
    try {
      await deleteAdminCategory(id);
      addToast({ title: 'SUKSES', message: 'Kategori berhasil dihapus', type: 'success' });
      fetchCategories();
    } catch (err: any) {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menghapus kategori', type: 'error' });
    }
  };

  const handleSuccess = () => {
    addToast({ title: 'SUKSES', message: 'Kategori berhasil disimpan!', type: 'success' });
    fetchCategories();
  };

  return (
    <>
      <TabCategories
        categories={categories}
        onAddCategory={handleAdd}
        onEditCategory={handleEdit}
        onDeleteCategory={handleDelete}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </>
  );
};


