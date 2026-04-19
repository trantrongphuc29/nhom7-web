import { API_ENDPOINTS } from "../../../config/api";
import { getJson } from "../../../services/apiClient";

export async function getAdminOrders(params) {
  const query = new URLSearchParams();
  const page = Number(params?.page || 1);
  const limit = Number(params?.limit || 10);
  query.set("page", String(page));
  query.set("limit", String(limit));

  const res = await getJson(`${API_ENDPOINTS.ADMIN_ORDERS}?${query.toString()}`);
  return res.data || {};
}

export async function getAdminOrderDetail(id) {
  const res = await getJson(API_ENDPOINTS.ADMIN_ORDER_DETAIL(id));
  return res.data || {};
}
