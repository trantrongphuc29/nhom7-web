import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { bulkDeleteAdminProducts } from "../services/adminProducts.service";
import { useAuth } from "../../../context/AuthContext";
import { formatVndCurrency } from "../utils/formatters";
import { normalizeRole } from "../utils/rbac";
import { isStaffRole } from "../utils/rbac";
import { getAdminProducts } from "../services/adminProducts.service";

export default function AdminProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageProducts = role === "admin";
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", token],
    queryFn: () => getAdminProducts(token),
    enabled: Boolean(token && isStaffRole(user?.role)),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (payload) => bulkDeleteAdminProducts(payload, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const records = data?.records || [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Danh sách sản phẩm</h1>
      </div>
      {isLoading ? (
        <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Tên sản phẩm</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Thương hiệu</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Giá bán</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Trạng thái</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="py-2.5 px-3">{row.name}</td>
                    <td className="py-2.5 px-3">{row.brand}</td>
                    <td className="py-2.5 px-3">{formatVndCurrency(row.salePrice || 0)}</td>
                    <td className="py-2.5 px-3">{row.status}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <button className="text-xs text-blue-600 hover:underline" onClick={() => navigate(`/admin/products/${row.id}/edit`)}>
                          {canManageProducts ? "Sửa" : "Xem"}
                        </button>
                        {canManageProducts ? (
                          <button
                            className="text-xs text-rose-600 hover:underline"
                            onClick={() => {
                              const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này không?");
                              if (!ok) return;
                              bulkDeleteMutation.mutate({ ids: [row.id] });
                            }}
                          >
                            Xóa
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-slate-500" colSpan={5}>
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
