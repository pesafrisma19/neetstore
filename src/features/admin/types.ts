export interface TransactionData { id: any; [key: string]: any; }
export interface UserData { id: any; [key: string]: any; }
export interface VoucherData { id: any; [key: string]: any; }
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
  isActive: boolean;
  forTransaction: boolean;
  forDeposit: boolean;
  gateway?: { id: number; name: string; code: string };
  [key: string]: any;
}
export interface BannerData { id: any; [key: string]: any; }
export interface SettingData { id: any; [key: string]: any; }
