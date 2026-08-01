import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { apiFetch } from '../../utils/api';

interface SearchBarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onCloseMobile, isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchGames, setSearchGames] = useState<any[]>([]);
  const navigate = useNavigate();
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search data once
    const loadSearchData = async () => {
      const data = await apiFetch<any[]>('/brands').catch(() => []);
      setSearchGames(data || []);
    };
    loadSearchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      if (onCloseMobile) onCloseMobile();
    }
  };

  const matchingGames = searchGames.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'w-56 lg:w-64'}`} ref={searchBoxRef}>
      <form onSubmit={handleSearchSubmit}>
        <Input
          placeholder="Cari game..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className={`py-1.5 px-3 bg-[var(--nb-surface)] pr-8 font-bold ${isMobile ? 'text-sm' : 'text-xs'}`}
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--nb-text)] hover:scale-110 transition-transform cursor-pointer"
        >
          <Search className="w-4 h-4 stroke-[3]" />
        </button>
      </form>

      {/* LIVE SUGGESTION DROPDOWN */}
      {showSuggestions && searchQuery.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--nb-surface-alt)] border-[3px] border-[var(--nb-border)] shadow-[6px_6px_0px_0px_var(--nb-shadow)] p-2 flex flex-col gap-1 text-left">
          {matchingGames.length > 0 ? (
            <>
              {matchingGames.map((g) => {
                const gameId = g.id || g.slug;
                return (
                  <Link
                    key={gameId}
                    to={`/checkout/game/${gameId}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="flex items-center justify-between p-2 hover:bg-[var(--nb-surface)] transition-colors border-b last:border-b-0 border-[var(--nb-border)]/10"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 bg-[var(--nb-surface)] border-[1.5px] border-[var(--nb-border)] overflow-hidden shrink-0 flex items-center justify-center">
                        {g.image ? (
                          <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-black">{g.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-black uppercase text-[var(--nb-text)] truncate">{g.name}</span>
                        <span className="text-[9px] font-bold text-[var(--nb-text-muted)] uppercase">
                          {typeof g.category === 'object' && g.category !== null 
                            ? String(g.category.name || g.category.slug || 'MOBILE GAMES') 
                            : String(g.category || 'MOBILE GAMES')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--nb-text-muted)] shrink-0" />
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full mt-1.5 p-2 bg-[var(--nb-yellow)] border-[2px] border-[var(--nb-border)] text-[#000000] font-black text-xs uppercase text-center hover:scale-[1.01] transition-transform cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                VIEW ALL RESULTS FOR &quot;{searchQuery.toUpperCase()}&quot;
              </button>
            </>
          ) : (
            <div className="p-3 text-center text-xs font-bold text-[var(--nb-text-muted)]">
              Tidak ada game cocok dengan &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
