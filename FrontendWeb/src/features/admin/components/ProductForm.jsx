import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductSpecsForm, { mergeLoadedSpecs } from "./ProductSpecsForm";
import ImageUploader from "./ImageUploader";
import toast from "react-hot-toast";
import { validateSpecsComplete } from "../utils/productFormValidation";

// 1. Định nghĩa Schema Validation
const schema = z.object({
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
  // State quản lý Specs và Ảnh
  const [specs, setSpecs] = useState(() => mergeLoadedSpecs(initialValues?.specs));
  const [images, setImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState(initialValues?.images || []);

  // 2. Map dữ liệu từ Backend (snake_case) sang Form (camelCase)
  const defaultValues = useMemo(
    () => ({
      name: initialValues?.name || "",
      status: initialValues?.status || "active",
      salePrice: initialValues?.sale_price || 0,
      originalPrice: initialValues?.original_price || 0,
      stockQuantity: initialValues?.stock_quantity || 0,
    }),
    [initialValues]
  );

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Tính toán % giảm giá hiển thị trên giao diện
  const salePrice = watch("salePrice");
  const originalPrice = watch("originalPrice");
  const discountPercent = useMemo(() => {
    const sale = Number(salePrice);
    const original = Number(originalPrice);
    if (!Number.isFinite(sale) || !Number.isFinite(original) || sale <= 0 || original <= sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  }, [originalPrice, salePrice]);

  // Reset form khi dữ liệu ban đầu thay đổi (dùng cho trang Edit)
  useEffect(() => {
    reset(defaultValues);
    setSpecs(mergeLoadedSpecs(initialValues?.specs));
    setExistingImageUrls(initialValues?.images || []);
  }, [defaultValues, initialValues, reset]);

  // 3. Xử lý Submit
  const submitHandler = handleSubmit(async (values) => {
    // Kiểm tra thông số kỹ thuật
    const specErr = validateSpecsComplete(specs);
    if (specErr) {
      toast.error(specErr);
      return;
    }

    /* LƯU Ý: Đã tạm thời bỏ qua bước kiểm tra (existingImg + newFiles === 0) 
       để bạn có thể tạo sản phẩm không cần ảnh.
    */

    try {
      let uploadedImages = [];
      const filesToUpload = images.map((x) => x.file).filter(Boolean);

      // Chỉ gọi API upload nếu thực sự có chọn file mới
      if (filesToUpload.length > 0 && onImageUpload) {
        uploadedImages = await onImageUpload(filesToUpload, values.name);
      }

      // 4. Map ngược dữ liệu sang snake_case để gửi lên Laravel
      const finalPayload = {
        name: values.name,
        status: values.status,
        sale_price: values.salePrice,
        original_price: values.originalPrice,
        stock_quantity: values.stockQuantity,
        specs: specs,
        // Gộp ảnh cũ (nếu sửa) và ảnh mới vừa upload (nếu có)
        images: [...existingImageUrls, ...uploadedImages],
      };

      onSubmit(finalPayload);
    } catch (error) {
      console.error("Lỗi submit:", error);
      toast.error("Có lỗi xảy ra: " + error.message);
    }
  });

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <h3 className="font-semibold text-slate-800 border-b pb-2 mb-2">Thông tin cơ bản</h3>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Tên sản phẩm *</label>
          <input 
            {...register("name")} 
            className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none ${errors.name ? 'border-rose-500 ring-rose-200' : 'border-slate-300 focus:ring-blue-200'}`} 
            placeholder="Ví dụ: Laptop Dell XPS 13"
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Trạng thái *</label>
          <select {...register("status")} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none">
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng kinh doanh</option>
            <option value="out_of_stock">Tạm hết hàng</option>
            <option value="coming_soon">Sắp về hàng</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Giá bán thực tế (VNĐ) *</label>
          <input
            type="number"
            {...register("salePrice")}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Giá niêm yết (Giá gốc)</label>
          <input
            type="number"
            {...register("originalPrice")}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">% Giảm giá (Tự động)</label>
          <input
            value={`${discountPercent}%`}
            disabled
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 font-bold text-green-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Số lượng kho *</label>
          <input
            type="number"
            {...register("stockQuantity")}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
      </div>

      <ProductSpecsForm specs={specs} setSpecs={setSpecs} />

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Hình ảnh sản phẩm</h3>
        <p className="text-xs text-slate-500 mb-4 italic">Đã tắt bắt buộc upload để bạn test Backend.</p>
        <ImageUploader
          files={images}
          setFiles={setImages}
          existingUrls={existingImageUrls}
          setExistingUrls={setExistingImageUrls}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button 
          type="submit" 
          disabled={submitting} 
          className={`px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
        >
          {submitting ? "Đang xử lý..." : submitLabel}
        </button>
      </div>
    </form>
  );
}