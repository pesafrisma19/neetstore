import { api } from '../../../../services/api';

export const transactionApi = {
  // Currently logic uses fetch to dashboard endpoint maybe? 
  // We can add logic here if needed.
  getUserTransactions: async () => {
    const res = await api.get('/user/transactions');
    return res.data;
  },
  
  // if there's search by invoice
  getTransactionByInvoice: async (invoice: string) => {
    const res = await api.get(`/transactions/${invoice}`);
    return res.data;
  }
};
