import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanners, type Banner } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';

const BannerSkeleton: React.FC = () => (
  <div className="w-full aspect-[16/7] sm:aspect-[24/9] bg-neutral-200 animate-pulse rounded-2xl border-[3px] sm:border-[3.5px] border-black shadow-[4px_4px_0px_0px_#000]" />
);

export const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: bannerData, isLoading } = useQuery<Banner[]>({
    queryKey: queryKeys.public.banners.all,
    queryFn: async () => {
      const data = await getBanners();
      if (!Array.isArray(data)) {
        throw new Error('Invalid /banners response: expected array');
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const banners = bannerData || [];

  // Auto-slide setiap 4.5 detik jika lebih dari 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners]);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  // Random Neo-Brutalist shadow color accent
  const shadowTone = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  if (isLoading) return <BannerSkeleton />;
  if (banners.length === 0) return null;

  const activeBanner = banners[current] || banners[0];

  return (
    <div
      className="relative w-full aspect-[16/7] sm:aspect-[24/9] rounded-2xl overflow-hidden border-[3px] sm:border-[3.5px] border-black bg-[var(--nb-surface)] select-none group"
      style={{
        boxShadow: `4px 4px 0px 0px var(--nb-shadow-${shadowTone})`,
      }}
    >
      {/* 🌟 1. GAMBAR BANNER AKTIF */}
      <a
        href={activeBanner.linkUrl || '#'}
        className="block w-full h-full overflow-hidden"
        aria-label={activeBanner.title || 'Promo Banner'}
      >
        <img
          src={activeBanner.imageUrl}
          alt={activeBanner.title || 'Promo Banner'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </a>

      {/* 🌟 2. BADGE JUDUL BANNER (JIKA ADA) */}
      {activeBanner.title && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
          <Badge
            variant={shadowTone as any}
            size="sm"
            className="border-[2px] border-black font-black text-[10px] sm:text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
          >
            {activeBanner.title}
          </Badge>
        </div>
      )}

      {/* 🌟 3. TOMBOL PANAH NAVIGASI OVERLAY (HANYA JIKA > 1 BANNER) */}
      {banners.length > 1 && (
        <>
          {/* Panah Kiri */}
          <button
            type="button"
            onClick={prev}
            aria-label="Banner sebelumnya"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 bg-white/90 hover:bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all cursor-pointer font-black"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>

          {/* Panah Kanan */}
          <button
            type="button"
            onClick={next}
            aria-label="Banner berikutnya"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 bg-white/90 hover:bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all cursor-pointer font-black"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>

          {/* 🌟 4. DOTS PAGINATION COMPACT */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-black/30">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Ke banner ${i + 1}`}
                className={`h-2 rounded-full border border-black/50 transition-all cursor-pointer ${
                  i === current
                    ? 'w-5 bg-[var(--nb-yellow)] border-black'
                    : 'w-2 bg-white/80 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
