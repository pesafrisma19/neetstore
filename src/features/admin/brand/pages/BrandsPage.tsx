import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminBrands, deleteAdminBrand } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2, Search, RefreshCw, AlertCircle } from 'lucide-react';
import type { BrandData } from '../../types';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { useToast } from '../../../../components/ui/ToastContext';

interface TabBrandsProps {
  brands: BrandData[];
  onAddBrand: () => void;
  onEditBrand: (id: number) => void;
  onDeleteBrand: (id: number) => void;
  isDeletingId?: number | null;
}

export const TabBrands: React.FC<TabBrandsProps> = ({
  brands,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  isDeletingId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const q = searchQuery.toLowerCase();
    return brands.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.publisher?.toLowerCase().includes(q) ||
        b.googlePlayId?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q)
    );
  }, [brands, searchQuery]);

  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="var(--nb-pink)" className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-black text-[#000000]">
            LEVEL 2: BRAND & GAME TITLE
          </CardTitle>
          <Badge variant="cyan" size="sm">
            {brands.length} BRANDS
          </Badge>
        </div>

        <Button variant="yellow" size="sm" onClick={onAddBrand}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH BRAND GAME</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nb-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Brand, Publisher, Slug, atau Google Play ID..."
            className="w-full pl-10 pr-4 py-2.5 font-bold text-xs bg-[var(--nb-input-bg)] border-[3px] border-[var(--nb-border)] text-[var(--nb-text)] placeholder:text-[var(--nb-text-muted)] outline-none focus:bg-[var(--nb-input-focus-bg)] shadow-[3px_3px_0px_0px_var(--nb-shadow-cyan)] transition-all"
          />
        </div>

        {/* Brands Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">POSTER</TableHead>
              <TableHead>NAMA BRAND</TableHead>
              <TableHead>GOOGLE PLAY ID</TableHead>
              <TableHead>PUBLISHER</TableHead>
              <TableHead>FORM FIELDS</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="w-10 h-10 border-[2.5px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] overflow-hidden shrink-0 rounded-lg shadow-[2px_2px_0px_0px_var(--nb-shadow-yellow)]">
                    <img
                      src={b.thumbnail}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black">{b.name}</span>
                    <span className="text-[10px] font-mono text-[var(--nb-text-muted)]">
                      slug: /{b.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {b.googlePlayId ? (
                    <Badge variant="mint" size="sm">
                      {b.googlePlayId}
                    </Badge>
                  ) : (
                    <Badge variant="yellow" size="sm">
                      Manual / -
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-[var(--nb-text)]">
                  {b.publisher || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="purple" size="sm">
                    {b.customFields?.length || 0} Dynamic Fields
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={b.isActive ? 'mint' : 'pink'} size="sm">
                    {b.isActive ? 'AKTIF' : 'NONAKTIF'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="purple" size="sm" onClick={() => onEditBrand(b.id)}>
                      <Edit className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">EDIT</span>
                    </Button>
                    <Button
                      variant="pink"
                      size="sm"
                      onClick={() => onDeleteBrand(b.id)}
                      disabled={isDeletingId === b.id}
                      isLoading={isDeletingId === b.id}
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filteredBrands.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[var(--nb-text-muted)] font-bold text-xs uppercase tracking-wider">
                  {searchQuery
                    ? `Tidak ada Brand yang cocok dengan "${searchQuery}"`
                    : 'Belum ada Brand yang ditambahkan.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const BrandsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<BrandData | null>(null);

  // TanStack Query for brands list
  const {
    data: brands = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BrandData[]>({
    queryKey: queryKeys.admin.brands.all,
    queryFn: async () => {
      const res = await getAdminBrands();
      return Array.isArray(res) ? res : [];
    },
  });

  // TanStack Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminBrand(id),
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.brands.all });
      addToast({ title: 'SUKSES', message: 'Brand berhasil dihapus.', type: 'success' });
    },
    onError: (err: any) => {
      addToast({ title: 'ERROR', message: err.message || 'Gagal menghapus brand.', type: 'error' });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleAdd = () => {
    navigate('/admin/brands/new');
  };

  const handleEdit = (id: number) => {
    navigate(`/admin/brands/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    const target = brands.find((b) => b.id === id) || null;
    setBrandToDelete(target || ({ id, name: `ID #${id}` } as any));
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <Card variant="white" shadow="md" borderWidth="4" className="p-12 text-center border-brutal">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[var(--nb-yellow)] mb-3 stroke-[3]" />
          <p className="font-black text-sm uppercase tracking-wider text-[var(--nb-text)]">
            Memuat Data Brand...
          </p>
        </Card>
      )}

      {isError && (
        <Card variant="white" shadow="md" borderWidth="4" className="p-8 text-center border-[4px] border-red-600">
          <AlertCircle className="w-10 h-10 mx-auto text-red-600 mb-3 stroke-[3]" />
          <p className="font-black text-sm text-red-600 uppercase tracking-wider mb-4">
            {(error as any)?.message || 'Gagal memuat daftar Brand.'}
          </p>
          <Button variant="yellow" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2 stroke-[3]" />
            COBA LAGI
          </Button>
        </Card>
      )}

      {!isLoading && !isError && (
        <TabBrands
          brands={brands}
          onAddBrand={handleAdd}
          onEditBrand={handleEdit}
          onDeleteBrand={handleDelete}
          isDeletingId={deletingId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        onConfirm={() => {
          if (brandToDelete) {
            deleteMutation.mutate(brandToDelete.id);
            setBrandToDelete(null);
          }
        }}
        title="HAPUS BRAND?"
        description={`Apakah Anda yakin ingin menghapus Brand "${brandToDelete?.name}"? Semua produk di dalamnya mungkin terpengaruh. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="HAPUS"
        cancelLabel="BATAL"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
