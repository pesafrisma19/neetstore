import type { AxiosRequestConfig } from 'axios';
import { api } from '../services/api';

// =====================================================
// Base URL — otomatis sesuai environment
// =====================================================


// =====================================================
// HELPER: Generic fetch dengan error handling (Menggunakan Axios)
// =====================================================
export const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T | null> => {
  try {
    const axiosConfig: AxiosRequestConfig = {
      method: (options?.method as AxiosRequestConfig['method']) || 'GET',
      url: path, // baseURL is already set in axios instance
      headers: (options?.headers as AxiosRequestConfig['headers']) || {},
      data: options?.body, // Axios uses 'data' instead of 'body'
      signal: options?.signal as AxiosRequestConfig['signal'],
    };

    // Otomatis parse JSON jika string
    if (typeof axiosConfig.data === 'string') {
      try {
        axiosConfig.data = JSON.parse(axiosConfig.data);
      } catch (e) {
        // Biarkan sebagai string jika gagal parse
      }
    }

    const res = await api.request<T>(axiosConfig);
    
    // Attach pagination metadata safely without breaking existing array expectations
    if (res.headers['x-total-count'] && typeof res.data === 'object' && res.data !== null) {
      (res.data as any)._meta = {
        totalCount: parseInt(res.headers['x-total-count'] as string) || 0,
        totalPages: parseInt(res.headers['x-total-pages'] as string) || 0
      };
    }

    return res.data;
  } catch (error: any) {
    // Jika ada response dari server (bukan network error murni), lempar ulang agar
    // consumer bisa menangani error secara eksplisit (mis. 401, 403, 404, dll.)
    // sehingga tidak ada kasus object error yang dikira array/data valid.
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || `Error ${error.response.status}`;
      throw new Error(message);
    }
    // Untuk network failure murni (no response), tetap return null
    return null;
  }
};

