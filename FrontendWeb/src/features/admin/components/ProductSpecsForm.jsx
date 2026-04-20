import React from "react";

export function defaultProductSpecs() {
  return {
    cpu: "",
    gpuOnboard: "",
    gpuDiscrete: "",
    ram: "",
    ramMax: "",
    storage: "",
    storageMax: "",
    screenSize: "",
    screenResolution: "",
    screenTechnology: "",
    ports: "",
    battery: "",
    dimensions: "",
    weight: "",
    material: "",
    wireless: "",
    webcam: "",
    os: "",
  };
}

/** API Laravel trả specs dạng mảng [{ spec_key, spec_value }] hoặc object phẳng (camelCase). */
export function mergeLoadedSpecs(raw) {
  const base = defaultProductSpecs();
  if (!raw) return base;

  let flat = {};
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (row && typeof row.spec_key === "string") {
        flat[row.spec_key] = row.spec_value != null ? String(row.spec_value) : "";
      }
    }
  } else if (typeof raw === "object") {
    flat = raw;
  } else {
    return base;
  }

  return {
    ...base,
    cpu: flat.cpu ?? flat.CPU ?? "",
    gpuOnboard: flat.gpuOnboard ?? "",
    gpuDiscrete: String(flat.gpuDiscrete ?? flat.gpu_discrete ?? flat.GPU ?? "").trim(),
    ram: flat.ram ?? flat.RAM ?? "",
    ramMax: flat.ramMax ?? "",
    storage: flat.storage ?? flat["Ổ cứng"] ?? "",
    storageMax: flat.storageMax ?? "",
    screenSize: flat.screenSize ?? flat["Màn hình"] ?? "",
    screenResolution: flat.screenResolution ?? "",
    screenTechnology: flat.screenTechnology ?? "",
    ports: flat.ports ?? flat["Cổng kết nối"] ?? "",
    battery: flat.battery ?? flat.Pin ?? "",
    dimensions: flat.dimensions ?? "",
    weight: flat.weight ?? flat["Trọng lượng"] ?? "",
    material: flat.material ?? flat["Chất liệu"] ?? "",
    wireless: flat.wireless ?? "",
    webcam: flat.webcam ?? "",
    os: flat.os ?? "",
  };
}

function Field({ label, hint, value, onChange, multiline = false, required = false }) {
  const common = "mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white";
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {required ? <span className="text-rose-600">*</span> : null}
        {required ? " " : ""}
        {label}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={common} placeholder={hint} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={common} placeholder={hint} />
      )}
    </div>
  );
}

export default function ProductSpecsForm({ specs, setSpecs }) {
  const patch = (key) => (v) => setSpecs((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Thông số kỹ thuật (chung cho sản phẩm)</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          <span className="text-rose-600 font-medium">Bắt buộc (*)</span>: CPU, GPU tích hợp, RAM (thông số chung), ổ cứng mặc định. Các ô còn lại để trống = không hiển thị trên trang sản phẩm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field required label="CPU" hint="VD: Intel Core Ultra 7 155H" value={specs.cpu} onChange={patch("cpu")} />
        <Field required label="GPU tích hợp" hint="VD: Intel Arc Graphics" value={specs.gpuOnboard} onChange={patch("gpuOnboard")} />
        <Field label="GPU rời (nếu có)" hint="VD: NVIDIA GeForce RTX 4070 8GB — để trống nếu không có" value={specs.gpuDiscrete} onChange={patch("gpuDiscrete")} />
        <Field required label="RAM (thông số chung)" hint="VD: 16GB LPDDR5x" value={specs.ram} onChange={patch("ram")} />
        <Field label="RAM tối đa (hỗ trợ nâng cấp)" hint="VD: 64GB" value={specs.ramMax} onChange={patch("ramMax")} />
        <Field required label="Ổ cứng (mặc định / gợi ý)" hint="VD: 512GB SSD NVMe" value={specs.storage} onChange={patch("storage")} />
        <Field label="Ổ tối đa" hint="VD: 2TB SSD" value={specs.storageMax} onChange={patch("storageMax")} />
        <Field label="Kích thước màn hình" hint="VD: 14 inch" value={specs.screenSize} onChange={patch("screenSize")} />
        <Field label="Độ phân giải" hint="VD: 2880x1800" value={specs.screenResolution} onChange={patch("screenResolution")} />
        <Field label="Công nghệ màn hình" hint="VD: OLED 120Hz" value={specs.screenTechnology} onChange={patch("screenTechnology")} />
        <Field label="Pin" hint="VD: 75Wh" value={specs.battery} onChange={patch("battery")} />
        <Field label="Kích thước (DxRxC)" hint="VD: 312 x 221 x 15 mm" value={specs.dimensions} onChange={patch("dimensions")} />
        <Field label="Trọng lượng" hint="VD: 1.41 kg" value={specs.weight} onChange={patch("weight")} />
        <Field label="Chất liệu" hint="VD: Nhôm" value={specs.material} onChange={patch("material")} />
        <Field label="Kết nối không dây" hint="VD: Wi-Fi 6E, Bluetooth 5.3" value={specs.wireless} onChange={patch("wireless")} />
        <Field label="Webcam" hint="VD: FHD 1080p" value={specs.webcam} onChange={patch("webcam")} />
        <Field label="Hệ điều hành" hint="VD: Windows 11 Home" value={specs.os} onChange={patch("os")} />
      </div>

      <Field
        label="Cổng kết nối"
        hint="Liệt kê USB-C, HDMI, jack tai nghe… — để trống nếu không ghi"
        value={specs.ports}
        onChange={patch("ports")}
        multiline
      />
    </div>
  );
}
