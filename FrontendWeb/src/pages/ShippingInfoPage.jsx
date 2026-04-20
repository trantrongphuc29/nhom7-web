import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../config/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getJson } from "../services/apiClient";
import { createStorefrontOrder } from "../services/orders.service";
import { fmtPrice } from "../utils/format";
import { clearShippingDraft, loadShippingDraft, ORDER_SUCCESS_FLAG, ORDER_SUCCESS_ORDER_CODE, saveShippingDraft } from "../utils/checkoutFlow";

export default function ShippingInfoPage() {
  const { items, totals, clear } = useCart();
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const [shipName, setShipName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [prefilledFromAccount, setPrefilledFromAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/gio-hang", { replace: true });
      return;
    }
    const draft = loadShippingDraft();
    if (draft) {
      if (draft.shipName != null) setShipName(draft.shipName);
      if (draft.shipPhone != null) setShipPhone(draft.shipPhone);
      if (draft.shipAddress != null) setShipAddress(draft.shipAddress);
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !token || prefilledFromAccount) return;
    let cancelled = false;
    (async () => {
      try {
        const [profileResult, addressesResult] = await Promise.allSettled([
          getJson("/account/profile", { skipAuthHandling: true }),
          getJson("/account/addresses", { skipAuthHandling: true }),
        ]);
        if (cancelled) return;
        const profileRes = profileResult.status === "fulfilled" ? profileResult.value : {};
        const addressesRes = addressesResult.status === "fulfilled" ? addressesResult.value : [];
        const profile = profileRes?.data || profileRes || {};
        const addresses = addressesRes?.data || addressesRes || [];
        const rows = Array.isArray(addresses) ? addresses : [];
        const defaultAddress = rows.find((a) => Boolean(a?.isDefault)) || rows[0] || null;

        if (!shipName.trim()) setShipName((profile.fullName || user?.fullName || "").trim());
        if (!shipPhone.trim()) setShipPhone((profile.phone || user?.phone || "").trim());

        if (defaultAddress) {
          if (!shipAddress.trim()) {
            const full = [defaultAddress.line1, defaultAddress.line2, defaultAddress.province]
              .filter(Boolean)
              .join(", ");
            setShipAddress(full);
          }
        }
      } catch {
      } finally {
        if (!cancelled) setPrefilledFromAccount(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    token,
    user,
    prefilledFromAccount,
    shipName,
    shipPhone,
    shipAddress,
  ]);

  const imgSrc = (url) =>
    url ? (url.startsWith("http") ? url : `${BACKEND_BASE_URL}/${url}`) : null;

  const validate = () => {
    if (!shipName.trim()) {
      toast.error("Vui lòng nhập họ tên người nhận.");
      return false;
    }
    if (!shipPhone.trim() || shipPhone.replace(/\D/g, "").length < 9) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ.");
      return false;
    }
    if (!shipAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ nhận hàng.");
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    fulfillment: "delivery",
    shipName: shipName.trim(),
    shipPhone: shipPhone.trim(),
    shipAddress: shipAddress.trim(),
  });

  const continueToPayment = async () => {
    if (items.length === 0) return;
    if (!validate()) return;
    const shipping = buildPayload();
    saveShippingDraft(shipping);
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
      };
      const result = await createStorefrontOrder(payload);
      const code = result?.orderCode != null ? String(result.orderCode) : "";
      try {
        sessionStorage.setItem(ORDER_SUCCESS_FLAG, "1");
        if (code) sessionStorage.setItem(ORDER_SUCCESS_ORDER_CODE, code);
        else sessionStorage.removeItem(ORDER_SUCCESS_ORDER_CODE);
      } catch {
        // ignore sessionStorage errors
      }
      clear();
      clearShippingDraft();
      navigate("/dat-hang-thanh-cong", {
        replace: true,
        state: { orderCode: code || null },
      });
    } catch (e) {
      toast.error(e?.message || "Không tạo được đơn hàng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 font-display text-slate-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full pb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Thông tin thanh toán</h1>
        <p className="text-sm text-slate-600 mb-6">Điền thông tin nhận hàng và xác nhận đặt hàng ngay.</p>

        <div className="flex gap-8 items-start">
          <div className="flex-1 w-full min-w-0 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Thông tin người nhận</h2>
              <p className="text-sm text-slate-500 mb-6">Thông tin liên hệ khi nhận hàng.</p>

              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="text-slate-600 font-medium">Họ và tên người nhận</span>
                  <input
                    value={shipName}
                    onChange={(e) => setShipName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-600 font-medium">Số điện thoại</span>
                  <input
                    value={shipPhone}
                    onChange={(e) => setShipPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                    placeholder="09xx xxx xxx"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-600 font-medium">Địa chỉ nhận hàng</span>
                  <textarea
                    value={shipAddress}
                    onChange={(e) => setShipAddress(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00] resize-y"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  />
                </label>
              </div>
            </section>

            <div className="pb-2">
              <Link to="/gio-hang" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                ← Quay lại giỏ hàng
              </Link>
            </div>
          </div>

          <aside className="w-[400px] shrink-0 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Đơn hàng ({items.length})</h2>
              <ul className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto mini-cart-scroll mb-4">
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
                <span className="text-2xl font-extrabold px-3 py-1 rounded-lg tabular-nums">{fmtPrice(totals.total)}₫</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Giá đã bao gồm VAT</p>
              <button
                type="button"
                onClick={continueToPayment}
                disabled={submitting}
                className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3.5 font-bold text-base hover:bg-slate-800 transition disabled:opacity-60 disabled:pointer-events-none"
              >
                {submitting ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
