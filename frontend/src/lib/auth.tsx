import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, profileApi, UserProfile } from './api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  language: string;
  setLanguage: (lang: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nv_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('nv_lang') || 'en');

  const refreshUser = useCallback(async () => {
    try {
      const profile = await profileApi.get();
      setUser(profile);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('nv_token');
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    localStorage.setItem('nv_lang', language);
  }, [language]);

  const login = async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('nv_token', res.token);
    setToken(res.token);
    await refreshUser();
  };

  const register = async (username: string, password: string, fullName?: string) => {
    const res = await authApi.register({ username, password, fullName });
    localStorage.setItem('nv_token', res.token);
    setToken(res.token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('nv_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, register, logout, refreshUser, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
