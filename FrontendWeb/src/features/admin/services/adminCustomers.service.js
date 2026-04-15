import { API_ENDPOINTS } from "../../../config/api";
import { getJson, patchJson } from "../../../services/apiClient";

export async function getAdminCustomers(params) {
  const query = new URLSearchParams();
  const page = Number(params?.page || 1);
  const limit = Number(params?.limit || 10);
  query.set("page", String(page));
  query.set("limit", String(limit));
  const res = await getJson(`${API_ENDPOINTS.ADMIN_CUSTOMERS}?${query.toString()}`);
  return res.data || {};
}

export async function updateAdminCustomerStatus(id, payload, token) {
  const res = await patchJson(API_ENDPOINTS.ADMIN_CUSTOMER_STATUS(id), payload);
  return res.data || {};
}
