import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminProductCreatePage from "../pages/AdminProductCreatePage";
import AdminProductEditPage from "../pages/AdminProductEditPage";
import AdminCustomersPage from "../pages/AdminCustomersPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import AdminProductsListPage from "../pages/AdminProductsListPage";

function AdminRoutes() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Đang tải module quản trị...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProductsListPage />} />
          <Route path="products/new" element={<AdminProductCreatePage />} />
          <Route path="products/:id/edit" element={<AdminProductEditPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AdminRoutes;
