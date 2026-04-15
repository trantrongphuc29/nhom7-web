// Cấu hình base URL cho API và Backend

// Chú ý: API_BASE_URL để trống '' vì trong apiClient.js đã có sẵn '/api/v1'
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export const API_ENDPOINTS = {
  // --- CLIENT ENDPOINTS ---
  STORE_CONFIG: `${API_BASE_URL}/store-config`,
  PRODUCTS: `${API_BASE_URL}/products`,
  ORDERS_CREATE: `${API_BASE_URL}/orders`,
  PRODUCT_DETAIL: (idOrSlug) => `${API_BASE_URL}/products/${encodeURIComponent(String(idOrSlug))}`,
  BANNERS: `${API_BASE_URL}/banners`,
  
  // --- AUTH & ACCOUNT ENDPOINTS ---
  USERS: `${API_BASE_URL}/users`,
  USER_DETAIL: (id) => `${API_BASE_URL}/users/${id}`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  ACCOUNT_PROFILE: `${API_BASE_URL}/account/profile`,
  ACCOUNT_PASSWORD: `${API_BASE_URL}/account/password`,
  ACCOUNT_ADDRESSES: `${API_BASE_URL}/account/addresses`,
  ACCOUNT_ADDRESS: (id) => `${API_BASE_URL}/account/addresses/${id}`,
  ACCOUNT_ORDERS: `${API_BASE_URL}/account/orders`,
  ACCOUNT_CART: `${API_BASE_URL}/account/cart`,

  // --- ADMIN ENDPOINTS ---
  ADMIN_PRODUCTS: `${API_BASE_URL}/admin/products`,
  ADMIN_PRODUCT_DETAIL: (id) => `${API_BASE_URL}/admin/products/${id}`,
  ADMIN_PRODUCTS_BULK_DELETE: `${API_BASE_URL}/admin/products/bulk-delete`,
  ADMIN_UPLOAD_IMAGES: `${API_BASE_URL}/admin/uploads/images`,

  ADMIN_CUSTOMERS: `${API_BASE_URL}/admin/customers`,
  ADMIN_CUSTOMER_STATUS: (id) => `${API_BASE_URL}/admin/customers/${id}/status`,
  ADMIN_ORDERS: `${API_BASE_URL}/admin/orders`,
  ADMIN_ORDER_DETAIL: (id) => `${API_BASE_URL}/admin/orders/${id}`,
  ADMIN_ORDER_STATUS: (id) => `${API_BASE_URL}/admin/orders/${id}/status`,
};

export { BACKEND_BASE_URL };
export default API_BASE_URL;