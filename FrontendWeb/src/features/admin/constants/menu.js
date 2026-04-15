export const ADMIN_MENU = [
  {
    key: "products",
    label: "Sản phẩm",
    icon: "inventory_2",
    children: [
      { key: "product-list", label: "Danh sách sản phẩm", path: "/admin/products", end: true },
      { key: "product-create", label: "Thêm sản phẩm", path: "/admin/products/new" },
    ],
  },
  { key: "orders", label: "Đơn hàng", path: "/admin/orders", icon: "receipt_long" },
  { key: "customers", label: "Khách hàng", path: "/admin/customers", icon: "groups" },
];
