import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { getJson, postJson } from '../services/apiClient';
import { AUTH_UNAUTHORIZED_EVENT } from '../utils/authSession';

const AuthContext = createContext(null);

function getCachedUser() {
  try {
    const raw = localStorage.getItem('user_info');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => (getCachedUser() ? 'session' : ''));
  const [user, setUser] = useState(() => getCachedUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySessionUser = useCallback((sessionUser) => {
    if (!sessionUser) {
      setToken('');
      setUser(null);
      localStorage.removeItem('user_info');
      return null;
    }

    const mappedUser = { ...sessionUser, fullName: sessionUser.full_name || sessionUser.fullName || '' };
    setToken('session');
    setUser(mappedUser);
    localStorage.setItem('user_info', JSON.stringify(mappedUser));
    return mappedUser;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getJson(API_ENDPOINTS.AUTH_ME, { skipAuthHandling: true });
      return applySessionUser(response?.data ?? response);
    } catch (error) {
      const status = Number(error?.status || 0);
      if (status === 401 || status === 419) {
        applySessionUser(null);
        return null;
      }
      // Giữ phiên hiện tại nếu backend/network lỗi tạm thời để tránh tự logout.
      return user;
    }
  }, [applySessionUser, user]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) setIsInitializing(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    const onUnauthorized = () => applySessionUser(null);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [applySessionUser]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await postJson(API_ENDPOINTS.AUTH_LOGIN, { email, password }, { skipAuthHandling: true });
      return applySessionUser(response?.data?.user ?? response?.user ?? null);
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  }, [applySessionUser]);

  const register = useCallback(async (fullName, email, password, confirmPassword) => {
    setIsLoading(true);
    try {
      const response = await postJson(API_ENDPOINTS.AUTH_REGISTER, {
        full_name: fullName,
        email,
        password,
        password_confirmation: confirmPassword,
      }, { skipAuthHandling: true });
      return applySessionUser(response?.data?.user ?? response?.user ?? null);
    } catch (error) {
      throw new Error(error.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  }, [applySessionUser]);

  const logout = useCallback(async () => {
    try {
      await postJson(API_ENDPOINTS.AUTH_LOGOUT, {}, { skipAuthHandling: true });
    } catch {
      // Session có thể đã hết hạn, vẫn xoá local state.
    } finally {
      applySessionUser(null);
    }
  }, [applySessionUser]);

  const value = useMemo(
    () => ({
      token, user, isAuthenticated: Boolean(user), isInitializing,
      isLoading, login, register, logout, refreshUser, setUser: applySessionUser
    }),
    [token, user, isLoading, isInitializing, login, register, logout, refreshUser, applySessionUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}