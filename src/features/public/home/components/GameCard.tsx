import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { ArrowRight, Bookmark, Flame, Star } from 'lucide-react';

export interface GameItem {
  id: string;
  name: string;
  publisher: string;
  category: string;
  image?: string | null; // Bisa null — akan pakai fallback inisial
  googlePlayId?: string | null; // App ID Google Play (opsional)
  discount?: string;
  isPopular?: boolean;
  rating?: number;
  salesCount?: string;
  estYear?: string | number;
}

export const GameCard: React.FC<{ game: GameItem }> = ({ game }) => {
  // 1. Generate 3 tema warna neon ACAK setiap kali komponen di-render/di-refresh
  const { cardTheme, buttonTheme, photoTheme, bookmarkTheme } = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const shuffled = [...tones].sort(() => Math.random() - 0.5);
    return {
      cardTheme: shuffled[0],
      buttonTheme: shuffled[1],
      photoTheme: shuffled[2],
      bookmarkTheme: shuffled[3],
    };
  }, []);

  // Map warna hover aksen & tombol agar responsif saat hover/tekan
  const bgClasses: Record<string, string> = {
    yellow: 'bg-[var(--nb-yellow)]',
    pink: 'bg-[var(--nb-pink)]',
    mint: 'bg-[var(--nb-mint)]',
    purple: 'bg-[var(--nb-purple)]',
    cyan: 'bg-[var(--nb-cyan)]',
  };

  const hoverClasses: Record<string, string> = {
    yellow: 'hover:bg-[var(--nb-yellow)]',
    pink: 'hover:bg-[var(--nb-pink)]',
    mint: 'hover:bg-[var(--nb-mint)]',
    purple: 'hover:bg-[var(--nb-purple)]',
    cyan: 'hover:bg-[var(--nb-cyan)]',
  };

  return (
    <Card
      variant="cream"
      className="p-2 sm:p-3 flex flex-col justify-between h-full group transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--nb-shadow)]"
      style={{
        boxShadow: `3px 3px 0px 0px var(--nb-shadow-${cardTheme})`,
      }}
    >
      {/* 1. Top Header: Publisher & Sticker Badge */}
      <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-hidden">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] border-[1.5px] sm:border-[2px] border-[var(--nb-border)] shadow-[1px_1px_0px_0px_#000] flex items-center justify-center font-black text-[8px] sm:text-[10px] shrink-0">
            {game.publisher.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="font-black text-[9px] sm:text-[11px] text-[var(--nb-text)] uppercase truncate">{game.publisher}</span>
            {game.estYear ? (
              <span className="text-[7px] sm:text-[8px] font-bold text-[var(--nb-text-muted)] uppercase mt-0.5 hidden sm:inline">
                EST. {game.estYear}
              </span>
            ) : null}
          </div>
        </div>

        {/* Only show discount badge if discount exists; remove OFFICIAL badge */}
        {game.discount ? (
          <Badge variant="mint" size="sm" className="text-[7px] sm:text-[9px] px-1.5 py-0.5 shrink-0 font-black tracking-tight border-[1.5px] border-[var(--nb-border)] shadow-[1.5px_1.5px_0px_0px_#000]">
            <span>{game.discount}</span>
          </Badge>
        ) : null}
      </div>

      {/* 2. Game Image — dengan fallback inisial kalau gambar kosong/error */}
      <div
        className="w-full aspect-square rounded-lg sm:rounded-xl border-[2px] sm:border-[2.5px] border-[var(--nb-border)] mb-1.5 sm:mb-2.5 overflow-hidden bg-[var(--nb-surface)] flex items-center justify-center p-1 sm:p-1.5"
        style={{
          boxShadow: `3px 3px 0px 0px var(--nb-shadow-${photoTheme})`,
        }}
      >
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              // Gambar gagal load → sembunyikan dan tampilkan fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.img-fallback') as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
        ) : null}
        {/* Fallback: Inisial nama game dengan background berwarna */}
        <div
          className="img-fallback w-full h-full items-center justify-center bg-gradient-to-br from-[var(--nb-yellow)] to-[var(--nb-pink)] border-0"
          style={{ display: game.image ? 'none' : 'flex' }}
        >
          <span className="font-black text-2xl sm:text-3xl text-[var(--nb-text)] select-none">
            {game.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      {/* 3. Accent Bar & Title (Uses Button Theme Color) */}
      <div className="flex flex-col gap-0.5 mb-1 sm:mb-1.5">
        <div className={`w-6 sm:w-8 h-1 sm:h-1.5 ${bgClasses[buttonTheme]} border-[1px] sm:border-[1.5px] border-[var(--nb-border)]`} />
        <h3 className="font-black text-xs sm:text-sm text-[var(--nb-text)] uppercase tracking-tight leading-snug m-0 line-clamp-1">
          {game.name}
        </h3>
      </div>

      {/* 4. Chips / Tags Row (Rating & Sales Count) */}
      {(game.rating || game.salesCount) ? (
        <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 flex-nowrap overflow-hidden whitespace-nowrap">
          {game.rating ? (
            <Badge variant="yellow" size="sm" className="text-[7px] sm:text-[9px] px-1 py-0.5 sm:px-1.5 sm:py-0.5 shrink-0">
              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-[var(--nb-text)] text-[var(--nb-text)] stroke-[2.5]" />
              <span>{game.rating}</span>
            </Badge>
          ) : null}

          {game.salesCount ? (
            <Badge variant="pink" size="sm" className="text-[7px] sm:text-[9px] px-1 py-0.5 sm:px-1.5 sm:py-0.5 truncate">
              <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-white text-[var(--nb-dark-text)] stroke-[2.5] shrink-0" />
              <span className="truncate">{game.salesCount}</span>
            </Badge>
          ) : null}
        </div>
      ) : null}

      {/* 5. Footer Buttons (CTA & Bookmark) */}
      <div className="flex items-center gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t-[1.5px] sm:border-t-[2px] border-[var(--nb-border)]/20">
        <Link to={`/checkout/game/${game.id}`} className="flex-1">
          <Button variant={buttonTheme} size="sm" fullWidth className="text-[9px] sm:text-[11px] py-1 sm:py-1.5 px-1 sm:px-1.5 rounded-lg sm:rounded-xl">
            <span>TOP UP</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </Button>
        </Link>
        <button
          type="button"
          aria-label="Bookmark"
          style={{
            boxShadow: `2px 2px 0px 0px var(--nb-shadow-${bookmarkTheme})`,
          }}
          className={`p-1 sm:p-1.5 bg-[var(--nb-surface)] border-[1.5px] sm:border-[2px] border-[var(--nb-border)] rounded-lg sm:rounded-xl ${hoverClasses[bookmarkTheme]} transition-colors cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shrink-0`}
        >
          <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--nb-text)] stroke-[3]" />
        </button>
      </div>
    </Card>
  );
};
