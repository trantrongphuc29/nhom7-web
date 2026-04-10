import React from 'react';
import Header from '../components/Header';
import {
  DEFAULT_PRODUCT_FILTERS,
  ProductGridPanel,
  useProductListing,
} from '../features/productListing';

function HomePage() {
  const {
    filters,
    setFilters,
    products,
    loading,
    visibleCount,
    setVisibleCount,
  } = useProductListing(DEFAULT_PRODUCT_FILTERS);

  return (
    <div className="bg-white font-display text-slate-900 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <ProductGridPanel
          filters={filters}
          setFilters={setFilters}
          products={products}
          loading={loading}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
        />
      </main>
    </div>
  );
}

export default HomePage;
