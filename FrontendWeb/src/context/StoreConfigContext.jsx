import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockData } from "../mocks/mockData";

const FALLBACK = {
  defaultShippingFee: 50_000,
  freeShippingThreshold: 10_000_000,
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        const d = mockData.storeConfig || {};
        if (cancelled) return;
        setConfig({
          defaultShippingFee: Number(d.defaultShippingFee) || FALLBACK.defaultShippingFee,
          freeShippingThreshold: Number(d.freeShippingThreshold) || FALLBACK.freeShippingThreshold,
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
