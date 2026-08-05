import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Sticker } from '../../../../components/ui/Sticker';
import { Breadcrumb } from '../../../../components/ui/Breadcrumb';
import { Progress } from '../../../../components/ui/Progress';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/RadioGroup';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { Separator } from '../../../../components/ui/Separator';
import { Dialog } from '../../../../components/ui/Dialog';
import { Badge } from '../../../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/Tabs';
import { Toast, type ToastMessage } from '../../../../components/ui/Toast';
import { ShieldCheck, Check, ArrowRight, Ticket, Info, Zap, Headphones, ShoppingCart, Sparkles, Download, Calendar, ChevronLeft, ChevronRight, Newspaper, BookOpen } from 'lucide-react';
import { checkoutApi } from '../services/checkout.api';

const optimizeGoogleBanner = (url: string) => {
  if (!url || !url.includes('googleusercontent.com')) return url;
  if (url.includes('=')) {
    return url.replace(/=.*$/, '=w1920-h1080-rw');
  }
  return url + '=w1920-h1080-rw';
};

const getCountryFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Verified Starburst Badge SVG
export const VerifiedBadgeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path
      d="M12 2L14.4 4.1L17.5 3.7L18.6 6.6L21.3 8.1L20.8 11.2L22.5 13.8L20.4 16.1L20.5 19.3L17.4 19.8L15.4 22.3L12.5 21L9.6 22.3L7.6 19.8L4.5 19.3L4.6 16.1L2.5 13.8L4.2 11.2L3.7 8.1L6.4 6.6L7.5 3.7L10.6 4.1L12 2Z"
      fill="#1DA1F2"
      stroke="black"
      strokeWidth="1.5"
    />
    <path d="M8.5 12L10.8 14.3L15.5 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Component Event Carousel Slider (Ganti Grid Event agar tidak pecah/tertarik)