// =====================================================
// TYPES
// =====================================================
export interface PublicBrandCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBrand {
  id: number;
  categoryId: number;
  category: PublicBrandCategory;
  name: string;
  slug: string;
  publisher: string | null;
  googlePlayId: string | null;
  thumbnail: string | null;
  bannerUrl: string | null;
  description: string | null;
  validationGameCode: string | null;
  customFields?: { fieldName: string; fieldType: string; fieldLabel: string; required?: boolean; placeholder?: string; options?: string[] }[] | null;
  promoScreenshots?: string[] | null;
  eventsAndOffers?: { title: string; badge: string; bannerUrl: string }[] | null;
  whatsNew?: string | null;
  releasedOn?: string | null;
  updatedOn?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBrandProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  priceUser: number;
  priceMember: number;
  priceReseller: number;
  priceVip: number;
  originalPrice: number;
  isActive: boolean;
  isPopular: boolean;
  isFlashsale: boolean;
  flashsalePrice: number | null;
  brandId: number | null;
  regionId: number | null;
  productCategoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBrandRegion {
  id: number;
  name: string;
  slug: string;
  code: string | null;
  sortOrder: number;
  availableCategories?: PublicBrandProductCategory[];
}

export interface PublicBrandProductCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface PublicBrandDetail extends PublicBrand {
  products: PublicBrandProduct[];
  regions: PublicBrandRegion[];
  productCategories: PublicBrandProductCategory[];
}

export const PAYMENT_METHOD_TYPES = [
  'SALDO_AKUN',
  'QRIS',
  'E-WALLET',
  'VIRTUAL_ACCOUNT',
  'RETAIL',
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export function isPaymentMethodType(val: unknown): val is PaymentMethodType {
  return typeof val === 'string' && (PAYMENT_METHOD_TYPES as readonly string[]).includes(val);
}

export interface PublicPaymentMethod {
  id: number;
  name: string;
  code: string;
  type: PaymentMethodType;
  feeFlat: number;
  feePercent: number;
  iconUrl: string | null;
  isActive: boolean;
}

export const VOUCHER_DISCOUNT_TYPES = ['FLAT', 'PERCENT'] as const;

export type VoucherDiscountType = (typeof VOUCHER_DISCOUNT_TYPES)[number];

export function isVoucherDiscountType(val: unknown): val is VoucherDiscountType {
  return typeof val === 'string' && (VOUCHER_DISCOUNT_TYPES as readonly string[]).includes(val);
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

export interface PublicVoucherCheckResponse {
  id: number;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
}

export interface PublicNeetflixValidationResult {
  nickname: string;
  detectedRegionCode?: string;
  detectedCountry?: string;
  recommendedRegionId?: number | null;
  matchedRegionId?: number | null;
  matchedRegionIds?: number[];
  firstTopupAvailable?: boolean;
  firstTopupTiers?: string[];
}

export interface PublicNeetflixValidationResponse {
  success: boolean;
  data?: PublicNeetflixValidationResult;
  error?: string;
  message?: string;
}

export interface CheckoutPayload {
  productId: number;
  targetAccount: string;
  targetZone?: string;
  nickname?: string;
  paymentMethod: number | string;
  voucherCode?: string;
  whatsapp?: string;
}

export interface CheckoutSuccessResponse {
  success: boolean;
  transactionId: number;
  invoiceId: string;
  paymentStatus: TransactionPaymentStatus;
  orderStatus: TransactionOrderStatus;
  isIdempotentReplay?: boolean;
}

export function isCheckoutSuccessResponse(val: unknown): val is CheckoutSuccessResponse {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    obj.success === true &&
    typeof obj.transactionId === 'number' && Number.isFinite(obj.transactionId) &&
    typeof obj.invoiceId === 'string' && obj.invoiceId.trim().length > 0 &&
    isTransactionPaymentStatus(obj.paymentStatus) &&
    isTransactionOrderStatus(obj.orderStatus) &&
    (obj.isIdempotentReplay === undefined || typeof obj.isIdempotentReplay === 'boolean')
  );
}

export const TRANSACTION_PAYMENT_STATUSES = [
  'UNPAID',
  'PAID',
  'FAILED',
  'REFUND',
] as const;

export type TransactionPaymentStatus = (typeof TRANSACTION_PAYMENT_STATUSES)[number];

export function isTransactionPaymentStatus(val: unknown): val is TransactionPaymentStatus {
  return typeof val === 'string' && (TRANSACTION_PAYMENT_STATUSES as readonly string[]).includes(val);
}

export const TRANSACTION_ORDER_STATUSES = [
  'PENDING',
  'PROCESS',
  'SUCCESS',
  'FAILED',
] as const;

export type TransactionOrderStatus = (typeof TRANSACTION_ORDER_STATUSES)[number];

export function isTransactionOrderStatus(val: unknown): val is TransactionOrderStatus {
  return typeof val === 'string' && (TRANSACTION_ORDER_STATUSES as readonly string[]).includes(val);
}

export interface UserTransactionItem {
  id: number;
  providerRef: string | null;
  userId: number;
  productId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: TransactionPaymentStatus;
  orderStatus: TransactionOrderStatus;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  } | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  googlePlayId: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export interface GPlayMeta {
  appId: string;
  title: string | null;
  developer: string | null;
  genre?: string | null;
  installs?: string | null;
  url?: string | null;
  icon: string | null;
  headerBanner: string | null;
  whatsNew: string | null;
  eventsAndOffers: { title: string; badge: string; bannerUrl: string }[];
  promoScreenshots: string[];
  description: string | null;
  updatedOn: string | null;
  releasedOn: string | null;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  digiflazzSku: string;
  price: number;
  originalPrice: number;
  isActive: boolean;
  isPopular: boolean;
  isFlashsale: boolean;
  flashsalePrice: number | null;
  soldCount: number;
  category: { name: string; slug: string; icon: string | null; googlePlayId: string | null } | null;
}

export interface Banner {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
}

// =====================================================
// PUBLIC ENDPOINTS (tidak butuh login)
// =====================================================

/** Semua kategori game untuk grid Home */
export const getCategories = () => apiFetch<Category[]>('/categories');

/** Semua produk dari database */
export const getProducts = () => apiFetch<Product[]>('/products');

/** Produk populer untuk section Popular */
export const getPopularProducts = () => apiFetch<Product[]>('/products/popular');

/** Produk flash sale */
export const getFlashsaleProducts = () => apiFetch<Product[]>('/products/flashsale');

/** Produk berdasarkan kategori slug — untuk halaman Checkout */
export const getCategoryBySlug = (slug: string) => apiFetch<Category & { products: Product[] }>(`/categories/${slug}`);

/** Produk berdasarkan brand slug - untuk halaman Checkout yang benar */
export const getBrandBySlug = (slug: string) => apiFetch<any>(`/brands/${slug}`);

/** Banner slider dari DB (banner manual admin) */
export const getBanners = () => apiFetch<Banner[]>('/banners');

/** Cari produk */
export const searchProducts = (q: string) => apiFetch<{ products: Product[]; categories: Category[] }>(`/search?q=${encodeURIComponent(q)}`);

// =====================================================
// GOOGLE PLAY PROXY (live scrape, cache RAM di server)
// =====================================================

/** 
 * Metadata game dari Google Play (icon, banner, news, events)
 * Hanya untuk brand yang punya googlePlayId
 */
export const getGPlayMeta = (appId: string) => apiFetch<GPlayMeta>(`/gplay/${appId}`);

// =====================================================
// AUTH ENDPOINTS
// =====================================================
export const login = (username: string, password: string) =>
  apiFetch<{ token: string; user: any; [key: string]: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const register = (username: string, password: string, phone?: string) =>
  apiFetch<{ token: string; user: any; [key: string]: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, phone }),
  });

