import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccountOrders } from "../../services/orders.service";
import { fmtPrice } from "../../utils/format";

export default function AccountOrdersPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["account-orders"],
    queryFn: () => getAccountOrders(),
  });

  const rows = Array.isArray(data) ? data : [];

  if (isLoading) return <p className="text-slate-500 text-sm">Đang tải lịch sử đơn hàng...</p>;
  if (isError) return <p className="text-rose-600 text-sm">{error?.message || "Không tải được đơn hàng."}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Lịch sử đơn hàng</h2>
      {rows.length === 0 ? (
        <p className="text-slate-600 text-sm">Bạn chưa có đơn hàng nào.</p>
      ) : (
        rows.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{order.orderCode}</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}
            </p>
            <p className="text-sm text-slate-700 mt-2">Địa chỉ: {order.shippingAddress || "—"}</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">Tổng tiền: {fmtPrice(order.totalAmount)}đ</p>

            <div className="mt-3 space-y-2">
              {(order.items || []).map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-100 p-2 text-sm">
                  <p className="font-medium text-slate-800">{item.productName}</p>
                  <p className="text-xs text-slate-500">{item.variantName || "Phiên bản mặc định"}</p>
                  <p className="text-xs text-slate-600">
                    SL: {item.quantity} • Đơn giá: {fmtPrice(item.unitPrice)}đ
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
