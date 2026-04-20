<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreProductRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $validated = $request->validated();
        $attributes = collect($validated)->except(['specs', 'images'])->all();
        $specs = $request->input('specs');
        $images = $request->input('images');

        return DB::transaction(function () use ($attributes, $specs, $images) {
            $product = Product::create($attributes);
            $this->syncProductSpecs($product, $specs);
            $this->syncProductImages($product, $images);

            return ApiResponse::success($product->fresh(['specs', 'images']), 'Product created', 201);
        });
    }

    public function show(int $id)
    {
        $product = Product::with(['specs', 'images'])->find($id);
        if (! $product) {
            return ApiResponse::error('Product not found', 404);
        }

        return ApiResponse::success($product);
    }

    public function update(UpdateProductRequest $request, int $id)
    {
        $product = Product::query()->find($id);
        if (! $product) {
            return ApiResponse::error('Product not found', 404);
        }

        $validated = $request->validated();
        $attributes = collect($validated)->except(['specs', 'images'])->all();

        return DB::transaction(function () use ($request, $product, $attributes) {
            if ($attributes !== []) {
                $product->update($attributes);
            }

            if ($request->exists('specs')) {
                $this->syncProductSpecs($product, $request->input('specs'));
            }
            if ($request->exists('images')) {
                $this->syncProductImages($product, $request->input('images'));
            }

            return ApiResponse::success($product->fresh(['specs', 'images']), 'Product updated');
        });
    }

    public function destroy(int $id)
    {
        $product = Product::find($id);
        if (! $product) {
            return ApiResponse::error('Product not found', 404);
        }
        $product->delete();

        return ApiResponse::success(null, 'Product deleted');
    }

    public function bulkDelete(Request $request)
    {
        $ids = collect($request->input('ids', []))->map(fn ($id) => (int) $id)->filter()->values();
        Product::query()->whereIn('id', $ids)->delete();

        return ApiResponse::success(['deleted_ids' => $ids], 'Bulk delete completed');
    }

    private function syncProductSpecs(Product $product, mixed $specs): void
    {
        if (! is_array($specs)) {
            return;
        }

        $product->specs()->delete();

        foreach ($specs as $key => $value) {
            if (! is_string($key) || $key === '') {
                continue;
            }
            if ($value === null) {
                continue;
            }
            $str = is_scalar($value) ? (string) $value : json_encode($value, JSON_UNESCAPED_UNICODE);
            $str = mb_substr(trim($str), 0, 500);
            if ($str === '') {
                continue;
            }

            $product->specs()->create([
                'spec_key' => mb_substr($key, 0, 100),
                'spec_value' => $str,
            ]);
        }
    }

    private function syncProductImages(Product $product, mixed $images): void
    {
        if (! is_array($images)) {
            return;
        }

        $product->images()->delete();

        $urls = [];
        foreach ($images as $img) {
            if (is_string($img) && $img !== '') {
                $urls[] = mb_substr($img, 0, 1024);
            } elseif (is_array($img) && isset($img['url']) && is_string($img['url']) && $img['url'] !== '') {
                $urls[] = mb_substr($img['url'], 0, 1024);
            }
        }

        $urls = array_values(array_unique(array_filter($urls)));

        foreach ($urls as $index => $url) {
            $product->images()->create([
                'url' => $url,
                'sort_order' => $index + 1,
                'is_primary' => $index === 0 ? 1 : 0,
            ]);
        }
    }
}
