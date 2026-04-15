import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="admin-panel min-h-screen bg-slate-50 flex">
      <AdminSidebar sidebarCollapsed={false} />
      <div className="flex-1 min-w-0">
        <main className="p-6 max-w-[1440px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