/** Trigger manual sync produk Digiflazz dari Admin Panel ke Database */
export const syncDigiflazzNow = () =>
  apiFetch<{ message?: string; error?: string }>('/digiflazz/sync-now', {
    method: 'POST',
  });

export const checkDigiflazzBalance = () =>
  apiFetch<{ data?: { deposit: number }; error?: string }>('/digiflazz/saldo', {
    method: 'POST',
  });

export const requestDigiflazzDeposit = (data: { amount: number; bank: string; owner_name: string }) =>
  apiFetch<{
    success?: boolean;
    data?: {
      rc: string;
      bank: string;
      payment_method: string;
      account_no: string;
      notes: string;
      amount: number;
    };
    error?: string;
  }>('/digiflazz/deposit', {
    method: 'POST',
    body: JSON.stringify(data),
  });


/** Ambil seluruh daftar brand game dari Database untuk Admin Panel & Home */
export const getAdminBrands = () => apiFetch<any[]>('/admin/brands');
export const createAdminCategory = (data: any) => apiFetch<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const updateAdminCategory = (id: number, data: any) => apiFetch<any>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const deleteAdminCategory = (id: number) => apiFetch<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE' });

/** Ambil daftar metode pembayaran untuk publik (Checkout) */
export const getPaymentMethods = () => apiFetch<any[]>('/payment-methods');

/** Validasi kode voucher untuk Checkout */
export const checkVoucher = (code: string) => apiFetch<any>('/voucher/check', { method: 'POST', body: JSON.stringify({ code }) });

