import { API_ENDPOINTS } from "../../../config/api";
import { getJson, patchJson } from "../../../services/apiClient";

function headers(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function getAdminOrders(params, token) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== "" && v != null) query.append(k, v);
  });
  const res = await getJson(`${API_ENDPOINTS.ADMIN_ORDERS}?${query.toString()}`, { headers: headers(token) });
  return res.data || {};
}

export async function getAdminOrderDetail(id, token) {
  const res = await getJson(API_ENDPOINTS.ADMIN_ORDER_DETAIL(id), { headers: headers(token) });
  return res.data || {};
}

export async function updateAdminOrderStatus(id, payload, token) {
  const res = await patchJson(API_ENDPOINTS.ADMIN_ORDER_STATUS(id), payload, { headers: headers(token) });
  return res.data || {};
}
