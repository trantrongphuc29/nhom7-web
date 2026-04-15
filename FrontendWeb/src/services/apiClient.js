import axios from "axios";
import { notifyUnauthorizedSession } from "../utils/authSession";


// Cấu hình địa chỉ Backend Laravel
const BASE_URL = "http://localhost:8000/api/v1";

const http = axios.create({
  baseURL: BASE_URL,

});

function toFetchLikeResponse(response) {
  return {
    status: response?.status ?? 0,
    ok: (response?.status ?? 0) >= 200 && (response?.status ?? 0) < 300,
  };
}

function normalizeMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.status) return `Request failed with status ${error.response.status}`;
  return error?.message || "Request failed";
}

async function requestViaMockServer(url, options = {}) {
  // 🛑 BỘ LỌC THÔNG MINH: Chỉ tắt Mock đối với các API bạn đã làm xong ở Backend
  if (url.includes('/api/v1/auth') || url.includes('/api/v1/account')) {
    return null; // Bỏ qua Mock, chạy thẳng xuống Laravel
  }

  // GIỮ NGUYÊN CODE CŨ TỪ ĐÂY ĐỂ TRANG SẢN PHẨM KHÔNG BỊ SẬP GIAO DIỆN
  if (typeof window === "undefined") return null;
  const mockRequest = window.__lapstoreMockRequest;
  if (typeof mockRequest !== "function") return null;

  const init = {
    method: options.method || "GET",
    headers: options.headers || {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const mockResponse = await mockRequest(url, init);
  if (!mockResponse) return null;

  let data = {};
  try {
    data = await mockResponse.json();
  } catch {
    data = {};
  }

  return {
    status: mockResponse.status ?? 0,
    data,
  };
}


export async function requestJson(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const token = localStorage.getItem("access_token");

  const config = {
    url,
    method,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "", 
    },
    data: options.body,
    withCredentials: options.withCredentials,
    params: options.params,
    timeout: options.timeout,
  };

  try {
    const response = await http.request(config);
    const fetchLikeResponse = toFetchLikeResponse(response);
    notifyUnauthorizedSession(fetchLikeResponse, options);

    const data = response?.data ?? {};
    if (data?.success === false) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    const fetchLikeResponse = toFetchLikeResponse(error?.response);
    notifyUnauthorizedSession(fetchLikeResponse, options);
    throw new Error(normalizeMessage(error));
  }
}

// --- CÁC HÀM HELPER ---

export function getJson(url, options = {}) {
  return requestJson(url, { ...options, method: "GET" });
}

export function postJson(url, body, options = {}) {
  return requestJson(url, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: body ?? {},
  });
}

// Hàm PUT (Sửa lỗi "not found in apiClient" của bạn)
export function putJson(url, body, options = {}) {
  return requestJson(url, {
    ...options,
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: body ?? {},
  });
}

// Hàm PATCH (Sửa lỗi "not found in apiClient" của bạn)
export function patchJson(url, body, options = {}) {
  return requestJson(url, {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: body ?? {},
  });
}

export function deleteJson(url, options = {}) {
  return requestJson(url, { ...options, method: "DELETE" });
}