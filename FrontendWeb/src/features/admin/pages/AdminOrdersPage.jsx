import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatVndCurrency } from "../utils/formatters";
import { getAdminOrderDetail, getAdminOrders } from "../services/adminOrders.service";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const listQuery = useQuery({
    queryKey: ["admin-orders", { page }],
    queryFn: () => getAdminOrders({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-order-detail", selectedOrderId],
    queryFn: () => getAdminOrderDetail(selectedOrderId),
    enabled: Boolean(selectedOrderId),
  });

  const records = listQuery.data?.records || [];
  const pagination = listQuery.data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const detail = detailQuery.data || null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý đơn hàng</h1>
          <p className="text-sm text-slate-500">Nhấn vào đơn hàng để xem chi tiết sản phẩm và địa chỉ giao.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)] gap-5 items-start">
        <div className="min-w-0 bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2.5 text-slate-600">Mã đơn</th>
                <th className="text-left px-3 py-2.5 text-slate-600">Khách hàng</th>
                <th className="text-left px-3 py-2.5 text-slate-600">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading ? (
                <tr><td className="p-6 text-center text-slate-500" colSpan={3}>Đang tải đơn hàng...</td></tr>
              ) : records.length === 0 ? (
                <tr><td className="p-6 text-center text-slate-500" colSpan={3}>Chưa có đơn hàng.</td></tr>
              ) : (
                records.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedOrderId(row.id)}
                    className={`border-t border-slate-100 cursor-pointer transition ${
                      selectedOrderId === row.id ? "bg-slate-50" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">{row.code}</td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <div className="break-words">{row.customerName || "-"}</div>
                      <div className="text-xs text-slate-500">{row.customerPhone || "-"}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-800 whitespace-nowrap">{formatVndCurrency(row.totalAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="min-w-0 bg-white border border-slate-200 rounded-xl p-4 xl:sticky xl:top-6">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Chi tiết đơn hàng</h2>
          {!selectedOrderId ? (
            <p className="text-sm text-slate-500">Chọn một đơn hàng để xem chi tiết.</p>
          ) : detailQuery.isLoading ? (
            <p className="text-sm text-slate-500">Đang tải chi tiết đơn hàng...</p>
          ) : !detail ? (
            <p className="text-sm text-slate-500">Không có dữ liệu chi tiết.</p>
          ) : (
            <div className="space-y-3 text-sm min-w-0">
              <div>
                <p className="text-slate-500">Mã đơn</p>
                <p className="font-semibold text-slate-900 break-all">{detail.code}</p>
              </div>
              <div>
                <p className="text-slate-500">Địa chỉ giao hàng</p>
                <p className="text-slate-800 break-words">{detail.shippingAddress || "-"}</p>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-slate-500 text-xs">Tổng thanh toán</p>
                <p className="text-lg font-semibold text-slate-900">{formatVndCurrency(detail.totalAmount ?? detail.subtotalAmount ?? 0)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Sản phẩm</p>
                <div className="space-y-2 max-h-[52vh] overflow-auto pr-1">
                  {(detail.items || []).map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-lg p-2 min-w-0">
                      <p className="font-medium text-slate-800 break-words">{item.productName}</p>
                      <p className="text-xs text-slate-500 break-words">{item.variantName || "-"}</p>
                      <p className="text-xs text-slate-600">
                        SL: {item.quantity} × {formatVndCurrency(item.unitPrice)} • Thành tiền: {formatVndCurrency(item.lineTotal ?? item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>Tổng: {pagination.total || 0}</span>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </button>
          <span>{pagination.page || 1}/{pagination.totalPages || 1}</span>
          <button
            className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50"
            disabled={page >= (pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
