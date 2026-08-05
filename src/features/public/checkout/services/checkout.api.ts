import { api } from '../../../../services/api';

export const checkoutApi = {
  getBrandBySlug: async (slug: string) => {
    const res = await api.get(`/brands/${slug}`);
    return res.data;
  },
  
  getPaymentMethods: async () => {
    const res = await api.get('/payment-methods');
    return res.data;
  },

  checkVoucher: async (code: string) => {
    const res = await api.get(`/vouchers/check/${code}`);
    return res.data;
  },

  checkoutPayment: async (data: any, idempotencyKey: string) => {
    const res = await api.post('/transactions/checkout', data, {
      headers: {
        'x-idempotency-key': idempotencyKey
      }
    });
    return res.data;
  },

  getTransaction: async (invoiceNumber: string) => {
    const res = await api.get(`/transactions/${invoiceNumber}`);
    return res.data;
  },

  validateNeetflixAccount: async (brandId: number, userId: string, zoneId?: string) => {
    const res = await api.post('/neetflix/validate', { brandId, userId, zoneId });
    return res.data;
  }
};
