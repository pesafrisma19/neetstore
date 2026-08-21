export interface TransactionData { id: any; [key: string]: any; }
export interface VoucherData {
  id: number;
  code: string;
  discountType: 'FLAT' | 'PERCENT';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  maxUsage: number;
  usedCount: number;
  expiredAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
export interface UserData {
  id: number;
  username: string;
  fullname?: string | null;
  email?: string | null;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  level: 'MEMBER' | 'RESELLER' | 'VIP';
  verified?: boolean;
  points: number;
  balance: number;
  isActive: boolean;
  apiStatus: string;
  referralCode?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface MutationData {
  id: number;
  userId: number;
  type: 'IN' | 'OUT';
  amount: number;
  startingBalance: number;
  endingBalance: number;
  description: string;
  createdAt: string;
  user?: {
    id?: number;
    username: string;
    email?: string | null;
    phone?: string | null;
  };
}
export interface ProviderData {
  id: number;
  name: string;
  code: string;
  apiUsername?: string;
  apiKey?: string;
  balance?: number;
  isActive: boolean;
  isConnected?: boolean;
  lastSync?: string | Date;
  _count?: { products: number };
  [key: string]: any;
}
export interface CategoryData { id: any; [key: string]: any; }
export interface BrandData { id: any; [key: string]: any; }
export interface ProductCategoryData { id: any; [key: string]: any; }
export interface RegionData { id: any; [key: string]: any; }

export interface ProductData {
  id: number;
  name: string;
  sku: string;
  providerSku?: string | null;
  digiflazzSku?: string;
  originalPrice: number;
  priceUser: number;
  priceMember?: number;
  priceReseller?: number;
  priceVip?: number;
  categoryId?: number;
  brandId?: number;
  regionId?: number;
  productCategoryId?: number;
  providerId?: number;
  isActive: boolean;
  providerActive: boolean;
  category?: CategoryData;
  brand?: BrandData;
  provider?: ProviderData;
  productCategory?: ProductCategoryData;
  region?: RegionData;
}

export interface UpdateAdminProductInput {
  name?: string;
  sku?: string;
  categoryId?: number;
  isActive?: boolean;
}

export interface PricingRuleData { id: any; [key: string]: any; }
export interface PaymentMethodData {
  id: number;
  name: string;
  code: string;
  type: string;
  paymentGatewayId?: number | null;
  feeFlat: number;
  feePercent: number;
  minAmount?: number | null;
  maxAmount?: number | null;
  iconUrl?: string | null;
  instructions?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrString?: string | null;
  isActive: boolean;
  forTransaction: boolean;
  forDeposit: boolean;
  useUniqueCode: boolean;
  gateway?: { id: number; name: string; code: string };
  [key: string]: any;
}
export interface BannerData { id: any; [key: string]: any; }
export interface SettingData { id: any; [key: string]: any; }
