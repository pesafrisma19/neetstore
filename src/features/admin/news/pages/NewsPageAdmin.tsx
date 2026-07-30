import React, { useState } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ArticleItem {
  id: number;
  title: string;
  category: 'PROMO' | 'UPDATE' | 'TOURNAMENT' | 'TIPS';
  summary: string;
  isPublished: boolean;
  publishedAt: string;
  thumbnailUrl?: string;
}

export const NewsPageAdmin: React.FC = () => {
  const { addToast } = useToast();
  const [articles, setArticles] = useState<ArticleItem[]>([
    {
      id: 1,
      title: 'EVENT DISKON MERDEKA 17 AGUSTUS - CASHBACK HINGGA 50 RIBU!',
      category: 'PROMO',
      summary: 'Dapatkan cashback langsung untuk setiap pembelian diamond Mobile Legends & Free Fire selama periode Kemerdekaan RI.',
      isPublished: true,
      publishedAt: '2026-07-28T10:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 2,
      title: 'PATCH UPDATE MLBB PROJECT NEXT TERBARU - CEK PERUBAHAN HERO!',
      category: 'UPDATE',
      summary: 'Daftar penyesuaian hero, nerf dan buff pada update Patch terbaru Mobile Legends musim ini.',
      isPublished: true,
      publishedAt: '2026-07-26T14:30:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 3,
      title: 'TURNAMEN NETSTORE CUP SEASON 5 - TOTAL PRIZEPOOL 10 JUTA RUPIAH!',
      category: 'TOURNAMENT',
      summary: 'Daftarkan tim MLBB kalian sekarang! Pendaftaran gratis untuk member setia Netstore.',
      isPublished: false,
      publishedAt: '2026-07-20T09:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800',
    },
  ]);

  const handleTogglePublish = (id: number, current: boolean) => {
    setArticles(
      articles.map((a) =>
        a.id === id ? { ...a, isPublished: !current } : a
      )
    );
    addToast({
      title: 'STATUS ARTIKEL DIUBAH',
      message: `Artikel sekarang ${!current ? 'DITERBITKAN (PUBLIK) 🟢' : 'DISEMBUNYIKAN (DRAFT) 🟡'}.`,
      type: 'success',
    });
  };

  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) return;
    setArticles(articles.filter((a) => a.id !== id));
    addToast({
      title: 'ARTIKEL DIHAPUS 🗑️',
      message: `Artikel "${title}" telah dihapus dari sistem.`,
      type: 'success',
    });
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'PROMO':
        return 'yellow';
      case 'TOURNAMENT':
        return 'cyan';
      case 'UPDATE':
        return 'mint';
      default:
        return 'pink';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              CONTENT / BLOG & NEWS
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL: {articles.length} ARTIKEL
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📰</span>
            <span>NEWS & BLOG ARTICLES</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Manajemen artikel berita, turnamen esports, patch notes, dan pengumuman promo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="cyan"
            size="md"
            onClick={() => {
              addToast({
                title: 'FITUR ARTIKEL',
                message: 'Silakan edit artikel dari daftar di bawah.',
                type: 'info',
              });
            }}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ TULIS ARTIKEL BARU</span>
          </Button>
        </div>
      </div>

      {/* 2. DAFTAR KARTU ARTIKEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((a) => (
          <Card
            key={a.id}
            variant="white"
            className={`border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden flex flex-col justify-between ${
              !a.isPublished ? 'opacity-70 bg-neutral-100' : ''
            }`}
          >
            <div>
              {/* Thumbnail */}
              <div className="relative w-full h-36 bg-neutral-900 border-b-[3px] border-black overflow-hidden">
                {a.thumbnailUrl && (
                  <img
                    src={a.thumbnailUrl}
                    alt={a.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant={getCategoryBadgeColor(a.category) as any}
                    size="sm"
                    className="border-2 font-black uppercase"
                  >
                    {a.category}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={a.isPublished ? 'mint' : 'pink'}
                    size="sm"
                    className="border-2 font-black uppercase"
                  >
                    {a.isPublished ? 'LIVE 🟢' : 'DRAFT 🟡'}
                  </Badge>
                </div>
              </div>

              {/* Konten Judul & Summary */}
              <div className="p-4 space-y-2">
                <h3 className="text-base font-black uppercase text-black line-clamp-2 leading-tight">
                  {a.title}
                </h3>
                <p className="text-xs font-bold text-neutral-600 line-clamp-3">
                  {a.summary}
                </p>
              </div>
            </div>

            {/* Footer Aksi */}
            <div className="p-4 pt-2 border-t-[2px] border-black bg-neutral-50 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-500">
                {new Date(a.publishedAt).toLocaleDateString('id-ID')}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant={a.isPublished ? 'pink' : 'mint'}
                  size="sm"
                  onClick={() => handleTogglePublish(a.id, a.isPublished)}
                  className="font-black text-[11px] px-2.5 py-1"
                  title={a.isPublished ? 'Sembunyikan' : 'Terbitkan'}
                >
                  {a.isPublished ? (
                    <EyeOff className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>{a.isPublished ? 'DRAFT' : 'PUBLISH'}</span>
                </Button>

                <Button
                  variant="white"
                  size="sm"
                  onClick={() => handleDelete(a.id, a.title)}
                  className="font-black text-[11px] px-2.5 py-1 text-red-600 hover:bg-red-50"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
