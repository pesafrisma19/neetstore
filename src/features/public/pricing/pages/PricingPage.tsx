import React, { useState, useEffect } from 'react';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Display } from '../../../../components/ui/Display';
import { Input } from '../../../../components/ui/Input';
import { getAdminBrands, getBrandBySlug } from '../../../../utils/api';
import { 
  Tag, Search, Gamepad2, ArrowRight, CheckCircle2, 
  AlertTriangle, Crown, Shield, Loader2 
} from 'lucide-react';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
}

interface ProductItem {
  id: string | number;
  name: string;
  guestPrice: number;
  memberPrice: number;
  resellerPrice: number;
  vipPrice: number;
  status: 'NORMAL' | 'GANGGUAN';
}

export const PricingPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Helper: Ambil data produk untuk satu brand tertentu
  const loadProductsForBrand = async (brandSlugOrId: string) => {
    setLoadingProducts(true);
    try {
      const res = await getBrandBySlug(brandSlugOrId);
      const realList = res?.products || [];

      if (realList.length > 0) {
        const mappedProducts: ProductItem[] = realList.map((p: any) => {
          const basePrice = Number(p.price) || 25000;
          const memberPrice = Math.round((basePrice * 0.975) / 100) * 100;
          const resellerPrice = Math.round((basePrice * 0.95) / 100) * 100;
          const vipPrice = Math.round((basePrice * 0.92) / 100) * 100;

          return {
            id: p.id || Math.random().toString(),
            name: String(p.name || '').toUpperCase(),
            guestPrice: basePrice,
            memberPrice: memberPrice,
            resellerPrice: resellerPrice,
            vipPrice: vipPrice,
            status: p.isActive !== false ? 'NORMAL' : 'GANGGUAN',
          };
        });
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading products for brand:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 1x useEffect TUNGGAL: Fetch Brand & langsung Produk pertama saat awal buka halaman
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingBrands(true);
      try {
        const dbBrands = await getAdminBrands();
        if (dbBrands && dbBrands.length > 0) {
          const mapped: BrandItem[] = dbBrands.map((b: any) => ({
            id: b.id?.toString() || b.slug || Math.random().toString(),
            slug: b.slug || b.id?.toString(),
            name: (b.name || '').toUpperCase(),
            image: b.thumbnail || b.image || b.imageUrl || '',
            category: typeof b.category === 'object' && b.category !== null 
              ? String(b.category.name || b.category.slug || 'MOBILE GAMES').toUpperCase() 
              : String(b.category || 'MOBILE GAMES').toUpperCase(),
          }));
          mapped.sort((a, b) => a.name.localeCompare(b.name));
          setBrands(mapped);
          setSelectedBrand(null);
          setProducts([]);
        } else {
          setBrands([]);
          setSelectedBrand(null);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching initial pricing data:', err);
        setBrands([]);
        setSelectedBrand(null);
        setProducts([]);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchInitialData();
  }, []);

  // Event Handler saat klik game di menu kiri (bukan useEffect lagi)
  const handleSelectBrand = (brand: BrandItem) => {
    if (brand.id === selectedBrand?.id) return; // Abaikan jika klik game yang sama
    setSelectedBrand(brand);
    loadProductsForBrand(brand.slug || brand.id);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Filter produk berdasarkan input pencarian pengguna
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-7 h-7 stroke-[3] text-[var(--nb-text)]" />
              <Display size="sm" highlight="yellow">
                DAFTAR HARGA RESMI &amp; MULTI-TIER
              </Display>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)]">
              Daftar harga real-time sinkron dengan server Database &amp; Admin Panel NETSTORE.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <Input
              placeholder="Cari nama produk voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--nb-surface)] pl-9 text-xs py-2 font-bold"
            />
            <Search className="w-4 h-4 text-[var(--nb-text)] stroke-[3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* -----------------------------------------------------------------
            SPLIT SCREEN LAYOUT YANG BENAR (SESUAI REQUEST TERBARU):
            - KIRI (lg:col-span-4): DAFTAR BRAND / GAME DENGAN FOTO & NAMA
            - KANAN (lg:col-span-8): TABEL HARGA 6 KOLOM LENGKAP
           ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ===============================================================
              SISI KIRI: DAFTAR BRAND / GAME BER-FOTO (4 Kolom di Desktop)
             =============================================================== */}
          <div className="lg:col-span-4 order-1">
            <Card
              variant="cream"
              shadow="lg"
              borderWidth="3"
              className="bg-[var(--nb-surface-alt)] p-4 sm:p-5 flex flex-col gap-4 sticky top-24"
            >
              <div className="flex items-center justify-between border-b-[2.5px] border-[var(--nb-border)] pb-3">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 stroke-[3] text-[var(--nb-text)]" />
                  <span className="font-black text-sm uppercase tracking-tight">
                    PILIH BRAND / GAME
                  </span>
                </div>
                <Badge variant="pink" size="sm">
                  {brands.length} GAME
                </Badge>
              </div>

              {/* Scrollable List Game Brand di Kiri */}
              <div className="flex flex-col gap-2 max-h-[620px] overflow-y-auto pr-1">
                {loadingBrands ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-14 bg-[var(--nb-surface)] animate-pulse rounded-xl border-[2.5px] border-[var(--nb-border)]"
                    />
                  ))
                ) : brands.length === 0 ? (
                  <div className="p-4 text-center bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] rounded-xl flex flex-col gap-2">
                    <span className="font-black text-xs uppercase text-[var(--nb-pink)]">
                      BELUM ADA BRAND DI DATABASE
                    </span>
                    <span className="text-[11px] font-bold text-[var(--nb-text-muted)]">
                      Silakan tambahkan data brand atau lakukan sinkronisasi produk di Panel Admin NETSTORE.
                    </span>
                  </div>
                ) : (
                  brands.map((brand) => {
                    const isSelected = brand.id === selectedBrand?.id;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleSelectBrand(brand)}
                        className={`w-full p-2.5 rounded-xl border-[2.5px] border-[var(--nb-border)] flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[var(--nb-yellow)] text-[#000000] shadow-[3px_3px_0px_0px_var(--nb-shadow)] -translate-y-0.5'
                            : 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:bg-[var(--nb-surface)]/70 hover:translate-x-1'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Foto / Thumbnail Brand */}
                          <div className="w-10 h-10 rounded-lg border-[2px] border-[var(--nb-border)] overflow-hidden bg-[var(--nb-surface-alt)] shrink-0 flex items-center justify-center">
                            {brand.image ? (
                              <img
                                src={brand.image}
                                alt={brand.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="font-black text-xs text-[var(--nb-text)]">
                                {brand.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {/* Nama Brand & Kategori */}
                          <div className="flex flex-col truncate">
                            <span className="font-black text-xs sm:text-sm uppercase truncate">
                              {brand.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase truncate ${
                                isSelected ? 'text-black/70' : 'text-[var(--nb-text-muted)]'
                              }`}
                            >
                              {typeof brand.category === 'object' && brand.category !== null
                                ? String((brand.category as any)?.name || (brand.category as any)?.slug || 'MOBILE GAMES')
                                : String(brand.category || 'MOBILE GAMES')}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className={`w-4 h-4 stroke-[3] shrink-0 ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* ===============================================================
              SISI KANAN: TABEL HARGA 6 KOLOM LENGKAP (8 Kolom di Desktop)
             =============================================================== */}
          <div className="lg:col-span-8 order-2 flex flex-col gap-4">
            {!selectedBrand ? (
              <Card
                variant="cream"
                shadow="md"
                borderWidth="3"
                className="bg-[var(--nb-surface-alt)] p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[420px]"
              >
                <div className="w-20 h-20 rounded-2xl bg-[var(--nb-yellow)] border-[3px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)] flex items-center justify-center">
                  <Gamepad2 className="w-10 h-10 stroke-[3] text-[#000000]" />
                </div>
                <div className="flex flex-col gap-2 max-w-md">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[var(--nb-text)]">
                    PILIH GAME DI SEBELAH KIRI
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)] leading-relaxed">
                    Klik salah satu brand atau game pada menu kiri untuk menampilkan daftar harga produk resmi &amp; bertingkat dari server NETSTORE.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {/* Header Brand Terpilih di Atas Tabel */}
                <div className="flex items-center justify-between p-4 bg-[var(--nb-surface)] border-[3px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border-[2px] border-[var(--nb-border)] overflow-hidden bg-[var(--nb-surface-alt)] shrink-0">
                      <img
                        src={selectedBrand?.image}
                        alt={selectedBrand?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase text-[var(--nb-pink)]">
                        PRODUK RESMI DALAM DATABASE
                      </span>
                      <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-[var(--nb-text)]">
                        {selectedBrand?.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="yellow" size="sm">
                      {loadingProducts ? 'MEMUAT...' : `${filteredProducts.length} PRODUK`}
                    </Badge>
                  </div>
                </div>

                {/* TABEL HARGA NEON BRUTALISM DENGAN HORIZONTAL SCROLL */}
                <Card
                  variant="cream"
                  shadow="md"
                  borderWidth="3"
                  className="bg-[var(--nb-surface-alt)] p-0 overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[720px]">
                      <thead>
                        <tr className="bg-[var(--nb-surface)] border-b-[3px] border-[var(--nb-border)] text-xs font-black uppercase tracking-wider">
                          <th className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20">
                            NAMA PRODUK
                          </th>
                          <th className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center">
                            GUEST
                          </th>
                          <th className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center">
                            MEMBER
                          </th>
                          <th className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center">
                            RESELLER
                          </th>
                          <th className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center bg-[var(--nb-yellow)]/20">
                            HARGA VIP
                          </th>
                          <th className="py-3.5 px-4 text-center">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-[2px] divide-[var(--nb-border)]/20 font-bold text-xs">
                        {loadingProducts ? (
                          <tr>
                            <td colSpan={6} className="py-14 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 text-[var(--nb-text-muted)]">
                                <Loader2 className="w-6 h-6 animate-spin text-[var(--nb-pink)] stroke-[3]" />
                                <span className="font-black uppercase tracking-wider text-xs">
                                  MEMUAT DATA PRODUK DARI SERVER...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredProducts.length > 0 ? (
                          filteredProducts.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-[var(--nb-surface)]/60 transition-colors"
                            >
                              {/* 1. NAMA PRODUK */}
                              <td className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 font-black uppercase text-[var(--nb-text)]">
                                {item.name}
                              </td>

                              {/* 2. HARGA GUEST */}
                              <td className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center text-[var(--nb-text-muted)]">
                                {formatRupiah(item.guestPrice)}
                              </td>

                              {/* 3. HARGA MEMBER */}
                              <td className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center text-[var(--nb-text)]">
                                {formatRupiah(item.memberPrice)}
                              </td>

                              {/* 4. HARGA RESELLER */}
                              <td className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center text-emerald-600 font-black">
                                {formatRupiah(item.resellerPrice)}
                              </td>

                              {/* 5. HARGA VIP (HIGHLIGHT) */}
                              <td className="py-3.5 px-4 border-r-[2px] border-[var(--nb-border)]/20 text-center font-black bg-[var(--nb-yellow)]/20 text-[#000000] dark:text-[#FFD700]">
                                {formatRupiah(item.vipPrice)}
                              </td>

                              {/* 6. STATUS PRODUK */}
                              <td className="py-3.5 px-4 text-center">
                                {item.status === 'NORMAL' ? (
                                  <Badge variant="mint" size="sm" className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>NORMAL</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="purple" size="sm" className="inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>GANGGUAN</span>
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-14 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 text-[var(--nb-text-muted)]">
                                <span className="font-black text-sm uppercase">
                                  BELUM ADA PRODUK AKTIF DI DATABASE UNTUK GAME INI
                                </span>
                                <span className="text-xs font-bold max-w-sm">
                                  Produk akan otomatis muncul setelah Anda menambahkan atau menyinkronkan data di Panel Admin.
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Info Tambahan di Bawah Tabel */}
                  <div className="p-4 bg-[var(--nb-surface)] border-t-[3px] border-[var(--nb-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-bold text-[var(--nb-text-muted)]">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Harga otomatis sinkron dengan server Database &amp; Panel Admin NETSTORE.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>Upgrade tipe akun ke Reseller / VIP untuk mendapatkan potongan harga spesial.</span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

