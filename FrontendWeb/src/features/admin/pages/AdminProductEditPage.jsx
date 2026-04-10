import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ProductForm from "../components/ProductForm";
import { getAdminProductDetail, updateAdminProduct, uploadAdminProductImages } from "../services/adminProducts.service";
import { useAuth } from "../../../context/AuthContext";
import { normalizeRole } from "../utils/rbac";

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageProducts = role === "admin";
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (!canManageProducts) {
      setLoading(false);
      return () => undefined;
    }
    let mounted = true;
    getAdminProductDetail(id, token)
      .then((data) => {
        if (!mounted) return;
        setInitialValues(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, token, canManageProducts]);

  const mutation = useMutation({
    mutationFn: (payload) => updateAdminProduct(id, payload, token),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      navigate("/admin/products");
    },
    onError: (err) => toast.error(err.message || "Cập nhật thất bại"),
  });

  if (!canManageProducts) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Sản phẩm</h1>
        </div>
        <p className="text-sm text-slate-600">Bạn chỉ có quyền xem danh sách sản phẩm. Chức năng sửa/xóa chỉ dành cho Admin.</p>
      </div>
    );
  }

  if (loading) return <div className="text-sm text-slate-500">Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Sửa sản phẩm</h1>
      </div>
      <ProductForm
        key={initialValues?.id ?? `edit-${id}`}
        initialValues={initialValues}
        submitLabel="Lưu thay đổi"
        submitting={mutation.isPending}
        onImageUpload={(files, productName) => uploadAdminProductImages(files, token, productName)}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}
