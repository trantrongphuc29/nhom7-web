<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        // Bổ sung load thêm 'specs' bên cạnh 'images'
        $query = Product::query()->with(['images', 'specs']);
        
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
        // Bổ sung load thêm 'specs'
        $product = Product::with(['images', 'specs'])->find($id);
        
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }
        return ApiResponse::success($product);
    }

    // ==========================================
    // CÁC HÀM BỔ SUNG CHO TÁC VỤ QUẢN TRỊ (ADMIN)
    // ==========================================

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sale_price' => 'required|integer|min:0',
            'original_price' => 'required|integer|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive,out_of_stock,coming_soon',
            'short_description' => 'nullable|string',
            'detail_html' => 'nullable|string',
            'specs' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        try {
            return DB::transaction(function () use ($data) {
                // 1. Tạo sản phẩm
                $product = Product::create($data);

                // 2. Tạo Specs
                if (!empty($data['specs'])) {
                    foreach ($data['specs'] as $key => $value) {
                        $product->specs()->create([
                            'spec_key' => $key,
                            'spec_value' => $value
                        ]);
                    }
                }

                // 3. Tạo Images
                if (!empty($data['images'])) {
                    foreach ($data['images'] as $index => $img) {
                        $product->images()->create([
                            'url' => is_array($img) ? $img['url'] : $img,
                            'sort_order' => $index + 1,
                            'is_primary' => $index === 0 ? 1 : 0
                        ]);
                    }
                }

                $product->load(['specs', 'images']);
                return ApiResponse::success($product, 'Tạo sản phẩm thành công');
            });
        } catch (\Exception $e) {
            return ApiResponse::error('Lỗi khi tạo sản phẩm: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, int $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }

        $data = $request->all();

        try {
            return DB::transaction(function () use ($product, $data) {
                // 1. Cập nhật thông tin cơ bản
                $product->update($data);

                // 2. Cập nhật Specs (Xóa cũ, thêm mới)
                if (isset($data['specs'])) {
                    $product->specs()->delete();
                    foreach ($data['specs'] as $key => $value) {
                        $product->specs()->create([
                            'spec_key' => $key,
                            'spec_value' => $value
                        ]);
                    }
                }

                // 3. Cập nhật Images (Xóa cũ, thêm mới)
                if (isset($data['images'])) {
                    $product->images()->delete();
                    foreach ($data['images'] as $index => $img) {
                        $product->images()->create([
                            'url' => is_array($img) ? $img['url'] : $img,
                            'sort_order' => $index + 1,
                            'is_primary' => $index === 0 ? 1 : 0
                        ]);
                    }
                }

                $product->load(['specs', 'images']);
                return ApiResponse::success($product, 'Cập nhật sản phẩm thành công');
            });
        } catch (\Exception $e) {
            return ApiResponse::error('Lỗi khi cập nhật sản phẩm: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(int $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }

        $product->delete();
        return ApiResponse::success(null, 'Đã xóa sản phẩm');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ])['ids'];

        if (empty($ids)) {
            return ApiResponse::error('Danh sách ID không được để trống', 400);
        }

        Product::whereIn('id', $ids)->delete();

        return ApiResponse::success(null, 'Đã xóa ' . count($ids) . ' sản phẩm');
    }
}