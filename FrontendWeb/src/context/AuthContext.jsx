import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { postJson } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. Đọc dữ liệu từ localStorage để F5 không bị mất
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user_info');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    return user;
  }, [user]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await postJson('http://127.0.0.1:8000/api/v1/auth/login', { email, password });
      const { token, user: backendUser } = response.data; 
      
      // Đồng bộ tên để Frontend hiểu
      const mappedUser = { ...backendUser, fullName: backendUser.full_name };
      
      setToken(token);
      setUser(mappedUser);
      // 2. Lưu vào bộ nhớ máy tính
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_info', JSON.stringify(mappedUser));
      
      return mappedUser;
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, confirmPassword) => {
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  };

  const value = useMemo(
    () => ({
      token, user, isAuthenticated: Boolean(token && user),
      isLoading, login, register, logout, refreshUser, setUser // Thêm setUser vào đây
    }),
    [token, user, isLoading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}