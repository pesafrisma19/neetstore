import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { getRecentlyViewed, clearRecentlyViewed, type RecentlyViewedItem } from '../../../../utils/recentlyViewed';

export const RecentlyViewedSection: React.FC = () => {
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => getRecentlyViewed());

  useEffect(() => {
    // Sinkronisasi state saat data localStorage berubah
    const handleUpdate = () => {
      setItems(getRecentlyViewed());
    };

    window.addEventListener('neetstore_recently_viewed_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('neetstore_recently_viewed_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  return (
    <section className="my-4 sm:my-6 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--nb-yellow)] border-[2px] border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center justify-center shrink-0">
            <History className="w-3.5 h-3.5 stroke-[3] text-black" />
          </div>
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight text-black m-0">
            TERAKHIR DILIHAT
          </h2>
          <Badge variant="cyan" size="sm" className="hidden sm:inline-flex text-[9px] px-1.5 py-0.2">
            {items.length}
          </Badge>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-red-50 text-red-600 border-[1.5px] border-black shadow-[1.5px_1.5px_0px_0px_#000] text-[10px] sm:text-xs font-black uppercase cursor-pointer active:translate-x-[1px] active:translate-y-[1px] transition-transform"
          title="Hapus semua riwayat terakhir dilihat"
        >
          <Trash2 className="w-3 h-3 stroke-[2.5]" />
          <span>HAPUS SEMUA</span>
        </button>
      </div>

      {/* Horizontal Swipeable Cards Row */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1.5 px-0.5">
        {items.map((item) => (
          <Link
            key={item.slug}
            to={`/checkout/game/${item.slug}`}
            className="flex items-center gap-2.5 p-2 bg-[var(--nb-surface)] border-[2px] sm:border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--nb-yellow)] transition-all shrink-0 min-w-[165px] sm:min-w-[190px] max-w-[230px] group cursor-pointer select-none"
          >
            {/* Mini Thumbnail */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border-[1.5px] border-black overflow-hidden bg-[var(--nb-surface-alt)] flex items-center justify-center shrink-0">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.mini-fallback') as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="mini-fallback w-full h-full items-center justify-center bg-[var(--nb-yellow)] font-black text-xs text-black select-none"
                style={{ display: item.thumbnail ? 'none' : 'flex' }}
              >
                {item.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="font-black text-xs sm:text-sm text-black uppercase tracking-tight truncate group-hover:underline">
                {item.name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[var(--nb-text-muted)] flex items-center gap-0.5 mt-0.5">
                <span>Top up</span>
                <ArrowRight className="w-2.5 h-2.5 stroke-[3] text-black" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
