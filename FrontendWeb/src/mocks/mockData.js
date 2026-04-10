const now = Date.now();

const adminUser = {
  id: 1,
  email: "admin@gmail.com",
  fullName: "Lapstore Admin",
  phone: "0901234567",
  role: "admin",
  permissions: {
    canEditCostAndImport: true,
    canManageWarehouse: true,
    canExportFinancialReports: true,
  },
};

const user = {
  id: 201,
  email: "user@gmail.com",
  fullName: "Nguyen Van A",
  phone: "0912345678",
  role: "user",
};

const products = [
  {
    id: 101,
    slug: "asus-zenbook-14-oled",
    name: "ASUS Zenbook 14 OLED",
    brand: "ASUS",
    category: "Ultrabook",
    status: "active",
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=960&q=80",
    price: 27990000,
    min_price: 27990000,
    min_discount: 7,
    stock: 12,
    shortDescription: "Mau laptop OLED mỏng nhẹ cho công việc va di chuyen.",
    detailHtml: "<p>Man hinh OLED 2.8K, pin ben bi va hieu nang on dinh cho cong viec hang ngay.</p>",
    specs: {
      cpu: "Intel Core Ultra 7",
      gpu_onboard: "Intel Arc Graphics",
      gpu_discrete: "",
      ram: "16GB LPDDR5X",
      ram_max: "32GB",
      storage: "1TB SSD",
      storage_max: "2TB",
      screen_size: "14 inch",
      screen_resolution: "2880x1800",
      screen_technology: "OLED 120Hz",
      ports: "USB-C, HDMI, USB-A",
      battery: "75Wh",
      dimensions: "312 x 220 x 15 mm",
      weight: "1.35 kg",
      material: "Aluminum",
      wireless: "Wi-Fi 6E, Bluetooth 5.3",
      webcam: "FHD IR",
      os: "Windows 11",
    }
  },
  {
    id: 102,
    slug: "lenovo-loq-15",
    name: "Lenovo LOQ 15",
    brand: "Lenovo",
    category: "Gaming",
    status: "active",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=960&q=80",
    price: 25990000,
    min_price: 25990000,
    min_discount: 7,
    stock: 8,
    shortDescription: "Gaming laptop manh me voi RTX va tan nhiet on dinh.",
    detailHtml: "<p>Phu hop cho gaming va do hoa voi bo xu ly Intel Core i7 va RTX 4060.</p>",
    specs: {
      cpu: "Intel Core i7-13620H",
      gpu_onboard: "Intel UHD",
      gpu_discrete: "RTX 4060 8GB",
      ram: "16GB DDR5",
      ram_max: "32GB",
      storage: "512GB SSD",
      storage_max: "2TB",
      screen_size: "15.6 inch",
      screen_resolution: "1920x1080",
      screen_technology: "IPS 144Hz",
      ports: "USB-C, HDMI, RJ45, USB-A",
      battery: "60Wh",
      dimensions: "359 x 259 x 22 mm",
      weight: "2.4 kg",
      material: "Polycarbonate",
      wireless: "Wi-Fi 6, Bluetooth 5.2",
      webcam: "HD",
      os: "Windows 11",
    }
  },
  {
    id: 103,
    slug: "macbook-air-m3-13",
    name: "MacBook Air M3 13",
    brand: "Apple",
    category: "Ultrabook",
    status: "coming_soon",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=960&q=80",
    price: 33990000,
    min_price: 33990000,
    min_discount: 0,
    stock: 0,
    shortDescription: "Mau laptop Apple the he moi, pin dai va nhe.",
    detailHtml: "<p>Chip M3 tiet kiem dien nang, phu hop hoc tap va cong viec sang tao.</p>",
    specs: {
      cpu: "Apple M3",
      gpu_onboard: "Apple GPU",
      gpu_discrete: "",
      ram: "16GB Unified",
      ram_max: "24GB",
      storage: "512GB SSD",
      storage_max: "2TB",
      screen_size: "13.6 inch",
      screen_resolution: "2560x1664",
      screen_technology: "Liquid Retina",
      ports: "MagSafe, Thunderbolt 4",
      battery: "52Wh",
      dimensions: "304 x 215 x 11 mm",
      weight: "1.24 kg",
      material: "Aluminum",
      wireless: "Wi-Fi 6E, Bluetooth 5.3",
      webcam: "1080p",
      os: "macOS",
    }
  }
];

