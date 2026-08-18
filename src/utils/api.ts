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
    // Untuk network failure murni (no response), lempar Error agar consumer menangani kegagalan jaringan
    const networkMessage = error.message || 'Koneksi jaringan terputus atau server tidak merespon';
    throw new Error(networkMessage);
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
  'BANK_TRANSFER',
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

export interface FirstTopupTier {
  id?: string | number;
  name?: string;
  diamonds?: number;
  available?: boolean;
}

export interface PublicNeetflixValidationResult {
  nickname: string;
  detectedRegionCode?: string;
  detectedCountry?: string;
  recommendedRegionId?: number | null;
  matchedRegionId?: number | null;
  matchedRegionIds?: number[];
  firstTopupAvailable?: boolean;
  firstTopupTiers?: FirstTopupTier[];
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
  email?: string;
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
  soldCount: number;
  category: { name: string; slug: string; icon: string | null; googlePlayId: string | null } | null;
}

export interface Banner {
  id: number | string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  title?: string;
  source?: 'MANUAL' | 'AUTO';
  brandId?: number;
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
export const getAdminBrandById = (id: number) => apiFetch<any>(`/admin/brands/${id}`);
export const getAdminCategories = () => apiFetch<any[]>('/admin/categories');
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
export const getAdminVouchers = (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const q = new URLSearchParams();
  if (params?.page) q.append('page', String(params.page));
  if (params?.limit) q.append('limit', String(params.limit));
  if (params?.search) q.append('search', params.search);
  if (params?.status && params.status !== 'all') q.append('status', params.status);
  const str = q.toString();
  return apiFetch<any[]>(`/admin/vouchers${str ? `?${str}` : ''}`);
};
export const createAdminVoucher = (data: any) => apiFetch<any>('/admin/vouchers', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const updateAdminVoucher = (id: number, data: any) => apiFetch<any>(`/admin/vouchers/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const deleteAdminVoucher = (id: number) => apiFetch<{ message: string }>(`/admin/vouchers/${id}`, { method: 'DELETE' });

// === Flashsales ===
export const getAdminFlashsales = (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const q = new URLSearchParams();
  if (params?.page) q.append('page', params.page.toString());
  if (params?.limit) q.append('limit', params.limit.toString());
  if (params?.search) q.append('search', params.search);
  if (params?.status && params.status !== 'all') q.append('status', params.status);
  const str = q.toString();
  return apiFetch<any[]>(`/admin/flashsales${str ? `?${str}` : ''}`);
};
export const createAdminFlashsale = (data: any) => apiFetch<any>('/admin/flashsales', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const updateAdminFlashsale = (id: number, data: any) => apiFetch<any>(`/admin/flashsales/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const deleteAdminFlashsale = (id: number) => apiFetch<{ message: string }>(`/admin/flashsales/${id}`, { method: 'DELETE' });
export const getPublicFlashsales = () => apiFetch<any[]>('/flashsales');

// === Payment Methods ===
export const getAdminPaymentMethods = () => apiFetch<any[]>('/admin/payment-methods');
export const getAdminPaymentMethodById = (id: number) => apiFetch<any>(`/admin/payment-methods/${id}`);
export const createAdminPaymentMethod = (data: any) => apiFetch<any>('/admin/payment-methods', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminPaymentMethod = (id: number, data: any) => apiFetch<any>(`/admin/payment-methods/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminPaymentMethod = (id: number) => apiFetch<{ message: string }>(`/admin/payment-methods/${id}`, { method: 'DELETE' });

// === Payment Gateways ===
export const getAdminPaymentGateways = () => apiFetch<any[]>('/admin/payment-gateways');
export const updateAdminPaymentGateway = (id: number, data: any) => apiFetch<any>(`/admin/payment-gateways/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const testConnectionAdminPaymentGateway = (id: number) => apiFetch<any>(`/admin/payment-gateways/${id}/test-connection`, { method: 'POST' });
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
export const createAdminPricingRule = (data: any) => apiFetch<any>('/admin/pricing-rules', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminPricingRule = (id: number, data: any) => apiFetch<any>(`/admin/pricing-rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteAdminPricingRule = (id: number) => apiFetch<{ message: string }>(`/admin/pricing-rules/${id}`, { method: 'DELETE' });
export const repriceAdminPricingRules = () => apiFetch<{ updatedCount: number; message: string }>('/admin/pricing-rules/reprice', { method: 'POST' });

// === Users ===
export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  level?: string;
  status?: string;
}

export const getAdminUsers = (params?: AdminUsersQueryParams) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.role && params.role !== 'ALL') query.append('role', params.role);
  if (params?.level && params.level !== 'ALL') query.append('level', params.level);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  const qStr = query.toString();
  return apiFetch<{ data: any[]; total: number; page: number; limit: number }>(`/admin/users${qStr ? `?${qStr}` : ''}`);
};

export const getAdminUserDetail = (id: number) => {
  return apiFetch<{ user: any; mutations: any[]; transactions: any[] }>(`/admin/users/${id}`);
};

export const updateAdminUser = (id: number, data: any) => {
  return apiFetch<any>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

export const adjustAdminUserBalance = (id: number, payload: { type: 'IN' | 'OUT'; amount: number; reason: string }) => {
  return apiFetch<any>(`/admin/users/${id}/adjust-balance`, { method: 'POST', body: JSON.stringify(payload) });
};

export const deleteAdminUser = (id: number) => apiFetch<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' });

export const approveAdminApiKey = (id: number) =>
  apiFetch<{ message: string; apiKey: string }>(`/admin/users/${id}/approve-apikey`, { method: 'POST' });

export const rejectAdminApiKey = (id: number) =>
  apiFetch<{ message: string }>(`/admin/users/${id}/reject-apikey`, { method: 'POST' });

// === User & Admin IP Whitelist ===
export const getUserWhitelists = () => apiFetch<any[]>('/user/api-whitelists');
export const addUserWhitelist = (ipAddress: string) =>
  apiFetch<any>('/user/api-whitelists', { method: 'POST', body: JSON.stringify({ ipAddress }) });
export const deleteUserWhitelist = (id: number) =>
  apiFetch<{ message: string }>(`/user/api-whitelists/${id}`, { method: 'DELETE' });

export const getAdminUserWhitelists = (userId: number) =>
  apiFetch<any[]>(`/admin/users/${userId}/api-whitelists`);
export const addAdminUserWhitelist = (userId: number, ipAddress: string) =>
  apiFetch<any>(`/admin/users/${userId}/api-whitelists`, { method: 'POST', body: JSON.stringify({ ipAddress }) });
export const deleteAdminUserWhitelist = (userId: number, whitelistId: number) =>
  apiFetch<{ message: string }>(`/admin/users/${userId}/api-whitelists/${whitelistId}`, { method: 'DELETE' });

// === Mutations ===
export interface AdminMutationsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const getAdminMutations = (params?: AdminMutationsQueryParams) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.type && params.type !== 'ALL') query.append('type', params.type);
  if (params?.userId) query.append('userId', String(params.userId));
  if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params?.dateTo) query.append('dateTo', params.dateTo);
  const qStr = query.toString();
  return apiFetch<{ data: any[]; total: number; page: number; limit: number }>(`/admin/mutations${qStr ? `?${qStr}` : ''}`);
};

export interface AdminTransactionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  refundStatus?: string;
}

export const getAdminTransactions = (params?: AdminTransactionsQueryParams) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.orderStatus && params.orderStatus !== 'ALL') query.append('orderStatus', params.orderStatus);
  if (params?.paymentStatus && params.paymentStatus !== 'ALL') query.append('paymentStatus', params.paymentStatus);
  if (params?.refundStatus && params.refundStatus !== 'ALL') query.append('refundStatus', params.refundStatus);
  const queryString = query.toString();
  return apiFetch<any[]>(`/admin/transactions${queryString ? `?${queryString}` : ''}`);
};
export const getAdminTransactionById = (id: number) => apiFetch<any>(`/admin/transactions/${id}`);
export const updateAdminTransaction = (id: number, data: any) => apiFetch<any>(`/admin/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
export const checkAdminTransactionStatus = (id: number) => apiFetch<any>(`/admin/transactions/${id}/check-status`, { method: 'POST' });
export const markAdminGuestRefunded = (id: number) => apiFetch<any>(`/admin/transactions/${id}/mark-refunded`, { method: 'POST' });

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
export const getAdminCronStatus = () => apiFetch<Record<string, any>>('/admin/settings/cron-status');
export const testNeetflixConnection = () => apiFetch<any>('/neetflix/test-connection', { method: 'GET' });
export const testSmtpConnection = () => apiFetch<any>('/admin/settings/smtp/test-connection', { method: 'POST' });
export const sendSmtpTestEmail = (to: string) => apiFetch<any>('/admin/settings/smtp/send-test', { method: 'POST', body: JSON.stringify({ to }) });
export const testFonnteConnection = () => apiFetch<any>('/admin/settings/fonnte/test-connection', { method: 'POST' });
export const sendFonnteTestMessage = (target: string, message?: string) => apiFetch<any>('/admin/settings/fonnte/send-test', { method: 'POST', body: JSON.stringify({ target, message }) });
export const testNotificationEmail = (event: string, targetEmail: string) => apiFetch<any>('/admin/settings/notifications/test-email', { method: 'POST', body: JSON.stringify({ event, targetEmail }) });
export const testNotificationWa = (event: string, targetPhone: string) => apiFetch<any>('/admin/settings/notifications/test-wa', { method: 'POST', body: JSON.stringify({ event, targetPhone }) });

// === Logs ===
export const getAdminActivityLogs = (params?: { page?: number; limit?: number; search?: string; action?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.action && params.action !== 'ALL') query.append('action', params.action);
  const qStr = query.toString();
  return apiFetch<{ data: any[]; _meta: { page: number; limit: number; totalCount: number; totalPages: number } }>(
    `/admin/logs/activity${qStr ? `?${qStr}` : ''}`
  );
};

export const getAdminWebhookLogs = (params?: { page?: number; limit?: number; provider?: string; status?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.provider && params.provider !== 'ALL') query.append('provider', params.provider);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  const qStr = query.toString();
  return apiFetch<{ data: any[]; _meta: { page: number; limit: number; totalCount: number; totalPages: number } }>(
    `/admin/logs/webhook${qStr ? `?${qStr}` : ''}`
  );
};

export const getAdminErrorLogs = (params?: { page?: number; limit?: number; level?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.level && params.level !== 'ALL') query.append('level', params.level);
  if (params?.search) query.append('search', params.search);
  const qStr = query.toString();
  return apiFetch<{ data: any[]; _meta: { page: number; limit: number; totalCount: number; totalPages: number } }>(
    `/admin/logs/error${qStr ? `?${qStr}` : ''}`
  );
};

// === Reports ===
export interface AdminReportQueryParams {
  period?: string;
  startDate?: string;
  endDate?: string;
}

export const getAdminSalesReport = (params?: AdminReportQueryParams) => {
  const query = new URLSearchParams();
  if (params?.period) query.append('period', params.period);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  const qStr = query.toString();
  return apiFetch<{
    revenue: number;
    profit: number;
    successfulOrders: number;
    totalOrders: number;
    topProducts: Array<{
      productId: number;
      name: string;
      sku: string;
      soldQuantity: number;
      revenue: number;
      profit: number;
    }>;
  }>(`/admin/reports/sales${qStr ? `?${qStr}` : ''}`);
};

export const getAdminTransactionReport = (params?: AdminReportQueryParams) => {
  const query = new URLSearchParams();
  if (params?.period) query.append('period', params.period);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  const qStr = query.toString();
  return apiFetch<{
    total: number;
    success: number;
    process: number;
    pending: number;
    failed: number;
    refunded: number;
    successRate: number;
    paymentMethods: Array<{
      name: string;
      count: number;
      volume: number;
      share: number;
    }>;
  }>(`/admin/reports/transactions${qStr ? `?${qStr}` : ''}`);
};

export const getAdminDepositReport = (params?: AdminReportQueryParams) => {
  const query = new URLSearchParams();
  if (params?.period) query.append('period', params.period);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  const qStr = query.toString();
  return apiFetch<{
    totalSuccessfulDeposit: number;
    successfulAmount: number;
    pendingAmount: number;
    failedAmount: number;
    countSuccess: number;
    countPending: number;
    countFailed: number;
    totalCount: number;
    latestDeposits: Array<{
      id: number;
      paymentRef: string;
      userId: number;
      username: string;
      amount: number;
      totalAmount: number;
      paymentMethod: string;
      status: string;
      createdAt: string;
    }>;
  }>(`/admin/reports/deposits${qStr ? `?${qStr}` : ''}`);
};

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
// PRODUCT API WRAPPERS
// =====================================================
export const updateAdminProduct = (id: number, data: import('../features/admin/types').UpdateAdminProductInput) =>
  apiFetch<import('../features/admin/types').ProductData>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminProduct = (id: number) =>
  apiFetch<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' });

// =====================================================

export const getAdminDashboardStats = () => apiFetch<any>('/admin/dashboard/stats');

// Deposit Admin Wrappers
export const getAdminDeposits = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  const queryString = query.toString();
  return apiFetch<any>(`/admin/deposits${queryString ? `?${queryString}` : ''}`);
};

export const confirmAdminDeposit = (id: number) =>
  apiFetch<any>(`/admin/deposits/${id}/confirm`, { method: 'POST' });

export const rejectAdminDeposit = (id: number, reason?: string) =>
  apiFetch<any>(`/admin/deposits/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });

// User Deposit API Wrappers
export const getDepositPaymentMethods = () =>
  apiFetch<import('../features/admin/types').PaymentMethodData[]>('/payment-methods/deposit');

export const getPublicSettings = () =>
  apiFetch<Record<string, any>>('/settings');

export const createUserDeposit = (data: { amount: number; paymentMethodCode: string }, idempotencyKey?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return apiFetch<any>('/user/deposit', { method: 'POST', headers, body: JSON.stringify(data) });
};

export const getUserDepositHistory = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const queryString = query.toString();
  return apiFetch<any>(`/user/deposit/history${queryString ? `?${queryString}` : ''}`);
};

export const getUserDepositDetail = (reference: string) => {
  return apiFetch<any>(`/user/deposit/${encodeURIComponent(reference)}`);
};

export const updateUserProfile = (data: { fullname?: string | null; email?: string | null; phone?: string | null }) => {
  return apiFetch<{ message: string; user: any }>('/user/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const getUserMutations = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  const qStr = query.toString();
  return apiFetch<{ data: any[]; total: number; page: number; limit: number }>(`/user/mutations${qStr ? `?${qStr}` : ''}`);
};

export const requestUserApiKey = () => {
  return apiFetch<{ message: string }>('/user/apikey/request', {
    method: 'POST',
  });
};

export const getUserLevelUpgradeInfo = () =>
  apiFetch<{
    currentLevel: string;
    nextLevel: string | null;
    upgradePrice: number;
    enabled: boolean;
    balance: number;
    canUpgrade: boolean;
    shortfall: number;
  }>('/user/level/upgrade-info');

export const upgradeUserLevel = (expectedCurrentLevel?: string) =>
  apiFetch<{
    message: string;
    previousLevel: string;
    newLevel: string;
    price: number;
    startingBalance: number;
    endingBalance: number;
  }>('/user/level/upgrade', {
    method: 'POST',
    body: JSON.stringify({ expectedCurrentLevel }),
  });

// User Outbound Webhook API Functions (JWT Session Auth)
export const getUserWebhookConfig = () =>
  apiFetch<{
    success: boolean;
    data: {
      url: string;
      secret: string;
      isActive: boolean;
      consecutiveFailures: number;
      lastTriggeredAt?: string | null;
      createdAt?: string;
      updatedAt?: string;
    } | null;
  }>('/user/webhook');

export const updateUserWebhookConfig = (url: string) =>
  apiFetch<{
    success: boolean;
    message?: string;
    error?: string;
    data?: any;
  }>('/user/webhook', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });

export const deleteUserWebhookConfig = () =>
  apiFetch<{
    success: boolean;
    message?: string;
    error?: string;
  }>('/user/webhook', {
    method: 'DELETE',
  });

export const testUserWebhookConfig = () =>
  apiFetch<{
    success: boolean;
    message?: string;
    error?: string;
    eventId?: string;
  }>('/user/webhook/test', {
    method: 'POST',
  });

export const getNeetPayPaymentChannelsAdmin = () =>
  apiFetch<{ success: boolean; data: Array<{ id: string; name: string; method: string; provider: string }> }>('/neetpay/channels');



