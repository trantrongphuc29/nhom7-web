<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreProductRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Support\ApiResponse;

class ProductController extends Controller
{
    public function index()
    {
        $records = Product::query()->with('images')->orderByDesc('id')->paginate((int) request('per_page', 20));
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

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());
        return ApiResponse::success($product, 'Product created', 201);
    }

    public function show(int $id)
    {
        $product = Product::with('images')->find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }
        return ApiResponse::success($product);
    }

    public function update(UpdateProductRequest $request, int $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }
        $product->update($request->validated());
        return ApiResponse::success($product->fresh(), 'Product updated');
    }

    public function destroy(int $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }
        $product->delete();
        return ApiResponse::success(null, 'Product deleted');
    }

    public function bulkDelete()
    {
        $ids = collect(request('ids', []))->map(fn ($id) => (int) $id)->filter()->values();
        Product::query()->whereIn('id', $ids)->delete();
        return ApiResponse::success(['deleted_ids' => $ids], 'Bulk delete completed');
    }
}
