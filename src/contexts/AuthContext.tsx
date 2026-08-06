import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { api, setAccessToken, getAccessToken, getIsRefreshing, setIsRefreshing, processQueue } from '../services/api';
import { queryClient } from '../services/queryClient';
import { queryKeys } from '../services/queryKeys';

export interface UserProfile {
  id: number;
  username: string;
  phone: string | null;
  balance: number;
  role: string;
  level: string;
  apiStatus: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginUser: (token: string, adminToken?: boolean) => void;
  logoutUser: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function removePersistedAttemptsForOwner(targetOwnerScope: string): void {
  try {
    const raw = sessionStorage.getItem('netstore_checkout_attempts_v1');
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

    const map = parsed as Record<string, unknown>;
    let modified = false;

    for (const [hash, item] of Object.entries(map)) {
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        // Hapus HANYA attempt PREPARED yang belum pernah dikirim.
        // Attempt IN_FLIGHT atau UNKNOWN_RESULT TETAP DIPERTAHANKAN di storage untuk owner ini.
        if (obj.ownerScope === targetOwnerScope && obj.status === 'PREPARED') {
          delete map[hash];
          modified = true;
        }
      }
    }

    if (modified) {
      if (Object.keys(map).length === 0) {
        sessionStorage.removeItem('netstore_checkout_attempts_v1');
      } else {
        sessionStorage.setItem('netstore_checkout_attempts_v1', JSON.stringify(map));
      }
    }
  } catch {}
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapAttempted = useRef(false); // apakah bootstrap sudah pernah dijalankan
  const hadSession = useRef(false);         // apakah user pernah login di sesi ini

  const fetchProfile = async () => {
    try {
      // Menggunakan Axios instance yang sudah ada interceptornya!
      const res = await api.get('/user/me');
      setUser(res.data);
    } catch (e) {
      console.error('Gagal mengambil profil', e);
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Tahap 4.4: Silent Refresh Bootstrap
  const bootstrapAuth = async () => {
    try {
      // Jika interceptor sudah sedang me-refresh (karena ada request lain yang 401),
      // jangan panggil refresh kedua — tunggu sebentar dan gunakan token yang sudah di-set
      if (getIsRefreshing()) {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (getAccessToken()) {
          await fetchProfile();
        } else {
          setIsLoading(false);
        }
        return;
      }

      // Kunci flag sebelum memanggil refresh agar interceptor tidak memanggil bersamaan
      setIsRefreshing(true);
      const res = await api.post('/auth/refresh');
      const newToken = res.data.token;
      setAccessToken(newToken);
      processQueue(null, newToken); // Bebaskan semua request yang antre
      setIsRefreshing(false);
      bootstrapAttempted.current = true;
      hadSession.current = true;    // Berhasil → user punya sesi valid
      await fetchProfile();
    } catch (error) {
      processQueue(error, null); // Tolak semua request yang antre
      setIsRefreshing(false);
      bootstrapAttempted.current = true;
      // hadSession tetap false jika sebelumnya memang belum login
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();

    // Listener 1: Tab lain melakukan logout (Tahap 4.5)
    const bc = new BroadcastChannel('auth_channel');
    bc.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        setAccessToken(null);
        setUser(null);
      }
    };

    // Listener 2: Axios Interceptor gagal refresh (Force Logout)
    const handleForceLogout = () => {
      setAccessToken(null);
      setUser(null);
      queryClient.removeQueries({ queryKey: queryKeys.user.root });
    };
    window.addEventListener('auth:logout', handleForceLogout);

    // Listener 3: Auto refresh saat user kembali ke tab ini setelah lama pergi
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !getAccessToken()) {
        // Hanya re-bootstrap jika user memang pernah punya sesi valid.
        // Jika belum pernah login sama sekali, tidak perlu coba lagi.
        if (hadSession.current) {
          bootstrapAuth();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      bc.close();
      window.removeEventListener('auth:logout', handleForceLogout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loginUser = (token: string, isAdmin = false) => {
    setAccessToken(token, isAdmin);
    hadSession.current = true; // User explicitly login
    setIsLoading(true);
    fetchProfile();
  };

  const logoutUser = async () => {
    const previousUserId = user?.id;
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setAccessToken(null);
      setUser(null);
      hadSession.current = false; // Reset sesi setelah logout
      queryClient.removeQueries({ queryKey: queryKeys.user.root });
      if (previousUserId) {
        removePersistedAttemptsForOwner(`user:${previousUserId}`);
      }

      // Beri tahu tab lain
      const bc = new BroadcastChannel('auth_channel');
      bc.postMessage({ type: 'LOGOUT' });
      bc.close();
    }
  };

  const refreshUser = async () => {
    if (getAccessToken()) {
      await fetchProfile();
    } else {
      await bootstrapAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginUser, logoutUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
