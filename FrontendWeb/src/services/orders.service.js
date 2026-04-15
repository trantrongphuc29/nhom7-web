import { API_ENDPOINTS } from "../config/api";
import { getJson, postJson } from "./apiClient";

/**
 * @param {object} body items, shipping, paymentMethod
 */
export async function createStorefrontOrder(body) {
  const data = await postJson(API_ENDPOINTS.ORDERS_CREATE, body);
  return data?.data ?? data;
}

export async function getAccountOrders() {
  const data = await getJson(API_ENDPOINTS.ACCOUNT_ORDERS);
  return data?.data ?? [];
}
