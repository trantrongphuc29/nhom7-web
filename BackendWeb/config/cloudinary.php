<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),

    /** Thư mục mặc định trên Cloudinary (Media Library) */
    'upload_folder' => env('CLOUDINARY_UPLOAD_FOLDER', 'lapstore/products'),

    /**
     * Upload preset (unsigned) — để trống nếu dùng API ký đầy đủ (mặc định hiện tại).
     *
     * @see https://cloudinary.com/documentation/upload_presets
     */
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

    /** Timeout HTTP (giây) khi gọi api.cloudinary.com */
    'http_timeout' => (int) env('CLOUDINARY_HTTP_TIMEOUT', 120),

    /**
     * Đường dẫn tùy chọn tới file CA (cacert.pem). Ưu tiên hơn gói composer/ca-bundle.
     */
    'cacert' => env('CLOUDINARY_CACERT'),

    /**
     * Chỉ khi APP_ENV=local: đặt false để tắt kiểm SSL (không dùng production).
     */
    'verify_ssl' => filter_var(env('CLOUDINARY_VERIFY_SSL', true), FILTER_VALIDATE_BOOLEAN),
];
