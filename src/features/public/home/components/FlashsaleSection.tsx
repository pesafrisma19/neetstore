import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { getPublicFlashsales } from '../../../../utils/api';

// Helper Countdown Timer Component
const CountdownTimer: React.FC<{ targetDate: string | Date }> = ({ targetDate }) => {
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
    <div className="flex items-center gap-1 font-mono font-black text-xs text-black">
      <div className="bg-black text-yellow-300 px-1.5 py-0.5 rounded-xs border-2 border-black shadow-[1px_1px_0px_0px_#000]">
        {pad(timeLeft.hours)}
      </div>
      <span>:</span>
      <div className="bg-black text-yellow-300 px-1.5 py-0.5 rounded-xs border-2 border-black shadow-[1px_1px_0px_0px_#000]">
        {pad(timeLeft.minutes)}
      </div>
      <span>:</span>
      <div className="bg-black text-yellow-300 px-1.5 py-0.5 rounded-xs border-2 border-black shadow-[1px_1px_0px_0px_#000]">
        {pad(timeLeft.seconds)}
      </div>
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

  if (isLoading || !Array.isArray(flashsales) || flashsales.length === 0) {
    return null;
  }

  // Ambil waktu selesai terkecil sebagai referensi countdown utama
  const minEndTime = flashsales.reduce((earliest, item) => {
    const cur = new Date(item.endTime).getTime();
    return cur < earliest ? cur : earliest;
  }, new Date(flashsales[0].endTime).getTime());

  return (
    <section className="mb-10 text-left font-sans">
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
        
        {/* Header Section Flashsale */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-[3px] border-black">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000]">
              <Zap className="w-5 h-5 fill-current text-yellow-300 animate-bounce" />
              <span className="font-black text-sm uppercase tracking-wider">FLASHSALE SPESIAL</span>
            </div>

            <div className="flex items-center gap-2 bg-white/90 px-3 py-1 border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000]">
              <Clock className="w-4 h-4 stroke-[3] text-red-600" />
              <span className="text-xs font-black uppercase hidden sm:inline">BERAKHIR DALAM:</span>
              <CountdownTimer targetDate={minEndTime} />
            </div>
          </div>
        </div>

        {/* Carousel Grid Item Produk Flashsale */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {flashsales.map((fs: any) => {
            const prod = fs.product || {};
            const brand = prod.brand || {};
            const realPrice = fs.realPrice || prod.priceUser || 0;
            const displayOriginalPrice = fs.displayOriginalPrice || Math.round(realPrice / (1 - (fs.displayPercent || 10) / 100));
            const brandSlug = brand.slug || 'game';

            return (
              <Link
                key={fs.id}
                to={`/checkout/game/${brandSlug}?productId=${prod.id}`}
                className="group block transition-transform duration-200 hover:-translate-y-1"
              >
                <Card
                  variant="white"
                  className="border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-0 overflow-hidden flex flex-col justify-between h-full bg-white group-hover:shadow-[6px_6px_0px_0px_#000]"
                >
                  {/* Thumbnail Brand */}
                  <div className="relative w-full aspect-video bg-neutral-900 border-b-[3px] border-black overflow-hidden">
                    {brand.thumbnail || brand.bannerUrl ? (
                      <img
                        src={brand.thumbnail || brand.bannerUrl}
                        alt={brand.name || prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black text-xs">
                        {brand.name}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant="pink" size="sm" className="border-2 font-black font-mono shadow-[2px_2px_0px_0px_#000]">
                        -{fs.displayPercent}%
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-500 line-clamp-1">
                        {brand.name || 'GAME PROMO'}
                      </span>
                      <h4 className="text-xs font-black uppercase text-black line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Pricing Display */}
                    <div className="pt-2 border-t border-neutral-200 flex flex-col gap-0.5">
                      <span className="line-through text-[11px] font-mono font-bold text-neutral-400">
                        Rp{displayOriginalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-sm font-black font-mono text-black">
                        Rp{realPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <Button
                      variant="yellow"
                      size="sm"
                      className="w-full mt-1 font-black text-[11px] py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    >
                      <span>TOP UP NOW</span>
                      <ArrowRight className="w-3 h-3 stroke-[3]" />
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
