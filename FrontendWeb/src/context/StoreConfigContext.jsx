import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import { getJson } from "../services/apiClient";

const FALLBACK = {
  footerHotline: "1900 630 680",
  footerEmail: "lapstore@gmail.com",
};

const StoreConfigContext = createContext(null);

export function StoreConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await getJson(API_ENDPOINTS.STORE_CONFIG, { skipAuthHandling: true });
        const d = response?.data || response || {};
        if (cancelled) return;
        setConfig({
          footerHotline: String(d.footerHotline || FALLBACK.footerHotline),
          footerEmail: String(d.footerEmail || FALLBACK.footerEmail),
        });
      } catch {
        if (!cancelled) setConfig(FALLBACK);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ ...config, ready }), [config, ready]);
  return <StoreConfigContext.Provider value={value}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig() {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) throw new Error("useStoreConfig must be used within StoreConfigProvider");
  return ctx;
}

export { FALLBACK as STORE_CONFIG_FALLBACK };
