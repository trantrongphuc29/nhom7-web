const KEY = "lapstore_checkout_shipping_v1";

export const ORDER_SUCCESS_FLAG = "lapstore_order_success_v1";
/** Mã đơn từ server (hiển thị trang thành công) */
export const ORDER_SUCCESS_ORDER_CODE = "lapstore_last_order_code_v1";

export function saveShippingDraft(payload) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadShippingDraft() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && typeof p === "object" ? p : null;
  } catch {
    return null;
  }
}

export function clearShippingDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
