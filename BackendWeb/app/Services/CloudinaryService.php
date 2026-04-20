<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Upload qua Laravel HTTP client để kiểm soát SSL (CA bundle) — tránh lỗi cURL 60 trên Windows khi thiếu CA hệ thống.
 */
class CloudinaryService
{
    /**
     * @return array{0: string, 1: string, 2: string} cloud_name, api_key, api_secret
     */
    protected function credentials(): array
    {
        $cloudName = trim((string) config('cloudinary.cloud_name', ''));
        $apiKey = trim((string) config('cloudinary.api_key', ''));
        $apiSecret = trim((string) config('cloudinary.api_secret', ''));

        if ($cloudName === '' || $apiKey === '' || $apiSecret === '') {
            throw new \RuntimeException(
                'Thiếu cấu hình Cloudinary. Hãy đặt CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong file .env.'
            );
        }

        return [$cloudName, $apiKey, $apiSecret];
    }

    /**
     * @return bool|string Chuỗi đường dẫn tới file CA, hoặc true/false cho tùy chọn verify của Guzzle.
     */
    protected function httpVerify(): bool|string
    {
        $allowInsecureLocal = config('cloudinary.verify_ssl') === false && app()->environment('local');
        if ($allowInsecureLocal) {
            return false;
        }

        $custom = config('cloudinary.cacert');
        if (is_string($custom) && $custom !== '' && is_readable($custom)) {
            return $custom;
        }

        $caBundleClass = 'Composer\\CaBundle\\CaBundle';
        if (class_exists($caBundleClass)) {
            $path = \call_user_func([$caBundleClass, 'getBundledCaBundlePath']);
            if (is_string($path) && is_readable($path)) {
                return $path;
            }
        }

        return true;
    }

    protected function httpClient()
    {
        return Http::withOptions(['verify' => $this->httpVerify()])
            ->timeout((int) config('cloudinary.http_timeout', 120));
    }

    /**
     * @return array{url: ?string, public_id: ?string, width: ?int, height: ?int}
     */
    public function uploadImage(UploadedFile $file, ?string $folder = null): array
    {
        $baseFolder = (string) config('cloudinary.upload_folder', 'lapstore/products');
        $targetFolder = $folder !== null && $folder !== ''
            ? trim($baseFolder.'/'.$folder, '/')
            : trim($baseFolder, '/');

        [$cloudName, $apiKey, $apiSecret] = $this->credentials();

        // Dùng HTTP Basic Auth (theo tài liệu Cloudinary) — không cần timestamp/signature trong body,
        // tránh lệch ký so với REST so với SDK và lỗi "unsigned upload / upload preset".
        $fields = [
            'folder' => $targetFolder,
            'use_filename' => '1',
            'unique_filename' => '1',
        ];

        $preset = config('cloudinary.upload_preset');
        if (is_string($preset) && trim($preset) !== '') {
            $fields['upload_preset'] = trim($preset);
        }

        $path = $file->getRealPath();
        if ($path === false || $path === '') {
            $path = $file->getPathname();
        }
        $binary = @file_get_contents($path);
        if ($binary === false || $binary === '') {
            throw new \RuntimeException('Không đọc được file upload.');
        }

        $filename = $file->getClientOriginalName() ?: 'upload.jpg';
        $mime = $file->getClientMimeType() ?: 'application/octet-stream';

        $url = sprintf('https://api.cloudinary.com/v1_1/%s/image/upload', rawurlencode($cloudName));

        // attach() + post($url, $fields) gửi multipart đúng chuẩn Guzzle; asMultipart + fopen hay gây thiếu part "file" trên Cloudinary.
        $response = $this->httpClient()
            ->withBasicAuth($apiKey, $apiSecret)
            ->attach('file', $binary, $filename, ['Content-Type' => $mime])
            ->post($url, $fields);

        if (! $response->successful()) {
            $json = $response->json();
            $msg = null;

            // Lấy thông báo lỗi từ Cloudinary
            if (is_array($json)) {
                $msg = $json['error']['message'] ?? $json['error'] ?? null;
            }
            if (! is_string($msg) || $msg === '') {
                $msg = $response->body();
            }

            // Log chi tiết lỗi để debug
            Log::error('Cloudinary upload error', [
                'status' => $response->status(),
                'error' => $msg,
                'full_response' => $response->json(),
            ]);

            throw new \RuntimeException(is_string($msg) && $msg !== '' ? $msg : 'Upload Cloudinary thất bại.');
        }

        $json = $response->json();
        if (! is_array($json)) {
            throw new \RuntimeException('Phản hồi Cloudinary không hợp lệ.');
        }

        return [
            'url' => $json['secure_url'] ?? null,
            'public_id' => $json['public_id'] ?? null,
            'width' => isset($json['width']) ? (int) $json['width'] : null,
            'height' => isset($json['height']) ? (int) $json['height'] : null,
        ];
    }

    public function destroy(string $publicId): void
    {
        $publicId = trim($publicId);
        if ($publicId === '') {
            return;
        }

        [$cloudName, $apiKey, $apiSecret] = $this->credentials();

        $url = sprintf('https://api.cloudinary.com/v1_1/%s/image/destroy', rawurlencode($cloudName));

        $this->httpClient()
            ->withBasicAuth($apiKey, $apiSecret)
            ->asForm()
            ->post($url, ['public_id' => $publicId]);
    }

    public static function folderFromProductName(string $name): string
    {
        $slug = Str::slug(Str::limit($name, 80, ''));
        if ($slug === '') {
            $slug = 'item-'.Str::lower(Str::random(8));
        }

        return $slug;
    }
}
