import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { formatVndCurrency } from "../utils/formatters";
import {
  getAdminOrderDetail,
  getAdminOrders,
  updateAdminOrderStatus,
} from "../services/adminOrders.service";
import { labelAdminOrderStatus } from "../utils/orderStatus";

function PageHeader({ title, subtitle }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
      </div>
    </div>
  );
}
function StatusBadge({ status }) {
  const cls =
    status === "pending" ? "bg-amber-100 text-amber-800"
      : status === "accepted" ? "bg-sky-100 text-sky-800"
      : status === "delivered" ? "bg-emerald-100 text-emerald-800"
      : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${cls}`}>{labelAdminOrderStatus(status)}</span>;
}
function OrderTimeline({ timeline = [] }) {
  return (
    <div className="space-y-3">
      {timeline.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">{labelAdminOrderStatus(item.status)}</p>
            {item.note ? <p className="text-xs text-slate-500">{item.note}</p> : null}
            <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
          </div>
        </div>
      ))}
      {timeline.length === 0 ? <p className="text-xs text-slate-500">Chưa có lịch sử trạng thái.</p> : null}
    </div>
  );
}
function ConfirmModal({ open, title, message, confirmText = "Xác nhận", cancelText = "Hủy", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-200" onClick={onCancel}>{cancelText}</button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
function PaginationBar({ page = 1, totalPages = 1, total = 0, onPageChange, align = "between" }) {
  const containerClass =
    align === "end"
      ? "mt-3 flex justify-end items-center gap-2 text-sm text-slate-500"
      : "mt-3 flex items-center justify-between text-sm text-slate-500";
  return (
    <div className={containerClass}>
      {align === "between" ? <span>Tổng: {total || 0}</span> : null}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Trước</button>
        <span>{page || 1}/{totalPages || 1}</span>
        <button className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50" disabled={page >= (totalPages || 1)} onClick={() => onPageChange(page + 1)}>Sau</button>
      </div>
    </div>
  );
}
function TableShell({ headers = [], children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr>{headers.map((h) => <th key={h.key || h.label} className="text-left px-3 py-2.5 text-slate-600">{h.label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function LoadingRow({ colSpan = 1, text = "Đang tải dữ liệu..." }) { return <tr><td colSpan={colSpan} className="p-6 text-center text-slate-500">{text}</td></tr>; }
function EmptyRow({ colSpan = 1, text = "Không có dữ liệu." }) { return <tr><td colSpan={colSpan} className="p-6 text-center text-slate-500">{text}</td></tr>; }
function ErrorBox({ text = "Có lỗi xảy ra." }) { return <div className="text-sm rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">{text}</div>; }
function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const PAYMENT_LABELS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
  card: "Thẻ (thanh toán online)",
  e_wallet: "Ví điện tử",
};

const NEXT_STATUS_OPTIONS = {
  pending: ["accepted"],
  accepted: ["delivered"],
  delivered: [],
};

export default function AdminOrdersPage({ pendingOnly = false }) {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const selectFromNav = location.state?.selectOrderId;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(pendingOnly ? "pending" : "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [nextStatus, setNextStatus] = useState("accepted");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  // Khi đổi giữa /admin/orders và /admin/orders/pending,
  // React Router có thể chỉ đổi props chứ không remount => state filter dễ "dính".
  useEffect(() => {
    setSearch("");
    setStatus(pendingOnly ? "pending" : "");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setSelectedOrderId(null);
    setNextStatus("accepted");
    setConfirmOpen(false);
  }, [pendingOnly]);

  useEffect(() => {
    if (selectFromNav == null) return;
    const id = Number(selectFromNav);
    if (!Number.isInteger(id) || id <= 0) return;
    setSelectedOrderId(id);
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: {} });
  }, [selectFromNav, location.pathname, location.search, navigate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, dateFrom, dateTo]);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", { search: debouncedSearch, status, dateFrom, dateTo, page }],
    queryFn: () => getAdminOrders({ search: debouncedSearch, status, dateFrom, dateTo, page, limit: 10 }, token),
    enabled: Boolean(token),
    keepPreviousData: true,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-order-detail", selectedOrderId],
    queryFn: () => getAdminOrderDetail(selectedOrderId, token),
    enabled: Boolean(token && selectedOrderId),
  });

  const selectedOrder = detailQuery.data;

  useEffect(() => {
    if (!selectedOrder) return;
    const options = NEXT_STATUS_OPTIONS[selectedOrder.status] || [];
    if (options.length > 0) setNextStatus(options[0]);
  }, [selectedOrder]);

  const updateStatusMutation = useMutation({
    mutationFn: (payload) => updateAdminOrderStatus(selectedOrderId, payload, token),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái đơn hàng");
      ordersQuery.refetch();
      detailQuery.refetch();
    },
    onError: (error) => toast.error(error?.message || "Không thể cập nhật trạng thái đơn hàng"),
  });

  const records = ordersQuery.data?.records ?? [];
  const pagination = ordersQuery.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const openConfirm = () => setConfirmOpen(true);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2">
        <PageHeader
          title={pendingOnly ? "Đơn cần xử lý" : "Tất cả đơn hàng"}
          subtitle="Theo dõi và cập nhật trạng thái đơn hàng."
        />
        <div className="mb-3 flex flex-wrap items-center gap-2 gap-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn / tên / SĐT"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 min-w-[200px] flex-1 sm:flex-none"
          />
          {pendingOnly ? null : (
            <select
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 shrink-0 bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Cần xử lý</option>
              <option value="accepted">Đã tiếp nhận</option>
              <option value="delivered">Đã giao</option>
            </select>
          )}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            title="Từ ngày"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            title="Đến ngày"
          />
        </div>
        <TableShell
          headers={[
            { key: "id", label: "ID" },
            { key: "code", label: "Mã đơn" },
            { key: "customer", label: "Khách hàng" },
            { key: "total", label: "Tổng tiền" },
            { key: "status", label: "Trạng thái" },
            { key: "payment", label: "Hình thức thanh toán" },
          ]}
        >
          {ordersQuery.isLoading ? (
            <LoadingRow colSpan={6} text="Đang tải đơn hàng..." />
          ) : (
            records.map((order) => (
              <tr
                key={order.id}
                className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                onClick={() => setSelectedOrderId(order.id)}
              >
                <td className="py-2.5 px-3">{order.id}</td>
                <td className="py-2.5 px-3">{order.code}</td>
                <td className="py-2.5 px-3">{order.customerName}</td>
                <td className="py-2.5 px-3">{formatVndCurrency(order.totalAmount)}</td>
                <td className="py-2.5 px-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-2.5 px-3 text-slate-700 text-xs">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}</td>
              </tr>
            ))
          )}
          {!ordersQuery.isLoading && records.length === 0 ? <EmptyRow colSpan={6} text="Không có đơn hàng." /> : null}
        </TableShell>
        {ordersQuery.isError ? (
          <div className="mt-3">
            <ErrorBox text={ordersQuery.error?.message || "Không tải được danh sách đơn hàng"} />
          </div>
        ) : null}
        <PaginationBar
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          total={pagination.total || 0}
          onPageChange={setPage}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-0">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Chi tiết đơn hàng</h3>
        {!selectedOrderId ? (
          <p className="text-sm text-slate-500">Chọn một đơn để xem chi tiết.</p>
        ) : detailQuery.isLoading ? (
          <p className="text-sm text-slate-500">Đang tải chi tiết...</p>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Mã đơn</p>
              <p className="text-sm font-semibold text-slate-700">{selectedOrder.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Khách hàng</p>
              <p className="text-sm text-slate-700">{selectedOrder.customerName}</p>
              <p className="text-xs text-slate-500">{selectedOrder.customerPhone}</p>
              {selectedOrder.customerEmail ? <p className="text-xs text-slate-500">{selectedOrder.customerEmail}</p> : null}
            </div>
            <div>
              <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{selectedOrder.shippingAddress?.trim() || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Hình thức thanh toán</p>
              <p className="text-sm text-slate-700">{PAYMENT_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Voucher</p>
              <p className="text-sm text-slate-800 font-semibold">
                {selectedOrder.voucherDiscountAmount > 0
                  ? `Giảm ${formatVndCurrency(selectedOrder.voucherDiscountAmount)}`
                  : "Không sử dụng voucher"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Sản phẩm</p>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-100 p-2 text-xs bg-slate-50/80">
                    <p className="font-medium text-slate-800">
                      {item.productName} × {item.quantity} — {formatVndCurrency(item.unitPrice)}
                    </p>
                    <p className="text-slate-500 mt-1">{item.variantName || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Timeline</p>
              <OrderTimeline timeline={selectedOrder.timeline} />
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500 mb-2">Cập nhật trạng thái</p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 min-w-0 max-w-full bg-white shrink-0"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                >
                  {(NEXT_STATUS_OPTIONS[selectedOrder.status] || []).map((s) => (
                    <option key={s} value={s}>
                      {labelAdminOrderStatus(s)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-xs rounded-lg bg-blue-600 text-white px-3 py-1.5 disabled:opacity-60"
                  disabled={(NEXT_STATUS_OPTIONS[selectedOrder.status] || []).length === 0 || updateStatusMutation.isLoading}
                  onClick={openConfirm}
                >
                  {updateStatusMutation.isLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Không tìm thấy chi tiết đơn.</p>
        )}
        {detailQuery.isError ? (
          <div className="mt-3">
            <ErrorBox text={detailQuery.error?.message || "Không tải được chi tiết đơn hàng"} />
          </div>
        ) : null}
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Xác nhận đổi trạng thái đơn"
        message={
          nextStatus === "accepted"
            ? `Chuyển đơn sang ${labelAdminOrderStatus("accepted")}?`
            : `Chuyển đơn sang ${labelAdminOrderStatus(nextStatus)}?`
        }
        confirmText="Đổi trạng thái"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (updateStatusMutation.isLoading) return;
          setConfirmOpen(false);
          updateStatusMutation.mutate({ status: nextStatus });
        }}
      />
    </div>
  );
}
