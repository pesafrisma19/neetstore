export type PaymentStatusType = 'UNPAID' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUND';
export type OrderStatusType = 'PENDING' | 'PROCESS' | 'SUCCESS' | 'FAILED';
export type RefundStatusType = 'NONE' | 'PENDING' | 'REFUNDED';

export interface PublicInvoiceResponse {
  invoiceVersion?: number;
  invoiceId: string;
  paymentStatus: PaymentStatusType;
  orderStatus: OrderStatusType;
  refundStatus?: RefundStatusType;
  isGuest?: boolean;

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
  checkoutUrl?: string;
  qrImageUrl?: string;
  gatewayCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrString?: string;
  instructions?: string;
  uniqueCode?: number;

  expiredAt?: string;
  createdAt: string;

  sn?: string;
}
