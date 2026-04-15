<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    protected $cloudinaryService;

    // Sử dụng Dependency Injection để tiêm CloudinaryService vào
    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    public function image(Request $request)
    {
        $request->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // Max 5MB
        ]);

        try {
            $records = [];
            
            foreach ($request->file('images') as $file) {
                // Gọi hàm uploadImage từ service (Giả sử bạn đã viết hàm này trong CloudinaryService)
                $result = $this->cloudinaryService->uploadImage($file);
                
                $records[] = [
                    'url' => $result['url'],
                    'public_id' => $result['public_id'],
                ];
            }

            return ApiResponse::success(['records' => $records], 'Upload successful');
            
        } catch (\Exception $e) {
            return ApiResponse::error('Lỗi khi upload ảnh: ' . $e->getMessage(), 500);
        }
    }
}