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
import { ShieldCheck, Check, ArrowRight, Ticket, Info, Zap, Headphones, ShoppingCart, Calendar, ChevronLeft, ChevronRight, Newspaper, BookOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useAuth, type UserProfile } from '../../../../contexts/AuthContext';
import { checkoutApi } from '../services/checkout.api';
import { calculateCheckoutBreakdown, type DiscountType } from '../../../../utils/checkoutCalculator';
import { apiFetch, type PublicBrandDetail, type PublicBrandProduct, type PublicPaymentMethod, isPaymentMethodType, isVoucherDiscountType, type PublicVoucherCheckResponse, type ApiErrorResponse, type PublicNeetflixValidationResponse, type CheckoutPayload, type CheckoutSuccessResponse, isCheckoutSuccessResponse } from '../../../../utils/api';
import { queryKeys } from '../../../../services/queryKeys';

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

const CHECKOUT_ATTEMPTS_STORAGE_KEY = 'netstore_checkout_attempts_v1';
const ATTEMPT_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL for PREPARED status
const MAX_PERSISTED_ATTEMPTS_PER_OWNER = 5;

export const CHECKOUT_ATTEMPT_STATUSES = [
  'PREPARED',
  'IN_FLIGHT',
  'UNKNOWN_RESULT',
] as const;

export type CheckoutAttemptStatus = (typeof CHECKOUT_ATTEMPT_STATUSES)[number];

export function isCheckoutAttemptStatus(val: unknown): val is CheckoutAttemptStatus {
  return typeof val === 'string' && (CHECKOUT_ATTEMPT_STATUSES as readonly string[]).includes(val);
}

export interface PersistedCheckoutAttempt {
  key: string;
  fingerprintHash: string;
  createdAt: number;
  ownerScope: string;
  status: CheckoutAttemptStatus;
}

export interface CheckoutMutationVariables {
  payload: CheckoutPayload;
  idempotencyKey: string;
  attemptHash: string;
  ownerScope: string;
  slug: string;
}

export type CheckoutAttemptMap = Record<string, PersistedCheckoutAttempt>;

export function isPersistedCheckoutAttempt(val: unknown): val is PersistedCheckoutAttempt {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    typeof obj.key === 'string' &&
    obj.key.trim().length > 0 &&
    typeof obj.fingerprintHash === 'string' &&
    obj.fingerprintHash.trim().length > 0 &&
    typeof obj.createdAt === 'number' &&
    Number.isFinite(obj.createdAt) &&
    typeof obj.ownerScope === 'string' &&
    obj.ownerScope.trim().length > 0 &&
    isCheckoutAttemptStatus(obj.status)
  );
}

