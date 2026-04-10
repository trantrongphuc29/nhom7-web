export function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === "";
}

/** Rich text Quill: không chỉ còn thẻ rỗng. */
export function htmlHasText(html) {
  const t = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > 0;
}

const SPEC_LABELS = {
  cpu: "CPU",
  gpuOnboard: "GPU tích hợp",
  gpuDiscrete: "GPU rời",
  ram: "RAM (thông số chung)",
  ramMax: "RAM tối đa",
  storage: "Ổ cứng (thông số chung)",
  storageMax: "Ổ tối đa",
  screenSize: "Kích thước màn hình",
  screenResolution: "Độ phân giải",
  screenTechnology: "Công nghệ màn hình",
  ports: "Cổng kết nối",
  battery: "Pin",
  dimensions: "Kích thước máy",
  weight: "Trọng lượng",
  material: "Chất liệu",
  wireless: "Kết nối không dây",
  webcam: "Webcam",
  os: "Hệ điều hành",
};

/** Chỉ bắt buộc: CPU, GPU tích hợp, RAM chung, ổ cứng mặc định. Còn lại để trống = không có. */
const REQUIRED_SPEC_KEYS = ["cpu", "gpuOnboard", "ram", "storage"];

export function validateSpecsComplete(specs) {
  if (!specs || typeof specs !== "object") return "Thiếu thông số kỹ thuật";
  for (const key of REQUIRED_SPEC_KEYS) {
    if (isBlank(specs[key])) {
      return `Thông số kỹ thuật — ${SPEC_LABELS[key] || key} là bắt buộc.`;
    }
  }
  return "";
}

