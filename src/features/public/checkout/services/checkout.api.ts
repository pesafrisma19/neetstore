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

  checkoutPayment: async (data: any) => {
    const res = await api.post('/transactions/checkout', data);
    return res.data;
  },

  getTransaction: async (invoiceNumber: string) => {
    const res = await api.get(`/transactions/${invoiceNumber}`);
    return res.data;
  }
};
