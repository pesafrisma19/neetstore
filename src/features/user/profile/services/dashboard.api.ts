import { api } from '../../../../services/api';

export const dashboardApi = {
  getUserTransactions: async () => {
    const res = await api.get('/user/transactions');
    return res.data;
  },
  
  // Deposit mock if any (or you can add a real endpoint)
  requestDeposit: async (amount: number, method: string) => {
    const res = await api.post('/user/deposit', { amount, method });
    return res.data;
  }
};
