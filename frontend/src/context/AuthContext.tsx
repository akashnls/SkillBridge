import React, { createContext, useContext, useState, useEffect } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { User, UserRole } from '../types/index.js';
import { authAPI } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginBiometric: (email: string) => Promise<User | null>;
  registerBiometric: () => Promise<string>;
  register: (data: any) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoUser: (demoEmail: string) => Promise<User | null>;
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

  const login = async (email: string, password: string): Promise<User | null> => {
    const res = await authAPI.login(email, password);
    if (res.data.success && res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    return null;
  };

  const loginBiometric = async (email: string): Promise<User | null> => {
    const optsRes = await authAPI.getBiometricLoginOptions(email);
    if (!optsRes.data.success || !optsRes.data.options) {
      throw new Error(optsRes.data.message || 'Failed to initialize biometric login');
    }
    const asseResp = await startAuthentication({ optionsJSON: optsRes.data.options });
    const verifyRes = await authAPI.verifyBiometricLogin(email, asseResp);
    if (verifyRes.data.success && verifyRes.data.token) {
      localStorage.setItem('skillbridge_token', verifyRes.data.token);
      setToken(verifyRes.data.token);
      setUser(verifyRes.data.user);
      return verifyRes.data.user;
    }
    return null;
  };

  const registerBiometric = async (): Promise<string> => {
    const optsRes = await authAPI.getBiometricRegisterOptions();
    if (!optsRes.data.success || !optsRes.data.options) {
      throw new Error(optsRes.data.message || 'Failed to initialize biometric registration');
    }
    const attResp = await startRegistration({ optionsJSON: optsRes.data.options });
    const verifyRes = await authAPI.verifyBiometricRegister(attResp);
    if (verifyRes.data.success) {
      await refreshUser();
      return verifyRes.data.message || 'Biometric passkey registered successfully';
    }
    throw new Error(verifyRes.data.message || 'Biometric registration failed');
  };

  const register = async (data: any): Promise<User | null> => {
    const res = await authAPI.register(data);
    if (res.data.success && res.data.token) {
      localStorage.setItem('skillbridge_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('skillbridge_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (demoEmail: string): Promise<User | null> => {
    setLoading(true);
    try {
      const password = demoEmail.includes('admin') ? 'admin123' : 'password123';
      return await login(demoEmail, password);
    } catch (e) {
      console.error('Failed to switch demo user', e);
      return null;
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


