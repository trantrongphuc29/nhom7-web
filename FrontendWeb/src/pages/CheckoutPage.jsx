import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { BACKEND_BASE_URL } from "../config/api";
import { useCart } from "../context/CartContext";
import { useStoreConfig } from "../context/StoreConfigContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fmtPrice } from "../utils/format";
import { clearShippingDraft, loadShippingDraft, ORDER_SUCCESS_FLAG, ORDER_SUCCESS_ORDER_CODE } from "../utils/checkoutFlow";
import { createStorefrontOrder } from "../services/orders.service";

export default function CheckoutPage() {
  const location = useLocation();
  const { freeShippingThreshold } = useStoreConfig();
  const { items, totals, allInStock, clear } = useCart();
  const { token } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const shipping = useMemo(() => {
    const fromNav = location.state?.shipping;
    if (fromNav && typeof fromNav === "object" && fromNav.fulfillment) return fromNav;
    return loadShippingDraft();
  }, [location.state]);

  useEffect(() => {
    let checkoutSuccessPending = false;
    try {
      checkoutSuccessPending = Boolean(sessionStorage.getItem(ORDER_SUCCESS_FLAG));
    } catch {
      /* ignore */
    }
    if (items.length === 0 && !checkoutSuccessPending) {
      navigate("/gio-hang", { replace: true });
      return;
    }
    if (!shipping?.fulfillment) {
      navigate("/thong-tin-nhan-hang", { replace: true });
    }
  }, [items.length, navigate, shipping]);

  const imgSrc = (url) =>
    url ? (url.startsWith("http") ? url : `${BACKEND_BASE_URL}/${url}`) : null;

  const shippingSummary = () => {
    if (!shipping) return null;
    return (
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          {shipping.shipName} · {shipping.shipPhone}
        </p>
        <p>{shipping.shipAddress}</p>
      </div>
    );
  };

  const finalizeCheckout = async () => {
    if (items.length === 0) return;
    if (!allInStock) {
      toastError("Sản phẩm đã hết hàng");
      return;
    }
    if (!shipping?.fulfillment) {
      navigate("/thong-tin-nhan-hang");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((li) => ({
          productId: li.productId,
          variantId: li.variantId,
          quantity: li.quantity,
          name: li.name,
          specSummary: li.specSummary,
        })),
        shipping,
        paymentMethod: "cod",
        voucherCode: null,
      };
      const result = await createStorefrontOrder(payload, token || null);
      const code = result?.orderCode != null ? String(result.orderCode) : "";
      try {
        sessionStorage.setItem(ORDER_SUCCESS_FLAG, "1");
        if (code) sessionStorage.setItem(ORDER_SUCCESS_ORDER_CODE, code);
        else sessionStorage.removeItem(ORDER_SUCCESS_ORDER_CODE);
      } catch {
        /* ignore */
      }
      clear();
      clearShippingDraft();
      navigate("/dat-hang-thanh-cong", {
        replace: true,
        state: { orderCode: code || null },
      });
    } catch (e) {
      toastError(e?.message || "Không tạo được đơn hàng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const completeOrder = async () => {
    await finalizeCheckout();
  };

  if (items.length === 0 || !shipping?.fulfillment) {
    return null;
  }

  return (
    <div className="bg-slate-50 font-display text-slate-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full pb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-left">Thanh toán</h1>
        <p className="text-sm text-slate-600 mb-6 text-left">Chọn phương thức thanh toán và xác nhận đơn hàng.</p>

        <div className="flex gap-8 items-start">
          <div className="flex-1 w-full min-w-0 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900">Thông tin nhận hàng</h2>
                <Link to="/thong-tin-nhan-hang" className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2">
                  Sửa thông tin
                </Link>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">{shippingSummary()}</div>
            </section>

          </div>

          <aside className="w-[400px] shrink-0 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Đơn hàng</h2>
              <ul className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto mini-cart-scroll mb-4">
                {items.map((li) => (
                  <li key={li.lineId} className="py-3 flex gap-3">
                    <div className="w-14 h-14 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                      {imgSrc(li.image) ? (
                        <img src={imgSrc(li.image)} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <span className="material-symbols-outlined text-2xl">laptop</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{li.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{li.specSummary}</p>
                      <p className="text-xs text-slate-600 mt-1">SL: {li.quantity}</p>
                      <p className="text-sm font-bold text-rose-600 tabular-nums">{fmtPrice(li.price * li.quantity)}₫</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Tóm tắt</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-medium tabular-nums">{fmtPrice(totals.subtotal)}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Khuyến mãi</span>
                  <span className="font-medium text-rose-600 tabular-nums">-{fmtPrice(totals.discount)}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Phí vận chuyển</span>
                  <span className="font-medium tabular-nums">
                    {totals.shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `${fmtPrice(totals.shippingFee)}₫`}
                  </span>
                </div>
                {totals.subtotal < freeShippingThreshold && totals.subtotal > 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                    Miễn phí ship cho đơn từ {fmtPrice(freeShippingThreshold)}₫.
                  </p>
                ) : null}
              </div>
              <div className="border-t border-slate-200 my-4" />
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-800 font-semibold">Tổng cộng</span>
                <span className="text-2xl font-extrabold px-3 py-1 rounded-lg tabular-nums">{fmtPrice(totals.total)}₫</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Giá đã bao gồm VAT</p>
              <button
                type="button"
                disabled={submitting}
                onClick={completeOrder}
                className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3.5 font-bold text-base hover:bg-slate-800 transition disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? "Đang xử lý…" : "HOÀN TẤT ĐẶT HÀNG"}
              </button>
              <Link to="/thong-tin-nhan-hang" className="mt-3 block text-center text-sm text-slate-600 hover:text-slate-900 font-medium">
                ← Quay lại thông tin nhận hàng
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
