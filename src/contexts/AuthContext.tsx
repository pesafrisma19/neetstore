import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { api, setAccessToken, getAccessToken, getIsRefreshing, setIsRefreshing, processQueue } from '../services/api';
import { queryClient } from '../services/queryClient';
import { queryKeys } from '../services/queryKeys';

export interface UserProfile {
  id: number;
  username: string;
  fullname?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  balance: number;
  points?: number;
  role: string;
  level: string;
  verified?: boolean;
  isActive?: boolean;
  referralCode?: string;
  apiKey?: string | null;
  apiStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginUser: (token: string, adminToken?: boolean) => Promise<UserProfile | null>;
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

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      const res = await api.get('/user/me');
      setUser(res.data);
      return res.data;
    } catch (e) {
      console.error('Gagal mengambil profil', e);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('netstore_has_session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Silent Refresh Bootstrap
  const bootstrapAuth = async () => {
    // KONDISI 1 FIX: Jika user belum pernah login (tidak ada marker netstore_has_session)
    // dan tidak ada access token di memory, jangan kirim request POST /api/auth/refresh (cegah 401 sia-sia untuk Guest)
    const hasSessionMarker = localStorage.getItem('netstore_has_session') === '1';
    if (!hasSessionMarker && !getAccessToken()) {
      setIsLoading(false);
      return;
    }

    try {
      if (getIsRefreshing()) {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (getAccessToken()) {
          await fetchProfile();
        } else {
          setIsLoading(false);
        }
        return;
      }

      setIsRefreshing(true);
      const res = await api.post('/auth/refresh');
      const newToken = res.data.token;
      setAccessToken(newToken);
      localStorage.setItem('netstore_has_session', '1');
      processQueue(null, newToken);
      setIsRefreshing(false);
      bootstrapAttempted.current = true;
      hadSession.current = true;
      await fetchProfile();
    } catch (error) {
      processQueue(error, null);
      setIsRefreshing(false);
      bootstrapAttempted.current = true;
      localStorage.removeItem('netstore_has_session');
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();

    const bc = new BroadcastChannel('auth_channel');
    bc.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('netstore_has_session');
      }
    };

    const handleForceLogout = () => {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('netstore_has_session');
      queryClient.removeQueries({ queryKey: queryKeys.user.root });
    };
    window.addEventListener('auth:logout', handleForceLogout);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !getAccessToken()) {
        if (hadSession.current || localStorage.getItem('netstore_has_session') === '1') {
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

  const loginUser = async (token: string, isAdmin = false): Promise<UserProfile | null> => {
    setAccessToken(token, isAdmin);
    hadSession.current = true;
    localStorage.setItem('netstore_has_session', '1');
    setIsLoading(true);
    return await fetchProfile();
  };

  const logoutUser = async () => {
    const previousUserId = user?.id;
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('netstore_has_session');
      setAccessToken(null);
      setUser(null);
      hadSession.current = false;
      queryClient.removeQueries({ queryKey: queryKeys.user.root });
      if (previousUserId) {
        removePersistedAttemptsForOwner(`user:${previousUserId}`);
      }

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
