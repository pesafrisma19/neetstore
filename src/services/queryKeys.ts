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
    settings: ['public', 'settings'] as const,
  },

  user: {
    root: ['user'] as const,
    profile: ['user', 'profile'] as const,
    transactions: {
      all: ['user', 'transactions'] as const,
      byUser: (userId: number | string) => ['user', userId, 'transactions'] as const,
    },
    mutations: {
      all: ['user', 'mutations'] as const,
      byUser: (userId: number | string) => ['user', userId, 'mutations'] as const,
    },
    deposits: {
      all: ['user', 'deposits'] as const,
      history: (userId: number | string) => ['user', userId, 'deposits'] as const,
    },
    levelUpgradeInfo: ['user', 'levelUpgradeInfo'] as const,
  },

  admin: {
    dashboard: {
      stats: ['admin', 'dashboard', 'stats'] as const,
    },
    categories: {
      all: ['admin', 'categories'] as const,
    },
    brands: {
      all: ['admin', 'brands'] as const,
      detail: (id: number) => ['admin', 'brands', 'detail', id] as const,
    },
    providers: {
      all: ['admin', 'providers'] as const,
    },
    regions: {
      all: ['admin', 'regions'] as const,
      list: (params?: { brandId?: number; search?: string; page?: number; pageSize?: number; active?: boolean }) =>
        ['admin', 'regions', 'list', params] as const,
    },
    productCategories: {
      all: ['admin', 'product-categories'] as const,
      list: (params?: { search?: string; page?: number; pageSize?: number; active?: boolean }) =>
        ['admin', 'product-categories', 'list', params] as const,
    },
    products: {
      all: ['admin', 'products'] as const,
      list: (params?: { page?: number; limit?: number; search?: string; categoryId?: string; brandId?: string; productCategoryId?: string; status?: string }) =>
        ['admin', 'products', 'list', params] as const,
    },
    pricingRules: {
      all: ['admin', 'pricing-rules'] as const,
    },
    banners: {
      all: ['admin', 'banners'] as const,
    },
    users: {
      all: ['admin', 'users'] as const,
      list: (params?: any) => ['admin', 'users', 'list', params] as const,
      detail: (id: number) => ['admin', 'users', 'detail', id] as const,
    },
    mutations: {
      all: ['admin', 'mutations'] as const,
      list: (params?: any) => ['admin', 'mutations', 'list', params] as const,
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
