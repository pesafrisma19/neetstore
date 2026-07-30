import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const fetchProfile = async (tokenStr: string) => {
    try {
      const res = await fetch(`${BASE_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${tokenStr}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
      }
    } catch (e) {
      console.error('Gagal mengambil profil', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginUser = (token: string, isAdmin = false) => {
    if (isAdmin) {
      localStorage.setItem('adminToken', token);
    } else {
      localStorage.setItem('token', token);
    }
    setIsLoading(true);
    fetchProfile(token);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      await fetchProfile(token);
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
