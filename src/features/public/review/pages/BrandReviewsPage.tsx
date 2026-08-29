import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { 
  Star, 
  Heart, 
  MessageSquare, 
  ChevronLeft, 
  ArrowLeft,
  Sparkles,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { 
  getBrandReviews, 
  toggleReviewLike, 
  type PublicReviewItem, 
  type ReviewSatisfactionType 
} from '../../../../utils/api';
import { checkoutApi } from '../../checkout/services/checkout.api';
import { useAuth } from '../../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const BrandReviewsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const cleanGameId = gameId || '';
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  // 1. URL State Management
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('sort');
  const ratingParam = searchParams.get('rating');
  const pageParam = searchParams.get('page');

  const sort = sortParam === 'liked' ? 'liked' : 'latest';
  const selectedRating = ratingParam && ['1', '2', '3', '4', '5'].includes(ratingParam) 
    ? parseInt(ratingParam, 10) 
    : undefined;
  const page = pageParam && parseInt(pageParam, 10) > 0 
    ? parseInt(pageParam, 10) 
    : 1;
  const limit = 12;

  // Helper untuk update search params tanpa reload
  const updateParams = (newParams: { sort?: string; rating?: number | null; page?: number }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      if (newParams.sort !== undefined) {
        if (newParams.sort === 'latest') next.delete('sort');
        else next.set('sort', newParams.sort);
      }
      
      if (newParams.rating !== undefined) {
        if (newParams.rating === null || newParams.rating === undefined) next.delete('rating');
        else next.set('rating', String(newParams.rating));
      }
      
      if (newParams.page !== undefined) {
        if (newParams.page === 1) next.delete('page');
        else next.set('page', String(newParams.page));
      }
      
      return next;
    }, { replace: true });
  };

  const handleRatingFilterChange = (ratingVal?: number) => {
    updateParams({ rating: ratingVal ?? null, page: 1 });
  };

  const handleSortChange = (sortVal: 'latest' | 'liked') => {
    updateParams({ sort: sortVal, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Fetch Brand Data for Title
  const { data: brandData } = useQuery({
    queryKey: ['brand', cleanGameId],
    queryFn: () => checkoutApi.getBrandBySlug(cleanGameId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(cleanGameId),
  });

  const brandSlug = brandData?.slug || cleanGameId;
  const brandTitle = brandData?.name || cleanGameId.replace(/-/g, ' ').toUpperCase();

  // 3. Fetch Paginated Brand Reviews with Filter & Sort
  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ['brandReviewsDedicated', brandSlug, sort, selectedRating, page],
    queryFn: () => getBrandReviews(brandSlug, { page, limit, sort, rating: selectedRating }),
    staleTime: 60 * 1000,
    enabled: Boolean(brandSlug),
  });

  const summary = reviewsResponse?.summary || { averageRating: 0, totalReviews: 0 };
  const reviews: PublicReviewItem[] = reviewsResponse?.data || [];
  const pagination = reviewsResponse?.pagination || { page: 1, totalPages: 1, totalReviews: 0, hasNextPage: false };

  // 4. Like Mutation
  const likeMutation = useMutation({
    mutationFn: (reviewId: number) => toggleReviewLike(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandReviewsDedicated', brandSlug] });
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
    <div className="min-h-screen flex flex-col bg-[var(--nb-background)] text-[var(--nb-text)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Back Navigation to Checkout */}
        <div className="flex items-center justify-between">
          <Link to={`/checkout/game/${encodeURIComponent(cleanGameId)}`}>
            <Button
              variant="white"
              size="sm"
              className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>KEMBALI KE HALAMAN TOP UP</span>
            </Button>
          </Link>
        </div>

        {/* 🌟 HEADER SUMMARY REVIEW */}
        <Card variant="white" shadow="lg" className="border-[3px] border-black rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            
            {/* Title & Overall Rating Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider text-[var(--nb-text-muted)]">
                  SEMUA ULASAN PRODUK
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-[var(--nb-text)] tracking-tight m-0">
                {brandTitle}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 bg-[var(--nb-yellow)] border-[2px] border-black rounded-xl shadow-[2px_2px_0px_0px_#000] flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 fill-black text-black stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-[var(--nb-text)] leading-none">
                      {summary.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-[var(--nb-text-muted)]">/ 5.0</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--nb-text-muted)] mt-0.5">
                    Berdasarkan <b>{summary.totalReviews}</b> ulasan
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* 🌟 FILTER RATING & SORTING CONTROLS */}
        <Card variant="white" shadow="md" className="border-[2.5px] border-black rounded-xl p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* FILTER RATING */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[var(--nb-text-muted)] shrink-0">
                <Filter className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>FILTER RATING:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* SEMUA */}
                <button
                  type="button"
                  onClick={() => handleRatingFilterChange(undefined)}
                  className={`px-3 py-1 border-[2px] border-black font-black text-xs uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] rounded-md ${
                    selectedRating === undefined
                      ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  SEMUA
                </button>

                {/* 5★, 4★, 3★, 2★, 1★ */}
                {[5, 4, 3, 2, 1].map((starVal) => {
                  const isActive = selectedRating === starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => handleRatingFilterChange(starVal)}
                      className={`px-2.5 py-1 border-[2px] border-black font-black text-xs uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] rounded-md flex items-center gap-1 ${
                        isActive
                          ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span>{starVal}</span>
                      <Star className="w-3 h-3 fill-black text-black stroke-[2]" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* URUTKAN */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-dashed border-neutral-200">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[var(--nb-text-muted)] shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>URUTKAN:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSortChange('latest')}
                  className={`px-3 py-1 border-[2px] border-black font-black text-xs uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] rounded-md ${
                    sort === 'latest'
                      ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  TERBARU
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('liked')}
                  className={`px-3 py-1 border-[2px] border-black font-black text-xs uppercase transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] rounded-md ${
                    sort === 'liked'
                      ? 'bg-[var(--nb-yellow)] text-black ring-1 ring-black'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  PALING DISUKAI
                </button>
              </div>
            </div>

          </div>
        </Card>

        {/* 🌟 REVIEW CARDS GRID */}
        {isLoading ? (
          <div className="p-12 text-center bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <span className="font-black text-xs uppercase tracking-wider text-neutral-500 animate-pulse">
              MEMUAT ULASAN...
            </span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-3">
            <MessageSquare className="w-10 h-10 mx-auto text-neutral-400 stroke-[2]" />
            {selectedRating !== undefined ? (
              <>
                <h3 className="font-black text-sm uppercase text-[var(--nb-text)]">
                  TIDAK ADA ULASAN BINTANG {selectedRating}
                </h3>
                <p className="text-xs font-bold text-[var(--nb-text-muted)] max-w-sm mx-auto">
                  Belum ada pembeli yang memberikan rating {selectedRating} bintang untuk brand ini.
                </p>
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => handleRatingFilterChange(undefined)}
                  className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] mt-2"
                >
                  TAMPILKAN SEMUA RATING
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-black text-sm uppercase text-[var(--nb-text)]">BELUM ADA ULASAN</h3>
                <p className="text-xs font-bold text-[var(--nb-text-muted)] max-w-sm mx-auto">
                  Belum ada ulasan yang diberikan untuk brand ini.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {reviews.map((review) => {
              const sat = getSatisfactionLabel(review.satisfaction);
              const isLiked = review.viewerHasLiked;

              return (
                <Card
                  key={review.id}
                  variant="white"
                  shadow="md"
                  className="border-[2.5px] border-black rounded-xl p-3.5 flex flex-col gap-2 text-left transition-all hover:translate-y-[-1px]"
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
                  <div className="flex items-end justify-between gap-2 pt-1.5 border-t border-dashed border-neutral-200">
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
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-[1.5px] border-black rounded-md text-xs font-black transition-all cursor-pointer shadow-[1px_1px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] shrink-0 ${
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

        {/* 🌟 PAGINATION CONTROLS */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {page > 1 && (
              <Button
                variant="white"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3] mr-1" />
                <span>SEBELUMNYA</span>
              </Button>
            )}
            <span className="px-3.5 py-1.5 bg-white border-[2px] border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000]">
              {page} / {pagination.totalPages}
            </span>
            {pagination.hasNextPage && (
              <Button
                variant="white"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                className="font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                <span>SELANJUTNYA</span>
                <ChevronLeft className="w-4 h-4 stroke-[3] ml-1 rotate-180" />
              </Button>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
