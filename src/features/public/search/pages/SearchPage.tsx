import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { GameCard, type GameItem } from '../../home/components/GameCard';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Display } from '../../../../components/ui/Display';
import { apiFetch, type PublicBrand } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';
import { Search, ArrowLeft, Gamepad2, AlertCircle } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(query);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  const { data: dbBrands = [], isLoading } = useQuery<PublicBrand[]>({
    queryKey: queryKeys.public.brands.all,
    queryFn: async () => {
      const data = await apiFetch<PublicBrand[]>('/brands');
      if (!Array.isArray(data)) {
        throw new Error('Invalid /brands response: expected array');
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const loading = isLoading;

  const games: GameItem[] = useMemo(() => {
    return dbBrands.map((brand: PublicBrand): GameItem => ({
      id: brand.slug,
      name: brand.name,
      publisher: brand.publisher || 'OFFICIAL',
      category: brand.category.name.toUpperCase(),
      image: brand.thumbnail,
      googlePlayId: brand.googlePlayId,
      estYear: new Date(brand.createdAt).getFullYear().toString(),
    }));
  }, [dbBrands]);

  const filteredGames = games.filter((g) => {
    if (!query.trim()) return true;
    const qLower = query.toLowerCase();
    const nameStr = String(g.name || '').toLowerCase();
    const pubStr = String(g.publisher || '').toLowerCase();
    const catStr = String(g.category || '').toLowerCase();
    return nameStr.includes(qLower) || pubStr.includes(qLower) || catStr.includes(qLower);
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: inputVal });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link & Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col items-start gap-2">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase text-[var(--nb-text-muted)] hover:text-[var(--nb-text)] transition-colors">
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              KEMBALI KE BERANDA
            </Link>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 stroke-[3] text-[var(--nb-text)]" />
              <Display size="sm" highlight="yellow">
                {query ? `HASIL PENCARIAN: "${query.toUpperCase()}"` : 'SEMUA KATALOG GAME'}
              </Display>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)]">
              Menampilkan {filteredGames.length} game yang sesuai dengan pencarian Anda.
            </p>
          </div>

          {/* Search Refinement Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Input
                placeholder="Cari nama game atau publisher..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="bg-[var(--nb-surface)] pl-9 text-xs"
              />
              <Search className="w-4 h-4 text-[var(--nb-text)] stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <Button type="submit" variant="yellow" size="sm">
              CARI
            </Button>
          </form>
        </div>

        {/* Search Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full h-56 bg-[var(--nb-surface)] animate-pulse rounded-2xl border-[3px] border-[var(--nb-border)] p-3" />
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="w-full p-12 bg-[var(--nb-surface)] border-[4px] border-[var(--nb-border)] shadow-[8px_8px_0px_0px_var(--nb-shadow)] rounded-2xl flex flex-col items-center justify-center text-center gap-4 my-8">
            <AlertCircle className="w-16 h-16 text-[var(--nb-pink)] stroke-[2.5]" />
            <div className="flex flex-col gap-1">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                GAME TIDAK DITEMUKAN
              </h3>
              <p className="text-sm font-bold text-[var(--nb-text-muted)] max-w-md">
                Maaf, tidak ada game yang cocok dengan kata kunci &quot;{query}&quot;. Coba cari dengan nama game lain atau lihat katalog lengkap kami.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                variant="yellow"
                size="md"
                onClick={() => {
                  setInputVal('');
                  setSearchParams({});
                }}
              >
                LIHAT SEMUA GAME
              </Button>
              <Link to="/">
                <Button variant="outline" size="md">
                  KEMBALI KE HOME
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};


