import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatVndCurrency } from "../utils/formatters";
import { useAuth } from "../../../context/AuthContext";
import { isStaffRole } from "../utils/rbac";
import { getAdminDashboardOverview } from "../services/adminDashboard.service";

function StatCard({ icon, label, value, trend }) {
  const isPositive = (trend || 0) >= 0;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="material-symbols-outlined text-slate-500">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
      {trend != null && !Number.isNaN(Number(trend)) ? (
        <p className={`mt-2 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
          {isPositive ? "+" : ""}
          {Number(trend).toFixed(1)}% so với hôm qua
        </p>
      ) : null}
    </div>
  );
}

export default function AdminDashboardOverviewPage() {
  const { token, isAuthenticated, user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-overview", token],
    queryFn: () => getAdminDashboardOverview(token),
    enabled: Boolean(isAuthenticated && token && isStaffRole(user?.role)),
    staleTime: 20 * 1000,
    refetchInterval: 20 * 1000,
    refetchOnWindowFocus: true,
  });
  const canViewRevenue = Boolean(user?.permissions?.canExportFinancialReports);

  if (isLoading) return <div className="text-sm text-slate-500">Đang tải dashboard...</div>;

  const kpis = data?.kpis || {};
  const topByRevenue = data?.topProductsByRevenue || [];
  const recentOrders = data?.recentOrders || [];
  const ent = data?.enterprise || {};
  const rc = ent.revenueCompare || {};

  const pct = (cur, prev) => {
    if (prev == null || !Number(prev)) return null;
    return ((Number(cur) - Number(prev)) / Number(prev)) * 100;
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard tổng quan</h1>
      </div>

      {canViewRevenue ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="payments"
            label="Doanh thu hôm nay"
            value={formatVndCurrency(rc.today)}
            trend={pct(rc.today, rc.todayPrev)}
          />
          <StatCard icon="analytics" label="Doanh thu 7 ngày" value={formatVndCurrency(rc.week)} />
          <StatCard icon="calendar_month" label="Doanh thu 30 ngày" value={formatVndCurrency(rc.month)} />
          <StatCard
            icon="inventory"
            label="Tồn &lt; 3 (cảnh báo)"
            value={ent.criticalStockUnder3 ?? kpis.lowStockProducts ?? 0}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon="percent"
            label="Margin TB (sản phẩm)"
            value={ent.avgMarginPercent != null ? `${Number(ent.avgMarginPercent).toFixed(2)}%` : "—"}
          />
          <StatCard
            icon="inventory"
            label="Tồn &lt; 3 (cảnh báo)"
            value={ent.criticalStockUnder3 ?? kpis.lowStockProducts ?? 0}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {canViewRevenue ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Top 5 theo doanh thu</h3>
            <div className="space-y-2 text-sm">
              {topByRevenue.length === 0 ? <p className="text-slate-500">Chưa có dữ liệu.</p> : null}
              {topByRevenue.map((item) => (
                <div key={item.id} className="flex justify-between gap-2 border-b border-slate-50 pb-2">
                  <span className="text-slate-700 line-clamp-1">{item.name}</span>
                  <span className="font-medium text-slate-800 shrink-0">{formatVndCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Đơn gần đây</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2">Mã đơn</th>
                  <th className="py-2">Khách hàng</th>
                  <th className="py-2">Tổng tiền</th>
                  <th className="py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 font-medium text-slate-700">{order.code}</td>
                    <td className="py-3 text-slate-600">{order.customerName}</td>
                    <td className="py-3 text-slate-700">{formatVndCurrency(order.totalAmount)}</td>
                    <td className="py-3">{order.status}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-slate-500" colSpan={4}>
                      Chưa có đơn hàng.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
