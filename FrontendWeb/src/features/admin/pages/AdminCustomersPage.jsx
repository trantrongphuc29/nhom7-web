import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { formatVnd } from "../utils/formatters";
import { getAdminCustomers, updateAdminCustomerStatus } from "../services/adminCustomers.service";

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

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: ["admin-customers", { page }],
    queryFn: () => getAdminCustomers({ page, limit: 10 }, token),
    enabled: Boolean(token),
    keepPreviousData: true,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status: s }) => updateAdminCustomerStatus(id, { status: s }, token),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái khách hàng");
      listQuery.refetch();
    },
    onError: (error) => toast.error(error?.message || "Không thể cập nhật trạng thái khách hàng"),
  });

  const records = listQuery.data?.records ?? [];
  const pagination = listQuery.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const onToggleStatus = (row) => {
    if (!row?.id) return;
    const nextStatus = row.status === "active" ? "blocked" : "active";
    const actionLabel = nextStatus === "active" ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} khách hàng này?`)) return;
    updateMutation.mutate({ id: row.id, status: nextStatus });
  };

  return (
    <div>
      <PageHeader title="Khách hàng" subtitle="Theo dõi danh sách khách hàng và trạng thái tài khoản" />
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
            <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2.5">{row.id}</td>
              <td className="px-3 py-2.5">{row.fullName}</td>
              <td className="px-3 py-2.5 text-xs text-slate-600">{row.email || "-"}<br />{row.phone || "-"}</td>
              <td className="px-3 py-2.5">{formatVnd(row.totalSpent)}đ</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                  <button
                    type="button"
                    className={`text-xs px-2.5 py-1 rounded-md text-white ${
                      row.status === "active" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                    disabled={updateMutation.isPending}
                    onClick={() => onToggleStatus(row)}
                  >
                    {row.status === "active" ? "Khóa" : "Mở khóa"}
                  </button>
                </div>
              </td>
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
  );
}
