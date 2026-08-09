import { api } from '../../../../services/api';
import type { PublicInvoiceResponse } from '../types/invoice.types';
import type { PublicVoucherCheckResponse, PublicNeetflixValidationResponse, CheckoutPayload, CheckoutSuccessResponse } from '../../../../utils/api';

export const checkoutApi = {
  getBrandBySlug: async (slug: string) => {
    const res = await api.get(`/brands/${slug}`);
    return res.data;
  },
  
  getPaymentMethods: async () => {
    const res = await api.get('/payment-methods');
    return res.data;
  },

  checkVoucher: async (code: string, amount?: number): Promise<PublicVoucherCheckResponse> => {
    const res = await api.post<PublicVoucherCheckResponse>('/voucher/check', { code, amount });
    return res.data;
  },

  checkoutPayment: async (data: CheckoutPayload, idempotencyKey: string): Promise<CheckoutSuccessResponse> => {
    const res = await api.post<CheckoutSuccessResponse>('/transactions/checkout', data, {
      headers: {
        'x-idempotency-key': idempotencyKey
      }
    });
    return res.data;
  },

  getTransaction: async (invoiceNumber: string): Promise<PublicInvoiceResponse> => {
    const res = await api.get<PublicInvoiceResponse>(`/transactions/${invoiceNumber}`);
    return res.data;
  },

  validateNeetflixAccount: async (brandId: number, userId: string, zoneId?: string): Promise<PublicNeetflixValidationResponse> => {
    const res = await api.post<PublicNeetflixValidationResponse>('/neetflix/validate', { brandId, userId, zoneId });
    return res.data;
  }
};
