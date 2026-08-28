import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Star, Heart, MessageSquare } from 'lucide-react';
import { 
  getBrandReviews, 
  toggleReviewLike, 
  type PublicReviewItem, 
  type ReviewSatisfactionType 
} from '../../../../utils/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export interface BrandReviewsTabProps {
  brandSlug: string;
}

export const BrandReviewsTab: React.FC<BrandReviewsTabProps> = ({ brandSlug }) => {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const [sort, setSort] = useState<'latest' | 'liked'>('latest');
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Query Brand Reviews
  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ['brandReviews', brandSlug, sort, page],
    queryFn: () => getBrandReviews(brandSlug, { page, limit, sort }),
    staleTime: 60 * 1000,
    enabled: Boolean(brandSlug),
  });

  const summary = reviewsResponse?.summary || { averageRating: 0, totalReviews: 0 };
  const reviews: PublicReviewItem[] = reviewsResponse?.data || [];
  const pagination = reviewsResponse?.pagination || { page: 1, totalPages: 1, totalReviews: 0, hasNextPage: false };

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (reviewId: number) => toggleReviewLike(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandReviews', brandSlug] });
    },
    onError: (err: any) => {
      alert(err?.message || 'Gagal memberikan like.');
    },
  });

  const handleLikeClick = (review: PublicReviewItem) => {
    if (!authUser) {
      alert('Silakan login terlebih dahulu untuk menyukai ulasan.');
      return;
    }
    likeMutation.mutate(review.id);
  };

  const formatReviewDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

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

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      
      {/* 🌟 HEADER SUMMARY REVIEW */}
      <Card variant="white" shadow="lg" className="border-[3px] border-black rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Average Rating & Total Count */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[var(--nb-yellow)] border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-black text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[var(--nb-text)]">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-[var(--nb-text-muted)]">/ 5.0</span>
              </div>
              <div className="text-xs font-bold text-[var(--nb-text-muted)]">
                Berdasarkan <b>{summary.totalReviews}</b> ulasan pembeli terverifikasi
              </div>
            </div>
          </div>

          {/* Sort Buttons (V1: TERBARU / PALING DISUKAI) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setSort('latest');
                setPage(1);
              }}
              className={`px-3 py-1.5 border-[2px] border-black font-black text-xs uppercase transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                sort === 'latest'
                  ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              TERBARU
            </button>
            <button
              type="button"
              onClick={() => {
                setSort('liked');
                setPage(1);
              }}
              className={`px-3 py-1.5 border-[2px] border-black font-black text-xs uppercase transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                sort === 'liked'
                  ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              PALING DISUKAI
            </button>
          </div>

        </div>
      </Card>

      {/* 🌟 REVIEW CARDS LIST */}
      {isLoading ? (
        <div className="p-8 text-center bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
          <span className="font-black text-xs uppercase tracking-wider text-neutral-500 animate-pulse">
            MEMUAT ULASAN PRODUK...
          </span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 text-center bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-neutral-400 stroke-[2]" />
          <h3 className="font-black text-sm uppercase text-[var(--nb-text)]">BELUM ADA ULASAN</h3>
          <p className="text-xs font-bold text-[var(--nb-text-muted)] max-w-sm mx-auto">
            Jadilah yang pertama mengulas setelah melakukan pembelian sukses di brand ini!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {reviews.map((review) => {
            const sat = getSatisfactionLabel(review.satisfaction);
            const isLiked = review.viewerHasLiked;

            return (
              <Card
                key={review.id}
                variant="white"
                shadow="md"
                className="border-[2.5px] border-black rounded-2xl p-3.5 flex flex-col justify-between gap-3 text-left transition-all hover:translate-y-[-1px]"
              >
                <div className="space-y-2">
                  
                  {/* Row 1: Anonymous Avatar + Masked Email + Date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* Default Anonymous Avatar — Always uniform for privacy */}
                      <div className="w-7 h-7 rounded-lg bg-neutral-200 border-[1.5px] border-black flex items-center justify-center shrink-0 font-black text-xs shadow-[1.5px_1.5px_0px_0px_#000]">
                        👤
                      </div>
                      <span className="font-black text-xs text-[var(--nb-text)] font-mono truncate">
                        {review.reviewerEmail}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold font-mono text-[var(--nb-text-muted)] shrink-0">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Row 2: Item Name (e.g. 86 Diamonds) */}
                  <div className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-400 truncate pl-9">
                    {review.product.name}
                  </div>

                  {/* Row 3: Rating Stars + Satisfaction Badge */}
                  <div className="flex items-center gap-2 pl-9">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 stroke-[2.5] ${
                            s <= review.rating ? 'fill-black text-black' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant={sat.tone} size="sm" className="font-black text-[9px] uppercase px-1.5 py-0.5">
                      {sat.text}
                    </Badge>
                  </div>

                  {/* Row 4: Optional Comment */}
                  {review.comment && (
                    <p className="text-xs font-bold text-[var(--nb-text)] pl-9 pt-0.5 leading-relaxed break-words m-0">
                      "{review.comment}"
                    </p>
                  )}

                </div>

                {/* Footer: Like Action Button */}
                <div className="flex items-center justify-end pt-2 border-t-[1.5px] border-dashed border-neutral-200 pl-9">
                  <button
                    type="button"
                    onClick={() => handleLikeClick(review)}
                    disabled={likeMutation.isPending}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-black rounded-lg text-xs font-black transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                      isLiked
                        ? 'bg-rose-100 text-rose-700 border-rose-600'
                        : 'bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                    aria-label={`Sukai ulasan (${review.likeCount} suka)`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 stroke-[2.5] ${
                        isLiked ? 'fill-rose-600 text-rose-600' : 'text-neutral-500'
                      }`}
                    />
                    <span className="font-mono text-[11px]">{review.likeCount}</span>
                  </button>
                </div>

              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination: Load More / Halaman Berikutnya */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <Button
              variant="white"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
            >
              SEBELUMNYA
            </Button>
          )}
          <span className="px-3 py-1 bg-white border-[2px] border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000]">
            {page} / {pagination.totalPages}
          </span>
          {pagination.hasNextPage && (
            <Button
              variant="white"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
            >
              LIHAT LEBIH BANYAK
            </Button>
          )}
        </div>
      )}

    </div>
  );
};
