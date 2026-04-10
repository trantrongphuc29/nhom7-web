<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use App\Support\ApiResponse;

class UploadController extends Controller
{
    public function image()
    {
        request()->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'image', 'max:5120'],
        ]);

        $service = app(CloudinaryService::class);
        $records = [];
        foreach (request()->file('images', []) as $file) {
            $result = $service->uploadImage($file);
            $records[] = [
                'url' => $result['url'],
                'public_id' => $result['public_id'],
            ];
        }

        return ApiResponse::success(['records' => $records], 'Upload successful');
    }
}
