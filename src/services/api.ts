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

// Listen to cross-tab auth channel to update access token and unblock local queue
if (typeof window !== 'undefined') {
  try {
    const channel = new BroadcastChannel('auth_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'REFRESH_SUCCESS' && event.data?.token) {
        setAccessToken(event.data.token, isAdminToken);
        processQueue(null, event.data.token);
      }
    };
  } catch {}
}

/**
 * Cross-Tab Coordinated Refresh using Web Locks API + BroadcastChannel + Generation Versioning
 * Strict Security: Refresh token is strictly HttpOnly cookie and NEVER exposed in JS or BroadcastChannel.
 * Only the short-lived JWT Access Token and generation timestamp are synchronized across tabs.
 */
export async function performCrossTabRefresh(): Promise<string> {
  const initialGen = Number(localStorage.getItem('netstore_token_gen') || 0);

  const executeRefresh = async (): Promise<string> => {
    // 1. Double check if another tab completed refresh while we were waiting for the lock
    const currentGen = Number(localStorage.getItem('netstore_token_gen') || 0);
    const existingToken = getAccessToken();
    if (currentGen > initialGen && existingToken) {
      return existingToken;
    }

    // 2. Perform actual HTTP refresh request (browser attaches HttpOnly cookie)
    const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
    const newToken = response.data.token;
    const newGen = Date.now();

    localStorage.setItem('netstore_token_gen', String(newGen));
    localStorage.setItem('netstore_has_session', '1');
    setAccessToken(newToken, isAdminToken);

    // 3. Broadcast new Access Token & Generation to other tabs (NEVER refresh token!)
    try {
      const bc = new BroadcastChannel('auth_channel');
      bc.postMessage({ type: 'REFRESH_SUCCESS', token: newToken, gen: newGen });
      bc.close();
    } catch {}

    return newToken;
  };

  const hasWebLocks = typeof navigator !== 'undefined' && 'locks' in navigator && typeof navigator.locks?.request === 'function';

  if (hasWebLocks) {
    return await navigator.locks.request('auth_refresh_lock', async () => {
      return await executeRefresh();
    });
  } else {
    // Fallback if navigator.locks is unavailable (e.g. legacy webview)
    return await executeRefresh();
  }
}

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
// 5. RESPONSE INTERCEPTOR (Cross-Tab Safe Refresh)
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
        // Jika sedang me-refresh dalam tab ini, masukkan request ke antrian
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
        const newToken = await performCrossTabRefresh();
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // Retry original request
      } catch (err) {
        // Refresh gagal (misal expired / dicuri)
        processQueue(err, null);
        setAccessToken(null);
        localStorage.removeItem('netstore_has_session');

        // Beri tahu tab lain untuk logout
        try {
          const bc = new BroadcastChannel('auth_channel');
          bc.postMessage({ type: 'LOGOUT' });
          bc.close();
        } catch {}

        // Redirect ke login via event
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
