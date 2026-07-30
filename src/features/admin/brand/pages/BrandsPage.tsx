import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../../components/ui/Table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { BrandData } from '../../types';

interface TabBrandsProps {
  brands: BrandData[];
  onAddBrand: () => void;
  onEditBrand: (brand: BrandData) => void;
  onEditBrandMargin?: (brand: BrandData) => void;
  onDeleteBrand: (id: number) => void;
}

export const TabBrands: React.FC<TabBrandsProps> = ({
  brands,
  onAddBrand,
  onEditBrand,
  onEditBrandMargin,
  onDeleteBrand,
}) => {
  return (
    <Card variant="white" shadow="xl" borderWidth="4" className="text-left">
      <CardHeader headerBg="#FF4D79" className="text-white flex items-center justify-between">
        <CardTitle className="text-white text-base">LEVEL 2: BRAND &amp; GAME TITLE (DYNAMIC FORM BUILDER &amp; POSTER BANNER)</CardTitle>
        <Button variant="yellow" size="sm" onClick={onAddBrand}>
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH BRAND GAME</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>POSTER</TableHead>
              <TableHead>NAMA BRAND</TableHead>
              <TableHead>GOOGLE PLAY ID</TableHead>
              <TableHead>PUBLISHER</TableHead>
              <TableHead>CUSTOM INPUT FIELDS</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="w-10 h-10 border-[2px] border-[var(--nb-border)] bg-gray-100 overflow-hidden shrink-0 rounded-lg">
                    <img src={b.thumbnail} alt={b.name} className="w-full h-full object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-black text-[var(--nb-text)]">{b.name}</TableCell>
                <TableCell>
                  {b.googlePlayId ? (
                    <Badge variant="mint" size="sm">{b.googlePlayId}</Badge>
                  ) : (
                    <Badge variant="yellow" size="sm">Manual / -</Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-pink-600">{b.publisher}</TableCell>
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
                <TableCell className="text-right flex items-center justify-end gap-2">
                  {onEditBrandMargin && (
                    <Button variant="purple" size="sm" onClick={() => onEditBrandMargin(b)}>
                      <span>EDIT MARGIN BRAND</span>
                    </Button>
                  )}
                  <Button variant="yellow" size="sm" onClick={() => onEditBrand(b)}>
                    <Edit className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EDIT LENGKAP</span>
                  </Button>
                  <Button variant="pink" size="sm" onClick={() => onDeleteBrand(b.id)}>
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

import { BrandModal } from '../components/BrandModal';

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<BrandData | null>(null);

  const fetchBrands = async () => {
    try {
      const data = await apiFetch<BrandData[]>('/admin/brands').catch(() => apiFetch<BrandData[]>('/brands'));
      setBrands(data || []);
    } catch (e) {
      console.error('Failed fetching brands:', e);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAdd = () => {
    setActiveBrand(null);
    setModalOpen(true);
  };

  const handleEdit = (brand: BrandData) => {
    setActiveBrand(brand);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin hapus Brand ini? Semua produk di dalamnya juga akan terhapus.')) return;
    try {
      await apiFetch(`/admin/brands/${id}`, { method: 'DELETE' });
      fetchBrands();
    } catch (e) {
      alert('Gagal menghapus brand.');
    }
  };

  return (
    <>
      <TabBrands
        brands={brands}
        onAddBrand={handleAdd}
        onEditBrand={handleEdit}
        onDeleteBrand={handleDelete}
      />
      <BrandModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        brand={activeBrand}
        onSuccess={fetchBrands}
      />
    </>
  );
};


