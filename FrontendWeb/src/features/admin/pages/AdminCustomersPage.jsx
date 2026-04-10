import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { formatVnd } from "../utils/formatters";
import { getAdminCustomerDetail, getAdminCustomers, updateAdminCustomerStatus } from "../services/adminCustomers.service";

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
  const cls = status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
  return <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${cls}`}>{status}</span>;
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
        <thead className="bg-slate-50">
          <tr>{headers.map((h) => <th key={h.key || h.label} className="text-left px-3 py-2.5 text-slate-600">{h.label}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function LoadingRow({ colSpan = 1, text = "Đang tải dữ liệu..." }) {
  return <tr><td colSpan={colSpan} className="p-6 text-center text-slate-500">{text}</td></tr>;
}
function EmptyRow({ colSpan = 1, text = "Không có dữ liệu." }) {
  return <tr><td colSpan={colSpan} className="p-6 text-center text-slate-500">{text}</td></tr>;
}
function ErrorBox({ text = "Có lỗi xảy ra." }) {
  return <div className="text-sm rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">{text}</div>;
}
function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const listQuery = useQuery({
    queryKey: ["admin-customers", { search: debouncedSearch, status, page }],
    queryFn: () => getAdminCustomers({ search: debouncedSearch, status, page, limit: 10 }, token),
    enabled: Boolean(token),
    keepPreviousData: true,
  });
  const detailQuery = useQuery({
    queryKey: ["admin-customer-detail", selectedId],
    queryFn: () => getAdminCustomerDetail(selectedId, token),
    enabled: Boolean(token && selectedId),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status: s }) => updateAdminCustomerStatus(id, { status: s }, token),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái khách hàng");
      listQuery.refetch();
      detailQuery.refetch();
    },
    onError: (error) => toast.error(error?.message || "Không thể cập nhật trạng thái khách hàng"),
  });

  const records = listQuery.data?.records ?? [];
  const pagination = listQuery.data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const detail = detailQuery.data;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2">
        <PageHeader title="Khách hàng" subtitle="Theo dõi danh sách khách hàng và trạng thái tài khoản" />
        <div className="mb-3 flex flex-wrap items-center gap-2 gap-y-3">
          <input className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 min-w-[200px] flex-1 sm:flex-none" placeholder="Tìm tên / email / SĐT" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 shrink-0 bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
          </select>
        </div>
        <TableShell
          headers={[
            { key: "id", label: "ID" },
            { key: "name", label: "Tên" },
            { key: "contact", label: "Liên hệ" },
            { key: "spent", label: "Chi tiêu" },
            { key: "status", label: "Trạng thái" },
          ]}
        >
          {listQuery.isLoading ? (
            <LoadingRow colSpan={5} text="Đang tải khách hàng..." />
          ) : (
            records.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(row.id)}>
                <td className="px-3 py-2.5">{row.id}</td>
                <td className="px-3 py-2.5">{row.fullName}</td>
                <td className="px-3 py-2.5 text-xs text-slate-600">{row.email || "-"}<br />{row.phone || "-"}</td>
                <td className="px-3 py-2.5">{formatVnd(row.totalSpent)}đ</td>
                <td className="px-3 py-2.5"><StatusBadge status={row.status} /></td>
              </tr>
            ))
          )}
          {!listQuery.isLoading && records.length === 0 ? <EmptyRow colSpan={5} text="Không có dữ liệu." /> : null}
        </TableShell>
        {listQuery.isError ? <div className="mt-3"><ErrorBox text={listQuery.error?.message || "Không tải được danh sách khách hàng"} /></div> : null}
        <PaginationBar
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          total={pagination.total || 0}
          onPageChange={setPage}
        />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Chi tiết khách hàng</h3>
        {!selectedId ? (
          <p className="text-sm text-slate-500">Chọn một khách hàng để xem chi tiết.</p>
        ) : detailQuery.isLoading ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : detail ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">{detail.fullName}</p>
              <p className="text-xs text-slate-500">{detail.email || "-"}</p>
              <p className="text-xs text-slate-500">{detail.phone || "-"}</p>
            </div>
            <div className="text-xs text-slate-600">Điểm tích lũy: {detail.loyaltyPoints}</div>
            <div className="text-xs text-slate-600">Tổng chi tiêu: {formatVnd(detail.totalSpent)}đ</div>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-60" disabled={updateMutation.isLoading} onClick={() => setPendingStatusUpdate({ id: detail.id, status: "active" })}>Mở khóa</button>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white disabled:opacity-60" disabled={updateMutation.isLoading} onClick={() => setPendingStatusUpdate({ id: detail.id, status: "blocked" })}>Khóa</button>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Đơn gần đây</p>
              <div className="space-y-1">
                {(detail.recentOrders || []).map((o) => (
                  <p key={o.id} className="text-xs text-slate-600">{o.code} - {formatVnd(o.totalAmount)}đ - {o.status}</p>
                ))}
                {(detail.recentOrders || []).length === 0 ? <p className="text-xs text-slate-500">Chưa có đơn hàng.</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <ConfirmModal
        open={Boolean(pendingStatusUpdate)}
        title="Xác nhận cập nhật trạng thái khách hàng"
        message={`Bạn có chắc muốn chuyển trạng thái sang "${pendingStatusUpdate?.status}"?`}
        confirmText="Xác nhận"
        onCancel={() => setPendingStatusUpdate(null)}
        onConfirm={() => {
          if (updateMutation.isLoading) return;
          const payload = pendingStatusUpdate;
          setPendingStatusUpdate(null);
          if (payload) updateMutation.mutate(payload);
        }}
      />
    </div>
  );
}
