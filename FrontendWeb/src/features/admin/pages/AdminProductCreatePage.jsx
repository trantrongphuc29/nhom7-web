import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ProductForm from "../components/ProductForm";
import { createAdminProduct, uploadAdminProductImages } from "../services/adminProducts.service";
import { useAuth } from "../../../context/AuthContext";
import { normalizeRole } from "../utils/rbac";

export default function AdminProductCreatePage() {
  const { token, user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageProducts = role === "admin";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => createAdminProduct(payload, token),
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.message || "Tạo sản phẩm thất bại"),
  });

  if (!canManageProducts) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Thêm sản phẩm</h1>
        </div>
        <p className="text-sm text-slate-600">Bạn chỉ có quyền xem danh sách sản phẩm. Chức năng tạo/sửa/xóa chỉ dành cho Admin.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Thêm sản phẩm</h1>
      </div>
      <ProductForm
        submitLabel="Tạo sản phẩm"
        submitting={mutation.isPending}
        onImageUpload={(files, productName) => uploadAdminProductImages(files, token, productName)}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}
