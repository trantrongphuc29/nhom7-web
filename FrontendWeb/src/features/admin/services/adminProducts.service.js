import { API_ENDPOINTS } from "../../../config/api";
import { deleteJson, getJson, postJson, putJson, requestJson } from "../../../services/apiClient";

export async function getAdminProducts(token) {
  const res = await getJson(API_ENDPOINTS.ADMIN_PRODUCTS);
  return res.data || {};
}

export async function createAdminProduct(payload, token) {
  const res = await postJson(API_ENDPOINTS.ADMIN_PRODUCTS, payload);
  return res.data || {};
}

export async function getAdminProductDetail(id, token) {
  const res = await getJson(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id));
  return res.data || {};
}

export async function updateAdminProduct(id, payload, token) {
  const res = await putJson(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id), payload);
  return res.data || {};
}

export async function bulkDeleteAdminProducts(payload, token) {
  const res = await deleteJson(API_ENDPOINTS.ADMIN_PRODUCTS_BULK_DELETE, { body: payload });
  return res.data || {};
}

export async function uploadAdminProductImages(files, token, productName = "") {
  const formData = new FormData();
  const list = Array.isArray(files) ? files.slice(0, 1) : files ? [files] : [];
  list.forEach((file) => formData.append("images", file));
  if (productName) formData.append("productName", productName);
  const data = await requestJson(API_ENDPOINTS.ADMIN_UPLOAD_IMAGES, {
    method: "POST",
    body: formData,
  });
  const records = data?.data?.records || [];
  // Form sản phẩm gửi mảng URL (chuỗi); Cloudinary trả thêm public_id, width, height.
  return records.map((r) => r?.url).filter(Boolean);
}
