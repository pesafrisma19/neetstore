export const queryKeys = {
  public: {
    brands: {
      all: ['public', 'brands'] as const,
      detail: (slug: string) => ['public', 'brands', 'detail', slug] as const,
    },
    categories: {
      all: ['public', 'categories'] as const,
    },
    banners: {
      all: ['public', 'banners'] as const,
    },
    paymentMethods: {
      all: ['public', 'payment-methods'] as const,
    },
  },

  user: {
    root: ['user'] as const,
    transactions: {
      all: ['user', 'transactions'] as const,
      byUser: (userId: number | string) => ['user', userId, 'transactions'] as const,
    },
  },

  admin: {
    dashboard: {
      stats: ['admin', 'dashboard', 'stats'] as const,
    },
    brands: {
      all: ['admin', 'brands'] as const,
      detail: (id: number) => ['admin', 'brands', 'detail', id] as const,
    },
    banners: {
      all: ['admin', 'banners'] as const,
    },
    users: {
      all: ['admin', 'users'] as const,
    },
    transactions: {
      all: ['admin', 'transactions'] as const,
      list: (params?: any) => ['admin', 'transactions', 'list', params] as const,
      detail: (id: number) => ['admin', 'transactions', 'detail', id] as const,
    },
    deposits: {
      all: ['admin', 'deposits'] as const,
      list: (params?: any) => ['admin', 'deposits', 'list', params] as const,
    },
    paymentGateways: {
      all: ['admin', 'payment-gateways'] as const,
    },
  },
} as const;
