import React, { useEffect, useState } from 'react';
import { BACKEND_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { fmtPrice } from '../../utils/format';
import { mockData } from '../../mocks/mockData';

function getCustomerOrderStatusLabel(status) {
  if (status === 'delivered') return 'Hoàn thành';
  return 'Đã đặt';
}

function isCustomerOrderDelivered(status) {
  return status === 'delivered';
}

export default function AccountOrdersPage() {
  const imgSrc = (url) => (url ? (String(url).startsWith('http') ? url : `${BACKEND_BASE_URL}/${String(url).replace(/^\/+/, '')}`) : null);

  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const list = mockData.accountOrders;
        if (!cancelled) setRows(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return <p className="text-slate-500 text-sm">Đang tải…</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Lịch sử đơn hàng</h2>
      {rows.length === 0 ? (
        <p className="text-slate-600 text-sm">Bạn chưa có đơn hàng nào được liên kết với tài khoản.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            return (
              <article key={o.id} className="rounded-xl border border-slate-100 bg-white overflow-hidden">
                <div className="w-full px-4 py-4 flex items-start justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{o.orderCode}</p>
                      <span
                        className={
                          isCustomerOrderDelivered(o.status)
                            ? 'inline-flex px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold'
                            : 'inline-flex px-2 py-0.5 rounded-lg bg-[#e8ff99] text-slate-900 text-xs font-semibold border border-[#CCFF00]/60'
                        }
                      >
                        {getCustomerOrderStatusLabel(o.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '—'}
                    </p>
                    <p className="text-xs text-slate-700 mt-1 break-words">
                      Địa chỉ: {o.shippingAddress || 'Không có thông tin'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{items.length} sản phẩm</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-slate-900 tabular-nums">{fmtPrice(o.totalAmount)} ₫</p>
                  </div>
                </div>

                <div className="px-4 pb-4 border-t border-slate-100">
                  <div className="mt-3 space-y-2">
                    {items.map((it) => (
                      <div key={`${o.id}-${it.id}`} className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5">
                        <div className="w-14 h-14 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                          {imgSrc(it.image) ? (
                            <img src={imgSrc(it.image)} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <span className="material-symbols-outlined text-xl">laptop</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 break-words">{it.productName}</p>
                          <p className="text-xs text-slate-500 break-words">{it.variantName || 'Phiên bản mặc định'}</p>
                          <p className="text-xs text-slate-700 mt-1">
                            SL: {it.quantity} • Đơn giá: {fmtPrice(Number(it.unitPrice || 0))} ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
