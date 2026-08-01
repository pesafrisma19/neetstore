import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { PromoBanner } from '../components/PromoBanner';
import { GameCard, type GameItem } from '../components/GameCard';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/Tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../../components/ui/Accordion';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Display } from '../../../../components/ui/Display';
import { Callout } from '../../../../components/ui/Callout';
import { Pagination } from '../../../../components/ui/Pagination';
import { Avatar, AvatarGroup } from '../../../../components/ui/Avatar';
import { Kbd } from '../../../../components/ui/Kbd';
import { Code } from '../../../../components/ui/Code';
import { Gamepad2, HelpCircle, Zap } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { apiFetch, getGPlayMeta, type GPlayMeta } from '../../../../utils/api';

// =====================================================
// Skeleton Card — ditampilkan saat loading
// =====================================================
const GameCardSkeleton: React.FC = () => (
  <div className="border-[3px] border-black shadow-[4px_4px_0px_0px_#000] bg-[#FAF7EE] p-3 flex flex-col gap-2 animate-pulse">
    <div className="flex justify-between mb-1">
      <div className="w-16 h-4 bg-gray-200 rounded" />
      <div className="w-10 h-4 bg-gray-200 rounded" />
    </div>
    <div className="w-full aspect-video bg-gray-200 rounded" />
    <div className="w-3/4 h-4 bg-gray-200 rounded" />
    <div className="flex gap-1">
      <div className="w-16 h-4 bg-gray-200 rounded" />
      <div className="w-12 h-4 bg-gray-200 rounded" />
    </div>
    <div className="w-full h-8 bg-gray-200 rounded mt-1" />
  </div>
);

