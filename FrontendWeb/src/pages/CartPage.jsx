import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { BACKEND_BASE_URL } from "../config/api";
import { useCart } from "../context/CartContext";
import { fmtPrice } from "../utils/format";

export default function CartPage() {
  const { items, updateQuantity, removeLine, totals } = useCart();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => new Set(items.map((i) => i.lineId)));
  const [updating, setUpdating] = useState({});
  const syncTimers = useRef({});

  useEffect(() => {
    setSelected(new Set(items.map((i) => i.lineId)));
  }, [items]);

  const toggleSelect = (lineId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.lineId)));
  };

  const bulkDelete = () => {
    selected.forEach((id) => removeLine(id));
    setSelected(new Set());
  };

  /** Cập nhật số lượng ngay; spinner kết thúc sau 500ms kể từ lần thay đổi cuối (mô phỏng debounce API). */
  const bumpQty = (lineId, nextQty) => {
    updateQuantity(lineId, nextQty);
    setUpdating((u) => ({ ...u, [lineId]: true }));
    if (syncTimers.current[lineId]) clearTimeout(syncTimers.current[lineId]);
    syncTimers.current[lineId] = setTimeout(() => {
      setUpdating((u) => ({ ...u, [lineId]: false }));
      delete syncTimers.current[lineId];
    }, 500);
  };

  const imgSrc = (url) =>
    url ? (url.startsWith("http") ? url : `${BACKEND_BASE_URL}/${url}`) : null;

  const goCheckout = () => {
    if (items.length === 0) return;
    navigate("/thong-tin-nhan-hang");
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 font-display text-slate-900">
      <Header />
      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200">shopping_cart</span>
            <p className="text-slate-600 mt-4 mb-6">Giỏ hàng của bạn đang trống.</p>
            <Link to="/" className="inline-flex rounded-xl bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="flex w-full items-start gap-8">
            <div className="w-full min-w-0 flex-1 space-y-3">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded border-slate-300" />
                  <span>Chọn tất cả</span>
                </label>
                {selected.size > 0 ? (
                  <button type="button" onClick={bulkDelete} className="font-medium text-rose-600 hover:underline">
                    Xóa đã chọn ({selected.size})
                  </button>
                ) : null}
              </div>

              {items.map((li) => (
                  <div
                    key={li.lineId}
                    className="relative flex min-w-0 gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <label className="shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={selected.has(li.lineId)}
                        onChange={() => toggleSelect(li.lineId)}
                        className="mt-1 rounded border-slate-300"
                      />
                    </label>
                    <Link
                      to="/"
                      className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                    >
                      {imgSrc(li.image) ? (
                        <img src={imgSrc(li.image)} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-slate-200">laptop</span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 flex gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/"
                            className="line-clamp-2 min-w-0 flex-1 break-words font-bold leading-snug text-slate-900 transition hover:text-slate-700"
                          >
                            {li.name}
                          </Link>
                          <p className="hidden shrink-0 text-right text-sm font-bold tabular-nums text-rose-600">
                            {fmtPrice(li.price * li.quantity)}₫
                          </p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{li.specSummary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center rounded-lg border border-slate-200">
                            <button
                              type="button"
                              disabled={li.quantity <= 1 || updating[li.lineId]}
                              onClick={() => bumpQty(li.lineId, li.quantity - 1)}
                              className="px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                            >
                              −
                            </button>
                            <span className="relative min-w-[2rem] px-3 text-center text-sm font-semibold tabular-nums">
                              {updating[li.lineId] ? (
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                              ) : (
                                li.quantity
                              )}
                            </span>
                            <button
                              type="button"
                              disabled={updating[li.lineId]}
                              onClick={() => bumpQty(li.lineId, li.quantity + 1)}
                              className="px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(li.lineId)}
                            className="text-sm font-medium text-rose-400 hover:text-rose-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="min-w-[120px] shrink-0 text-right block">
                        <p className="text-lg font-bold tabular-nums text-rose-600">{fmtPrice(li.price)}₫</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <aside className="w-[360px] shrink-0 space-y-4 sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4">Tóm tắt đơn hàng</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tạm tính</span>
                    <span className="font-medium tabular-nums">{fmtPrice(totals.subtotal)}₫</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 my-4" />
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-800 font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-extrabold px-3 py-1 rounded-lg tabular-nums">
                    {fmtPrice(totals.total)}₫
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Giá đã bao gồm VAT</p>
                <button
                  type="button"
                  onClick={goCheckout}
                  className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3.5 font-bold text-base hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ĐẶT HÀNG
                </button>
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-center text-[11px] text-slate-500">
                  <span>Hàng chính hãng</span>
                  <span>·</span>
                  <span>Đổi trả 30 ngày</span>
                  <span>·</span>
                  <span>Bảo hành tận nhà</span>
                </div>
              </div>
            </aside>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
