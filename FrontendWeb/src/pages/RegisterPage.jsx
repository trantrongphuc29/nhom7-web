import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');

  // Kiểm tra lỗi Real-time
  const fullNameError = useMemo(() => {
    if (!form.fullName) return 'Họ và tên là bắt buộc';
    return '';
  }, [form.fullName]);

  const emailError = useMemo(() => {
    if (!form.email) return 'Email là bắt buộc';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không hợp lệ';
    return '';
  }, [form.email]);

  const passwordError = useMemo(() => {
    if (!form.password) return 'Mật khẩu là bắt buộc';
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
    return '';
  }, [form.password]);

  const confirmPasswordError = useMemo(() => {
    if (!form.confirmPassword) return 'Vui lòng xác nhận mật khẩu';
    if (form.confirmPassword !== form.password) return 'Mật khẩu xác nhận không khớp';
    return '';
  }, [form.confirmPassword, form.password]);

  const canSubmit = !fullNameError && !emailError && !passwordError && !confirmPasswordError && !isLoading;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    try {
      setError('');
      // Gửi 4 tham số: Tên, Email, Mật khẩu, Xác nhận mật khẩu
      await register(
        form.fullName.trim(), 
        form.email.trim().toLowerCase(), 
        form.password, 
        form.confirmPassword
      );
      
      toast.success('Chào mừng bạn đến với LapStore!');
      navigate('/admin/products', { replace: true });
    } catch (err) {
      // Hiển thị lỗi từ Laravel (ví dụ: Email đã tồn tại)
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Đăng ký</h1>
        <p className="text-sm text-slate-500 mb-6">Tạo tài khoản để quản lý kho hàng.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ví dụ: Đỗ Văn Hin"
            />
            {form.fullName && fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="hin@gmail.com"
            />
            {form.email && emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {form.confirmPassword && confirmPasswordError && <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>}
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-blue-600 text-white py-3 font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className="text-sm text-slate-600 mt-6 text-center">
          Đã có tài khoản? <Link to="/login" className="font-bold text-blue-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;