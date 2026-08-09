import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge } from '../../../../components/ui/Badge';
import { Zap, Clock } from 'lucide-react';
import { getPublicFlashsales } from '../../../../utils/api';

// Helper Countdown Timer Per-Product
const CardCountdownTimer: React.FC<{ targetDate: string | Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="mt-1.5 flex items-center justify-center gap-0.5 bg-black text-yellow-300 px-1 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] rounded-xs font-mono font-black text-[10px] w-full text-center">
      <Clock className="w-2.5 h-2.5 stroke-[3] shrink-0 text-red-500 animate-pulse" />
      <span>
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
};

export const FlashsaleSection: React.FC = () => {
  // Fetch active flashsale items from backend
  const { data: flashsales = [], isLoading } = useQuery({
    queryKey: ['public', 'flashsales', 'active'],
    queryFn: getPublicFlashsales,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Random Neo-Brutalist Theme Color Accents untuk Badge & Card Pop
  const themeColors = useMemo(() => ['pink', 'cyan', 'yellow', 'mint', 'purple'] as const, []);

  if (isLoading || !Array.isArray(flashsales) || flashsales.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 text-left font-sans">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-3 sm:p-5 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
        
        {/* Header Section Flashsale */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 border-[2px] border-black shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-4 h-4 fill-current text-yellow-300 animate-bounce" />
              <span className="font-black text-xs sm:text-sm uppercase tracking-wider">FLASHSALE SPESIAL</span>
            </div>
            <Badge variant="white" size="sm" className="border-2 font-mono font-black text-[11px] hidden sm:inline-block">
              {flashsales.length} ITEM PROMO
            </Badge>
          </div>

          <span className="text-[11px] font-black uppercase text-black/80 font-mono">
            LIVE PROMO ⚡
          </span>
        </div>

        {/* Responsive Grid: Mobile 2 kolom (grid-cols-2), PC 6 kolom (lg:grid-cols-6) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {flashsales.map((fs: any, index: number) => {
            const prod = fs.product || {};
            const brand = prod.brand || {};
            const realPrice = fs.realPrice || prod.priceUser || 0;
            const displayOriginalPrice = fs.displayOriginalPrice || Math.round(realPrice / (1 - (fs.displayPercent || 10) / 100));
            const brandSlug = brand.slug || 'game';
            
            // Random theme color per card
            const colorVariant = themeColors[index % themeColors.length];

            return (
              <Link
                key={fs.id}
                to={`/checkout/game/${brandSlug}?productId=${prod.id}`}
                className="group block transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-2.5 flex flex-row items-stretch justify-between h-full group-hover:shadow-[6px_6px_0px_0px_#000] relative">
                  
                  {/* SISI KIRI: Gambar Brand + Badge Menonjol Out + Countdown di bawahnya */}
                  <div className="w-2/5 shrink-0 flex flex-col items-center justify-between pr-2">
                    
                    {/* Frame Gambar Thumbnail */}
                    <div className="relative w-full aspect-square bg-neutral-900 border-[2px] border-black overflow-visible">
                      {brand.thumbnail || brand.bannerUrl ? (
                        <img
                          src={brand.thumbnail || brand.bannerUrl}
                          alt={brand.name || prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-black text-[10px]">
                          {brand.name}
                        </div>
                      )}

                      {/* Badge Diskon (-X%) MENONJOL KELUAR DI SUDUT KIRI ATAS */}
                      <div className="absolute -top-2 -left-2 z-10">
                        <Badge
                          variant={colorVariant}
                          size="sm"
                          className="border-2 border-black font-black font-mono text-[10px] px-1 py-0.5 shadow-[2px_2px_0px_0px_#000] rotate-[-4deg]"
                        >
                          -{fs.displayPercent}%
                        </Badge>
                      </div>
                    </div>

                    {/* COUNTDOWN TIMER DI BAWAH GAMBAR */}
                    <CardCountdownTimer targetDate={fs.endTime} />
                  </div>

                  {/* SISI KANAN: Tulisan Brand/Produk + Harga */}
                  <div className="w-3/5 flex flex-col justify-between text-left pl-1">
                    <div>
                      <span className="text-[9px] font-black uppercase text-neutral-400 line-clamp-1">
                        {brand.name || 'GAME PROMO'}
                      </span>
                      <h4 className="text-xs font-black uppercase text-black line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Pricing Display Kanan Bawah */}
                    <div className="pt-1 border-t border-dashed border-neutral-300 flex flex-col gap-0.5 mt-1">
                      <span className="line-through text-[10px] font-mono font-bold text-neutral-400">
                        Rp{displayOriginalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs font-black font-mono text-red-600 leading-none">
                        Rp{realPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
