import { useEffect, useState } from "react";
import { DEFAULT_PRODUCT_FILTERS } from "../constants";
import { getProductsByFilters } from "../services/productListing.service";

export function useProductListing(initialFilters = DEFAULT_PRODUCT_FILTERS) {
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let isMounted = true;
    getProductsByFilters(DEFAULT_PRODUCT_FILTERS)
      .then((records) => {
        if (!isMounted) return;
        const unique = [...new Set((records || []).map((item) => String(item?.brand || "").trim()).filter(Boolean))];
        setBrandOptions(unique);
      })
      .catch(() => {
        if (isMounted) setBrandOptions([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const result = await getProductsByFilters(filters);
        if (!isMounted) return;
        setProducts(result);
        const dynamicBrands = [...new Set((result || []).map((item) => String(item?.brand || "").trim()).filter(Boolean))];
        if (dynamicBrands.length > 0) {
          setBrandOptions((prev) => [...new Set([...(prev || []), ...dynamicBrands])]);
        }
        setVisibleCount(12);
      } catch (error) {
        console.error("Fetch products error:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  /** Khi quay lại tab (sau khi admin đổi trạng thái), làm mới danh sách không bật skeleton */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      getProductsByFilters(filters)
        .then((result) => setProducts(result))
        .catch((err) => console.error("Fetch products error:", err));
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [filters]);

  return {
    filters,
    setFilters,
    products,
    loading,
    visibleCount,
    setVisibleCount,
    productCount: products.length,
    brandOptions,
  };
}
