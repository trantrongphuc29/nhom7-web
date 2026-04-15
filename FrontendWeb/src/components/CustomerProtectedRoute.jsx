import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStaffHomePath, isRetailCustomerRole } from '../features/admin/utils/rbac';

export default function CustomerProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <div className="p-4 text-sm text-slate-500">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!isRetailCustomerRole(user?.role)) {
    return <Navigate to={getStaffHomePath()} replace />;
  }

  return children;
}
