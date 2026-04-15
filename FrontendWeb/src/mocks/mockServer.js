import { mockData } from "./mockData";

const LATENCY_MS = 500;

const db = {
  products: structuredClone(mockData.products),
  accountProfile: structuredClone(mockData.accountProfile),
  accountAddresses: structuredClone(mockData.accountAddresses),
  accountOrders: structuredClone(mockData.accountOrders),
  adminCustomers: structuredClone(mockData.adminCustomers),
  users: structuredClone(mockData.users),
  dashboard: structuredClone(mockData.dashboard),
  vouchers: structuredClone(mockData.vouchers || []),
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function delay(result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), LATENCY_MS));
}

function parseBody(init) {
  const raw = init?.body;
  if (!raw) return {};
  if (typeof raw !== "string") return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getPrimaryVariant(product) {
  const first = product?.variants?.[0];
  if (first && typeof first === "object") return first;
  return {
    id: product?.id ? Number(product.id) * 1000 : 0,
    sku: product?.sku || product?.masterSku || "",
    price: product?.min_price ?? product?.price ?? 0,
    discount: product?.min_discount ?? product?.discount ?? 0,
    stock: product?.stock ?? 999,
    image: product?.image || null,
  };
}

function getProductPrice(product) {
  const first = getPrimaryVariant(product);
  return Number(first.price || product?.min_price || product?.price || 0);
}

function listProductsFromFilters(urlObj) {
  const params = urlObj.searchParams;
  const brandRaw = params.get("brand");
  const keyword = String(params.get("keyword") || "").toLowerCase().trim();
  const minPrice = Number(params.get("minPrice") || 0);
  const maxPrice = Number(params.get("maxPrice") || 0);
  const brands = brandRaw ? brandRaw.split(",").map((x) => x.trim().toLowerCase()) : [];
  const rows = db.products.filter((p) => {
    const price = getProductPrice(p);
    if (brands.length && !brands.includes(String(p.brand || "").toLowerCase())) return false;
    if (keyword && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(keyword)) return false;
    if (minPrice > 0 && price < minPrice) return false;
    if (maxPrice > 0 && price > maxPrice) return false;
    return true;
  });
  const records = rows.map((p) => {
    const first = getPrimaryVariant(p);
    const secondImg = p.images?.[1]?.image_url || null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      image: p.image,
      image_url: p.image,
      imageUrl: p.image,
      image_url_2: secondImg,
      min_price: Number(first.price || 0),
      min_discount: Number(first.discount || 0),
      colors: [...new Set((p.variants || []).map((v) => v.color).filter(Boolean))],
      variantCount: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants.length : 1,
      status: p.status,
      specs: p.specs,
      variants: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [first],
      sku: first.sku || null,
      masterSku: first.sku || null,
    };
  });
  return { data: { records } };
}

function adminProductsRecords() {
  return db.products.map((p) => {
    const first = getPrimaryVariant(p);
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      salePrice: Number(first.price || 0),
      status: p.status,
    };
  });
}