function getOwnerScope(user: UserProfile | null): string {
  if (user?.id) {
    return `user:${user.id}`;
  }
  let guestId = '';
  try {
    guestId = sessionStorage.getItem('netstore_guest_session_id') || '';
    if (!guestId) {
      guestId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `g_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('netstore_guest_session_id', guestId);
    }
  } catch {
    guestId = 'guest_fallback';
  }
  return `guest:${guestId}`;
}

export function createAttemptStorageKey(ownerScope: string, fingerprintHash: string): string {
  return `${ownerScope}::${fingerprintHash}`;
}

// 1. Membaca SELURUH storage dan mengembalikan semua attempt valid milik SEMUA owner
function readAllPersistedAttempts(): CheckoutAttemptMap {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_ATTEMPTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      sessionStorage.removeItem(CHECKOUT_ATTEMPTS_STORAGE_KEY);
      return {};
    }

    const map = parsed as Record<string, unknown>;
    const validAllMap: CheckoutAttemptMap = {};

    for (const [storageKey, item] of Object.entries(map)) {
      if (isPersistedCheckoutAttempt(item)) {
        validAllMap[storageKey] = item;
      }
    }
    return validAllMap;
  } catch {
    return {};
  }
}

// 2. Menulis kembali SELURUH map ke sessionStorage tanpa membuang owner lain
function writeAllPersistedAttempts(allMap: CheckoutAttemptMap): void {
  try {
    if (Object.keys(allMap).length === 0) {
      sessionStorage.removeItem(CHECKOUT_ATTEMPTS_STORAGE_KEY);
    } else {
      sessionStorage.setItem(CHECKOUT_ATTEMPTS_STORAGE_KEY, JSON.stringify(allMap));
    }
  } catch {}
}

// 3. Mengambil attempt HANYA untuk owner tertentu (untuk view / lookup)
function getAttemptsForOwner(allMap: CheckoutAttemptMap, ownerScope: string): CheckoutAttemptMap {
  const now = Date.now();
  const ownerMap: CheckoutAttemptMap = {};

  for (const [storageKey, item] of Object.entries(allMap)) {
    if (item.ownerScope === ownerScope) {
      // Kebijakan TTL: HANYA HAPUS 'PREPARED' jika > 15 menit.
      // Item 'IN_FLIGHT' dan 'UNKNOWN_RESULT' TIDAK BOLEH dihapus oleh TTL!
      if (item.status === 'PREPARED' && now - item.createdAt > ATTEMPT_TTL_MS) {
        continue;
      }
      ownerMap[storageKey] = item;
    }
  }
  return ownerMap;
}

// 4. Menyimpan / memperbarui attempt dengan isolasi mutasi composite key per owner
function savePersistedAttempt(attempt: PersistedCheckoutAttempt): void {
  const compositeKey = createAttemptStorageKey(attempt.ownerScope, attempt.fingerprintHash);
  const allMap = readAllPersistedAttempts();
  const ownerMap = getAttemptsForOwner(allMap, attempt.ownerScope);

  ownerMap[compositeKey] = attempt;
  allMap[compositeKey] = attempt;

  const ownerEntries = Object.entries(ownerMap);
  if (ownerEntries.length > MAX_PERSISTED_ATTEMPTS_PER_OWNER) {
    // EVICTION PER-OWNER: Hanya buang entry 'PREPARED' milik owner ini!
    const preparedEntries = ownerEntries.filter(([, item]) => item.status === 'PREPARED');
    if (preparedEntries.length > 0) {
      preparedEntries.sort((a, b) => a[1].createdAt - b[1].createdAt);
      const oldestCompositeKey = preparedEntries[0][0];
      delete allMap[oldestCompositeKey];
    } else {
      throw new Error('Kapasitas transaksi belum terkonfirmasi penuh (5 unresolved) untuk akun ini. Silakan periksa Riwayat Transaksi Anda.');
    }
  }

  writeAllPersistedAttempts(allMap);
}

// 5. Menghapus attempt spesifik milik owner spesifik (menggunakan Composite Key)
function removePersistedAttempt(fingerprintHash: string, ownerScope: string): void {
  const compositeKey = createAttemptStorageKey(ownerScope, fingerprintHash);
  const allMap = readAllPersistedAttempts();
  const item = allMap[compositeKey];

  if (item && item.ownerScope === ownerScope) {
    delete allMap[compositeKey];
    writeAllPersistedAttempts(allMap);
  }
}

// 6. Mengupdate status attempt spesifik milik owner spesifik (menggunakan Composite Key)
function updateAttemptStatus(fingerprintHash: string, newStatus: CheckoutAttemptStatus, ownerScope: string): void {
  const compositeKey = createAttemptStorageKey(ownerScope, fingerprintHash);
  const allMap = readAllPersistedAttempts();
  const item = allMap[compositeKey];

  if (item && item.ownerScope === ownerScope) {
    item.status = newStatus;
    allMap[compositeKey] = item;
    writeAllPersistedAttempts(allMap);
  }
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `KEY-${crypto.randomUUID()}`;
  }
  return `KEY-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

async function computePayloadFingerprintHash(payload: CheckoutPayload): Promise<string> {
  const deterministicStr = JSON.stringify({
    p: payload.productId,
    a: payload.targetAccount.trim(),
    z: (payload.targetZone || '').trim(),
    n: (payload.nickname || '').trim(),
    m: String(payload.paymentMethod),
    v: (payload.voucherCode || '').trim().toUpperCase(),
    w: (payload.whatsapp || '').trim(),
  });

  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(deterministicStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Browser Anda tidak mendukung Web Crypto API (SHA-256) untuk pemrosesan transaksi yang aman.');
}

export const CheckoutPage: React.FC = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const slug = (gameId || '').toLowerCase();

  // Tab State: "topup" | "information"
  const [activeTab, setActiveTab] = useState('topup');

  // Auto Slider Banner Header
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // State Form Checkout
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [selectedItem, setSelectedItem] = useState<PublicBrandProduct | null>(null);

  // Phase 5: Dynamic 5-Level Region & ProductCategory States
  const [selectedRegionId, setSelectedRegionId] = useState<number | 'ALL'>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  
  // Dynamic Payment Methods Selection State
  const [selectedPayment, setSelectedPayment] = useState<number | string>('');

  // Phase 4: Neetflix Validation States & Region Lock UX
  const [nickname, setNickname] = useState('');
  const [detectedRegionCode, setDetectedRegionCode] = useState('');
  const [firstTopupTiers, setFirstTopupTiers] = useState<any[]>([]);
  const [isRegionLocked, setIsRegionLocked] = useState(false);
  const [showAllRegionsOverride, setShowAllRegionsOverride] = useState(false);
  const [validMatchedRegionIds, setValidMatchedRegionIds] = useState<number[]>([]);
  const [checkIdError, setCheckIdError] = useState('');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  // State untuk merekam ID & Server yang BENAR-BENAR berhasil divalidasi
  const [validatedUserId, setValidatedUserId] = useState('');
  const [validatedServerId, setValidatedServerId] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedDiscountType, setAppliedDiscountType] = useState<DiscountType>('FLAT');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const currentOwnerScope = getOwnerScope(user);

  // Refs untuk Synchronous Submit Lock & Idempotency Attempt Tracking terikat SHA-256 Fingerprint Hash & Owner Scope
  const checkoutSubmitLockRef = useRef(false);
  const checkoutAttemptRef = useRef<PersistedCheckoutAttempt | null>(null);
  const currentAttemptHashRef = useRef<string | null>(null);

  // Hydrate attempt dari sessionStorage saat halaman dimuat (jika scope user/guest cocok)
  useEffect(() => {
    const all = readAllPersistedAttempts();
    const ownerMap = getAttemptsForOwner(all, currentOwnerScope);
    const ownerAttempts = Object.values(ownerMap);
    if (ownerAttempts.length > 0) {
      ownerAttempts.sort((a, b) => b.createdAt - a.createdAt);
      const newest = ownerAttempts[0];
      checkoutAttemptRef.current = newest;
      currentAttemptHashRef.current = newest.fingerprintHash;
    }
  }, [currentOwnerScope]);

  const resolveCheckoutAttemptKey = async (payload: CheckoutPayload): Promise<string> => {
    const fingerprintHash = await computePayloadFingerprintHash(payload);
    const compositeKey = createAttemptStorageKey(currentOwnerScope, fingerprintHash);
    const all = readAllPersistedAttempts();
    const ownerMap = getAttemptsForOwner(all, currentOwnerScope);
    const existing = ownerMap[compositeKey] || (checkoutAttemptRef.current?.fingerprintHash === fingerprintHash ? checkoutAttemptRef.current : null);

    if (existing) {
      checkoutAttemptRef.current = existing;
      currentAttemptHashRef.current = fingerprintHash;
      return existing.key;
    }

    const newKey = generateIdempotencyKey();
    const newAttempt: PersistedCheckoutAttempt = {
      key: newKey,
      fingerprintHash,
      createdAt: Date.now(),
      ownerScope: currentOwnerScope,
      status: 'PREPARED',
    };
    checkoutAttemptRef.current = newAttempt;
    currentAttemptHashRef.current = fingerprintHash;
    savePersistedAttempt(newAttempt);
    return newKey;
  };

  // Helper untuk reset SELURUH state validasi
  const resetValidationState = React.useCallback(() => {
    setNickname('');
    setDetectedRegionCode('');
    setIsRegionLocked(false);
    setShowAllRegionsOverride(false);
    setValidMatchedRegionIds([]);
    setFirstTopupTiers([]);
    setValidatedUserId('');
    setValidatedServerId('');
    setCheckIdError('');
  }, []);

  // Handler onChange dengan proteksi: hanya reset jika nilai BENAR-BENAR BERBEDA
  const handleUserIdChange = (val: string) => {
    if (val !== userId) {
      setUserId(val);
      resetValidationState();
    }
  };

  const handleServerIdChange = (val: string) => {
    if (val !== serverId) {
      setServerId(val);
      resetValidationState();
    }
  };

  // 1. Query Detail Brand berdasarkan slug
  const {
    data: brandData,
    isLoading: isBrandLoading,
    isError: isBrandError,
    refetch: refetchBrand,
  } = useQuery<PublicBrandDetail, Error>({
    queryKey: queryKeys.public.brands.detail(slug),
    queryFn: async ({ signal }) => {
      const data = await apiFetch<PublicBrandDetail>(`/brands/${slug}`, { signal });
      if (!data || typeof data !== 'object') {
        throw new Error(`Brand detail empty or missing for slug: ${slug}`);
      }
      if (
        typeof data.id !== 'number' || !Number.isFinite(data.id) ||
        typeof data.name !== 'string' || !data.name.trim() ||
        typeof data.slug !== 'string' || !data.slug.trim()
      ) {
        throw new Error(`Brand detail missing mandatory fields (id, name, slug)`);
      }
      if (!Array.isArray(data.products)) {
        throw new Error(`Brand products must be an array`);
      }
      for (const p of data.products) {
        if (
          typeof p.id !== 'number' || !Number.isFinite(p.id) ||
          typeof p.name !== 'string' || !p.name.trim() ||
          typeof p.sku !== 'string' || !p.sku.trim() ||
          typeof p.price !== 'number' || !Number.isFinite(p.price) ||
          typeof p.priceUser !== 'number' || !Number.isFinite(p.priceUser) ||
          typeof p.isActive !== 'boolean'
        ) {
          throw new Error(`Malformed product item found in brand ${slug}`);
        }
      }
      if (!Array.isArray(data.regions)) {
        throw new Error(`Brand regions must be an array`);
      }
      for (const r of data.regions) {
        const isValidCategories = !r.availableCategories || (
          Array.isArray(r.availableCategories) &&
          r.availableCategories.every(
            (c) => typeof c.id === 'number' && Number.isFinite(c.id) && typeof c.name === 'string' && typeof c.slug === 'string' && typeof c.sortOrder === 'number' && Number.isFinite(c.sortOrder)
          )
        );

        if (
          typeof r.id !== 'number' || !Number.isFinite(r.id) ||
          typeof r.name !== 'string' || !r.name.trim() ||
          typeof r.slug !== 'string' || !r.slug.trim() ||
          typeof r.sortOrder !== 'number' || !Number.isFinite(r.sortOrder) ||
          !isValidCategories
        ) {
          throw new Error(`Malformed region item found in brand ${slug}`);
        }
      }
      if (!Array.isArray(data.productCategories)) {
        throw new Error(`Brand productCategories must be an array`);
      }
      for (const c of data.productCategories) {
        if (
          typeof c.id !== 'number' || !Number.isFinite(c.id) ||
          typeof c.name !== 'string' || !c.name.trim() ||
          typeof c.slug !== 'string' || !c.slug.trim() ||
          typeof c.sortOrder !== 'number' || !Number.isFinite(c.sortOrder)
        ) {
          throw new Error(`Malformed productCategory item found in brand ${slug}`);
        }
      }

      // Validasi bentuk JSON opsional yang dikirim backend
      if (data.customFields !== null && data.customFields !== undefined && !Array.isArray(data.customFields)) {
        throw new Error(`customFields in brand ${slug} must be an array or null`);
      }
      if (data.promoScreenshots !== null && data.promoScreenshots !== undefined && (!Array.isArray(data.promoScreenshots) || !data.promoScreenshots.every(s => typeof s === 'string'))) {
        throw new Error(`promoScreenshots in brand ${slug} must be an array of strings or null`);
      }
      if (data.eventsAndOffers !== null && data.eventsAndOffers !== undefined && !Array.isArray(data.eventsAndOffers)) {
        throw new Error(`eventsAndOffers in brand ${slug} must be an array or null`);
      }

      return data;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const products: PublicBrandProduct[] = React.useMemo(() => {
    return brandData?.products || [];
  }, [brandData]);

  // 2. Query Daftar Metode Pembayaran
  const paymentMethodsQueryResult = useQuery({
    queryKey: queryKeys.public.paymentMethods.all,
    queryFn: async ({ signal }): Promise<PublicPaymentMethod[]> => {
      const data = await apiFetch<PublicPaymentMethod[]>('/payment-methods', { signal });
      if (!Array.isArray(data)) {
        throw new Error('Invalid /payment-methods response: expected array');
      }
      for (const item of data) {
        if (
          typeof item.id !== 'number' || !Number.isFinite(item.id) ||
          typeof item.name !== 'string' || !item.name.trim() ||
          typeof item.code !== 'string' || !item.code.trim() ||
          !isPaymentMethodType(item.type) ||
          typeof item.feeFlat !== 'number' || !Number.isFinite(item.feeFlat) ||
          typeof item.feePercent !== 'number' || !Number.isFinite(item.feePercent) ||
          (item.iconUrl !== null && typeof item.iconUrl !== 'string') ||
          typeof item.isActive !== 'boolean'
        ) {
          throw new Error('Invalid payment method item: malformed data or missing mandatory fields');
        }
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const paymentMethodsList = paymentMethodsQueryResult.data || [];
  const isPaymentLoading = paymentMethodsQueryResult.isLoading;
  const isPaymentError = paymentMethodsQueryResult.isError;
  const isPaymentRefetching = paymentMethodsQueryResult.isRefetching;
  const refetchPaymentMethods = paymentMethodsQueryResult.refetch;

  // Effect UI: Reset input & state validasi game lama saat slug berubah
  useEffect(() => {
    setUserId('');
    setServerId('');
    resetValidationState();
    setSelectedRegionId('ALL');
    setSelectedCategoryId('ALL');
    setSelectedItem(null);
    setSelectedPayment('');
    setPromoCode('');
    setAppliedDiscount(0);
    setAppliedDiscountType('FLAT');
    setAppliedVoucherCode('');
    setVoucherError('');
    checkoutAttemptRef.current = null;
    checkoutSubmitLockRef.current = false;
  }, [slug, resetValidationState]);

  // Effect UI: Auto-select metode pembayaran AKTIF pertama saat list dimuat
  useEffect(() => {
    const activePaymentMethods = paymentMethodsList.filter((p) => p.isActive !== false);
    if (activePaymentMethods.length > 0) {
      if (!selectedPayment || !activePaymentMethods.some((p) => p.id === selectedPayment)) {
        setSelectedPayment(activePaymentMethods[0].id);
      }
    }
  }, [paymentMethodsList, selectedPayment]);

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

  // 3. Mutation Cek Voucher
  const checkVoucherMutation = useMutation<PublicVoucherCheckResponse, Error, string>({
    mutationFn: async (rawCode: string): Promise<PublicVoucherCheckResponse> => {
      const code = rawCode.trim().toUpperCase();
      if (!code) {
        throw new Error('Kode promo tidak boleh kosong.');
      }
      const data = await checkoutApi.checkVoucher(code);
      if (
        !data || typeof data !== 'object' ||
        typeof data.id !== 'number' || !Number.isFinite(data.id) ||
        typeof data.code !== 'string' || !data.code.trim() ||
        !isVoucherDiscountType(data.discountType) ||
        typeof data.discountValue !== 'number' || !Number.isFinite(data.discountValue) || data.discountValue < 0
      ) {
        throw new Error('Response voucher dari server tidak valid.');
      }

      if (data.discountType === 'PERCENT' && data.discountValue > 100) {
        throw new Error('Diskon persentase tidak boleh lebih dari 100%.');
      }

      return data;
    },
    onMutate: () => {
      setVoucherError('');
    },
    onSuccess: (data) => {
      setAppliedDiscount(data.discountValue);
      setAppliedDiscountType(data.discountType);
      setAppliedVoucherCode(data.code);
      setVoucherError('');
      setToast({
        type: 'success',
        title: 'PROMO DITERAPKAN',
        message: `Kamu mendapatkan potongan diskon ${data.discountType === 'PERCENT' ? data.discountValue + '%' : 'Rp ' + data.discountValue.toLocaleString('id-ID')}!`,
      });
    },
    onError: (error: unknown) => {
      setAppliedDiscount(0);
      setAppliedDiscountType('FLAT');
      setAppliedVoucherCode('');

      let errorMessage = 'Gagal memvalidasi promo.';
      if (isAxiosError<ApiErrorResponse>(error)) {
        errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setVoucherError(errorMessage);
      setToast({
        type: 'error',
        title: 'KODE PROMO TIDAK VALID',
        message: errorMessage,
      });
    },
  });

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code || checkVoucherMutation.isPending) return;
    checkVoucherMutation.mutate(code);
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(0);
    setAppliedDiscountType('FLAT');
    setAppliedVoucherCode('');
    setPromoCode('');
    setVoucherError('');
    setToast({
      type: 'info',
      title: 'PROMO DICABUT',
      message: 'Kode promo telah dihapus.',
    });
  };

  // 4. Mutation Validasi Akun Game
  const validateAccountMutation = useMutation<
    PublicNeetflixValidationResponse,
    Error,
    { brandId: number; slug: string; userId: string; zoneId?: string }
  >({
    mutationFn: async (params) => {
      const res = await checkoutApi.validateNeetflixAccount(
        params.brandId,
        params.userId,
        params.zoneId
      );
      if (!res || typeof res !== 'object' || typeof res.success !== 'boolean') {
        throw new Error('Response validasi akun dari server tidak valid.');
      }

      if (res.success) {
        if (!res.data || typeof res.data !== 'object') {
          throw new Error('Data validasi akun dari server kosong.');
        }
        const d = res.data;
        if (typeof d.nickname !== 'string' || !d.nickname.trim()) {
          throw new Error('Nickname dari server tidak valid.');
        }
        if (d.detectedRegionCode !== undefined && typeof d.detectedRegionCode !== 'string') {
          throw new Error('Kode region dari server tidak valid.');
        }
        if (d.detectedCountry !== undefined && typeof d.detectedCountry !== 'string') {
          throw new Error('Kode negara dari server tidak valid.');
        }
        if (
          d.recommendedRegionId !== undefined &&
          d.recommendedRegionId !== null &&
          (typeof d.recommendedRegionId !== 'number' || !Number.isFinite(d.recommendedRegionId))
        ) {
          throw new Error('Recommended region ID dari server tidak valid.');
        }
        if (
          d.matchedRegionId !== undefined &&
          d.matchedRegionId !== null &&
          (typeof d.matchedRegionId !== 'number' || !Number.isFinite(d.matchedRegionId))
        ) {
          throw new Error('Matched region ID dari server tidak valid.');
        }
        if (
          d.matchedRegionIds !== undefined &&
          (!Array.isArray(d.matchedRegionIds) ||
            !d.matchedRegionIds.every((id) => typeof id === 'number' && Number.isFinite(id)))
        ) {
          throw new Error('Matched region IDs dari server tidak valid.');
        }
        if (d.firstTopupAvailable !== undefined && typeof d.firstTopupAvailable !== 'boolean') {
          throw new Error('First topup status dari server tidak valid.');
        }
        if (
          d.firstTopupTiers !== undefined &&
          (!Array.isArray(d.firstTopupTiers) ||
            !d.firstTopupTiers.every((tier) => typeof tier === 'string'))
        ) {
          throw new Error('First topup tiers dari server tidak valid.');
        }
      } else {
        if (res.error !== undefined && typeof res.error !== 'string') {
          throw new Error('Format error dari server tidak valid.');
        }
        if (res.message !== undefined && typeof res.message !== 'string') {
          throw new Error('Format message dari server tidak valid.');
        }
      }

      return res;
    },
    onMutate: () => {
      setNickname('');
      setDetectedRegionCode('');
      setFirstTopupTiers([]);
      setCheckIdError('');
    },
    onSuccess: (res, variables) => {
      // Proteksi Stale Response: Pastikan snapshot input saat request dipicu masih persis sama dengan state aktif
      if (
        variables.slug !== slug ||
        variables.userId.trim() !== userId.trim() ||
        (variables.zoneId || '').trim() !== serverId.trim()
      ) {
        return; // Abaikan respons lama secara diam-diam tanpa memperbarui UI
      }

      if (res.success && res.data) {
        setNickname(res.data.nickname);
        setValidatedUserId(variables.userId.trim());
        setValidatedServerId((variables.zoneId || '').trim());

        const targetRegionId = res.data.recommendedRegionId ?? res.data.matchedRegionId;
        if (targetRegionId) {
          // Verifikasi keberadaan Region ID terhadap brand aktif di DB
          const isValidBrandRegion = brandData?.regions?.some((r) => r.id === targetRegionId);
          if (isValidBrandRegion) {
            setSelectedRegionId(targetRegionId); // Auto-Lock Recommended Region yang valid
            setIsRegionLocked(true);
            setShowAllRegionsOverride(false);
          }
        }

        if (res.data.matchedRegionIds && Array.isArray(res.data.matchedRegionIds)) {
          const validMatchedIds = res.data.matchedRegionIds.filter((id) =>
            brandData?.regions?.some((r) => r.id === id)
          );
          setValidMatchedRegionIds(validMatchedIds);
        } else if (targetRegionId && brandData?.regions?.some((r) => r.id === targetRegionId)) {
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
        setValidatedUserId('');
        setValidatedServerId('');
        const errMsg = res.error || res.message || 'ID tidak terdeteksi, jika benar silakan lanjut.';
        setCheckIdError(errMsg);
        setToast({ type: 'error', title: 'ID TIDAK VALID', message: errMsg });
      }
    },
    onError: (error: unknown, variables) => {
      // Proteksi Stale Response pada Jalur Error
      if (
        variables.slug !== slug ||
        variables.userId.trim() !== userId.trim() ||
        (variables.zoneId || '').trim() !== serverId.trim()
      ) {
        return;
      }

      setValidatedUserId('');
      setValidatedServerId('');
      let errMsg = 'ID tidak terdeteksi, jika benar silakan lanjut.';
      if (isAxiosError<ApiErrorResponse>(error)) {
        errMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          errMsg;
      } else if (error instanceof Error) {
        errMsg = error.message;
      }
      setCheckIdError(errMsg);
      setToast({ type: 'error', title: 'GAGAL CEK ID', message: errMsg });
    },
  });

  const isCheckingId = validateAccountMutation.isPending;

  const handleCheckId = () => {
    if (!userId.trim()) {
      setToast({ type: 'warning', title: 'USER ID KOSONG', message: 'Silakan isi User ID kamu!' });
      return;
    }
    if (!brandData || validateAccountMutation.isPending) return;

    validateAccountMutation.mutate({
      brandId: brandData.id,
      slug,
      userId: userId.trim(),
      zoneId: serverId.trim() || undefined,
    });
  };

  const getPaymentDetails = (id: number | string) => {
    const selected = paymentMethodsList.find(p => p.id === id);
    if (!selected) return { feeFlat: 0, feePercent: 0 };
    return { feeFlat: selected.feeFlat || 0, feePercent: selected.feePercent || 0 };
  };

  const getCheckoutBreakdown = React.useCallback(() => {
    const { feeFlat, feePercent } = getPaymentDetails(selectedPayment);
    return calculateCheckoutBreakdown({
      basePrice: selectedItem?.price || 0,
      appliedDiscount,
      appliedDiscountType,
      feeFlat,
      feePercent,
    });
  }, [selectedItem, appliedDiscount, appliedDiscountType, selectedPayment, paymentMethodsList]);

  const calculateTotal = () => {
    return getCheckoutBreakdown().grandTotal;
  }; 
  
  // 5. Mutation Submit Transaksi Checkout
  const checkoutMutation = useMutation<
    CheckoutSuccessResponse,
    unknown,
    CheckoutMutationVariables
  >({
    mutationFn: async (variables): Promise<CheckoutSuccessResponse> => {
      // TRANSISI LIFECYCLE 1 -> 2: IN_FLIGHT (menggunakan SNAPSHOT dari variables per-request)
      updateAttemptStatus(variables.attemptHash, 'IN_FLIGHT', variables.ownerScope);

      const res = await checkoutApi.checkoutPayment(variables.payload, variables.idempotencyKey);
      if (!res || !isCheckoutSuccessResponse(res)) {
        throw new Error('Response transaksi dari server tidak valid.');
      }
      return res;
    },
    retry: false, // Strict: TIDAK BOLEH auto-retry transaksi checkout
    onSuccess: (data, variables) => {
      // PENTING: Gunakan SNAPSHOT variables.ownerScope
      if (variables.ownerScope.startsWith('user:')) {
        const userIdFromScope = Number(variables.ownerScope.replace('user:', ''));
        if (Number.isFinite(userIdFromScope)) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.user.transactions.byUser(userIdFromScope),
          });
        }
      }

      setToast({
        type: 'success',
        title: 'PESANAN DIBUAT',
        message: 'Transaksi berhasil diproses.',
      });
      setIsConfirmModalOpen(false);

      // TRANSISI LIFECYCLE -> SELESAI: Hapus attempt berdasarkan SNAPSHOT variables
      removePersistedAttempt(variables.attemptHash, variables.ownerScope);
      checkoutAttemptRef.current = null;
      currentAttemptHashRef.current = null;

      setPromoCode('');
      setAppliedDiscount(0);
      setAppliedDiscountType('FLAT');
      setAppliedVoucherCode('');
      setVoucherError('');

      navigate(`/invoice/${encodeURIComponent(data.invoiceId)}`);
    },
    onError: (error: unknown, variables) => {
      let errorMessage = 'Gagal memproses pembayaran.';
      let isFinalBusinessError = false;

      if (isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const serverData = error.response?.data;
        const serverCode = serverData?.code;
        const serverErr = serverData?.error || serverData?.message;

        if (status === 409) {
          if (serverCode === 'PRICE_CHANGED') {
            isFinalBusinessError = true;
            errorMessage = serverErr || 'Harga modal atau status produk telah berubah. Silakan tinjau ulang.';
            refetchBrand();
          } else {
            isFinalBusinessError = false;
            errorMessage = serverErr || 'Terjadi konflik transaksi atau idempotency key. Silakan periksa kembali.';
          }
        } else if (status === 401) {
          isFinalBusinessError = true;
          errorMessage = serverErr || 'Anda harus login terlebih dahulu atau sesi telah berakhir.';
        } else if (status === 400) {
          isFinalBusinessError = true;
          errorMessage = serverErr || 'Data transaksi tidak valid atau saldo/kuota tidak mencukupi.';
        } else if (status === 503) {
          errorMessage = serverErr || 'Layanan supplier sedang tidak tersedia. Silakan coba beberapa saat lagi.';
        } else {
          errorMessage = serverErr || error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (isFinalBusinessError) {
        // TRANSISI LIFECYCLE -> HAPUS: Error 400/401/409 dipastikan terjadi SEBELUM transaksi DB dibuat
        removePersistedAttempt(variables.attemptHash, variables.ownerScope);
        checkoutAttemptRef.current = null;
        currentAttemptHashRef.current = null;
      } else {
        // TRANSISI LIFECYCLE 2 -> 3: UNKNOWN_RESULT (Network timeout/50x/409 generik) -> SIMPAN PERMANEN DI STORAGE
        updateAttemptStatus(variables.attemptHash, 'UNKNOWN_RESULT', variables.ownerScope);
      }

      setToast({
        type: 'error',
        title: 'TRANSAKSI GAGAL',
        message: errorMessage,
      });
      setIsConfirmModalOpen(false);
    },
    onSettled: () => {
      checkoutSubmitLockRef.current = false;
    },
  });

  const isSubmitting = checkoutMutation.isPending;

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

    // Phase 4 Guard: Jika game mendukung Cek ID (validationGameCode), pastikan ID divalidasi & tidak berubah
    if (brandData?.validationGameCode) {
      const currentUserId = userId.trim();
      const currentServerId = serverId.trim();

      if (!validatedUserId) {
        setToast({
          id: `t_${Date.now()}`,
          type: 'warning',
          title: 'CEK ID DIPERLUKAN',
          message: 'Silakan lakukan Cek ID terlebih dahulu.',
        });
        return;
      }

      if (currentUserId !== validatedUserId || currentServerId !== validatedServerId) {
        setToast({
          id: `t_${Date.now()}`,
          type: 'warning',
          title: 'DATA AKUN BERUBAH',
          message: 'User ID atau Server telah berubah. Silakan lakukan Cek ID kembali.',
        });
        return;
      }
    }

    if (!selectedItem || !selectedPayment) {
      setIsConfirmModalOpen(true);
      return;
    }

    // Persiapkan draft payload & trigger resolving attempt key async
    const draftPayload: CheckoutPayload = {
      productId: selectedItem.id,
      targetAccount: userId.trim(),
      targetZone: serverId.trim() || undefined,
      nickname: nickname.trim() || undefined,
      paymentMethod: selectedPayment,
      voucherCode: appliedDiscount > 0 ? (appliedVoucherCode || promoCode).trim().toUpperCase() : undefined,
      whatsapp: whatsapp.trim() || undefined,
    };

    resolveCheckoutAttemptKey(draftPayload).catch(() => {});
    setIsConfirmModalOpen(true);
  };

  const handleFinalPayment = async () => {
    // Synchronous submit lock via Ref untuk mencegah double-event sebelum render berikutnya
    if (checkoutSubmitLockRef.current || checkoutMutation.isPending) return;
    checkoutSubmitLockRef.current = true;

    if (!agreeTerms) {
      checkoutSubmitLockRef.current = false;
      setToast({
        id: `t_${Date.now()}`,
        type: 'warning',
        title: 'SYARAT & KETENTUAN',
        message: 'Anda harus menyetujui Syarat & Ketentuan transaksi.',
      });
      return;
    }

    if (!selectedItem) {
      checkoutSubmitLockRef.current = false;
      setToast({ type: 'error', title: 'PRODUK KOSONG', message: 'Silakan pilih nominal topup.' });
      return;
    }
    if (!selectedPayment) {
      checkoutSubmitLockRef.current = false;
      setToast({ type: 'error', title: 'PEMBAYARAN KOSONG', message: 'Silakan pilih metode pembayaran.' });
      return;
    }

    const payload: CheckoutPayload = {
      productId: selectedItem.id,
      targetAccount: userId.trim(),
      targetZone: serverId.trim() || undefined,
      nickname: nickname.trim() || undefined,
      paymentMethod: selectedPayment,
      voucherCode: appliedDiscount > 0 ? (appliedVoucherCode || promoCode).trim().toUpperCase() : undefined,
      whatsapp: whatsapp.trim() || undefined,
    };

    let activeKey = '';
    let attemptHash = '';
    try {
      attemptHash = await computePayloadFingerprintHash(payload);
      activeKey = await resolveCheckoutAttemptKey(payload);
    } catch (err: unknown) {
      checkoutSubmitLockRef.current = false;
      const msg = err instanceof Error ? err.message : 'Gagal memproses kunci idempotensi.';
      setToast({ type: 'error', title: 'KEAMANAN TRANSAKSI', message: msg });
      return;
    }

    checkoutMutation.mutate({
      payload,
      idempotencyKey: activeKey,
      attemptHash,
      ownerScope: currentOwnerScope,
      slug,
    });
  };

  if (isBrandLoading || isPaymentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutalist-grid">
        <span className="font-black text-2xl uppercase tracking-wider text-[var(--nb-text)]">MEMUAT DETAIL GAME & PEMBAYARAN...</span>
      </div>
    );
  }

  if (isBrandError || isPaymentError || !brandData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brutalist-grid gap-4 py-20 px-4 text-center">
        <h2 className="text-2xl font-black uppercase text-red-500">GAME TIDAK DITEMUKAN / GAGAL MEMUAT DATA</h2>
        <p className="text-sm font-bold text-[var(--nb-text-muted)]">Data katalog game &quot;{slug}&quot; tidak dapat diakses saat ini.</p>
        <Button variant="yellow" onClick={() => navigate('/')}>KEMBALI KE BERANDA</Button>
      </div>
    );
  }

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
          <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] rounded-xl sm:rounded-2xl border-[2.5px] sm:border-[3.5px] border-[var(--nb-border)] shadow-[4px_4px_0px_0px_var(--nb-shadow)] overflow-hidden bg-[var(--nb-surface-alt)] group">
            <img
              src={optimizeGoogleBanner(headerBanners[bannerIndex])}
              alt={`${gameTitle} Banner Slide ${bannerIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700"
            />

            {/* Top Up Resmi Badge Overlay */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              <Sticker variant="mint" size="md" angle="-rotate-3">
                <ShieldCheck className="w-3.5 h-3.5 fill-black stroke-[2]" />
                <span>TOP UP RESMI</span>
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
                            <div key={field.id || index} className={`${isFirst ? ((brandData.customFields?.length || 0) === 1 ? 'col-span-12' : 'col-span-7 sm:col-span-8') : 'col-span-5 sm:col-span-4'}`}>
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
                                  onChange={(e) => isFirst ? handleUserIdChange(e.target.value) : handleServerIdChange(e.target.value)}
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
                                  onChange={(e) => isFirst ? handleUserIdChange(e.target.value) : handleServerIdChange(e.target.value)}
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
                    {isPaymentError ? (
                      <div className="p-4 bg-red-100 border-2 border-red-500 rounded text-red-600 font-bold text-center text-xs sm:text-sm flex flex-col items-center gap-2 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]">
                        <span>⚠️ GAGAL MEMUAT METODE PEMBAYARAN.</span>
                        <Button variant="yellow" size="sm" onClick={() => { void refetchPaymentMethods(); }} disabled={isPaymentRefetching}>
                          {isPaymentRefetching ? 'MEMUAT...' : 'COBA LAGI'}
                        </Button>
                      </div>
                    ) : paymentMethodsList.length === 0 ? (
                      <div className="p-4 bg-yellow-100 border-2 border-yellow-500 rounded text-yellow-800 font-bold text-center text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(234,179,8,1)]">
                        Belum ada metode pembayaran yang tersedia saat ini.
                      </div>
                    ) : (
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
                                  <div className="w-5 h-5 bg-black text-white border-[1.5px] border-[var(--nb-border)] rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_var(--nb-shadow)] shrink-0">
                                    <Check className="w-3 h-3 stroke-[3.5]" />
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-xs font-bold bg-[var(--nb-dark-bg)] text-[var(--nb-dark-text)] py-1 px-2 rounded w-fit uppercase">
                                {(method.feeFlat ?? 0) > 0 ? `+ Rp ${(method.feeFlat ?? 0).toLocaleString('id-ID')} Fee` : ((method.feePercent ?? 0) > 0 ? `+ ${method.feePercent}% Fee` : 'BEBAS BIAYA ADMIN')}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </RadioGroup>
                    )}
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
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Kode Promo (NEON30)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="text-xs uppercase bg-[var(--nb-surface)]"
                      disabled={checkVoucherMutation.isPending}
                    />
                    {appliedDiscount > 0 ? (
                      <Button type="button" variant="pink" size="sm" onClick={handleRemovePromo} disabled={checkVoucherMutation.isPending}>
                        HAPUS
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant={promoButtonTheme}
                        size="sm"
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim() || checkVoucherMutation.isPending}
                      >
                        {checkVoucherMutation.isPending ? 'MEMERIKSA...' : 'PAKAI'}
                      </Button>
                    )}
                  </div>
                  {voucherError && (
                    <span className="text-[11px] font-bold text-red-600">⚠️ {voucherError}</span>
                  )}
                </div>

                {appliedDiscount > 0 && (
                  <div className="bg-[var(--nb-mint)] text-[var(--nb-text)] p-2.5 border-[2px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] flex items-center justify-between font-bold text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span className="uppercase">PROMO {appliedVoucherCode || promoCode} DITERAPKAN!</span>
                    </div>
                    <button type="button" onClick={handleRemovePromo} className="text-xs text-red-600 underline font-black">
                      HAPUS
                    </button>
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
                      <span>- Rp {getCheckoutBreakdown().discountAmount.toLocaleString('id-ID')}</span>
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
