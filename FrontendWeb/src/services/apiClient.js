import axios from "axios";
import { notifyUnauthorizedSession } from "../utils/authSession";

const http = axios.create();

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
  const config = {
    url,
    method,
    headers: options.headers || {},
    data: options.body,
    withCredentials: options.withCredentials,
    params: options.params,
    timeout: options.timeout,
  };

  try {
    const mockResponse = await requestViaMockServer(url, {
      method,
      headers: config.headers,
      body: config.data,
    });
    if (mockResponse) {
      const fetchLikeResponse = toFetchLikeResponse(mockResponse);
      notifyUnauthorizedSession(fetchLikeResponse, options);
      if (!fetchLikeResponse.ok) {
        throw new Error(mockResponse?.data?.message || `Request failed with status ${mockResponse.status}`);
      }
      const data = mockResponse?.data ?? {};
      if (data?.success === false) {
        throw new Error(data?.message || `Request failed with status ${mockResponse.status}`);
      }
      return data;
    }

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

export function putJson(url, body, options = {}) {
  return requestJson(url, {
    ...options,
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: body ?? {},
  });
}

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
