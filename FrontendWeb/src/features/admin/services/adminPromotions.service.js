import { API_ENDPOINTS } from "../../../config/api";
import { deleteJson, getJson, postJson, putJson } from "../../../services/apiClient";

function headers(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function getAdminPromotions(token) {
  const res = await getJson(API_ENDPOINTS.ADMIN_PROMOTIONS, { headers: headers(token) });
  return res.data || {};
}

export async function createAdminVoucher(payload, token) {
  const res = await postJson(API_ENDPOINTS.ADMIN_PROMOTION_VOUCHERS, payload, { headers: headers(token) });
  return res.data || {};
}

export async function updateAdminVoucher(id, payload, token) {
  const res = await putJson(API_ENDPOINTS.ADMIN_PROMOTION_VOUCHER_DETAIL(id), payload, { headers: headers(token) });
  return res.data || {};
}

export async function deleteAdminVoucher(id, token) {
  const res = await deleteJson(API_ENDPOINTS.ADMIN_PROMOTION_VOUCHER_DETAIL(id), { headers: headers(token) });
  return res.data || {};
}
