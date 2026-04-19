import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { getJson } from '../../services/apiClient';

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-full text-sm transition-colors border border-transparent',
    isActive
      ? 'bg-[#CCFF00] text-black font-bold shadow-none [&_span.material-symbols-outlined]:text-black'
      : 'text-slate-700 font-semibold hover:bg-slate-50 [&_span.material-symbols-outlined:last-child]:opacity-70',
  ].join(' ');

export default function AccountLayout() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [profileName, setProfileName] = useState('');
  
  const displayName = useMemo(
    () => profileName?.trim() || user?.full_name?.trim() || user?.fullName?.trim() || user?.email?.split('@')[0] || 'Bạn',
    [profileName, user]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      try {
        const json = await getJson('/account/profile');
        if (cancelled) return;
        const p = json?.data || json;
        setProfileName(p?.full_name || p?.fullName || '');
      } catch {
        // Lỗi sẽ tự im lặng, dùng tên lấy từ useAuth()
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-display text-slate-900">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-72 shrink-0">
            <div className="px-3 py-3 mb-1">
                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
              </div>
            <nav className="bg-white rounded-2xl shadow-xl p-2 space-y-1.5">
              <NavLink to="/tai-khoan/thong-tin" className={navClass}>
                <span className="material-symbols-outlined text-[20px] shrink-0">person</span>
                <span className="flex-1 text-left leading-tight">Thông tin tài khoản</span>
                <span className="material-symbols-outlined text-lg shrink-0">chevron_right</span>
              </NavLink>
              <NavLink to="/tai-khoan/don-hang" className={navClass}>
                <span className="material-symbols-outlined text-[20px] shrink-0">receipt_long</span>
                <span className="flex-1 text-left leading-tight">Lịch sử đơn hàng</span>
                <span className="material-symbols-outlined text-lg shrink-0">chevron_right</span>
              </NavLink>
              <NavLink to="/tai-khoan/so-dia-chi" className={navClass}>
                <span className="material-symbols-outlined text-[20px] shrink-0">location_on</span>
                <span className="flex-1 text-left leading-tight">Sổ địa chỉ</span>
                <span className="material-symbols-outlined text-lg shrink-0">chevron_right</span>
              </NavLink>
              <NavLink to="/tai-khoan/faq" className={navClass}>
                <span className="material-symbols-outlined text-[20px] shrink-0">help</span>
                <span className="flex-1 text-left leading-tight">Câu hỏi thường gặp</span>
                <span className="material-symbols-outlined text-lg shrink-0">chevron_right</span>
              </NavLink>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-transparent"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
                <span className="flex-1 text-left leading-tight">Đăng xuất</span>
                <span className="material-symbols-outlined text-lg shrink-0 opacity-70">chevron_right</span>
              </button>
            </nav>
          </aside>

          <section className="flex-1 min-w-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
            <Outlet />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}