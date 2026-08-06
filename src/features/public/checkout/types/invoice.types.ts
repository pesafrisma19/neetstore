export type PaymentStatusType = 'UNPAID' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUND';
export type OrderStatusType = 'PENDING' | 'PROCESS' | 'SUCCESS' | 'FAILED';

export interface PublicInvoiceResponse {
  invoiceVersion?: number;
  invoiceId: string;
  paymentStatus: PaymentStatusType;
  orderStatus: OrderStatusType;

  game: {
    name: string;
    publisher?: string;
  };

  product: {
    name: string;
    cleanName: string;
  };

  targetAccount: string;
  targetZone?: string;
  nickname?: string;

  basePrice: number;
  discountAmount: number;
  voucherCode?: string;
  feeAmount: number;
  amount: number;

  paymentMethod: string;
  paymentType: string;
  paymentCode?: string;
  paymentUrl?: string;

  expiredAt?: string;
  createdAt: string;

  sn?: string;

  adminDebug?: {
    digiflazzSku?: string;
    providerRef?: string;
    providerPrice?: number;
    profit?: number;
    providerMessage?: string;
  };
}
