import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Display } from '../../../../components/ui/Display';
import { Card } from '../../../../components/ui/Card';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: 'PROMO' | 'TOURNAMENT' | 'UPDATE' | 'TIPS';
  date: string;
  excerpt: string;
  image: string;
  tagTone: 'yellow' | 'pink' | 'mint' | 'purple';
}

const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    title: 'SEASON BARU MOBILE LEGENDS: TOP UP DIAMOND DAPAT BONUS SKIN EPIC!',
    category: 'PROMO',
    date: '27 JULI 2026',
    excerpt: 'Nikmati promo spesial awal season! Setiap pembelian minimal 344 Diamond akan langsung mendapatkan kesempatan gacha Skin Epic permanen.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    tagTone: 'pink',
  },
  {
    id: '2',
    title: 'VALORANT NIGHT MARKET KEMBALI HADIR SERENTAK MINGGU DEPAN',
    category: 'UPDATE',
    date: '25 JULI 2026',
    excerpt: 'Siapkan Valorant Points kamu sekarang juga! Night Market kembali membawa diskon skin hingga 50% untuk semua akun aktif.',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    tagTone: 'purple',
  },
  {
    id: '3',
    title: 'TURNAMEN NETSTORE CUP SEASON 4 BERHADIAH TOTAL 50 JUTA RUPIAH',
    category: 'TOURNAMENT',
    date: '22 JULI 2026',
    excerpt: 'Daftarkan tim Mobile Legends dan Free Fire terbaikmu di turnamen tahunan bergengsi Netstore Cup. Pendaftaran gratis untuk member.',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    tagTone: 'yellow',
  },
  {
    id: '4',
    title: 'TIPS HEMAT TOP UP GENSHIN IMPACT UNTUK GACHA KARAKTER BINTANG 5',
    category: 'TIPS',
    date: '19 JULI 2026',
    excerpt: 'Panduan lengkap cara memaksimalkan Blessing of the Welkin Moon dan Genesis Crystal dengan harga paling ramah di kantong.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tagTone: 'mint',
  },
];

export const NewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const filtered = NEWS_DATA.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Newspaper className="w-7 h-7 stroke-[3] text-[var(--nb-text)]" />
              <Display size="sm" highlight="pink">
                BERITA &amp; PROMO TERKINI
              </Display>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)]">
              Update informasi event game, turnamen, dan diskon top up resmi di NETSTORE.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PROMO', 'UPDATE', 'TOURNAMENT', 'TIPS'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 text-xs font-black uppercase border-[2.5px] border-[var(--nb-border)] transition-all cursor-pointer ${
                  activeTab === cat
                    ? 'bg-[var(--nb-yellow)] text-[#000000] shadow-[3px_3px_0px_0px_var(--nb-shadow)] -translate-y-[2px]'
                    : 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:bg-[var(--nb-surface-alt)]'
                }`}
              >
                {cat === 'ALL' ? '🌟 SEMUA' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured News Hero Card (Latest article) */}
        {filtered.length > 0 && (
          <div className="mb-10">
            <Card
              variant="cream"
              shadow="lg"
              borderWidth="3"
              className="group overflow-hidden bg-[var(--nb-surface-alt)] p-0 grid grid-cols-1 lg:grid-cols-2"
            >
              <div className="h-64 lg:h-auto border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[var(--nb-border)] overflow-hidden">
                <img
                  src={filtered[0].image}
                  alt={filtered[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-between text-left gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={filtered[0].tagTone} size="sm">
                      {filtered[0].category}
                    </Badge>
                    <span className="text-xs font-bold text-[var(--nb-text-muted)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {filtered[0].date}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-snug">
                    {filtered[0].title}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)] leading-relaxed">
                    {filtered[0].excerpt}
                  </p>
                </div>
                <div>
                  <Link to="/">
                    <Button variant="yellow" size="md" className="font-black">
                      <span>BACA SELENGKAPNYA</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(1).map((item) => (
            <Card
              key={item.id}
              variant="cream"
              shadow="md"
              borderWidth="3"
              className="flex flex-col justify-between bg-[var(--nb-surface-alt)] p-0 overflow-hidden text-left"
            >
              <div className="h-48 border-b-[3px] border-[var(--nb-border)] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.tagTone} size="sm">
                      {item.category}
                    </Badge>
                    <span className="text-[10px] font-bold text-[var(--nb-text-muted)]">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black uppercase leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-[var(--nb-text-muted)] line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
                <div className="pt-3 border-t-[2px] border-[var(--nb-border)]/20">
                  <Link to="/">
                    <Button variant="outline" size="sm" fullWidth>
                      <span>BACA ARTIKEL</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

