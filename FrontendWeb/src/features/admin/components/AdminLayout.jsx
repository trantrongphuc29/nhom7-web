import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="admin-panel min-h-screen bg-slate-50 flex">
      <AdminSidebar sidebarCollapsed={sidebarCollapsed} />
      <div className="flex-1 min-w-0">
        <AdminTopbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-[1440px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
