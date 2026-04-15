import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useStoreConfig } from "./StoreConfigContext";

const CartContext = createContext(null);
const STORAGE_KEY = "lapstore_cart_v1";

/** @typedef {{ lineId: string, productId: number, variantId: number, name: string, image: string|null, specSummary: string, price: number, stock: number, quantity: number, color?: string, productSlug?: string }} CartLine */

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function getLineId(productId, variantId) {
  return `${productId}-${variantId}`;
}

export function stockStatus(stock, qty) {
  const s = Number(stock) || 0;
  const q = Number(qty) || 0;
  if (s <= 0) return "out";
  if (s <= 3) return "low";
  if (q > s) return "out";
  return "in";
}

export function computeCartTotals(items, shipping = {}) {
  const subtotal = items.reduce((sum, li) => sum + Number(li.price) * Number(li.quantity), 0);
  const threshold = Number(shipping.freeShippingThreshold) || 10_000_000;
  const fee = Number(shipping.defaultShippingFee) || 50_000;
  const shippingFee = subtotal >= threshold ? 0 : fee;
  const total = Math.max(0, subtotal + shippingFee);
  return { subtotal, shippingFee, total };
}

export function cartAllInStock(items) {
  return items.every((li) => li.quantity <= (Number(li.stock) || 0) && (Number(li.stock) || 0) > 0);
}

export function CartProvider({ children }) {
  const { defaultShippingFee, freeShippingThreshold } = useStoreConfig();
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addLine = useCallback((line) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.lineId === line.lineId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...line, quantity: next[idx].quantity + (line.quantity || 1) };
        return next;
      }
      return [...prev, { ...line, quantity: line.quantity || 1 }];
    });
  }, []);

  const removeLine = useCallback((lineId) => {
    setItems((prev) => prev.filter((x) => x.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId, quantity) => {
    const q = Math.max(1, Math.floor(Number(quantity) || 1));
    setItems((prev) =>
      prev.map((li) => {
        if (li.lineId !== lineId) return li;
        const max = Math.max(1, Number(li.stock) || 1);
        return { ...li, quantity: Math.min(q, max) };
      })
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const restoreLine = useCallback((line) => {
    setItems((prev) => {
      if (prev.some((x) => x.lineId === line.lineId)) return prev;
      return [...prev, line];
    });
  }, []);

  const itemCount = useMemo(() => items.reduce((s, li) => s + li.quantity, 0), [items]);

  const totals = useMemo(
    () => computeCartTotals(items, { defaultShippingFee, freeShippingThreshold }),
    [items, defaultShippingFee, freeShippingThreshold]
  );

  const allInStock = useMemo(() => cartAllInStock(items), [items]);

  const value = useMemo(
    () => ({
      items,
      addLine,
      removeLine,
      restoreLine,
      updateQuantity,
      clear,
      itemCount,
      totals,
      allInStock,
    }),
    [
      items,
      addLine,
      removeLine,
      restoreLine,
      updateQuantity,
      clear,
      itemCount,
      totals,
      allInStock,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