async function handleMockRequest(input, init = {}) {
  const method = String(init?.method || "GET").toUpperCase();
  const url = typeof input === "string" ? input : input.url;
  if (!url) return null;
  const urlObj = new URL(url, window.location.origin);
  const path = urlObj.pathname;

  if (method === "GET" && path.endsWith("/auth/me")) return delay(jsonResponse({ data: mockData.adminUser }));
  if (method === "POST" && path.endsWith("/auth/login")) return delay(jsonResponse({ data: { token: "mock-token-user", user: mockData.user } }));
  if (method === "POST" && path.endsWith("/auth/register")) return delay(jsonResponse({ data: { id: 999, email: "new@lapstore.vn" } }));

  if (method === "GET" && path.endsWith("/store-config")) return delay(jsonResponse({ data: mockData.storeConfig }));
  if (method === "GET" && path.endsWith("/products")) return delay(jsonResponse(listProductsFromFilters(urlObj)));

  if (method === "GET" && /\/products\/[^/]+$/.test(path)) {
    const idOrSlug = decodeURIComponent(path.split("/").pop());
    const product = db.products.find((p) => String(p.id) === idOrSlug || String(p.slug) === idOrSlug);
    if (!product) return delay(jsonResponse({ message: "Not found" }, 404));
    return delay(jsonResponse({ data: product }));
  }

  if (method === "POST" && path.endsWith("/orders")) {
    const body = parseBody(init);
    const newId = Date.now();
    const order = {
      id: newId,
      orderCode: `ODR-${newId}`,
      code: `ODR-${newId}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      totalAmount: (body.items || []).reduce((s, x) => s + Number(x.quantity || 0) * 1000000, 0),
      discountAmount: 0,
      voucherDiscountAmount: 0,
      paymentMethod: body.paymentMethod || "cod",
      shippingAddress: body?.shipping?.shipAddress || "Pickup store",
      customerName: body?.shipping?.shipName || body?.shipping?.pickupName || "Khach hang",
      customerPhone: body?.shipping?.shipPhone || body?.shipping?.pickupPhone || "",
      customerEmail: db.accountProfile.email,
      items: (body.items || []).map((it, idx) => ({
        id: idx + 1,
        productId: it.productId,
        productName: it.name || "Product",
        variantName: it.specSummary || "",
        quantity: Number(it.quantity || 1),
        unitPrice: 1000000,
        image: db.products.find((p) => p.id === it.productId)?.image || null,
      })),
      timeline: [{ status: "pending", createdAt: new Date().toISOString(), note: "Don hang moi tao" }],
    };
    db.accountOrders.unshift(order);
    return delay(jsonResponse({ data: { orderCode: order.orderCode } }));
  }

  if (method === "POST" && path.endsWith("/vouchers/preview")) {
    const body = parseBody(init);
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);
    const v = db.vouchers.find((x) => x.code === code && x.isActive);
    if (!v) return delay(jsonResponse({ message: "Ma khong hop le" }, 400));
    if (subtotal < Number(v.minOrderValue || 0)) return delay(jsonResponse({ message: "Don hang chua dat dieu kien" }, 400));
    const discountAmount = v.discountType === "percent"
      ? Math.min(Math.floor((subtotal * Number(v.discountValue || 0)) / 100), Number(v.maxDiscountAmount || Number.MAX_SAFE_INTEGER))
      : Number(v.discountValue || 0);
    return delay(jsonResponse({ data: { code: v.code, discountAmount } }));
  }
  if (method === "POST" && path.endsWith("/vouchers/redeem")) return delay(jsonResponse({ data: { ok: true } }));

  if (method === "GET" && path.endsWith("/account/profile")) return delay(jsonResponse({ data: db.accountProfile }));
  if (method === "PATCH" && path.endsWith("/account/profile")) {
    const body = parseBody(init);
    db.accountProfile = { ...db.accountProfile, ...body };
    return delay(jsonResponse({ data: db.accountProfile }));
  }
  if (method === "POST" && path.endsWith("/account/password")) return delay(jsonResponse({ data: { changed: true } }));

  if (method === "GET" && path.endsWith("/account/addresses")) return delay(jsonResponse({ data: db.accountAddresses }));
  if (method === "POST" && path.endsWith("/account/addresses")) {
    const body = parseBody(init);
    const newRow = { ...body, id: Date.now() };
    if (newRow.isDefault) db.accountAddresses = db.accountAddresses.map((x) => ({ ...x, isDefault: false }));
    db.accountAddresses.unshift(newRow);
    return delay(jsonResponse({ data: newRow }));
  }
  if (/\/account\/addresses\/\d+$/.test(path)) {
    const id = Number(path.split("/").pop());
    if (method === "PUT") {
      const body = parseBody(init);
      db.accountAddresses = db.accountAddresses.map((x) => (x.id === id ? { ...x, ...body, id } : body.isDefault ? { ...x, isDefault: false } : x));
      return delay(jsonResponse({ data: db.accountAddresses.find((x) => x.id === id) }));
    }
    if (method === "DELETE") {
      db.accountAddresses = db.accountAddresses.filter((x) => x.id !== id);
      return delay(jsonResponse({ data: { deleted: true } }));
    }
  }
  if (method === "GET" && path.endsWith("/account/orders")) return delay(jsonResponse({ data: db.accountOrders }));
  if (path.endsWith("/account/cart")) return delay(jsonResponse({ data: { items: [] } }));

  if (method === "GET" && path.endsWith("/admin/dashboard")) return delay(jsonResponse({ data: db.dashboard }));

  if (method === "GET" && path.endsWith("/admin/products")) {
    return delay(jsonResponse({ data: { records: adminProductsRecords() } }));
  }
  if (method === "POST" && path.endsWith("/admin/products")) return delay(jsonResponse({ data: { created: true } }));
  if (method === "DELETE" && path.endsWith("/admin/products/bulk-delete")) {
    const body = parseBody(init);
    db.products = db.products.filter((p) => !(body.ids || []).includes(p.id));
    return delay(jsonResponse({ data: { ok: true } }));
  }
  if (method === "GET" && /\/admin\/products\/\d+$/.test(path)) {
    const id = Number(path.split("/").pop());
    return delay(jsonResponse({ data: db.products.find((x) => x.id === id) || null }));
  }
  if (method === "PUT" && /\/admin\/products\/\d+$/.test(path)) return delay(jsonResponse({ data: { updated: true } }));
  if (method === "POST" && path.endsWith("/admin/uploads/images")) return delay(jsonResponse({ data: { records: ["https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=960&q=80"] } }));

  if (method === "GET" && path.endsWith("/admin/orders")) {
    const page = Number(urlObj.searchParams.get("page") || 1);
    const limit = Number(urlObj.searchParams.get("limit") || 10);
    const status = String(urlObj.searchParams.get("status") || "");
    const search = String(urlObj.searchParams.get("search") || "").toLowerCase();
    let rows = [...db.accountOrders];
    if (status) rows = rows.filter((x) => x.status === status);
    if (search) rows = rows.filter((x) => `${x.code} ${x.customerName} ${x.customerPhone}`.toLowerCase().includes(search));
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return delay(jsonResponse({ data: { records: rows.slice(start, start + limit), pagination: { page, totalPages, total } } }));
  }
  if (method === "GET" && /\/admin\/orders\/\d+$/.test(path)) {
    const id = Number(path.split("/").pop());
    return delay(jsonResponse({ data: db.accountOrders.find((x) => x.id === id) || null }));
  }
  if (method === "PATCH" && /\/admin\/orders\/\d+\/status$/.test(path)) {
    const id = Number(path.split("/").slice(-2)[0]);
    const body = parseBody(init);
    db.accountOrders = db.accountOrders.map((o) => (o.id === id ? { ...o, status: body.status } : o));
    return delay(jsonResponse({ data: { ok: true } }));
  }

  if (method === "GET" && path.endsWith("/admin/customers")) {
    const page = Number(urlObj.searchParams.get("page") || 1);
    const limit = Number(urlObj.searchParams.get("limit") || 10);
    const status = String(urlObj.searchParams.get("status") || "");
    const search = String(urlObj.searchParams.get("search") || "").toLowerCase();
    let rows = [...db.adminCustomers];
    if (status) rows = rows.filter((x) => x.status === status);
    if (search) rows = rows.filter((x) => `${x.fullName} ${x.email} ${x.phone}`.toLowerCase().includes(search));
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return delay(jsonResponse({ data: { records: rows.slice(start, start + limit), pagination: { page, totalPages, total } } }));
  }
  if (method === "GET" && /\/admin\/customers\/\d+$/.test(path)) {
    const id = Number(path.split("/").pop());
    return delay(jsonResponse({ data: db.adminCustomers.find((x) => x.id === id) || null }));
  }
  if (method === "PATCH" && /\/admin\/customers\/\d+\/status$/.test(path)) {
    const id = Number(path.split("/").slice(-2)[0]);
    const body = parseBody(init);
    db.adminCustomers = db.adminCustomers.map((x) => (x.id === id ? { ...x, status: body.status } : x));
    return delay(jsonResponse({ data: { ok: true } }));
  }

  if (method === "GET" && path.endsWith("/admin/promotions")) return delay(jsonResponse({ data: { vouchers: db.vouchers } }));
  if (method === "POST" && path.endsWith("/admin/promotions/vouchers")) {
    const body = parseBody(init);
    db.vouchers.unshift({ id: Date.now(), usedCount: 0, ...body });
    return delay(jsonResponse({ data: { ok: true } }));
  }
  if (/\/admin\/promotions\/vouchers\/\d+$/.test(path)) {
    const id = Number(path.split("/").pop());
    if (method === "PUT") {
      const body = parseBody(init);
      db.vouchers = db.vouchers.map((v) => (v.id === id ? { ...v, ...body } : v));
      return delay(jsonResponse({ data: { ok: true } }));
    }
    if (method === "DELETE") {
      db.vouchers = db.vouchers.filter((v) => v.id !== id);
      return delay(jsonResponse({ data: { ok: true } }));
    }
  }

  if (method === "GET" && path.endsWith("/users")) return delay(jsonResponse({ data: { records: db.users } }));
  if (method === "POST" && path.endsWith("/users")) {
    const body = parseBody(init);
    db.users.push({ id: Date.now(), name: body.name || "New User" });
    return delay(jsonResponse({ data: { ok: true } }));
  }
  if (/\/users\/\d+$/.test(path)) {
    const id = Number(path.split("/").pop());
    if (method === "PUT") {
      const body = parseBody(init);
      db.users = db.users.map((u) => (u.id === id ? { ...u, name: body.name || u.name } : u));
      return delay(jsonResponse({ data: { ok: true } }));
    }
    if (method === "DELETE") {
      db.users = db.users.filter((u) => u.id !== id);
      return delay(jsonResponse({ data: { ok: true } }));
    }
  }

  return null;
}

export function setupMockServer() {
  if (typeof window === "undefined") return;
  if (window.__lapstoreMockServerInstalled) return;
  window.__lapstoreMockRequest = handleMockRequest;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const mocked = await handleMockRequest(input, init || {});
    if (mocked) return mocked;
    return originalFetch(input, init);
  };
  window.__lapstoreMockServerInstalled = true;
}

