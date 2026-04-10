import { API_ENDPOINTS } from "../config/api";
import { postJson } from "./apiClient";

/**
 * @param {object} body items, shipping, paymentMethod, voucherCode?
 * @param {string|null} token Bearer khi đã đăng nhập (guest: null)
 */
export async function createStorefrontOrder(body, token) {
  const data = await postJson(API_ENDPOINTS.ORDERS_CREATE, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data?.data ?? data;
}
