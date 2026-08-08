import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanners, type Banner } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';

const BannerSkeleton: React.FC = () => (
  <div className="w-full aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] bg-gray-200 animate-pulse rounded-2xl border-[4px] border-black" />
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
  const loading = isLoading;

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

  // Undi warna neon acak untuk bingkai dan shadow ke-3 banner serta tombol navigasi (WAJIB di atas sebelum return awal agar tidak melanggar Rules of Hooks)
  const { leftTone, centerTone, rightTone, btnTone } = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const shuffled = [...tones].sort(() => Math.random() - 0.5);
    return {
      leftTone: shuffled[0],
      centerTone: shuffled[1],
      rightTone: shuffled[2],
      btnTone: shuffled[3],
    };
  }, []);

  if (loading) return <BannerSkeleton />;
  if (banners.length === 0) return null;

  // Jika cuma 1 banner, tampilkan center biasa
  if (banners.length === 1) {
    const active = banners[0];
    return (
      <div
        className="relative w-full max-w-7xl mx-auto aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] rounded-2xl overflow-hidden border-[3.5px] sm:border-[4px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1.5 sm:p-2.5"
        style={{
          boxShadow: `8px 8px 0px 0px var(--nb-shadow-${centerTone})`,
        }}
      >
        {active.title && (
          <div className="absolute top-3.5 left-3.5 z-40 pointer-events-none">
            <Badge
              variant={centerTone as any}
              size="sm"
              className="border-[2.5px] border-black font-black text-[10px] sm:text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
            >
              {active.title}
            </Badge>
          </div>
        )}
        <a href={active.linkUrl || '#'} className="block w-full h-full overflow-hidden rounded-lg sm:rounded-xl">
          <img
            src={active.imageUrl}
            alt={active.title || 'Promo Banner'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </a>
      </div>
    );
  }

  // Hitung indeks 3 banner: Kiri (prev), Tengah (active), Kanan (next)
  const prevIndex = (current - 1 + banners.length) % banners.length;
  const currentIndex = current;
  const nextIndex = (current + 1) % banners.length;

  const prevBanner = banners[prevIndex];
  const activeBanner = banners[currentIndex];
  const nextBanner = banners[nextIndex];

  return (
    <div className="relative w-full max-w-7xl mx-auto aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] overflow-hidden select-none group py-2">
      {/* 3D Coverflow Container */}
      <div className="relative w-full h-full flex items-center justify-center">

        {/* ⬅️ BANNER KIRI (PREV) - Tertimpa di belakang kiri */}
        <div
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[65%] sm:w-[58%] md:w-[52%] h-[82%] z-10 -translate-x-[22%] sm:-translate-x-[16%] scale-90 opacity-60 hover:opacity-95 transition-all duration-500 ease-out cursor-pointer overflow-hidden rounded-2xl border-[3.5px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1.5 sm:p-2"
          style={{
            boxShadow: `4px 4px 0px 0px var(--nb-shadow-${leftTone})`,
          }}
          title="Lihat banner sebelumnya"
        >
          <div className="w-full h-full overflow-hidden rounded-lg sm:rounded-xl">
            <img
              src={prevBanner.imageUrl}
              alt="Banner Sebelumnya"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* ➡️ BANNER KANAN (NEXT) - Tertimpa di belakang kanan */}
        <div
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[65%] sm:w-[58%] md:w-[52%] h-[82%] z-10 translate-x-[22%] sm:translate-x-[16%] scale-90 opacity-60 hover:opacity-95 transition-all duration-500 ease-out cursor-pointer overflow-hidden rounded-2xl border-[3.5px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1.5 sm:p-2"
          style={{
            boxShadow: `4px 4px 0px 0px var(--nb-shadow-${rightTone})`,
          }}
          title="Lihat banner berikutnya"
        >
          <div className="w-full h-full overflow-hidden rounded-lg sm:rounded-xl">
            <img
              src={nextBanner.imageUrl}
              alt="Banner Berikutnya"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* 👑 BANNER TENGAH (AKTIF / FOKUS UTAMA) - Paling Besar di Depan */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] sm:w-[75%] md:w-[68%] h-full z-30 scale-100 opacity-100 transition-all duration-500 ease-out overflow-hidden rounded-2xl border-[4px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1.5 sm:p-2.5"
          style={{
            boxShadow: `8px 8px 0px 0px var(--nb-shadow-${centerTone})`,
          }}
        >
          {activeBanner.title && (
            <div className="absolute top-3.5 left-3.5 z-40 pointer-events-none">
              <Badge
                variant={centerTone as any}
                size="sm"
                className="border-[2.5px] border-black font-black text-[10px] sm:text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
              >
                {activeBanner.title}
              </Badge>
            </div>
          )}
          <a
            href={activeBanner.linkUrl || '#'}
            className="block w-full h-full overflow-hidden rounded-lg sm:rounded-xl"
            aria-label="Lihat promo utama"
          >
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title || `Promo Banner ${currentIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </a>
        </div>

      </div>

      {/* Tombol Panah Kiri & Kanan (Z-40 di atas semua banner) */}
      <button
        type="button"
        onClick={prev}
        aria-label="Banner sebelumnya"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-white border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all cursor-pointer font-black"
        style={{
          ['--hover-bg' as any]: `var(--nb-${btnTone})`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = `var(--nb-${btnTone})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = '';
        }}
      >
        <ChevronLeft className="w-6 h-6 stroke-[3]" />
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Banner berikutnya"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-white border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all cursor-pointer font-black"
        style={{
          ['--hover-bg' as any]: `var(--nb-${btnTone})`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = `var(--nb-${btnTone})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = '';
        }}
      >
        <ChevronRight className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Titik Indikator (Pagination Dots) di bawah */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Ke banner ${i + 1}`}
            className={`h-2.5 rounded-none border-[2px] border-[var(--nb-border)] transition-all cursor-pointer`}
            style={{
              backgroundColor: i === currentIndex ? `var(--nb-${centerTone})` : '#ffffff',
              width: i === currentIndex ? '32px' : '10px',
              boxShadow: i === currentIndex ? `2px 2px 0px 0px var(--nb-shadow-${centerTone})` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};

