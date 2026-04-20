<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class UploadController extends Controller
{
    public function __construct(
        protected CloudinaryService $cloudinaryService
    ) {}

    public function image(Request $request)
    {
        // Một file: $request->file('images') là UploadedFile; nhiều file: mảng. Rule "array" sẽ 422 nếu chỉ 1 file.
        $files = array_values(array_filter(Arr::wrap($request->file('images'))));

        Validator::make(
            [
                'images' => $files,
                'folder' => $request->input('folder'),
                'productName' => $request->input('productName'),
            ],
            [
                'images' => ['required', 'array', 'min:1', 'max:1'],
                'images.*' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
                'folder' => ['sometimes', 'nullable', 'string', 'max:200'],
                'productName' => ['sometimes', 'nullable', 'string', 'max:255'],
            ]
        )->validate();

        try {
            $subfolder = null;
            if ($request->filled('folder')) {
                $subfolder = trim((string) $request->string('folder'));
            } elseif ($request->filled('productName')) {
                $subfolder = CloudinaryService::folderFromProductName((string) $request->string('productName'));
            }

            $records = [];

            foreach ($files as $file) {
                $result = $this->cloudinaryService->uploadImage($file, $subfolder);

                $records[] = [
                    'url' => $result['url'],
                    'public_id' => $result['public_id'],
                    'width' => $result['width'],
                    'height' => $result['height'],
                ];
            }

            return ApiResponse::success(['records' => $records], 'Upload successful');
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 503);
        } catch (\Exception $e) {
            return ApiResponse::error('Lỗi khi upload ảnh: '.$e->getMessage(), 500);
        }
    }
}