// =====================================================
// Fallback statis — muncul kalau API mati/belum sync
// =====================================================
const FALLBACK_GAMES: GameItem[] = [
  { id: 'mobile-legends', name: 'Mobile Legends', publisher: 'Moonton', category: 'GAME', googlePlayId: 'com.mobile.legends' },
  { id: 'free-fire', name: 'Free Fire', publisher: 'Garena', category: 'GAME', googlePlayId: 'com.dts.freefireth' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', publisher: 'Tencent', category: 'GAME', googlePlayId: 'com.tencent.ig' },
  { id: 'genshin-impact', name: 'Genshin Impact', publisher: 'miHoYo', category: 'GAME', googlePlayId: 'com.miHoYo.GenshinImpact' },
];

// =====================================================
// Helper: Ubah Brand dari API → GameItem untuk GameCard
// =====================================================
const brandToGameItem = (brand: any, gplayData?: GPlayMeta | null): GameItem => {
  const catName = brand.category?.name || (typeof brand.category === 'string' ? brand.category : 'GAME');
  return {
    id: brand.slug || String(brand.id),
    name: gplayData?.title || brand.name || '',
    publisher: gplayData?.developer || brand.publisher || 'Official',
    category: catName.toUpperCase(),
    image: gplayData?.icon || brand.thumbnail || null,
    googlePlayId: brand.googlePlayId || null,
  };
};

// =====================================================
// HOME PAGE
// =====================================================
export const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Data dari API
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Fetch brands dari DB, lalu enrich dengan Google Play
  // =====================================================
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const dbBrands = await apiFetch<any[]>('/brands').catch(() => null);

      if (!dbBrands || dbBrands.length === 0) {
        // API gagal / DB kosong → pakai fallback statis
        setGames(FALLBACK_GAMES);
        setLoading(false);
        return;
      }

      // Untuk setiap brand yang punya googlePlayId, fetch metadata Google Play
      const enriched = await Promise.all(
        dbBrands.map(async (brand) => {
          if (brand.googlePlayId) {
            const meta = await getGPlayMeta(brand.googlePlayId);
            return brandToGameItem(brand, meta);
          }
          return brandToGameItem(brand, null);
        })
      );

      setGames(enriched);
      setLoading(false);
    };

    load();
  }, []);

  // =====================================================
  // Filter & Search
  // =====================================================
  const ITEMS_PER_PAGE = 12;
  const filtered = games.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.publisher.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'ALL' || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Ambil tab kategori unik dari data
  const uniqueCategories = ['ALL', ...Array.from(new Set(games.map((g) => g.category)))];

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-black overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">

        {/* Promo Banner Slider dalam frame Brutalist */}
        <PromoBanner />

        {/* Callout Promo Kupon */}
        <Callout tone="yellow" title="⚡ PERIODE PROMO SPESIAL DIGIFLAZZ" className="my-6">
          Gunakan kode kupon{' '}
          <Code tone="yellow" className="inline-block px-1.5 py-0.5 border-[1.5px] border-black my-0 text-[11px]">
            NEON30
          </Code>{' '}
          untuk mendapatkan diskon langsung Rp 5.000 pada setiap transaksi pertama kamu! Tekan{' '}
          <Kbd size="sm">Ctrl K</Kbd> untuk mencari game secara kilat.
        </Callout>

        {/* Catalog Section Header */}
        <div className="my-8 text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gamepad2 className="w-6 h-6 stroke-[3] text-black" />
              <Display size="sm" highlight="yellow">
                KATALOG GAME &amp; VOUCHER
              </Display>
            </div>
            <p className="text-sm font-bold text-gray-700">
              Pilih game favoritmu dan nikmati harga terjangkau dengan proses otomatis 24 jam
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000]">
            <AvatarGroup>
              <Avatar fallback="ML" variant="yellow" size="sm" />
              <Avatar fallback="FF" variant="pink" size="sm" />
              <Avatar fallback="VAL" variant="mint" size="sm" />
              <Avatar fallback="GI" variant="purple" size="sm" />
            </AvatarGroup>
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-black text-black">150.000+ GAMER</span>
              <span className="text-[10px] font-bold text-gray-600">SUDAH TOP UP HARI INI</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <Tabs defaultValue="ALL" value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setCurrentPage(1); }} className="w-full md:w-auto">
            <TabsList>
              {uniqueCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat === 'ALL' ? 'SEMUA' : cat}
                  {cat === 'ALL' && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-black text-white text-[10px]">
                      {games.length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="w-full md:w-72">
            <Input
              placeholder="Cari game..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-white"
            />
          </div>
        </div>

        {/* Game Grid */}
        {loading ? (
          // Skeleton saat loading
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginated.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="my-10 flex justify-center overflow-x-auto py-2">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        ) : (
          // Hasil pencarian kosong
          <Card variant="cream" className="p-12 text-center">
            <h3 className="font-black text-lg uppercase">GAME TIDAK DITEMUKAN</h3>
            <p className="text-xs font-bold text-gray-600 mt-1">Coba kata kunci pencarian yang lain.</p>
          </Card>
        )}

        {/* Step-by-Step Top-Up Guide */}
        <div className="my-16">
          <div className="text-left mb-6">
            <Badge variant="pink" size="md" className="mb-2">
              <Zap className="w-3.5 h-3.5 stroke-[3]" />
              PETUNJUK PRAKTIS
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black m-0">
              CARA TOP-UP HANYA 3 LANGKAH
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Card variant="yellow" shadow="lg" className="p-6 flex flex-col gap-3">
              <div className="w-12 h-12 bg-black text-white font-black text-2xl flex items-center justify-center border-[2px] border-black shadow-[3px_3px_0px_0px_#fff]">1</div>
              <h3 className="font-black text-lg uppercase">MASUKKAN USER ID</h3>
              <p className="text-xs font-semibold text-black/80">Isi ID Akun Game dan Server ID kamu secara benar pada form checkout yang tersedia.</p>
            </Card>
            <Card variant="mint" shadow="lg" className="p-6 flex flex-col gap-3">
              <div className="w-12 h-12 bg-black text-white font-black text-2xl flex items-center justify-center border-[2px] border-black shadow-[3px_3px_0px_0px_#fff]">2</div>
              <h3 className="font-black text-lg uppercase">PILIH NOMINAL &amp; BAYAR</h3>
              <p className="text-xs font-semibold text-black/80">Pilih paket Diamond/Item yang kamu inginkan lalu pilih pembayaran QRIS atau E-Wallet favoritmu.</p>
            </Card>
            <Card variant="purple" shadow="lg" className="p-6 flex flex-col gap-3">
              <div className="w-12 h-12 bg-black text-white font-black text-2xl flex items-center justify-center border-[2px] border-black shadow-[3px_3px_0px_0px_#fff]">3</div>
              <h3 className="font-black text-lg uppercase">PROSES DETIK ITU JUGA</h3>
              <p className="text-xs font-semibold text-black/80">Sistem otomatis Digiflazz akan langsung mengirimkan item ke akun game kamu dalam hitungan detik.</p>
            </Card>
          </div>
        </div>

        {/* Accordion FAQ Section */}
        <div className="my-16 max-w-4xl mx-auto text-left">
          <div className="text-center mb-8">
            <Badge variant="cyan" size="md" className="mb-2">
              <HelpCircle className="w-3.5 h-3.5 stroke-[3]" />
              FAQ &amp; BANTUAN
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black m-0">
              PERTANYAAN SERING DIAJUKAN
            </h2>
          </div>

          <Accordion type="single" collapsible defaultValue="faq-1">
            <AccordionItem value="faq-1">
              <AccordionTrigger triggerBg="#FFDC00">
                Berapa lama proses top-up di NETSTORE VITE?
              </AccordionTrigger>
              <AccordionContent>
                Proses transaksi diproses secara **otomatis 24 jam nonstop** dalam waktu 1 s/d 3 detik setelah pembayaran kamu berhasil terverifikasi oleh sistem.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger triggerBg="#6EE7B7">
                Apakah top up di sini aman dan legal?
              </AccordionTrigger>
              <AccordionContent>
                Sangat aman dan 100% legal! Kami bekerja sama langsung dengan distributor resmi provider game melalui API resmi Digiflazz, sehingga akun kamu dijamin bebas dari risiko banned.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger triggerBg="#C4B5FD">
                Metode pembayaran apa saja yang didukung?
              </AccordionTrigger>
              <AccordionContent>
                Kami mendukung pembayaran instant via **QRIS (BCA, Mandiri, BRI, BNI)**, E-Wallet (**GOPAY, DANA, OVO, ShopeePay**), serta Virtual Account Bank.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger triggerBg="#7DD3FC">
                Bagaimana jika item tidak masuk dalam 5 menit?
              </AccordionTrigger>
              <AccordionContent>
                Kamu bisa langsung mengecek status pesanan melalui halaman **Cek Invoice** atau menghubungi Customer Service WhatsApp 24 jam kami dengan melampirkan Kode Transaksi.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </main>

      <Footer />
    </div>
  );
};
