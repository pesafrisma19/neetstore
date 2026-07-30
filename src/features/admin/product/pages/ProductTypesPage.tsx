import React, { useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Dialog } from '../../../../components/ui/Dialog';
import { 
  FolderPlus, 
  Trash2, 
  Tag 
} from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ProductTypeItem {
  id: number;
  name: string;
  slug: string;
  brandName: string;
  itemCount: number;
  isActive: boolean;
}

export const ProductTypesPage: React.FC = () => {
  const { addToast } = useToast();
  const [types, setTypes] = useState<ProductTypeItem[]>([
    { id: 1, name: 'Umum / Regular', slug: 'umum', brandName: 'Mobile Legends', itemCount: 42, isActive: true },
    { id: 2, name: 'Membership / Starlight', slug: 'membership', brandName: 'Mobile Legends', itemCount: 8, isActive: true },
    { id: 3, name: 'Fast Diamonds', slug: 'fast-diamonds', brandName: 'Free Fire', itemCount: 25, isActive: true },
    { id: 4, name: 'UC Global / Regional', slug: 'uc-global', brandName: 'PUBG Mobile', itemCount: 14, isActive: true },
    { id: 5, name: 'Genesis Crystals', slug: 'genesis', brandName: 'Genshin Impact', itemCount: 12, isActive: true },
  ]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('Mobile Legends');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);

    const newId = types.length > 0 ? Math.max(...types.map((t) => t.id)) + 1 : 1;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    setTimeout(() => {
      setTypes([
        ...types,
        {
          id: newId,
          name,
          slug,
          brandName,
          itemCount: 0,
          isActive: true,
        },
      ]);
      addToast({
        title: 'TIPE PRODUK DITAMBAHKAN! 🎉',
        message: `Tipe "${name}" berhasil ditambahkan ke brand ${brandName}.`,
        type: 'success',
      });
      setName('');
      setModalOpen(false);
      setIsSubmitting(false);
    }, 400);
  };

  const handleDelete = (id: number, typeName: string) => {
    if (!window.confirm(`Yakin ingin menghapus tipe produk "${typeName}"?`)) return;
    setTypes(types.filter((t) => t.id !== id));
    addToast({
      title: 'TIPE DIHAPUS 🗑️',
      message: `Tipe produk ${typeName} dihapus dari sistem.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & STATS */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              LAYANAN / CLASSIFICATION
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL TYPES: {types.length}
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📁</span>
            <span>PRODUCT TYPES</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Manajemen tipe klasifikasi produk & sub-kategori (Membership, Diamonds, Fast Topup, dll).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="purple"
            size="md"
            onClick={() => setModalOpen(true)}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <FolderPlus className="w-4 h-4 stroke-[3]" />
            <span>+ TAMBAH TIPE</span>
          </Button>
        </div>
      </div>

      {/* 2. GRID TIPE PRODUK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((item) => (
          <Card
            key={item.id}
            variant="white"
            className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="yellow" size="sm" className="font-black uppercase text-[10px]">
                  {item.brandName}
                </Badge>
                <Badge variant="mint" size="sm" className="font-mono text-[10px]">
                  {item.itemCount} SKU
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-black leading-tight flex items-center gap-1.5">
                  <Tag className="w-4 h-4 stroke-[2.5] text-neutral-600" />
                  <span>{item.name}</span>
                </h3>
                <div className="text-xs font-mono text-neutral-500 mt-0.5">
                  Slug: /{item.slug}
                </div>
              </div>
            </CardContent>

            <div className="p-3 bg-neutral-100 border-t-[2px] border-black flex items-center justify-end">
              <Button
                variant="white"
                size="sm"
                onClick={() => handleDelete(item.id, item.name)}
                className="font-black uppercase text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                <span>HAPUS TIPE</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. MODAL TAMBAH TIPE */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="TAMBAH TIPE PRODUK BARU"
        className="max-w-md"
      >
        <form onSubmit={handleCreateType} className="space-y-4 text-left">
          <Input
            label="Nama Tipe Produk"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Weekly Diamond Pass / Turkey"
            required
          />

          <div>
            <label className="block text-xs font-black uppercase mb-1.5 text-black">
              Pilih Brand Game
            </label>
            <select
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-white border-[2px] border-black p-2.5 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nb-yellow)]"
            >
              <option value="Mobile Legends">Mobile Legends</option>
              <option value="Free Fire">Free Fire</option>
              <option value="PUBG Mobile">PUBG Mobile</option>
              <option value="Genshin Impact">Genshin Impact</option>
              <option value="Valorant">Valorant</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-[3px] border-black">
            <Button
              type="button"
              variant="white"
              size="md"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              BATAL
            </Button>
            <Button
              type="submit"
              variant="yellow"
              size="md"
              disabled={isSubmitting}
              className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
            >
              <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN TIPE 🚀'}</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
