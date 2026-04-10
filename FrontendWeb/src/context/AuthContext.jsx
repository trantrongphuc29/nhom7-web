import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockData } from '../mocks/mockData';

const AuthContext = createContext(null);
const DEMO_PASSWORD = '123456';

function resolveMockUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (normalized === String(mockData.adminUser?.email || '').toLowerCase()) {
    return { token: 'mock-token-admin', user: mockData.adminUser };
  }
  if (normalized === String(mockData.user?.email || '').toLowerCase()) {
    return { token: 'mock-token-user', user: mockData.user };
  }
  return null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return user;
  }, [user]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (String(password || '') !== DEMO_PASSWORD) {
        throw new Error('Sai mật khẩu. Dùng mật khẩu demo: 123456');
      }
      const resolved = resolveMockUserByEmail(email);
      if (!resolved) {
        throw new Error('Không tìm thấy tài khoản.');
      }
      setToken(resolved.token);
      setUser(resolved.user);
      return resolved.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, confirmPassword) => {
    void email;
    void password;
    void confirmPassword;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, isLoading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
