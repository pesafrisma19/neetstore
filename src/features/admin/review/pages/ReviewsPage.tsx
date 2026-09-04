import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Star, Trash2, Heart, Search, RefreshCw, AlertCircle, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { useToast } from '../../../../components/ui/ToastContext';
import {
  getAdminReviews,
  deleteAdminReview,
  type AdminReviewItem,
  type ReviewSatisfactionType,
} from '../../../../utils/api';

export const ReviewsPage: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [reviewToDelete, setReviewToDelete] = useState<AdminReviewItem | null>(null);

  // Fetch real reviews with TanStack Query
  const {
    data: reviewsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-reviews', page, search, selectedRating],
    queryFn: () => getAdminReviews({
      page,
      limit: 15,
      search: search.trim() || undefined,
      rating: selectedRating,
    }),
    staleTime: 30 * 1000,
  });

  const reviews: AdminReviewItem[] = reviewsResponse?.data || [];
  const pagination = reviewsResponse?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  // Real Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      addToast({
        title: 'ULASAN DIHAPUS',
        message: 'Ulasan berhasil dihapus dari database.',
        type: 'success',
      });
      setReviewToDelete(null);
    },
    onError: (err: any) => {
      addToast({
        title: 'GAGAL MENGHAPUS',
        message: err?.message || 'Terjadi kesalahan saat menghapus ulasan.',
        type: 'error',
      });
    },
  });

  const getSatisfactionLabel = (satisfaction: ReviewSatisfactionType) => {
    switch (satisfaction) {
      case 'KURANG_PUAS':
        return { text: 'Kurang Puas', tone: 'pink' as const };
      case 'PUAS':
        return { text: 'Puas', tone: 'yellow' as const };
      case 'SANGAT_PUAS':
      default:
        return { text: 'Sangat Puas', tone: 'mint' as const };
    }
  };

  const handleRatingFilter = (rating?: number) => {
    setSelectedRating(rating);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* Header Banner */}
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
            Moderasi ulasan produk dan rating bintang dari pembeli secara langsung (Real-Time Database).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="mint" size="lg" className="border-[2.5px] border-black font-mono font-black shadow-[3px_3px_0px_0px_#000]">
            TOTAL: {pagination.total} ULASAN
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari user, komentar, produk, atau invoice..."
              className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-white border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000] outline-none focus:bg-yellow-50 transition-all placeholder:text-neutral-400"
            />
          </div>

          {/* Rating Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-black uppercase text-neutral-600 mr-1">RATING:</span>
            <button
              type="button"
              onClick={() => handleRatingFilter(undefined)}
              className={`px-2.5 py-1 border-[2px] border-black text-xs font-black uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] ${
                selectedRating === undefined
                  ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              SEMUA
            </button>
            {[5, 4, 3, 2, 1].map((rVal) => (
              <button
                key={rVal}
                type="button"
                onClick={() => handleRatingFilter(rVal)}
                className={`px-2.5 py-1 border-[2px] border-black text-xs font-black uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1 ${
                  selectedRating === rVal
                    ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <span>{rVal}</span>
                <Star className="w-3 h-3 fill-black text-black stroke-[2]" />
              </button>
            ))}
          </div>

        </div>
      </Card>

      {/* Main Table Card */}
      <Card variant="white" className="border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="p-4 bg-neutral-900 text-white border-b-[3px] border-black flex items-center justify-between">
          <h3 className="text-sm font-black uppercase flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>DAFTAR ULASAN DARI PENGGUNA ({pagination.total})</span>
          </h3>
          <Button
            variant="white"
            size="sm"
            onClick={() => refetch()}
            className="font-black text-[10px] uppercase py-1 px-2.5 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>REFRESH</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[var(--nb-yellow)] stroke-[3]" />
            <p className="font-black text-xs uppercase tracking-wider text-neutral-500">
              Memuat data ulasan dari database...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-red-600 stroke-[2.5]" />
            <p className="font-black text-xs text-red-600 uppercase tracking-wider">
              {(error as any)?.message || 'Gagal memuat ulasan pengguna.'}
            </p>
            <Button variant="yellow" size="sm" onClick={() => refetch()} className="font-black text-xs uppercase">
              COBA LAGI
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 mx-auto text-neutral-400 stroke-[2]" />
            <h4 className="font-black text-sm uppercase text-neutral-800">BELUM ADA ULASAN</h4>
            <p className="text-xs font-bold text-neutral-500 max-w-sm mx-auto">
              {search || selectedRating !== undefined
                ? 'Tidak ada ulasan yang cocok dengan kriteria pencarian / filter Anda.'
                : 'Belum ada pembeli yang memberikan ulasan produk di database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-[2px] border-black text-left text-xs font-black uppercase">
                  <th className="p-3 w-16">ID</th>
                  <th className="p-3">User & Transaksi</th>
                  <th className="p-3">Produk & Brand</th>
                  <th className="p-3">Rating & Kepuasan</th>
                  <th className="p-3 max-w-[320px]">Komentar</th>
                  <th className="p-3">Waktu & Suka</th>
                  <th className="p-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[2px] divide-black text-sm font-bold">
                {reviews.map((r) => {
                  const sat = getSatisfactionLabel(r.satisfaction);
                  return (
                    <tr key={r.id} className="hover:bg-yellow-50/60 transition-colors">
                      {/* ID */}
                      <td className="p-3 font-mono text-xs">#{r.id}</td>

                      {/* User & Transaksi */}
                      <td className="p-3">
                        <div className="font-black text-black">
                          {r.user?.username || 'Guest / Tanpa Akun'}
                        </div>
                        {r.user?.email && (
                          <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[150px]">
                            {r.user.email}
                          </div>
                        )}
                        {r.transactionRef && (
                          <div className="text-[9px] font-mono font-black text-indigo-700 mt-0.5">
                            TRX: {r.transactionRef}
                          </div>
                        )}
                      </td>

                      {/* Produk & Brand */}
                      <td className="p-3">
                        <div className="font-black text-black text-xs">{r.product.name}</div>
                        {r.product.brand && (
                          <Badge variant="cyan" size="sm" className="font-black text-[9px] uppercase px-1 py-0 mt-0.5">
                            {r.product.brand.name}
                          </Badge>
                        )}
                      </td>

                      {/* Rating & Kepuasan */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-mono font-black ml-1">({r.rating}/5)</span>
                        </div>
                        <Badge variant={sat.tone} size="sm" className="font-black text-[9px] uppercase px-1.5 py-0.5">
                          {sat.text}
                        </Badge>
                      </td>

                      {/* Komentar */}
                      <td className="p-3 text-xs text-neutral-700 max-w-[320px]">
                        {r.comment ? (
                          <p className="m-0 leading-relaxed font-bold break-words">
                            "{r.comment}"
                          </p>
                        ) : (
                          <span className="text-[11px] font-bold text-neutral-400 italic">
                            Tanpa komentar
                          </span>
                        )}
                      </td>

                      {/* Waktu & Like */}
                      <td className="p-3">
                        <div className="text-xs font-mono text-neutral-600">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {r.likeCount > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-mono font-black text-rose-600 mt-1">
                            <Heart className="w-3 h-3 fill-rose-600 text-rose-600" />
                            <span>{r.likeCount} suka</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="p-3 text-center">
                        <Button
                          variant="white"
                          size="sm"
                          onClick={() => setReviewToDelete(r)}
                          className="font-black text-[10px] px-2 py-1 text-red-600 hover:bg-red-50 border-[2px] border-black shadow-[1.5px_1.5px_0px_0px_#000]"
                          title="Hapus Ulasan"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-3 bg-neutral-50 border-t-[2px] border-black flex items-center justify-between gap-2">
            <Button
              variant="white"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || isLoading}
              className="font-black text-xs uppercase flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
              <span>SEBELUMNYA</span>
            </Button>

            <span className="font-mono font-black text-xs">
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
            </span>

            <Button
              variant="white"
              size="sm"
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={page >= pagination.totalPages || isLoading}
              className="font-black text-xs uppercase flex items-center gap-1"
            >
              <span>SELANJUTNYA</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={() => {
          if (reviewToDelete) {
            deleteMutation.mutate(reviewToDelete.id);
          }
        }}
        title="HAPUS ULASAN?"
        description={
          reviewToDelete
            ? `Apakah Anda yakin ingin menghapus ulasan ID #${reviewToDelete.id} dari "${reviewToDelete.user?.username || 'Guest'}" untuk produk "${reviewToDelete.product.name}"? Tindakan ini akan menghapus ulasan secara permanen dari database.`
            : 'Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.'
        }
        confirmLabel="HAPUS"
        cancelLabel="BATAL"
        confirmVariant="pink"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
