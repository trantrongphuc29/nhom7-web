import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { postJson, getJson } from '../services/apiClient';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // --- Hàm Đăng nhập ---
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await postJson(API_ENDPOINTS.AUTH_LOGIN, { email, password });
      const { token: authToken, user: authUser } = response.data;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('user_info', JSON.stringify(authUser));

      return authUser;
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Hàm Đăng ký (Đã sửa để khớp hoàn toàn với Laravel confirmed rule) ---
  const register = async (fullName, email, password, passwordConfirmation) => {
    setIsLoading(true);
    try {
      const response = await postJson(API_ENDPOINTS.AUTH_REGISTER, {
        full_name: fullName,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation // Gửi kèm để Laravel kiểm tra khớp mật khẩu
      });

      const { token: authToken, user: authUser } = response.data;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('user_info', JSON.stringify(authUser));

      return authUser;
    } catch (error) {
      // Bắt lỗi validation từ Laravel gửi về
      throw new Error(error.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Hàm Đăng xuất ---
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  };

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await getJson(API_ENDPOINTS.AUTH_ME);
      setUser(res.data);
      localStorage.setItem('user_info', JSON.stringify(res.data));
      return res.data;
    } catch {
      logout();
      return null;
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register, // Hàm đã có đầy đủ 4 tham số
      logout,
      refreshUser,
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