import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { bulkDeleteAdminProducts, getAdminProducts } from "../services/adminProducts.service";
import { useAuth } from "../../../context/AuthContext";
import { formatVndCurrency } from "../utils/formatters";
import { normalizeRole, isStaffRole } from "../utils/rbac";
import toast from "react-hot-toast";

export default function AdminProductsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuth();

  // Kiểm tra quyền hạn
  const role = normalizeRole(user?.role);
  const canManageProducts = role === "admin";

  // 1. Lấy dữ liệu từ API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-products", token],
    queryFn: () => getAdminProducts(token),
    enabled: Boolean(token && isStaffRole(user?.role)),
  });

  // 2. TRUY CẬP ĐÚNG CẤP DỮ LIỆU: records nằm trong data.data
  // Giải thích: data (của react-query) -> .data (key trong JSON Laravel) -> .records
  const records = data?.records || [];

  // 3. Xử lý Xóa sản phẩm
  const bulkDeleteMutation = useMutation({
    mutationFn: (payload) => bulkDeleteAdminProducts(payload, token),
    onSuccess: () => {
      toast.success("Đã xóa sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  });

  const handleDelete = (id) => {
    const ok = window.confirm("Bạn có chắc muốn xóa sản phẩm này không?");
    if (!ok) return;
    bulkDeleteMutation.mutate({ ids: [id] });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-slate-500">Danh sách các laptop hiện có trong hệ thống</p>
        </div>
        {canManageProducts && (
          <button 
            onClick={() => navigate("/admin/products/new")}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Thêm sản phẩm mới
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-500">Đang tải dữ liệu từ LapStore...</span>
        </div>
      ) : isError ? (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm">
          Lỗi: Không thể kết nối đến máy chủ Backend. Hãy kiểm tra XAMPP/Wamp.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-4 font-semibold text-slate-700">Tên sản phẩm</th>
                  <th className="py-4 px-4 font-semibold text-slate-700">Giá bán</th>
                  <th className="py-4 px-4 font-semibold text-slate-700 text-center">Tồn kho</th>
                  <th className="py-4 px-4 font-semibold text-slate-700">Trạng thái</th>
                  <th className="py-4 px-4 font-semibold text-slate-700 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-[11px] text-slate-400">ID: #{row.id}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-600">
                      {/* Dùng row.sale_price (snake_case) từ Database */}
                      {formatVndCurrency(row.sale_price || 0)}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-600">
                      {row.stock_quantity ?? 0}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.status === 'active' ? 'Đang bán' : row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => navigate(`/admin/products/${row.id}/edit`)}
                        >
                          {canManageProducts ? "Sửa" : "Xem"}
                        </button>
                        {canManageProducts && (
                          <button
                            className="text-rose-600 hover:text-rose-800 font-medium"
                            disabled={bulkDeleteMutation.isPending}
                            onClick={() => handleDelete(row.id)}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {records.length === 0 && (
                  <tr>
                    <td className="py-20 text-center text-slate-500" colSpan={5}>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-2">📦</span>
                        <p>Hiện không có sản phẩm nào trong kho hàng.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}