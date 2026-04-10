<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiResponse;

class ProductController extends Controller
{
    public function index()
    {
        $query = Product::query()->with('images');
        if (request('keyword')) {
            $query->where('name', 'like', '%'.request('keyword').'%');
        }
        if (request('status')) {
            $query->where('status', request('status'));
        }

        $records = $query->orderByDesc('id')->paginate((int) request('per_page', 20));
        return ApiResponse::success([
            'records' => $records->items(),
            'pagination' => [
                'current_page' => $records->currentPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
                'last_page' => $records->lastPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        $product = Product::with('images')->find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }
        return ApiResponse::success($product);
    }
}
