import React, { useState } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Star, Trash2 } from 'lucide-react';
import { useToast } from '../../../../components/ui/ToastContext';

export interface ReviewItem {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { username: string };
  product: { name: string };
}

export const ReviewsPage: React.FC = () => {
  const { addToast } = useToast();
  // Dummy data as there is no backend endpoint yet
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 1,
      userId: 101,
      productId: 5,
      rating: 5,
      comment: 'Mantap banget proses masuknya cepet! Gak sampai 1 menit diamond MLBB langsung landing.',
      createdAt: '2026-07-28T10:00:00Z',
      user: { username: 'gamer_pro123' },
      product: { name: 'MLBB 86 Diamonds' }
    },
    {
      id: 2,
      userId: 102,
      productId: 8,
      rating: 4,
      comment: 'Lumayan murah dari toko sebelah, cuma tadi webnya agak nge-lag pas bayar.',
      createdAt: '2026-07-28T09:15:00Z',
      user: { username: 'sultan_muda' },
      product: { name: 'FF 140 Diamonds' }
    }
  ]);

  const handleDelete = (id: number) => {
    if (!window.confirm('Hapus ulasan ini?')) return;
    setReviews(reviews.filter(r => r.id !== id));
    addToast({ title: 'ULASAN DIHAPUS', message: 'Ulasan berhasil dihapus dari sistem.', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm" className="border-2 font-black uppercase mb-2">
            MODERATION
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>⭐</span>
            <span>REVIEWS & RATINGS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Moderasi ulasan produk dan rating bintang dari pembeli.
          </p>
        </div>
      </div>

      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>DAFTAR ULASAN PENGGUNA</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                <th className="p-3 w-16">ID</th>
                <th className="p-3">User & Produk</th>
                <th className="p-3">Rating</th>
                <th className="p-3 max-w-[400px]">Komentar (Kesan)</th>
                <th className="p-3">Waktu</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-black text-sm font-bold">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-yellow-50 transition-colors">
                  <td className="p-3 font-mono">#{r.id}</td>
                  <td className="p-3">
                    <div className="font-black text-black">{r.user.username}</div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">{r.product.name}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-neutral-700 max-w-[400px]">
                    "{r.comment}"
                  </td>
                  <td className="p-3 text-xs font-mono text-neutral-500">
                    {new Date(r.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      className="font-black text-[10px] px-2 py-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
