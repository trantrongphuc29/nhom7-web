import React, { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { BACKEND_BASE_URL } from "../../../config/api";

function toImageUrlString(raw) {
  if (raw == null || raw === "") return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object") {
    if (typeof raw.url === "string") return raw.url.trim();
    if (typeof raw.secure_url === "string") return raw.secure_url.trim();
  }
  return String(raw).trim();
}

function resolveSrc(raw) {
  const url = toImageUrlString(raw);
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND_BASE_URL}/${url.replace(/^\//, "")}`;
}

export default function ImageUploader({ files, setFiles, existingUrls = [], setExistingUrls }) {
  const previewSetRef = useRef(new Set());
  const onDrop = useCallback(
    (acceptedFiles) => {
      const next = acceptedFiles[0];
      if (!next) return;
      setFiles((prev) => {
        (prev || []).forEach((x) => {
          if (x?.preview) URL.revokeObjectURL(x.preview);
        });
        return [{ file: next, preview: URL.createObjectURL(next) }];
      });
    },
    [setFiles]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });
  const removeExisting = (index) => {
    if (!setExistingUrls) return;
    setExistingUrls((prev) => prev.filter((_, idx) => idx !== index));
  };
  const removeNewFile = (index) => {
    setFiles((prev) => {
      const target = prev?.[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  useEffect(() => {
    const nextSet = new Set((files || []).map((item) => item?.preview).filter(Boolean));
    previewSetRef.current.forEach((url) => {
      if (!nextSet.has(url)) URL.revokeObjectURL(url);
    });
    previewSetRef.current = nextSet;
  }, [files]);

  useEffect(() => {
    return () => {
      previewSetRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div>
      {existingUrls.length > 0 ? (
        <p className="text-xs text-slate-600 mb-2">
          Ảnh hiện tại ({existingUrls.length}). Chỉ dùng một ảnh đại diện — chọn ảnh mới bên dưới sẽ thay ảnh đang chọn.
        </p>
      ) : null}
      {existingUrls.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
          {existingUrls.map((url, idx) => (
            <div key={`ex-${idx}`} className="aspect-square border rounded-lg overflow-hidden relative bg-slate-50">
              <img src={resolveSrc(url)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(idx)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/65 text-white text-xs font-bold hover:bg-black/80"
                aria-label="Xóa ảnh hiện có"
                title="Xóa ảnh"
              >
                x
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-slate-300"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-slate-600">Kéo thả hoặc click để chọn một ảnh (JPEG/PNG/WebP, tối đa 5MB)</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
        {(files || []).map((f, idx) => (
          <div key={idx} className="aspect-square border rounded-lg overflow-hidden relative">
            <img src={f.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(idx)}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/65 text-white text-xs font-bold hover:bg-black/80"
              aria-label="Xóa ảnh mới"
              title="Xóa ảnh"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
