import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductSpecsForm, { mergeLoadedSpecs } from "./ProductSpecsForm";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";
import { validateSpecsComplete } from "../utils/productFormValidation";

const schema = z
  .object({
    name: z.string().min(3, "Tên sản phẩm tối thiểu 3 ký tự"),
    status: z.enum(["active", "inactive", "out_of_stock", "coming_soon"]),
    salePrice: z.coerce.number().min(0, "Giá bán phải >= 0"),
    originalPrice: z.coerce.number().min(0, "Giá gốc phải >= 0"),
    stockQuantity: z.coerce.number().int("Số lượng kho phải là số nguyên").min(0, "Số lượng kho phải >= 0"),
  });

export default function ProductForm({
  initialValues,
  submitLabel,
  submitting,
  onSubmit,
  onImageUpload,
}) {
  const [specs, setSpecs] = useState(() => mergeLoadedSpecs(initialValues?.specs));
  const [images, setImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState(initialValues?.imageUrls || []);

  const defaultValues = useMemo(
    () => ({
      name: initialValues?.name || "",
      status: initialValues?.status || "active",
      salePrice: Number.isFinite(initialValues?.salePrice) ? initialValues.salePrice : 0,
      originalPrice: Number.isFinite(initialValues?.originalPrice) ? initialValues.originalPrice : 0,
      stockQuantity: Number.isFinite(initialValues?.stockQuantity) ? initialValues.stockQuantity : 0,
    }),
    [initialValues]
  );

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const salePrice = watch("salePrice");
  const originalPrice = watch("originalPrice");
  const discountPercent = useMemo(() => {
    const sale = Number(salePrice);
    const original = Number(originalPrice);
    if (!Number.isFinite(sale) || !Number.isFinite(original)) return 0;
    if (sale <= 0) return 0;
    if (original <= sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  }, [originalPrice, salePrice]);

  useEffect(() => {
    reset(defaultValues);
    setSpecs(mergeLoadedSpecs(initialValues?.specs));
    setExistingImageUrls(initialValues?.imageUrls || []);
  }, [defaultValues, initialValues, reset]);

  const submitHandler = handleSubmit(async (values) => {
    const specErr = validateSpecsComplete(specs);
    if (specErr) {
      toast.error(specErr);
      return;
    }
    const existingImg = existingImageUrls.length;
    const newFiles = images.map((x) => x.file).filter(Boolean).length;
    if (existingImg + newFiles === 0) {
      toast.error("Cần ít nhất một ảnh sản phẩm (thêm ảnh mới hoặc giữ ảnh hiện có khi sửa).");
      return;
    }

    const files = images.map((x) => x.file).filter(Boolean);
    const uploaded = files.length > 0 && onImageUpload ? await onImageUpload(files, values.name) : [];
    onSubmit({
      ...values,
      specs,
      images: [...existingImageUrls, ...uploaded],
    });
  });

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Tên sản phẩm *</label>
          <input {...register("name")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          {errors.name ? <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Trạng thái *</label>
          <select {...register("status")} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="coming_soon">Sắp ra mắt</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Giá bán</label>
          <input
            type="number"
            inputMode="numeric"
            step="1000"
            min={0}
            {...register("salePrice")}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
          {errors.salePrice ? <p className="text-xs text-rose-600 mt-1">{errors.salePrice.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Giá gốc (gạch ngang)</label>
          <input
            type="number"
            inputMode="numeric"
            step="1000"
            min={0}
            {...register("originalPrice")}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
          {errors.originalPrice ? <p className="text-xs text-rose-600 mt-1">{errors.originalPrice.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium">% giảm giá</label>
          <input
            value={discountPercent}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-slate-50"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Số lượng kho</label>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min={0}
            {...register("stockQuantity")}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
          {errors.stockQuantity ? <p className="text-xs text-rose-600 mt-1">{errors.stockQuantity.message}</p> : null}
        </div>
      </div>

      <ProductSpecsForm specs={specs} setSpecs={setSpecs} />

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Hình ảnh sản phẩm *</h3>
        <p className="text-xs text-slate-500 mb-3">Tạo mới: cần upload ít nhất một ảnh. Sửa: có thể giữ ảnh hiện có hoặc thêm ảnh mới.</p>
        <ImageUploader
          files={images}
          setFiles={setImages}
          existingUrls={existingImageUrls}
          setExistingUrls={setExistingImageUrls}
        />
      </div>

      <button disabled={submitting} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold">
        {submitting ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
