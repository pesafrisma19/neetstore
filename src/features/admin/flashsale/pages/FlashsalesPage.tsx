import React, { useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Zap, 
  Trash2, 
  Calendar,
  Clock,
  Percent
} from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';

export interface FlashsaleCampaign {
  id: number;
  name: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  itemCount: number;
}

export const FlashsalesPage: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<FlashsaleCampaign[]>([
    {
      id: 1,
      name: 'FLASHSALE SPESIAL MERDEKA 17 AGUSTUS',
      bannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
      startTime: '2026-08-16T17:00:00Z',
      endTime: '2026-08-18T16:59:59Z',
      isActive: true,
      itemCount: 15,
    },
    {
      id: 2,
      name: 'WEEKEND CRAZY DIAMOND DISKON 30%',
      bannerUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=800',
      startTime: '2026-07-25T00:00:00Z',
      endTime: '2026-07-31T23:59:59Z',
      isActive: true,
      itemCount: 8,
    },
  ]);

  const handleToggleActive = (id: number, current: boolean) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === id ? { ...c, isActive: !current } : c
      )
    );
    addToast({
      title: 'STATUS FLASHSALE DIUBAH',
      message: `Kampanye Flashsale sekarang ${!current ? 'AKTIF ⚡' : 'NON-AKTIF'}.`,
      type: 'success',
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kampanye "${name}"?`)) return;
    setCampaigns(campaigns.filter((c) => c.id !== id));
    addToast({
      title: 'FLASHSALE DIHAPUS 🗑️',
      message: `Kampanye Flashsale "${name}" dihapus dari sistem.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              PROMOTION & CAMPAIGN
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL: {campaigns.length} CAMPAIGNS
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>⚡</span>
            <span>FLASHSALE CAMPAIGNS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Manajemen event promosi berjangka waktu dengan hitung mundur (countdown timer) & kuota diskon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="purple"
            size="md"
            onClick={() => {
              addToast({
                title: 'INFO FLASHSALE',
                message: 'Silakan aktifkan atau atur diskon produk pada menu Produk.',
                type: 'info',
              });
            }}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <Zap className="w-4 h-4 stroke-[3]" />
            <span>+ BUAT KAMPANYE BARU</span>
          </Button>
        </div>
      </div>

      {/* 2. DAFTAR KAMPANYE FLASHSALE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => (
          <Card
            key={c.id}
            variant="white"
            className={`border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden transition-all ${
              !c.isActive ? 'opacity-60 bg-neutral-100' : ''
            }`}
          >
            {/* Header / Banner */}
            <div className="relative w-full h-36 bg-neutral-900 border-b-[4px] border-black overflow-hidden flex items-center justify-center">
              {c.bannerUrl && (
                <img
                  src={c.bannerUrl}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Badge
                  variant={c.isActive ? 'mint' : 'pink'}
                  size="sm"
                  className="border-2 font-black uppercase shadow-[2px_2px_0px_0px_#000]"
                >
                  {c.isActive ? 'RUNNING 🟢' : 'STOPPED 🔴'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-black uppercase text-black leading-tight">
                  {c.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 mt-2">
                  <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>
                    {new Date(c.startTime).toLocaleDateString('id-ID')} -{' '}
                    {new Date(c.endTime).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-yellow-50 border-[2px] border-black text-xs font-bold">
                <span className="flex items-center gap-1 text-black">
                  <Percent className="w-3.5 h-3.5 stroke-[3] text-red-600" />
                  <span>Produk Ikut Serta:</span>
                </span>
                <Badge variant="cyan" size="sm" className="font-mono font-black">
                  {c.itemCount} SKU PRODUK
                </Badge>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-black">
                <Button
                  variant={c.isActive ? 'pink' : 'mint'}
                  size="sm"
                  onClick={() => handleToggleActive(c.id, c.isActive)}
                  className="font-black uppercase text-xs"
                >
                  <Clock className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{c.isActive ? 'NONAKTIFKAN' : 'AKTIFKAN'}</span>
                </Button>

                <Button
                  variant="white"
                  size="sm"
                  onClick={() => handleDelete(c.id, c.name)}
                  className="font-black uppercase text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                  <span>HAPUS</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