const EventCarouselSlider: React.FC<{ events: { title: string; badge: string; bannerUrl: string }[] }> = ({ events }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (events.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [events]);

  if (!events || events.length === 0) return null;

  const active = events[index];

  return (
    <div className="flex flex-col gap-3">
      <Card shadow="md" className="relative w-full aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] !rounded-2xl overflow-hidden bg-[var(--nb-surface-alt)] group">
        <img
          src={active.bannerUrl}
          alt={active.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Badge Expiry Overlay */}
        {active.badge && (
          <div className="absolute top-3 right-3 z-10">
            <Sticker variant="pink" size="md" angle="-rotate-3">
              <span>{active.badge}</span>
            </Sticker>
          </div>
        )}

        {/* Navigasi Arrows */}
        {events.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + events.length) % events.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--nb-yellow)]"
              aria-label="Event sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % events.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--nb-surface)] border-[2.5px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--nb-yellow)]"
              aria-label="Event berikutnya"
            >
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {events.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 border-[1.5px] border-[var(--nb-border)] transition-all ${
                    i === index ? 'bg-[var(--nb-yellow)] w-6' : 'bg-[var(--nb-surface)] w-2'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Title Event di bawah banner */}
      <Card variant="cream" shadow="sm" className="p-3 !rounded-xl flex items-center justify-between">
        <span className="font-black text-sm uppercase text-[var(--nb-text)]">{active.title}</span>
        <Badge variant="purple" size="sm">
          EVENT {index + 1} / {events.length}
        </Badge>
      </Card>
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const slug = (gameId || '').toLowerCase();

  // State Data
  const [brandData, setBrandData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Tab State: "topup" | "information"
  const [activeTab, setActiveTab] = useState('topup');

  // Auto Slider Banner Header
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // State Form Checkout
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Phase 5: Dynamic 5-Level Region & ProductCategory States
  const [selectedRegionId, setSelectedRegionId] = useState<number | 'ALL'>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  
  // Dynamic Payment Methods
  const [paymentMethodsList, setPaymentMethodsList] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<number | string>('');

  // Phase 4: Neetflix Validation States & Region Lock UX
  const [nickname, setNickname] = useState('');
  const [detectedRegionCode, setDetectedRegionCode] = useState('');
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [firstTopupTiers, setFirstTopupTiers] = useState<any[]>([]);
  const [isRegionLocked, setIsRegionLocked] = useState(false);
  const [showAllRegionsOverride, setShowAllRegionsOverride] = useState(false);
  const [validMatchedRegionIds, setValidMatchedRegionIds] = useState<number[]>([]);
  const [checkIdError, setCheckIdError] = useState('');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedDiscountType, setAppliedDiscountType] = useState('FLAT');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  // Load Data dari API Database NETSTORE (100% Kontrol Admin)
  useEffect(() => {
    const loadGameData = async () => {
      const brandRes = await checkoutApi.getBrandBySlug(slug);
      if (brandRes) {
        setBrandData(brandRes);
        const prodList = brandRes.products || [];
        setProducts(prodList);
        if (prodList.length > 0) {
          setSelectedItem(prodList[0]);
        } else {
          setSelectedItem(null);
        }
      } else {
        setProducts([]);
        setSelectedItem(null);
      }

      // Fetch dynamic payment methods
      const payRes = await checkoutApi.getPaymentMethods();
      if (payRes && payRes.length > 0) {
        setPaymentMethodsList(payRes);
        setSelectedPayment(payRes[0].id);
      }
    };

    loadGameData();
  }, [slug]);

  const availableRegions = React.useMemo(() => {
    if (!brandData?.regions || !Array.isArray(brandData.regions)) return [];
    return [...brandData.regions].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [brandData]);

  // Filter visible regions based on Rule Engine matches when locked
  const visibleRegions = React.useMemo(() => {
    if (!availableRegions) return [];
    if (!isRegionLocked || showAllRegionsOverride || validMatchedRegionIds.length === 0) {
      return availableRegions;
    }
    return availableRegions.filter((reg: any) => validMatchedRegionIds.includes(reg.id));
  }, [availableRegions, isRegionLocked, showAllRegionsOverride, validMatchedRegionIds]);

  const availableCategories = React.useMemo(() => {
    if (!brandData) return [];

    if (typeof selectedRegionId === 'number') {
      const selectedReg = brandData.regions?.find((r: any) => r.id === selectedRegionId);
      if (selectedReg?.availableCategories && Array.isArray(selectedReg.availableCategories)) {
        return [...selectedReg.availableCategories].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
    }

    if (!brandData?.productCategories || !Array.isArray(brandData.productCategories)) return [];
    return [...brandData.productCategories].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [brandData, selectedRegionId]);

  // Auto-select first available region when availableRegions updates
  useEffect(() => {
    if (availableRegions.length > 0) {
      if (selectedRegionId === 'ALL' || !availableRegions.some((r: any) => r.id === selectedRegionId)) {
        setSelectedRegionId(availableRegions[0].id);
      }
    }
  }, [availableRegions]);

  // Auto-select first available category when availableCategories updates
  useEffect(() => {
    if (availableCategories.length > 0) {
      if (selectedCategoryId === 'ALL' || !availableCategories.some((c: any) => c.id === selectedCategoryId)) {
        setSelectedCategoryId(availableCategories[0].id);
      }
    }
  }, [availableCategories]);

  // Phase 5: Filtered Product Grid based on Region & Category
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchRegion = selectedRegionId === 'ALL' || p.regionId === selectedRegionId;
      const matchCat = selectedCategoryId === 'ALL' || p.productCategoryId === selectedCategoryId;
      return matchRegion && matchCat;
    });
  }, [products, selectedRegionId, selectedCategoryId]);

  // Phase 5: Safe Selected Product Handling (Reset safely if current selection is filtered out)
  useEffect(() => {
    if (selectedItem && !filteredProducts.some((p) => p.id === selectedItem.id)) {
      setSelectedItem(filteredProducts.length > 0 ? filteredProducts[0] : null);
    }
  }, [filteredProducts, selectedItem]);

  // Daftar Gambar untuk Auto Slider Banner Header
  const headerBanners: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (brandData?.bannerUrl) list.push(brandData.bannerUrl);
    if (brandData?.promoScreenshots && Array.isArray(brandData.promoScreenshots) && brandData.promoScreenshots.length > 0) {
      brandData.promoScreenshots.forEach((img: string) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (list.length === 0) {
      list.push(`https://placehold.co/1200x400/FFDC00/000000?font=montserrat&text=${slug.toUpperCase()}`);
    }
    return list;
  }, [brandData, slug]);

  // Generate Pure Random neon themes on mount / list load, locked per item
  const productThemes = React.useMemo(() => {
    const themes = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const map: Record<string, typeof themes[number]> = {};
    products.forEach((p) => {
      map[p.id] = themes[Math.floor(Math.random() * themes.length)];
    });
    return map;
  }, [products]);

  const paymentThemes = React.useMemo(() => {
    const themes = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const map: Record<string, typeof themes[number]> = {};
    paymentMethodsList.forEach((m) => {
      map[m.id] = themes[Math.floor(Math.random() * themes.length)];
    });
    return map;
  }, [paymentMethodsList]);

  const regionThemes = React.useMemo(() => {
    const themes = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const map: Record<string, typeof themes[number]> = {};
    availableRegions.forEach((r: any) => {
      map[r.id] = themes[Math.floor(Math.random() * themes.length)];
    });
    return map;
  }, [availableRegions]);

  // Generate warna acak untuk kotak Ringkasan Pesanan (Promo button, Total Pembayaran box, Submit button)
  const { promoButtonTheme, totalBoxTheme, submitButtonTheme } = React.useMemo(() => {
    const themes = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const shuffled = [...themes].sort(() => Math.random() - 0.5);
    return {
      promoButtonTheme: shuffled[0],
      totalBoxTheme: shuffled[1],
      submitButtonTheme: shuffled[2],
    };
  }, []);

  // Auto Slider Timer 4 Detik
  useEffect(() => {
    if (headerBanners.length <= 1) return;
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % headerBanners.length);
    }, 4000);

    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [headerBanners]);

  const breadcrumbItems = [
    { label: 'HOME', href: '/' },
    { label: 'GAME', href: '/' },
    { label: brandData?.name || slug.replace('-', ' ').toUpperCase() },
  ];

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const response = await checkoutApi.checkVoucher(promoCode.trim().toUpperCase());
      if (response && !response.error) {
        setAppliedDiscount(response.discountValue);
        setAppliedDiscountType(response.discountType);
        setToast({
          type: 'success',
          title: 'PROMO DITERAPKAN',
          message: `Kamu mendapatkan potongan diskon ${response.discountType === 'PERCENT' ? response.discountValue + '%' : 'Rp ' + response.discountValue}!`,
        });
      } else {
        setAppliedDiscount(0);
        setToast({
          type: 'error',
          title: 'KODE PROMO TIDAK VALID',
          message: response?.error || 'Silakan periksa kembali kode promo kamu.',
        });
      }
    } catch (err) {
      setAppliedDiscount(0);
      setToast({
        type: 'error',
        title: 'ERROR JARINGAN',
        message: 'Gagal memvalidasi promo.',
      });
    }
  };

  const handleCheckId = async () => {
    if (!userId.trim()) {
      setToast({ type: 'warning', title: 'USER ID KOSONG', message: 'Silakan isi User ID kamu!' });
      return;
    }

    setIsCheckingId(true);
    setNickname('');
    setDetectedRegionCode('');
    setFirstTopupTiers([]);
    setCheckIdError('');
    try {
      const res = await checkoutApi.validateNeetflixAccount(brandData.id, userId, serverId);
      if (res.success && res.data) {
        setNickname(res.data.nickname);
        const targetRegionId = res.data.recommendedRegionId || res.data.matchedRegionId;
        if (targetRegionId) {
          setSelectedRegionId(targetRegionId); // Auto-Lock Recommended Region
          setIsRegionLocked(true);
          setShowAllRegionsOverride(false);
        }
        if (res.data.matchedRegionIds && Array.isArray(res.data.matchedRegionIds)) {
          setValidMatchedRegionIds(res.data.matchedRegionIds);
        } else if (targetRegionId) {
          setValidMatchedRegionIds([targetRegionId]);
        }
        if (res.data.detectedRegionCode) {
          setDetectedRegionCode(res.data.detectedRegionCode);
        }
        if (res.data.firstTopupTiers && Array.isArray(res.data.firstTopupTiers)) {
          setFirstTopupTiers(res.data.firstTopupTiers);
        }
        setToast({ type: 'success', title: 'AKUN DITEMUKAN', message: `Halo, ${res.data.nickname}!` });
      } else {
        const errMsg = res.message || 'ID tidak terdeteksi, jika benar silakan lanjut.';
        setCheckIdError(errMsg);
        setToast({ type: 'error', title: 'ID TIDAK VALID', message: errMsg });
      }
    } catch (err: any) {
      const errMsg = err.message || 'ID tidak terdeteksi, jika benar silakan lanjut.';
      setCheckIdError(errMsg);
      setToast({ type: 'error', title: 'GAGAL CEK ID', message: errMsg });
    } finally {
      setIsCheckingId(false);
    }
  };

  const getPaymentDetails = (id: number | string) => {
    const selected = paymentMethodsList.find(p => p.id === id);
    if (!selected) return { feeFlat: 0, feePercent: 0 };
    return { feeFlat: selected.feeFlat || 0, feePercent: selected.feePercent || 0 };
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    const basePrice = selectedItem.price;
    const { feeFlat, feePercent } = getPaymentDetails(selectedPayment);
    const feeAmount = feeFlat + (basePrice * (feePercent / 100));
    const subtotal = basePrice + feeAmount;
    
    let totalDiscount = 0;
    if (appliedDiscount > 0) {
      if (appliedDiscountType === 'PERCENT') {
        totalDiscount = subtotal * (appliedDiscount / 100);
      } else {
        totalDiscount = appliedDiscount;
      }
    }
    
    const grandTotal = subtotal - totalDiscount;
    return grandTotal > 0 ? grandTotal : 0;
  }; 
  
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setToast({
        id: `t_${Date.now()}`,
        type: 'warning',
        title: 'USER ID MASIH KOSONG',
        message: 'Silakan masukkan User ID akun game kamu terlebih dahulu!',
      });
      return;
    }
    // Generate UUID pseudo-random sebagai Idempotency Key unik untuk transaksi ini
    const newKey = `KEY-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    setIdempotencyKey(newKey);
    setIsConfirmModalOpen(true);
  };

  const handleFinalPayment = async () => {
    if (!agreeTerms) {
      setToast({
        id: `t_${Date.now()}`,
        type: 'warning',
        title: 'SYARAT & KETENTUAN',
        message: 'Anda harus menyetujui Syarat & Ketentuan transaksi.',
      });
      return;
    }
    
    if (!selectedItem) {
      setToast({ type: 'error', title: 'PRODUK KOSONG', message: 'Silakan pilih nominal topup.' });
      return;
    }
    if (!selectedPayment) {
      setToast({ type: 'error', title: 'PEMBAYARAN KOSONG', message: 'Silakan pilih metode pembayaran.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productId: selectedItem.id,
        targetAccount: userId,
        targetZone: serverId,
        paymentMethod: selectedPayment,
        voucherCode: appliedDiscount > 0 ? promoCode : undefined,
        whatsapp,
      };

      const res = await checkoutApi.checkoutPayment(payload, idempotencyKey);
      
      if (res && res.success) {
        setToast({
          type: 'success',
          title: 'PESANAN DIBUAT',
          message: 'Transaksi berhasil diproses.'
        });
        setIsConfirmModalOpen(false);
        navigate(`/invoice/${res.invoiceId}`);
      } else {
        setToast({
          type: 'error',
          title: 'TRANSAKSI GAGAL',
          message: res?.error || 'Gagal memproses pembayaran.'
        });
        setIsConfirmModalOpen(false);
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'ERROR JARINGAN',
        message: 'Gagal terhubung ke server transaksi.'
      });
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gameTitle = brandData?.name || slug.replace('-', ' ').toUpperCase();
  const developerName = brandData?.publisher || 'OFFICIAL PUBLISHER';

  const gameIcon = brandData?.thumbnail ||
    'https://ui-avatars.com/api/?name=' + slug + '&background=random&color=fff&size=512';



  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">

        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        {/* 🌟 HERO CARD: AUTO SLIDER BANNER HEADER (NEON BRUTALISM) */}
        <Card variant="white" shadow="xl" borderWidth="4" className="mb-6 p-3 sm:p-6 rounded-3xl relative flex flex-col gap-4 sm:gap-6 bg-[var(--nb-surface)]">

          {/* 1. AUTO BANNER SLIDER (Geser-Geser Sendiri 4s) */}
          <div className="relative w-full h-48 sm:h-72 md:h-96 rounded-xl sm:rounded-2xl border-[2.5px] sm:border-[3.5px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)] overflow-hidden bg-[var(--nb-surface-alt)] group">
            <img
              src={optimizeGoogleBanner(headerBanners[bannerIndex])}
              alt={`${gameTitle} Banner Slide ${bannerIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700"
            />

            {/* Official Badge Overlay */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <Sticker variant="mint" size="md" angle="-rotate-3">
                <Sparkles className="w-3.5 h-3.5 fill-black stroke-[2]" />
                <span>GOOGLE PLAY OFFICIAL</span>
              </Sticker>
            </div>

            {/* Banner Carousel Arrows */}
            {headerBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setBannerIndex(prev => (prev - 1 + headerBanners.length) % headerBanners.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--nb-surface)] border-[2px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--nb-yellow)]"
                  aria-label="Banner sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>
                <button
                  type="button"
                  onClick={() => setBannerIndex(prev => (prev + 1) % headerBanners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--nb-surface)] border-[2px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--nb-yellow)]"
                  aria-label="Banner berikutnya"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {headerBanners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBannerIndex(idx)}
                      className={`h-2 border-[1.5px] border-[var(--nb-border)] transition-all ${
                        idx === bannerIndex ? 'bg-[var(--nb-yellow)] w-6' : 'bg-[var(--nb-surface)] w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 2. Game Icon & Title Info */}
          <div className="flex flex-row items-center sm:items-start gap-3 sm:gap-6 pt-1 sm:pt-2">
            <Card shadow="lg" className="w-20 h-20 sm:w-36 sm:h-36 !rounded-2xl shrink-0 p-0 border-[3px] sm:border-[4px]">
              <img src={gameIcon} alt={gameTitle} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </Card>

            <div className="flex flex-col justify-center gap-1.5 flex-1 text-left overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-xs sm:text-base uppercase text-[var(--nb-text)] truncate">{developerName}</span>
                <VerifiedBadgeIcon size={18} />
                <Badge variant="mint" size="sm" className="hidden sm:inline-flex">
                  <Download className="w-3 h-3 text-[var(--nb-text)] stroke-[2.5]" />
                  <span>OFFICIAL BRAND</span>
                </Badge>
              </div>

              <div className="w-12 sm:w-16 h-1.5 bg-[var(--nb-pink)] rounded-full border-[1px] border-[var(--nb-border)]" />

              <h1 className="text-xl sm:text-4xl md:text-5xl font-black uppercase text-[var(--nb-text)] tracking-tight leading-none m-0 mt-0.5 truncate mb-2 sm:mb-0">
                {gameTitle}
              </h1>

              {/* 3. Bar Keunggulan Layanan (Dipindah ke bawah judul) */}
              <Card variant="cream" shadow="sm" className="grid grid-cols-3 gap-1 sm:gap-3 p-2 sm:p-3 mt-2 sm:mt-4 w-full !rounded-xl">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left pr-1 sm:pr-2 border-r-[1.5px] border-dashed border-[var(--nb-border)]/40">
                  <div className="p-1 sm:p-1.5 bg-[var(--nb-mint)] border-[1.5px] border-[var(--nb-border)] shadow-[1px_1px_0px_0px_var(--nb-shadow)] rounded-md sm:rounded-lg shrink-0">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--nb-text)] stroke-[3]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <h4 className="font-black text-[8px] sm:text-[10px] uppercase text-[var(--nb-text)] m-0 line-clamp-1">PROSES 1-3 DETIK</h4>
                    <p className="text-[7px] sm:text-[9px] font-bold text-[var(--nb-text-muted)] m-0 mt-0.5 hidden sm:block">Otomatis 24/7</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left pr-1 sm:pr-2 border-r-[1.5px] border-dashed border-[var(--nb-border)]/40">
                  <div className="p-1 sm:p-1.5 bg-[var(--nb-purple)] border-[1.5px] border-[var(--nb-border)] shadow-[1px_1px_0px_0px_var(--nb-shadow)] rounded-md sm:rounded-lg shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--nb-text)] stroke-[3]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <h4 className="font-black text-[8px] sm:text-[10px] uppercase text-[var(--nb-text)] m-0 line-clamp-1">100% LEGAL &amp; AMAN</h4>
                    <p className="text-[7px] sm:text-[9px] font-bold text-[var(--nb-text-muted)] m-0 mt-0.5 hidden sm:block">API Digiflazz Resmi</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                  <div className="p-1 sm:p-1.5 bg-[var(--nb-pink)] text-[var(--nb-dark-text)] border-[1.5px] border-[var(--nb-border)] shadow-[1px_1px_0px_0px_var(--nb-shadow)] rounded-md sm:rounded-lg shrink-0">
                    <Headphones className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <h4 className="font-black text-[8px] sm:text-[10px] uppercase text-[var(--nb-text)] m-0 line-clamp-1">CS BANTUAN 24/7</h4>
                    <p className="text-[7px] sm:text-[9px] font-bold text-[var(--nb-text-muted)] m-0 mt-0.5 hidden sm:block">Support WhatsApp</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </Card>

        {/* 🌟 2-COLUMN MAIN LAYOUT: LEFT = TABS, RIGHT = STICKY ORDER SUMMARY */}
        <form onSubmit={handleOpenConfirmModal} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT 8 COLS: TABS SYSTEM */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            <Tabs defaultValue="topup" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-4 !bg-[var(--nb-surface)]">
                <TabsTrigger value="topup" className="flex-1 sm:flex-initial text-sm font-black py-2.5 px-6">
                  <Zap className="w-4 h-4 stroke-[3] inline mr-2" />
                  FORM TOP UP
                </TabsTrigger>
                <TabsTrigger value="information" className="flex-1 sm:flex-initial text-sm font-black py-2.5 px-6">
                  <Info className="w-4 h-4 stroke-[3] inline mr-2" />
                  INFORMASI GAME
                </TabsTrigger>
              </TabsList>

              {/* ⚡ TAB 1: FORM TOP UP */}
              <TabsContent value="topup" className="pt-2 flex flex-col gap-8">
                
                <div className="max-w-xl">
                  <Progress value={75} label="PROGRESS KELENGKAPAN PESANAN" tone="yellow" />
                </div>

                {/* Step 1: User ID & Zone ID */}
                <Card variant="white" shadow="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] rounded-none flex items-center justify-center text-sm font-black">1</span>
                      <span>LENGKAPI DATA AKUN GAME</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-end">
                      {(!brandData?.customFields || brandData.customFields.length === 0) ? (
                        <div className="col-span-12 p-4 bg-red-100 border-2 border-red-500 rounded text-red-600 font-bold text-center text-xs sm:text-sm shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                          ⚠️ INPUT GAME BELUM DIATUR ADMIN ⚠️<br/>
                          Silakan masuk ke Panel Admin &gt; Brands &gt; Tambah Form Field untuk game ini.
                        </div>
                      ) : (
                        brandData.customFields.map((field: any, index: number) => {
                          const isFirst = index === 0;
                          return (
                            <div key={field.id || index} className={`${isFirst ? (brandData.customFields.length === 1 ? 'col-span-12' : 'col-span-7 sm:col-span-8') : 'col-span-5 sm:col-span-4'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] sm:text-xs font-black uppercase text-[var(--nb-text)] truncate">{field.label}</label>
                                {isFirst && (
                                  <Tooltip content={`${field.label} dapat dilihat di menu profil game Anda`}>
                                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--nb-text)] cursor-pointer stroke-[3] shrink-0" />
                                  </Tooltip>
                                )}
                              </div>
                              {field.fieldType === 'SELECT' ? (
                                <select
                                  className="w-full text-xs sm:text-sm py-2 px-3 bg-[var(--nb-surface)] border-2 border-[var(--nb-border)] rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                                  value={isFirst ? userId : serverId}
                                  onChange={(e) => isFirst ? setUserId(e.target.value) : setServerId(e.target.value)}
                                  required
                                >
                                  <option value="">-- Pilih --</option>
                                  {(field.selectOptions || '').split(',').map((opt: string) => (
                                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  type={field.inputType || 'text'}
                                  placeholder={`Masukkan ${field.label}`}
                                  value={isFirst ? userId : serverId}
                                  onChange={(e) => isFirst ? setUserId(e.target.value) : setServerId(e.target.value)}
                                  required
                                  className="w-full text-xs sm:text-sm py-2 px-3 bg-[var(--nb-surface)]"
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Phase 4: Tombol Cek ID (Hanya Muncul Jika Game Mendukung Validasi Neetflix) */}
                    {brandData?.validationGameCode && (
                      <div className="flex flex-col gap-2 mt-2">
                        <Button
                          type="button"
                          variant="purple"
                          size="sm"
                          onClick={handleCheckId}
                          disabled={isCheckingId || !userId.trim()}
                          className="w-full sm:w-auto self-start font-black text-xs uppercase"
                        >
                          <ShieldCheck className="w-4 h-4 stroke-[3]" />
                          {isCheckingId ? 'MEMERIKSA ID...' : 'CEK ID & PROMO'}
                        </Button>
                        
                        {nickname && (
                          <div className="p-2.5 bg-[var(--nb-cyan)] border-[2.5px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 bg-black text-white p-0.5 rounded-full shrink-0" />
                              <span className="font-black text-xs sm:text-sm uppercase truncate">NICKNAME: {nickname}</span>
                            </div>
                            {detectedRegionCode && (
                              <Badge variant="yellow" size="sm" className="font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1 shrink-0">
                                <span>{getCountryFlagEmoji(detectedRegionCode)}</span>
                                <span>REGION: {detectedRegionCode}</span>
                              </Badge>
                            )}
                          </div>
                        )}

                        {checkIdError && (
                          <div className="p-2.5 bg-[var(--nb-yellow)] border-[2.5px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase text-black">
                            ⚠️ {checkIdError}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--nb-text-muted)] m-0">
                      *User ID dan Zone ID bisa dilihat pada menu Profil di dalam aplikasi game.
                    </p>
                  </CardContent>
                </Card>

                {/* Step 2: Nominal Products (Region Chips -> Category Tabs -> Products Grid) */}
                <Card variant="white" shadow="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] rounded-none flex items-center justify-center text-sm font-black">2</span>
                      <span>PILIH NOMINAL TOP UP</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">

                    {/* Sub-bagian 1: Region Server Game (Scroll Horisontal 1 Baris Chips) */}
                    {availableRegions.length > 0 && (
                      <div className="flex flex-col gap-2 pb-3 border-b-2 border-black/10">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] sm:text-xs font-black uppercase text-[var(--nb-text)]">REGION SERVER</label>
                          {isRegionLocked && (
                            <button
                              type="button"
                              onClick={() => setIsOverrideModalOpen(true)}
                              className="text-[10px] sm:text-[11px] font-black text-[var(--nb-text-muted)] hover:text-black uppercase underline"
                            >
                              {showAllRegionsOverride ? '✓ SEMUA REGION TERBUKA' : '⚙ UBAH REGION'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {visibleRegions.map((reg: any) => {
                            const isSelected = selectedRegionId === reg.id;
                            const flag = getCountryFlagEmoji(reg.code || '');
                            const regTheme = regionThemes[reg.id] || 'yellow';
                            const themeShadow = `var(--nb-shadow-${regTheme})`;
                            const themeBgClasses: Record<string, string> = {
                              yellow: 'bg-[var(--nb-yellow)] text-black',
                              pink: 'bg-[var(--nb-pink)] text-white',
                              mint: 'bg-[var(--nb-mint)] text-black',
                              purple: 'bg-[var(--nb-purple)] text-black',
                              cyan: 'bg-[var(--nb-cyan)] text-black',
                            };
                            return (
                              <button
                                key={reg.id}
                                type="button"
                                onClick={() => setSelectedRegionId(reg.id)}
                                style={{
                                  boxShadow: isSelected
                                    ? `2px 2px 0px 0px ${themeShadow}`
                                    : '2px 2px 0px 0px var(--nb-shadow)',
                                }}
                                className={`shrink-0 px-3 py-1.5 text-xs font-black uppercase border-[2px] border-[var(--nb-border)] transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? (themeBgClasses[regTheme] || 'bg-[var(--nb-yellow)] text-black')
                                    : 'bg-[var(--nb-surface)] text-[var(--nb-text)] hover:bg-[var(--nb-surface-alt)]'
                                }`}
                              >
                                <span>{flag}</span>
                                <span>{reg.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Phase 5: Dynamic ProductCategory Filter Tabs (Tampil Hanya Jika Tersedia) */}
                    {availableCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b-2 border-black/10">
                        {availableCategories.map((cat: any) => (
                          <Button
                            key={cat.id}
                            type="button"
                            variant={selectedCategoryId === cat.id ? 'purple' : 'white'}
                            size="sm"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className="text-xs font-bold uppercase"
                          >
                            {cat.name}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-8 font-bold text-[var(--nb-text-muted)] uppercase">
                          Tidak ada produk SKU yang tersedia untuk pilihan Region & Kategori ini.
                        </div>
                      ) : (
                        filteredProducts.map((item) => {
                          const isSelected = selectedItem?.id === item.id;
                          const priceVal = item.price || item.priceUser || 0;
                          const itemTheme = productThemes[item.id] || 'yellow';
                          const shadowColor = `var(--nb-shadow-${itemTheme})`;

                          // Phase 4: Matching logic for First Topup 2X Diamond
                          const sanitizeForMatch = (str: string) => (str || '').replace(/💎/g, '').replace(/\s+/g, '').toLowerCase();
                          const tierMatch = firstTopupTiers.find(t => {
                            const safeTier = sanitizeForMatch(t.name);
                            const safeItem = sanitizeForMatch(item.name);
                            return safeTier && safeItem.includes(safeTier);
                          });

                          const isTierDisabled = tierMatch && tierMatch.available === false;
                          const isTierAvailable = tierMatch && tierMatch.available === true;
                          const isCardDisabled = isTierDisabled; // can be extended later
                          
                          // override isSelected if disabled to prevent accidental buys
                          const effectivelySelected = isSelected && !isCardDisabled;

                          return (
                            <Card
                              key={item.id}
                              variant={isCardDisabled ? 'cream' : (effectivelySelected ? itemTheme : 'white')}
                              shadow="none"
                              style={{
                                boxShadow: effectivelySelected ? `4px 4px 0px 0px ${shadowColor}` : (isCardDisabled ? `2px 2px 0px 0px var(--nb-shadow-cream)` : `2px 2px 0px 0px ${shadowColor}`),
                              }}
                              className={`p-3 text-left flex flex-col justify-between transition-all select-none relative ${
                                isCardDisabled 
                                  ? 'opacity-60 cursor-not-allowed grayscale-[50%]' 
                                  : `cursor-pointer ${effectivelySelected ? '-translate-y-1' : 'hover:bg-[var(--nb-surface-alt)]'}`
                              }`}
                              onClick={() => {
                                if (!isCardDisabled) setSelectedItem(item);
                              }}
                            >
                              {isTierDisabled && (
                                <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none rounded-[inherit]" />
                              )}
                              
                              {/* Top Badge Bar inside card padding (No clipping!) */}
                              {(isTierDisabled || isTierAvailable || (item.isPopular && !tierMatch)) && (
                                <div className="mb-2 flex items-center justify-between gap-1">
                                  {isTierDisabled && (
                                    <Badge variant="dark" size="sm" className="text-[9px] py-0.5 px-1.5 font-black uppercase">
                                      BATAS TERCAPAI
                                    </Badge>
                                  )}
                                  {isTierAvailable && (
                                    <Badge variant="cyan" size="sm" className="text-[9px] py-0.5 px-1.5 font-black uppercase animate-pulse">
                                      ✨ PROMO 2X
                                    </Badge>
                                  )}
                                  {item.isPopular && !tierMatch && (
                                    <Badge variant="pink" size="sm" className="text-[9px] py-0.5 px-1.5 font-black uppercase">
                                      BEST SELLER
                                    </Badge>
                                  )}
                                </div>
                              )}

                              <div className="relative z-20 flex-1">
                                <span className={`text-xs font-black uppercase leading-tight block ${effectivelySelected ? 'text-[var(--nb-text-on-accent)]' : (isCardDisabled ? 'text-neutral-500 line-through' : 'text-[var(--nb-text)]')}`}>
                                  {item.name}
                                </span>
                              </div>

                              <div className="relative z-20 mt-3 pt-2 border-t-[1.5px] border-[var(--nb-border)]/40 flex items-center justify-between">
                                <span className={`text-xs font-black ${effectivelySelected ? 'text-[var(--nb-text-on-accent)]' : (isCardDisabled ? 'text-neutral-500' : 'text-[var(--nb-text)]')}`}>
                                  Rp {priceVal.toLocaleString('id-ID')}
                                </span>
                                {effectivelySelected && (
                                  <div className="w-5 h-5 bg-black text-white border-[1.5px] border-[var(--nb-border)] rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_var(--nb-shadow)] shrink-0">
                                    <Check className="w-3 h-3 stroke-[3.5]" />
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3: Payment Method */}
                <Card variant="white" shadow="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] rounded-none flex items-center justify-center text-sm font-black">3</span>
                      <span>PILIH METODE PEMBAYARAN</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={String(selectedPayment)} onValueChange={(val) => setSelectedPayment(val === 'saldo' ? val : Number(val))}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {paymentMethodsList.map((method) => {
                          const isSelected = String(selectedPayment) === String(method.id);
                          const methodTheme = paymentThemes[method.id] || 'yellow';
                          const shadowColor = `var(--nb-shadow-${methodTheme})`;

                          return (
                            <Card
                              key={method.id}
                              variant={isSelected ? methodTheme : 'white'}
                              shadow="none"
                              style={{
                                boxShadow: isSelected ? `4px 4px 0px 0px ${shadowColor}` : `2px 2px 0px 0px ${shadowColor}`,
                              }}
                              className={`p-4 cursor-pointer transition-all ${
                                isSelected 
                                  ? '-translate-y-1' 
                                  : 'hover:bg-[var(--nb-surface-alt)]'
                              }`}
                              onClick={() => setSelectedPayment(method.id)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {method.iconUrl ? (
                                    <img src={method.iconUrl} alt={method.name} className="w-6 h-6 object-contain" />
                                  ) : (
                                    <span className="text-xl">💳</span>
                                  )}
                                  <span className={`font-bold text-sm leading-tight ${isSelected ? 'text-[var(--nb-text-on-accent)]' : 'text-[var(--nb-text)]'}`}>
                                    {method.name}
                                  </span>
                                </div>
                                <RadioGroupItem value={String(method.id)} id={String(method.id)} className="sr-only" />
                                {isSelected && (
                                  <Badge variant="cyan" size="sm"><Check className="w-3 h-3 mr-1 inline" /> AKTIF</Badge>
                                )}
                              </div>
                              <div className="mt-2 text-xs font-bold bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] py-1 px-2 rounded w-fit uppercase">
                                {method.feeFlat > 0 ? `+ Rp ${method.feeFlat.toLocaleString('id-ID')} Fee` : (method.feePercent > 0 ? `+ ${method.feePercent}% Fee` : 'BEBAS BIAYA ADMIN')}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Step 4: WhatsApp Contact */}
                <Card variant="white" shadow="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] rounded-none flex items-center justify-center text-sm font-black">4</span>
                      <span>KONTAK BUKTI TRANSAKSI</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <Input
                      label="Nomor WhatsApp (Opsional)"
                      placeholder="081234567890"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      helperText="Bukti transaksi dan status pemprosesan akan dikirimkan otomatis via WA."
                      className="bg-[var(--nb-surface)]"
                    />
                  </CardContent>
                </Card>

              </TabsContent>

              {/* ℹ️ TAB 2: INFORMASI GAME */}
              <TabsContent value="information" className="pt-2 flex flex-col gap-6">

                {/* 1. Banner Event & Offers Slider (CAROUSEL AUTO SLIDER) */}
                {brandData?.eventsAndOffers && Array.isArray(brandData.eventsAndOffers) && brandData.eventsAndOffers.length > 0 && (
                  <Card variant="white" shadow="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 stroke-[3]" />
                        <span>EVENTS &amp; OFFERS RESMI BRAND</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EventCarouselSlider events={brandData.eventsAndOffers} />
                    </CardContent>
                  </Card>
                )}

                {/* 2. What's New / Event News */}
                {brandData?.whatsNew && (
                  <Card variant="white" shadow="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Newspaper className="w-5 h-5 stroke-[3]" />
                          <span>WHAT'S NEW - UPDATE &amp; PATCH NOTES</span>
                        </div>
                        {brandData.updatedOn && (
                          <Badge variant="dark" size="sm">Updated: {brandData.updatedOn}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-[var(--nb-surface-alt)] border-[2.5px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_var(--nb-shadow)] rounded-xl">
                        <p className="text-xs font-bold text-[var(--nb-text)] opacity-90 whitespace-pre-line leading-relaxed m-0">
                          {brandData.whatsNew}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Deskripsi Game */}
                {brandData?.description && (
                  <Card variant="white" shadow="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 stroke-[3]" />
                          <span>DESKRIPSI LENGKAP BRAND</span>
                        </div>
                        {brandData.releasedOn && (
                          <Badge variant="dark" size="sm">Released: {brandData.releasedOn}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs font-semibold text-[var(--nb-text)] leading-relaxed whitespace-pre-line m-0">
                        {brandData.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

              </TabsContent>
            </Tabs>

          </div>

          {/* RIGHT 4 COLS: STICKY ORDER SUMMARY SIDEBAR (TERKUNCI PRESISI DI SAMPING) */}
          <div className="lg:col-span-4 sticky top-28 z-30">
            <Card variant="white" shadow="xl" className="border-[4px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 stroke-[3]" />
                  <span>RINGKASAN PESANAN</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">

                {/* Promo Code Input */}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Kode Promo (NEON30)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="text-xs uppercase bg-[var(--nb-surface)]"
                  />
                  <Button type="button" variant={promoButtonTheme} size="sm" onClick={handleApplyPromo}>
                    PAKAI
                  </Button>
                </div>

                {appliedDiscount > 0 && (
                  <div className="bg-[var(--nb-mint)] text-[var(--nb-text)] p-2.5 border-[2px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-between font-bold text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span className="uppercase">PROMO DITERAPKAN!</span>
                    </div>
                  </div>
                )}

                <div className="border-t-[2px] border-b-[2px] border-[var(--nb-border)] py-3 flex flex-col gap-2 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-[var(--nb-text-muted)] uppercase">GAME:</span>
                    <span className="font-black text-[var(--nb-text)]">{gameTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nb-text-muted)] uppercase">ITEM:</span>
                    <span className="font-black text-[var(--nb-text)]">{selectedItem?.name || '-'}</span>
                  </div>
                  {(!brandData?.customFields || brandData.customFields.length === 0) ? (
                    <div className="flex justify-between">
                      <span className="text-[var(--nb-text-muted)] uppercase text-xs">BELUM DIATUR</span>
                      <span className="font-black text-red-500 text-xs">HUBUNGI ADMIN</span>
                    </div>
                  ) : (
                    brandData.customFields.map((field: any, index: number) => {
                      const isFirst = index === 0;
                      const val = isFirst ? userId : serverId;
                      return (
                        <div key={field.id || index} className="flex justify-between">
                          <span className="text-[var(--nb-text-muted)] uppercase">{field.label}:</span>
                          <span className="font-black text-[var(--nb-text)]">{val || '-'}</span>
                        </div>
                      );
                    })
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--nb-text-muted)] uppercase">HARGA ITEM:</span>
                    <span className="font-black text-[var(--nb-text)]">Rp {selectedItem?.price?.toLocaleString('id-ID') || 0}</span>
                  </div>
                  
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-[#FF4D79]">
                      <span className="uppercase">POTONGAN PROMO:</span>
                      <span>- {appliedDiscountType === 'PERCENT' ? `${appliedDiscount}%` : `Rp ${appliedDiscount.toLocaleString('id-ID')}`}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-bold text-[var(--nb-text-muted)]">
                    <span className="uppercase">BIAYA LAYANAN:</span>
                    <span>{getPaymentDetails(selectedPayment).feeFlat > 0 || getPaymentDetails(selectedPayment).feePercent > 0 ? '+ Sesuai Metode Pembayaran' : 'GRATIS'}</span>
                  </div>
                </div>

                {/* Total Payment Box */}
                <Card variant={totalBoxTheme} shadow="sm" className="flex flex-col gap-1 p-3 !rounded-none border-[3px]">
                  <span className="text-[10px] font-black uppercase text-[#000000]">TOTAL PEMBAYARAN:</span>
                  <span className="text-2xl font-black text-[#000000]">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </Card>

                {/* Submit CTA */}
                <Button type="submit" variant={submitButtonTheme} size="lg" fullWidth>
                  <span>KONFIRMASI PESANAN</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </Button>

                <p className="text-[10px] font-bold text-center text-[var(--nb-text-muted)]">
                  Periksa kembali User ID akun Anda sebelum melakukan konfirmasi pembayaran.
                </p>

              </CardContent>
            </Card>
          </div>

        </form>

        {/* 🌟 CONFIRMATION DIALOG MODAL */}
        <Dialog
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="KONFIRMASI RINCIAN PESANAN"
          className="max-w-md"
        >
          <div className="flex flex-col gap-4 text-left">
            <Card variant="cream" shadow="sm" className="p-3 !rounded-xl flex items-center gap-3">
              <Card variant="pink" shadow="sm" className="p-2 text-[var(--nb-dark-text)] !rounded-lg border-[2px]">
                <ShoppingCart className="w-5 h-5 stroke-[3]" />
              </Card>
              <div>
                <h4 className="font-black text-sm uppercase text-[var(--nb-text)] m-0">{gameTitle}</h4>
                <p className="text-[10px] font-bold text-[var(--nb-text-muted)] m-0">Proses Otomatis 1-3 Detik</p>
              </div>
            </Card>

            <Card variant="white" shadow="none" className="border-[2.5px] divide-y-[2px] divide-black text-xs font-bold !rounded-none">
              <div className="p-2.5 flex justify-between bg-gray-50">
                <span className="text-[var(--nb-text-muted)] uppercase">AKUN TARGET:</span>
                <span className="font-black text-[var(--nb-text)]">{userId} {serverId ? `(${serverId})` : ''}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-[var(--nb-text-muted)] uppercase">ITEM / NOMINAL:</span>
                <span className="font-black text-[var(--nb-text)]">{selectedItem?.name}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-[var(--nb-text-muted)] uppercase">METODE BAYAR:</span>
                <span className="font-black text-[var(--nb-text)]">{paymentMethodsList.find(p => p.id === selectedPayment)?.name || '-'}</span>
              </div>
              <div className="p-2.5 flex justify-between bg-[var(--nb-yellow)] font-black text-sm">
                <span className="uppercase text-[var(--nb-text)]">TOTAL BAYAR:</span>
                <span className="text-[var(--nb-text)]">Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
            </Card>

            <Separator dashed />

            <Card variant="mint" shadow="none" className="p-3 !rounded-xl border-[2px] !bg-opacity-20">
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                label="SAYA MENYETUJUI SYARAT & KETENTUAN TRANSAKSI"
                tone="yellow"
              />
            </Card>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="white"
                size="md"
                className="flex-1"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                BATALKAN
              </Button>
              <Button
                type="button"
                variant="pink"
                size="md"
                className="flex-1"
                disabled={isSubmitting || !agreeTerms}
                onClick={handleFinalPayment}
              >
                {isSubmitting ? (
                  <span>MEMPROSES...</span>
                ) : (
                  <>
                    <span>BAYAR SEKARANG</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Modal Override Region */}
        <Dialog isOpen={isOverrideModalOpen} onClose={() => setIsOverrideModalOpen(false)} title="MENGUBAH REGION">
          <div className="flex flex-col gap-4 text-left">
            <p className="text-xs font-bold leading-relaxed text-[var(--nb-text)] m-0">
              Anda akan membuka seluruh pilihan region.<br /><br />
              Region yang dipilih otomatis berdasarkan hasil validasi akun untuk mengurangi risiko transaksi gagal.<br /><br />
              Jika Anda memilih region lain, pastikan Anda memahami risikonya.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
              <Button
                type="button"
                variant="white"
                size="sm"
                onClick={() => setIsOverrideModalOpen(false)}
                className="font-black text-xs uppercase"
              >
                BATAL
              </Button>
              <Button
                type="button"
                variant="yellow"
                size="sm"
                onClick={() => {
                  setShowAllRegionsOverride(true);
                  setIsOverrideModalOpen(false);
                }}
                className="font-black text-xs uppercase"
              >
                YA, TAMPILKAN SEMUA REGION
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Custom Neon Brutalism Toast Notification */}
        <Toast toast={toast} onClose={() => setToast(null)} />

      </main>

      <Footer />
    </div>
  );
};