const accountProfile = {
  id: 201,
  email: "user@gmail.com", fullName: "Nguyen Van A",
  phone: "0912345678",
};

const accountAddresses = [
  { id: 1, recipientName: "Nguyen Van A", phone: "0912345678", line1: "123 Le Loi", line2: "", ward: "Phuong Ben Thanh", district: "Quan 1", province: "TP Ho Chi Minh", isDefault: true },
  { id: 2, recipientName: "Nguyen Van A", phone: "0912345678", line1: "56 Tran Phu", line2: "Tang 3", ward: "Phuong Dien Bien", district: "Ba Dinh", province: "Ha Noi", isDefault: false },
];

const accountOrders = [
  {
    id: 9001,
    orderCode: "ODR-9001",
    code: "ODR-9001",
    createdAt: new Date(now - 86400000).toISOString(),
    status: "pending",
    totalAmount: 28140000,
    discountAmount: 500000,
    voucherDiscountAmount: 500000,
    paymentMethod: "cod",
    shippingAddress: "123 Le Loi, Quan 1, TP Ho Chi Minh",
    customerName: "Nguyen Van A",
    customerPhone: "0912345678",
    customerEmail: "customer@lapstore.vn",
    items: [
      { id: 1, productId: 101, productName: "ASUS Zenbook 14 OLED", variantName: "16GB / 1TB / Bac", quantity: 1, unitPrice: 27990000, image: products[0].image },
    ],
    timeline: [
      { status: "pending", createdAt: new Date(now - 86000000).toISOString(), note: "Don hang moi tao" },
    ],
  },
];

const adminCustomers = [
  {
    id: 201,
    fullName: "Nguyen Van A",
    email: "customer@lapstore.vn",
    phone: "0912345678",
    totalSpent: 125000000,
    loyaltyPoints: 230,
    status: "active",
    recentOrders: [{ id: 9001, code: "ODR-9001", totalAmount: 28140000, status: "pending" }],
  },
  {
    id: 202,
    fullName: "Tran Thi B",
    email: "b@lapstore.vn",
    phone: "0988222111",
    totalSpent: 8900000,
    loyaltyPoints: 45,
    status: "blocked",
    recentOrders: [],
  },
];

const users = [
  { id: 1, name: "Admin User" },
  { id: 2, name: "Demo User" },
];

const storeConfig = {
  defaultShippingFee: 50000,
  freeShippingThreshold: 10000000,
  footerHotline: "1900 630 680",
  footerEmail: "lapstore@gmail.com",
};

const dashboard = {
  kpis: { lowStockProducts: 2 },
  topProductsByRevenue: [
    { id: 101, name: "ASUS Zenbook 14 OLED", revenue: 2351160000 },
    { id: 102, name: "Lenovo LOQ 15", revenue: 1585390000 },
  ],
  recentOrders: [
    { id: 9001, code: "ODR-9001", customerName: "Nguyen Van A", totalAmount: 28140000, status: "pending" },
  ],
  enterprise: {
    revenueCompare: { today: 64000000, todayPrev: 52000000, week: 356000000, month: 1314000000 },
    criticalStockUnder3: 2,
    avgMarginPercent: 12.6,
  },
};

export const mockData = {
  adminUser,
  user,
  products,
  storeConfig,
  accountProfile,
  accountAddresses,
  accountOrders,
  adminCustomers,
  users,
  dashboard,
};
