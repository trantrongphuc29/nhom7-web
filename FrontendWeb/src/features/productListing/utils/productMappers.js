import { BACKEND_BASE_URL } from "../../../config/api";

function shortenCpuLabel(cpu) {
  if (!cpu) return null;
  let s = cpu
    .replace(/^Intel\s+Core\s+/i, "")
    .replace(/^Intel\s+/i, "")
    .replace(/^AMD\s+Ryzen\s+/i, "Ryzen ")
    .replace(/^Apple\s+/i, "")
    .trim();
  s = s.replace(/^(i\d+)-/i, "$1 ");
  return s;
}

function screenPart(resolution, technology) {
  const t = technology?.trim();
  const r = resolution?.trim();
  if (t && t.length <= 28) return t;
  if (r) return r;
  return t || null;
}

function buildSpecSummary(product) {
  return [
    shortenCpuLabel(product.cpu),
    product.ram,
    product.storage,
    screenPart(product.screen_resolution, product.screen_technology),
  ]
    .filter(Boolean)
    .join(", ");
}

const fmt = (price) => new Intl.NumberFormat("vi-VN").format(price);

function toStorefrontImageUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BACKEND_BASE_URL}/${path}`;
}

export function mapProductToCard(product) {
  return {
    ...product,
    status: product.status ?? null,
    imageUrl: toStorefrontImageUrl(product.image),
    priceFormatted: product.min_price ? fmt(product.min_price) : "Liên hệ",
    specSummary: buildSpecSummary(product),
    min_discount: Number(product.min_discount) || 0,
  };
}
