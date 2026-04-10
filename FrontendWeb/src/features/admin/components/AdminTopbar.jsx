import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ADMIN_MENU } from "../constants/menu";

export default function AdminTopbar({ onToggleSidebar }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const pathLabelMap = useMemo(() => {
    const map = {};
    ADMIN_MENU.forEach((item) => {
      if (item.path) map[item.path] = item.label;
      (item.children || []).forEach((child) => {
        map[child.path] = child.label;
      });
    });
    return map;
  }, []);
  const crumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const pathParts = [];
    return segments.map((segment) => {
      pathParts.push(segment);
      const currentPath = `/${pathParts.join("/")}`;
      return pathLabelMap[currentPath] || segment;
    });
  }, [location.pathname, pathLabelMap]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 ">
        <button type="button" onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 ">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-sm font-semibold text-slate-500 ">{crumbs.join(" / ") || "Dashboard"}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold">
            {user?.email?.slice(0, 1)?.toUpperCase() || "A"}
          </div>
          <button type="button" onClick={logout} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