export const createAdminBrand = (data: Partial<any>) => apiFetch<any>('/admin/brands', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminBrand = (id: number, data: Partial<any>) => apiFetch<any>(`/admin/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminBrand = (id: number) => apiFetch<{ message: string }>(`/admin/brands/${id}`, { method: 'DELETE' });

// === Vouchers ===
export const getAdminVouchers = () => apiFetch<any[]>('/admin/vouchers');
export const createAdminVoucher = (data: any) => apiFetch<any>('/admin/vouchers', { method: 'POST', body: data });
export const updateAdminVoucher = (id: number, data: any) => apiFetch<any>(`/admin/vouchers/${id}`, { method: 'PATCH', body: data });
export const deleteAdminVoucher = (id: number) => apiFetch<{ message: string }>(`/admin/vouchers/${id}`, { method: 'DELETE' });

// === Payment Methods ===
export const getAdminPaymentMethods = () => apiFetch<any[]>('/admin/payment-methods');
export const createAdminPaymentMethod = (data: any) => apiFetch<any>('/admin/payment-methods', { method: 'POST', body: data });
export const updateAdminPaymentMethod = (id: number, data: any) => apiFetch<any>(`/admin/payment-methods/${id}`, { method: 'PATCH', body: data });
export const deleteAdminPaymentMethod = (id: number) => apiFetch<{ message: string }>(`/admin/payment-methods/${id}`, { method: 'DELETE' });

// === Payment Gateways ===
export const getAdminPaymentGateways = () => apiFetch<any[]>('/admin/payment-gateways');
export const updateAdminPaymentGateway = (id: number, data: any) => apiFetch<any>(`/admin/payment-gateways/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const checkTokoPayBalance = () => apiFetch<any>('/tokopay/saldo', { method: 'POST' });
export const checkTokoPayOrderStatus = (ref_id: string) => apiFetch<any>('/tokopay/status', { method: 'POST', body: JSON.stringify({ ref_id }) });
export const requestTokoPayWithdrawal = (nominal: number) => apiFetch<any>('/tokopay/tarik-saldo', { method: 'POST', body: JSON.stringify({ nominal }) });

// === Providers ===
export const getAdminProviders = () => apiFetch<any[]>('/admin/providers');
export const createAdminProvider = (data: any) => apiFetch<any>('/admin/providers', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminProvider = (id: number, data: any) => apiFetch<any>(`/admin/providers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const syncDigiflazzProducts = syncDigiflazzNow;

// === Products ===
export const getAdminProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  productCategoryId?: string;
  status?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.categoryId && params.categoryId !== 'ALL') query.append('categoryId', params.categoryId);
  if (params?.brandId && params.brandId !== 'ALL') query.append('brandId', params.brandId);
  if (params?.productCategoryId && params.productCategoryId !== 'ALL') query.append('productCategoryId', params.productCategoryId);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  const queryString = query.toString();
  return apiFetch<any[]>(`/admin/products${queryString ? `?${queryString}` : ''}`);
};

// === Pricing Rules ===
export const getAdminPricingRules = () => apiFetch<any[]>('/admin/pricing-rules');
export const createAdminPricingRule = (data: any) => apiFetch<any>('/admin/pricing-rules', { method: 'POST', body: data });
export const updateAdminPricingRule = (id: number, data: any) => apiFetch<any>(`/admin/pricing-rules/${id}`, { method: 'PATCH', body: data });
export const deleteAdminPricingRule = (id: number) => apiFetch<{ message: string }>(`/admin/pricing-rules/${id}`, { method: 'DELETE' });

// === Users ===
export const getAdminUsers = () => apiFetch<any[]>('/admin/users');
export const updateAdminUser = (id: number, data: any) => apiFetch<any>(`/admin/users/${id}`, { method: 'PATCH', body: data });
export const deleteAdminUser = (id: number) => apiFetch<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' });

// === Mutations ===
export const getAdminMutations = () => apiFetch<any[]>('/admin/users/mutations').catch(() => apiFetch<any[]>('/admin/mutations')).catch(() => null);

// === Transactions ===
export const getAdminTransactions = () => apiFetch<any[]>('/admin/transactions');
export const updateAdminTransaction = (id: number, data: any) => apiFetch<any>(`/admin/transactions/${id}`, { method: 'PATCH', body: data });
export const checkAdminTransactionStatus = (id: number) => apiFetch<any>(`/admin/transactions/${id}/check-status`, { method: 'POST' });

// === Banners ===
export const getAdminBanners = () => apiFetch<any[]>('/admin/banners');
export const createAdminBanner = (data: any) => apiFetch<any>('/admin/banners', { method: 'POST', body: data });
export const updateAdminBanner = (id: number, data: any) => apiFetch<any>(`/admin/banners/${id}`, { method: 'PATCH', body: data });
export const deleteAdminBanner = (id: number) => apiFetch<{ message: string }>(`/admin/banners/${id}`, { method: 'DELETE' });

// === Checkout & Pembayaran ===
export const checkoutPayment = (data: any) => apiFetch<any>('/checkout', { method: 'POST', body: data });

// === Settings ===
export const getAdminSettings = () => apiFetch<any>('/admin/settings');
export const updateAdminSettings = (data: any) => apiFetch<any>('/admin/settings', { method: 'POST', body: data });
export const testNeetflixConnection = () => apiFetch<any>('/neetflix/test-connection', { method: 'GET' });

// === Logs ===
export const getAdminActivityLogs = () => apiFetch<any[]>('/admin/logs/activity');
export const getAdminWebhookLogs = () => apiFetch<any[]>('/admin/logs/webhook');

// =====================================================
// REGION & PRODUCT CATEGORY & PROVIDER MAPPING TYPES
// =====================================================
export interface RegionData {
  id: number;
  brandId: number;
  name: string;
  slug: string;
  code: string | null;
  sortOrder: number;
  mappingMode: 'ALLOW' | 'BLOCK';
  mappingCountries: any;
  isActive: boolean;
  brand?: { id: number; name: string; slug: string };
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategoryData {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}


export interface PaginatedResult<T> {
  items: T[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// =====================================================
// REGION API WRAPPERS
// =====================================================
export const getAdminRegions = (params?: { brandId?: number; search?: string; page?: number; pageSize?: number; active?: boolean }) => {
  const query = new URLSearchParams();
  if (params?.brandId) query.append('brandId', String(params.brandId));
  if (params?.search) query.append('search', params.search);
  if (params?.page) query.append('page', String(params.page));
  if (params?.pageSize) query.append('pageSize', String(params.pageSize));
  if (params?.active !== undefined) query.append('active', String(params.active));
  const queryString = query.toString();
  return apiFetch<PaginatedResult<RegionData>>(`/admin/regions${queryString ? `?${queryString}` : ''}`);
};

export const createAdminRegion = (data: Partial<RegionData>) =>
  apiFetch<RegionData>('/admin/regions', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminRegion = (id: number, data: Partial<RegionData>) =>
  apiFetch<RegionData>(`/admin/regions/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminRegion = (id: number) =>
  apiFetch<{ message: string }>(`/admin/regions/${id}`, { method: 'DELETE' });

// =====================================================
// PRODUCT CATEGORY API WRAPPERS
// =====================================================
export const getAdminProductCategories = (params?: { search?: string; page?: number; pageSize?: number; active?: boolean }) => {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.page) query.append('page', String(params.page));
  if (params?.pageSize) query.append('pageSize', String(params.pageSize));
  if (params?.active !== undefined) query.append('active', String(params.active));
  const queryString = query.toString();
  return apiFetch<PaginatedResult<ProductCategoryData>>(`/admin/product-categories${queryString ? `?${queryString}` : ''}`);
};

export const createAdminProductCategory = (data: Partial<ProductCategoryData>) =>
  apiFetch<ProductCategoryData>('/admin/product-categories', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminProductCategory = (id: number, data: Partial<ProductCategoryData>) =>
  apiFetch<ProductCategoryData>(`/admin/product-categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminProductCategory = (id: number) =>
  apiFetch<{ message: string }>(`/admin/product-categories/${id}`, { method: 'DELETE' });

// =====================================================

export const getAdminErrorLogs = () => apiFetch<any[]>('/admin/logs/error');
export const getAdminDashboardStats = () => apiFetch<any>('/admin/dashboard/stats');
