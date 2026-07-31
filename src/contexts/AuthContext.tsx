import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, setAccessToken, getAccessToken } from '../services/api';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      // Coba refresh secara gaib menggunakan HttpOnly cookie
      const res = await api.post('/auth/refresh');
      setAccessToken(res.data.token);
      await fetchProfile(); // Ambil profil dengan token baru
    } catch (error) {
      // Jika gagal, artinya memang belum login atau cookie kadaluarsa
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
    };
    window.addEventListener('auth:logout', handleForceLogout);

    // Listener 3: Auto refresh saat user kembali ke tab ini setelah lama pergi
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !getAccessToken()) {
        // Jika kembali dan memory kosong, coba refresh lagi
        bootstrapAuth();
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
    setIsLoading(true);
    fetchProfile();
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setAccessToken(null);
      setUser(null);
      
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
