import { API_ENDPOINTS } from "../../../config/api";
import { deleteJson, getJson, postJson, putJson, requestJson } from "../../../services/apiClient";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function getAdminProducts(token) {
  const res = await getJson(API_ENDPOINTS.ADMIN_PRODUCTS, { headers: authHeaders(token) });
  return res.data || {};
}

export async function createAdminProduct(payload, token) {
  const res = await postJson(API_ENDPOINTS.ADMIN_PRODUCTS, payload, { headers: authHeaders(token) });
  return res.data || {};
}

export async function getAdminProductDetail(id, token) {
  const res = await getJson(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id), {
    headers: authHeaders(token),
  });
  return res.data || {};
}

export async function updateAdminProduct(id, payload, token) {
  const res = await putJson(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id), payload, { headers: authHeaders(token) });
  return res.data || {};
}

export async function bulkDeleteAdminProducts(payload, token) {
  const res = await deleteJson(API_ENDPOINTS.ADMIN_PRODUCTS_BULK_DELETE, {
    headers: authHeaders(token),
    body: payload,
  });
  return res.data || {};
}

export async function uploadAdminProductImages(files, token, productName = "") {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  if (productName) formData.append("productName", productName);
  const data = await requestJson(API_ENDPOINTS.ADMIN_UPLOAD_IMAGES, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return data?.data?.records || [];
}
