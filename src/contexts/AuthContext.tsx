import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { api, setAccessToken, getAccessToken, getIsRefreshing, setIsRefreshing, processQueue } from '../services/api';
import { queryClient } from '../services/queryClient';
import { queryKeys } from '../services/queryKeys';
import { useUserProfile } from '../hooks/useUserProfile';
import { apiFetch } from '../utils/api';

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
  isAuthenticated: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getAccessToken()));
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapAttempted = useRef(false);
  const hadSession = useRef(false);

  // Silent Refresh Bootstrap
  const bootstrapAuth = async () => {
    const hasSessionMarker = localStorage.getItem('netstore_has_session') === '1';
    if (!hasSessionMarker && !getAccessToken()) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      if (getIsRefreshing()) {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (getAccessToken()) {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
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
      setIsAuthenticated(true);
    } catch (error) {
      processQueue(error, null);
      setIsRefreshing(false);
      bootstrapAttempted.current = true;
      localStorage.removeItem('netstore_has_session');
      setAccessToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapAuth();

    const bc = new BroadcastChannel('auth_channel');
    bc.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        setAccessToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('netstore_has_session');
        queryClient.removeQueries({ queryKey: queryKeys.user.root });
      }
    };

    const handleForceLogout = () => {
      setAccessToken(null);
      setIsAuthenticated(false);
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
    setIsAuthenticated(true);

    const profile = await queryClient.fetchQuery<UserProfile | null>({
      queryKey: queryKeys.user.profile,
      queryFn: async (): Promise<UserProfile | null> => {
        const res = await apiFetch<UserProfile>('/user/me');
        return res || null;
      },
    });

    return profile;
  };

  const logoutUser = async () => {
    const currentProfile = queryClient.getQueryData<UserProfile | null>(queryKeys.user.profile);
    const previousUserId = currentProfile?.id;
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('netstore_has_session');
      setAccessToken(null);
      setIsAuthenticated(false);
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    } else {
      await bootstrapAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loginUser, logoutUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user, isLoading: isProfileLoading, isFetching, error, refetch } = useUserProfile(
    context.isAuthenticated,
    context.isLoading
  );
  return {
    ...context,
    user,
    isLoading: context.isLoading || (context.isAuthenticated && isProfileLoading),
    isProfileFetching: isFetching,
    profileError: error,
    refetchProfile: refetch,
  };
};
