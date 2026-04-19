import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SPEC_SECTIONS = [
  {
    title: 'Bộ vi xử lý & Card đồ hoạ',
    rows: [
      ['Bộ vi xử lý', 'cpu'],
      ['Card đồ hoạ Onboard', 'gpu_onboard'],
      ['Card đồ hoạ rời', 'gpu_discrete'],
    ],
  },
  {
    title: 'Bộ nhớ Ram, Ổ cứng',
    rows: [
      ['Bộ nhớ Ram', 'ram'],
      ['Hỗ trợ Ram tối đa', 'ram_max'],
      ['Ổ cứng', 'storage'],
      ['Hỗ trợ ổ cứng tối đa', 'storage_max'],
    ],
  },
  {
    title: 'Màn hình',
    rows: [
      ['Kích thước màn hình', 'screen_size'],
      ['Độ phân giải', 'screen_resolution'],
      ['Công nghệ màn hình', 'screen_technology'],
    ],
  },
  {
    title: 'Thông tin khác',
    rows: [
      ['Cổng kết nối', 'ports'],
      ['Pin', 'battery'],
      ['Kích thước', 'dimensions'],
      ['Trọng lượng', 'weight'],
      ['Chất liệu', 'material'],
      ['Kết nối không dây', 'wireless'],
      ['Webcam', 'webcam'],
      ['Hệ điều hành', 'os'],
    ],
  },
];

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addLine } = useCart();
  const [detailOpen, setDetailOpen] = useState(false);
  const hasPrice = Number(product.min_price) > 0;

  useEffect(() => {
    if (!detailOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDetailOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailOpen]);

  const specSections = useMemo(() => {
    const specs = product.specs || {};
    return SPEC_SECTIONS.map((section) => {
      const rows = section.rows
        .map(([label, key]) => [label, specs[key]])
        .filter(([, value]) => Boolean(String(value || '').trim()));
      return { ...section, rows };
    }).filter((section) => section.rows.length > 0);
  }, [product.specs]);

  const handleAddToCart = () => {
    if (!hasPrice) return;
    const lineId = `${product.id}-0`;
    addLine({
      lineId,
      productId: Number(product.id) || 0,
      variantId: 0,
      name: product.name || "Sản phẩm",
      image: product.image || product.imageUrl || null,
      specSummary: product.specSummary || "",
      price: Number(product.min_price) || 0,
      quantity: 1,
      productSlug: product.slug || undefined,
    });
  };

  const handleBuyNow = () => {
    if (!hasPrice) return;
    handleAddToCart();
    navigate("/gio-hang");
  };

  return (
    <>
    <article
      onClick={() => setDetailOpen(true)}
      className="relative flex h-full min-h-[380px] max-h-[490px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-[box-shadow,border-color] duration-200 hover:border-slate-50 hover:shadow-[0_10px_40px_-4px_rgba(15,23,42,0.12)]"
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col p-4">
        <div className="relative flex h-[232px] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
          {product.imageUrl ? (
            <img
              className="max-h-full max-w-full object-contain"
              alt={product.name}
              src={product.imageUrl}
            />
          ) : (
            <span className="material-symbols-outlined text-6xl text-slate-200">laptop</span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden pt-2.5">
          <h4 className="line-clamp-2 shrink-0 text-[18px] font-bold leading-snug text-slate-900">
            {product.name}
          </h4>

          {product.specSummary ? (
            <p className="line-clamp-2 shrink-0 text-[15px] leading-snug text-slate-600">
              {product.specSummary}
            </p>
          ) : null}

          <div className="mt-auto flex min-h-0 shrink-0 flex-col gap-2.5 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-bold leading-tight text-rose-600">{product.priceFormatted}</p>
              {product.min_discount > 0 ? (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-red-50">
                  -{product.min_discount}%
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={!hasPrice}
                className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
                disabled={!hasPrice}
                className="rounded-lg bg-slate-900 px-2 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
    {detailOpen ? (
      <div
        className="fixed inset-0 z-[1000] bg-black/40 p-4"
        onClick={() => setDetailOpen(false)}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="mx-auto h-[calc(100vh-2rem)] w-[580px] overflow-hidden rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-[24px] font-bold leading-tight text-slate-900">Cấu hình & đặc điểm</h3>
            <button
              type="button"
              onClick={() => setDetailOpen(false)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined text-[30px]">close</span>
            </button>
          </div>

          <div className="h-[calc(100%-84px)] overflow-y-auto">
            {specSections.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Chưa có thông số chi tiết.</p>
            ) : (
              specSections.map((section) => (
                <div key={section.title} className="border-b border-slate-200 last:border-b-0">
                  <div className="bg-slate-100 px-5 py-2.5 text-base font-bold text-slate-900">{section.title}</div>
                  {section.rows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[220px_1fr] border-t border-slate-200 px-5 py-2.5 text-[14px] text-slate-800">
                      <p className="pr-4">{label}</p>
                      <p className="whitespace-pre-wrap">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
};

export default ProductCard;
