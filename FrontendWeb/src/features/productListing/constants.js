export const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];

export const DEFAULT_PRODUCT_FILTERS = {
  brands: [],
  cpu: "",
  ram: "",
  storage: "",
  minPrice: null,
  maxPrice: null,
  priceRanges: [],
  keyword: "",
  sort: "newest",
};
