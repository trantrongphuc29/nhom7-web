/** Event khi API trả 401 — AuthProvider lắng nghe để xóa phiên. */
export const AUTH_UNAUTHORIZED_EVENT = "lapstore:auth-unauthorized";

export function notifyUnauthorizedSession(response, options) {
  if (typeof window === "undefined") return;
  if (!response || response.status !== 401) return;
  if (options?.skipAuthHandling) return;
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}
