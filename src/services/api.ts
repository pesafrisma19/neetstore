import axios, { type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getPublicBackendUrl = (): string => {
  return API_URL.replace(/\/api\/?$/, '');
};

// =====================================================
// 1. MEMORY STORE (Stateless AT Storage)
// =====================================================
let inMemoryToken: string | null = null;
let isAdminToken: boolean = false; // Untuk membedakan token member & admin jika diperlukan

export const getAccessToken = () => inMemoryToken;
export const setAccessToken = (token: string | null, isAdmin = false) => {
  inMemoryToken = token;
  isAdminToken = isAdmin;
};

// =====================================================
// 2. REFRESH QUEUE & STATE
// =====================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Ekspor agar AuthContext bisa koordinasi saat bootstrapAuth berjalan
export const getIsRefreshing = () => isRefreshing;
export const setIsRefreshing = (val: boolean) => { isRefreshing = val; };

export const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// =====================================================
// 3. AXIOS INSTANCE
// =====================================================
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // WAJIB untuk mengirim/menerima HttpOnly Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================
// 4. REQUEST INTERCEPTOR
// =====================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    // Hanya suntikkan token jika API bukan /auth/refresh
    if (token && config.headers && !config.url?.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// =====================================================
// 5. RESPONSE INTERCEPTOR (Refresh Queue Logic)
// =====================================================
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Jika 401, belum pernah di-retry, dan url bukan /auth/refresh (hindari loop di endpoint refresh itu sendiri)
    if (
      error.response?.status === 401 && 
      originalRequest && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Jika sedang me-refresh, masukkan request ke antrian
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest); // Retry original request
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tembak endpoint refresh, browser otomatis kirim HttpOnly cookie
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = response.data.token;

        setAccessToken(newToken, isAdminToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // Retry original request
      } catch (err) {
        // Refresh gagal (misal expired / dicuri)
        processQueue(err, null);
        setAccessToken(null);

        // Beri tahu tab lain untuk logout
        const bc = new BroadcastChannel('auth_channel');
        bc.postMessage({ type: 'LOGOUT' });
        bc.close();

        // Redirect ke login (akan ditangani AuthContext atau router, tapi kita bisa berikan fallback event)
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
