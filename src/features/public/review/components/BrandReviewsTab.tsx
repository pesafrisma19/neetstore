import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Star, Heart, MessageSquare, ArrowRight, AlertCircle } from 'lucide-react';
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
  gameId?: string;
}

export const BrandReviewsTab: React.FC<BrandReviewsTabProps> = ({ brandSlug, gameId }) => {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  // Query 5 Latest Reviews Preview (Reuses the exact background prefetch cache key)
  const {
    data: reviewsResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['brandReviewsPreview', brandSlug],
    queryFn: () => getBrandReviews(brandSlug, { page: 1, limit: 5, sort: 'latest' }),
    staleTime: 60 * 1000,
    enabled: Boolean(brandSlug),
  });

  const summary = reviewsResponse?.summary || { averageRating: 0, totalReviews: 0 };
  const reviews: PublicReviewItem[] = reviewsResponse?.data || [];

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (reviewId: number) => toggleReviewLike(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandReviewsPreview', brandSlug] });
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

  const reviewsTargetUrl = `/checkout/game/${encodeURIComponent(gameId || brandSlug)}/reviews`;

  // 1. SKELETON LOADING STATE (Eliminates blank flash & fake 0.0 rating)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 text-left font-sans">
        {/* Skeleton Header Summary */}
        <Card variant="white" shadow="lg" className="border-[3px] border-black rounded-2xl p-4 animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-neutral-200 border-[2px] border-black/20 rounded-xl" />
              <div className="space-y-2">
                <div className="w-24 h-6 bg-neutral-200 rounded" />
                <div className="w-36 h-3.5 bg-neutral-200 rounded" />
              </div>
            </div>
            <div className="hidden sm:block w-28 h-8 bg-neutral-200 rounded-lg" />
          </div>
        </Card>

        {/* Skeleton 2 Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card
              key={i}
              variant="white"
              shadow="md"
              className="border-[2.5px] border-black rounded-xl p-3 flex flex-col gap-2.5 animate-pulse"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-neutral-200" />
                  <div className="w-28 h-3.5 bg-neutral-200 rounded" />
                </div>
                <div className="w-16 h-3 bg-neutral-200 rounded" />
              </div>
              <div className="w-24 h-3 bg-neutral-200 rounded" />
              <div className="w-32 h-4 bg-neutral-200 rounded" />
              <div className="pt-1.5 border-t border-dashed border-neutral-200 flex items-center justify-between">
                <div className="w-3/4 h-3.5 bg-neutral-200 rounded" />
                <div className="w-10 h-5 bg-neutral-200 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (Friendly fallback with retry, does not break checkout)
  if (isError) {
    return (
      <div className="flex flex-col gap-4 text-left font-sans">
        <Card variant="white" shadow="md" className="p-6 text-center border-[3px] border-black rounded-2xl space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-amber-500 stroke-[2.5]" />
          <h3 className="font-black text-sm uppercase text-[var(--nb-text)]">ULASAN BELUM DAPAT DIMUAT</h3>
          <p className="text-xs font-bold text-[var(--nb-text-muted)] max-w-sm mx-auto">
            Terjadi kendala saat memuat ulasan produk. Silakan coba beberapa saat lagi.
          </p>
          <Button
            type="button"
            variant="yellow"
            size="sm"
            onClick={() => refetch()}
            className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
          >
            COBA LAGI
          </Button>
        </Card>
      </div>
    );
  }

  // 3. SUCCESS STATE (Instant Render with cached or fetched data)
  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      
      {/* 🌟 HEADER SUMMARY REVIEW (PREVIEW COMPACT) */}
      <Card variant="white" shadow="lg" className="border-[3px] border-black rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Average Rating & Total Count */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-[var(--nb-yellow)] border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-black text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[var(--nb-text)]">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-[var(--nb-text-muted)]">/ 5.0</span>
              </div>
              <div className="text-xs font-bold text-[var(--nb-text-muted)]">
                Berdasarkan <b>{summary.totalReviews}</b> ulasan
              </div>
            </div>
          </div>

          {summary.totalReviews > 0 && (
            <Link to={reviewsTargetUrl}>
              <Button
                variant="white"
                size="sm"
                className="font-black text-xs uppercase hidden sm:inline-flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
              >
                <span>LIHAT SEMUA</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Button>
            </Link>
          )}

        </div>
      </Card>

      {/* 🌟 5 LATEST REVIEW CARDS (PREVIEW) */}
      {reviews.length === 0 ? (
        <div className="p-6 text-center bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-2">
          <MessageSquare className="w-7 h-7 mx-auto text-neutral-400 stroke-[2]" />
          <h3 className="font-black text-xs uppercase text-[var(--nb-text)]">BELUM ADA ULASAN</h3>
          <p className="text-xs font-bold text-[var(--nb-text-muted)] max-w-sm mx-auto">
            Jadilah yang pertama mengulas setelah melakukan pembelian sukses di brand ini!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reviews.map((review) => {
            const sat = getSatisfactionLabel(review.satisfaction);
            const isLiked = review.viewerHasLiked;

            return (
              <Card
                key={review.id}
                variant="white"
                shadow="md"
                className="border-[2.5px] border-black rounded-xl p-3 flex flex-col gap-2 text-left transition-all hover:translate-y-[-1px]"
              >
                {/* Row 1: Avatar + Masked Email (left) | Date (right) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Default Anonymous Avatar */}
                    <div className="w-6 h-6 rounded-md bg-neutral-200 border-[1.5px] border-black flex items-center justify-center shrink-0 font-black text-[11px] shadow-[1px_1px_0px_0px_#000]">
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
                <div className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-400 truncate">
                  {review.product.name}
                </div>

                {/* Row 3: Rating Stars + Satisfaction Badge */}
                <div className="flex items-center gap-2">
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

                {/* Row 4: Komentar (kiri) + Like (kanan) */}
                <div className="flex items-end justify-between gap-2 pt-1 border-t border-dashed border-neutral-200">
                  <div className="min-w-0 flex-1">
                    {review.comment ? (
                      <p className="text-xs font-bold text-[var(--nb-text)] leading-relaxed break-words m-0">
                        "{review.comment}"
                      </p>
                    ) : (
                      <span className="text-[11px] font-bold text-[var(--nb-text-muted)] italic">
                        Tanpa komentar
                      </span>
                    )}
                  </div>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleLikeClick(review)}
                    disabled={likeMutation.isPending}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 border-[1.5px] border-black rounded-md text-xs font-black transition-all cursor-pointer shadow-[1px_1px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] shrink-0 ${
                      isLiked
                        ? 'bg-rose-100 text-rose-700 border-rose-600'
                        : 'bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                    aria-label={`Sukai ulasan (${review.likeCount} suka)`}
                  >
                    <Heart
                      className={`w-3 h-3 stroke-[2.5] ${
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

      {/* 🌟 TOMBOL LIHAT SEMUA ULASAN */}
      {summary.totalReviews > 0 && (
        <div className="pt-2">
          <Link to={reviewsTargetUrl} className="block w-full">
            <Button
              type="button"
              variant="yellow"
              size="md"
              fullWidth
              className="font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center gap-2"
            >
              <span>LIHAT SEMUA ({summary.totalReviews}) ULASAN</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
};
