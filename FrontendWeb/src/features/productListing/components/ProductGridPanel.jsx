import React from "react";
import ProductCard from "../../../components/ProductCard";
import { SORT_OPTIONS } from "../constants";
import { mapProductToCard } from "../utils/productMappers";

const ProductGridPanel = ({
  filters,
  setFilters,
  products,
  loading,
  visibleCount,
  setVisibleCount,
}) => {
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <section className="flex-1">
      <div className="mb-6 flex gap-2 rounded-2xl border border-slate-200 bg-white p-4 font-bold items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 whitespace-nowrap text-sm text-slate-500">Sắp xếp:</span>
          {SORT_OPTIONS.map((sort) => (
            <button
              key={sort.value}
              type="button"
              onClick={() => setFilters({ ...filters, sort: sort.value })}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition ${
                filters.sort === sort.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Đang tải sản phẩm...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Không tìm thấy sản phẩm nào.
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {visibleProducts.map((p) => (
            <div key={p.id} className="h-full">
              <ProductCard product={mapProductToCard(p)} />
            </div>
          ))}
        </div>
      )}

      {!loading && visibleCount < products.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-100 transition"
          >
            <span>Xem thêm</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductGridPanel;
