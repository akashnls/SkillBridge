import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { authAPI } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginBiometric: (email: string) => Promise<void>;
  registerBiometric: () => Promise<string>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoUser: (demoEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillbridge_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('skillbridge_token')) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await authAPI.getMe();
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to load user session', err);
      localStorage.removeItem('skillbridge_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    if (res.data.success && res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      setToken(res.data.token);
      await refreshUser();
    }
  };

  const loginBiometric = async (email: string) => {
    const res = await authAPI.loginBiometric(email);
    if (res.data.success && res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      setToken(res.data.token);
      await refreshUser();
    }
  };

  const registerBiometric = async (): Promise<string> => {
    const res = await authAPI.registerBiometric();
    if (res.data.success) {
      await refreshUser();
      return res.data.message;
    }
    throw new Error(res.data.message || 'Biometric registration failed');
  };

  const register = async (data: any) => {
    const res = await authAPI.register(data);
    if (res.data.success && res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      setToken(res.data.token);
      await refreshUser();
    }
  };

  const logout = () => {
    localStorage.removeItem('skillbridge_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (demoEmail: string) => {
    setLoading(true);
    try {
      const password = demoEmail.includes('admin') ? 'admin123' : 'password123';
      await login(demoEmail, password);
    } catch (e) {
      console.error('Failed to switch demo user', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginBiometric,
        registerBiometric,
        register,
        logout,
        refreshUser,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
