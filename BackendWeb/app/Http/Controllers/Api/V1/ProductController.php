<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\ApiResponse;

class ProductController extends Controller
{
    public function index()
    {
        $query = Product::query()->with(['images', 'specs']);

        if ($keyword = trim((string) request('keyword', ''))) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('short_description', 'like', "%{$keyword}%")
                    ->orWhere('detail_html', 'like', "%{$keyword}%")
                    ->orWhereHas('specs', function ($specQuery) use ($keyword) {
                        $specQuery->where('spec_value', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($status = request('status')) {
            $query->where('status', $status);
        }

        if ($brand = trim((string) request('brand', ''))) {
            $brandValues = collect(explode(',', $brand))
                ->map(fn ($item) => trim($item))
                ->filter();

            if ($brandValues->isNotEmpty()) {
                $query->where(function ($q) use ($brandValues) {
                    $q->where(function ($nameQuery) use ($brandValues) {
                        foreach ($brandValues as $value) {
                            $nameQuery->orWhere('name', 'like', "%{$value}%");
                        }
                    });
                });
            }
        }

        foreach (['cpu', 'ram', 'storage'] as $specKey) {
            if ($specValue = trim((string) request($specKey, ''))) {
                $query->whereHas('specs', function ($specQuery) use ($specKey, $specValue) {
                    $specQuery->where('spec_key', $specKey)
                        ->where('spec_value', 'like', "%{$specValue}%");
                });
            }
        }

        if ($minPrice = request('minPrice')) {
            if (is_numeric($minPrice)) {
                $query->where('sale_price', '>=', (int) $minPrice);
            }
        }

        if ($maxPrice = request('maxPrice')) {
            if (is_numeric($maxPrice)) {
                $query->where('sale_price', '<=', (int) $maxPrice);
            }
        }

        if ($priceRanges = trim((string) request('priceRanges', ''))) {
            $ranges = collect(explode(',', $priceRanges))
                ->map(fn ($range) => trim($range))
                ->filter()
                ->map(function ($range) {
                    if (preg_match('/^(\d+)\s*-\s*(\d+)$/', $range, $matches)) {
                        return [
                            'min' => (int) $matches[1],
                            'max' => (int) $matches[2],
                        ];
                    }
                    return null;
                })
                ->filter();

            if ($ranges->isNotEmpty()) {
                $query->where(function ($rangeQuery) use ($ranges) {
                    foreach ($ranges as $range) {
                        $rangeQuery->orWhereBetween('sale_price', [$range['min'], $range['max']]);
                    }
                });
            }
        }

        $records = $query->orderByDesc('id')->paginate((int) request('per_page', 20));
        return ApiResponse::success([
            'records' => collect($records->items())->map(fn (Product $product) => $this->transformProduct($product))->all(),
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
        $product = Product::with(['images', 'specs'])->find($id);
        if (!$product) {
            return ApiResponse::error('Product not found', 404);
        }

        return ApiResponse::success($this->transformProduct($product));
    }

    private function transformProduct(Product $product): array
    {
        $data = $product->toArray();
        $specs = $this->normalizeSpecs($product->specs->toArray());
        $data['specs'] = $specs;
        $data['cpu'] = $data['cpu'] ?? ($specs['cpu'] ?? null);
        $data['gpu_onboard'] = $data['gpu_onboard'] ?? ($specs['gpu_onboard'] ?? null);
        $data['gpu_discrete'] = $data['gpu_discrete'] ?? ($specs['gpu_discrete'] ?? null);
        $data['ram'] = $data['ram'] ?? ($specs['ram'] ?? null);
        $data['ram_max'] = $data['ram_max'] ?? ($specs['ram_max'] ?? null);
        $data['storage'] = $data['storage'] ?? ($specs['storage'] ?? null);
        $data['storage_max'] = $data['storage_max'] ?? ($specs['storage_max'] ?? null);
        $data['screen_size'] = $data['screen_size'] ?? ($specs['screen_size'] ?? null);
        $data['screen_resolution'] = $data['screen_resolution'] ?? ($specs['screen_resolution'] ?? null);
        $data['screen_technology'] = $data['screen_technology'] ?? ($specs['screen_technology'] ?? null);
        $data['ports'] = $data['ports'] ?? ($specs['ports'] ?? null);
        $data['battery'] = $data['battery'] ?? ($specs['battery'] ?? null);
        $data['dimensions'] = $data['dimensions'] ?? ($specs['dimensions'] ?? null);
        $data['weight'] = $data['weight'] ?? ($specs['weight'] ?? null);
        $data['material'] = $data['material'] ?? ($specs['material'] ?? null);
        $data['wireless'] = $data['wireless'] ?? ($specs['wireless'] ?? null);
        $data['webcam'] = $data['webcam'] ?? ($specs['webcam'] ?? null);
        $data['os'] = $data['os'] ?? ($specs['os'] ?? null);

        $data['image'] = $data['image'] ?? $product->images->first()?->url;
        $data['min_price'] = $data['min_price'] ?? $product->sale_price;
        $data['min_discount'] = $data['min_discount'] ?? ($product->original_price > 0 && $product->sale_price < $product->original_price ? round((($product->original_price - $product->sale_price) / $product->original_price) * 100) : 0);
        $data['stock'] = $data['stock'] ?? $product->stock_quantity;

        return $data;
    }

    private function normalizeSpecs(array $specs): array
    {
        $result = [];
        foreach ($specs as $spec) {
            $key = $this->normalizeSpecKey((string) ($spec['spec_key'] ?? ''));
            if ($key === '') {
                continue;
            }
            $result[$key] = $spec['spec_value'] ?? null;
        }
        return $result;
    }

    private function normalizeSpecKey(string $key): string
    {
        $normalized = mb_strtolower(trim($key), 'UTF-8');
        $normalized = str_replace([
            'á','à','ả','ã','ạ','â','ấ','ầ','ẩ','ẫ','ậ','ă','ắ','ằ','ẳ','ẵ','ặ',
            'é','è','ẻ','ẽ','ẹ','ê','ế','ề','ể','ễ','ệ',
            'í','ì','ỉ','ĩ','ị',
            'ó','ò','ỏ','õ','ọ','ô','ố','ồ','ổ','ỗ','ộ','ơ','ớ','ờ','ở','ỡ','ợ',
            'ú','ù','ủ','ũ','ụ','ư','ứ','ừ','ử','ữ','ự',
            'ý','ỳ','ỷ','ỹ','ỵ','đ',
        ], [
            'a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a',
            'e','e','e','e','e','e','e','e','e','e','e',
            'i','i','i','i','i',
            'o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o',
            'u','u','u','u','u','u','u','u','u','u','u','u','u','u','u','y','y','y','y','y','d',
        ], $normalized);
        $normalized = preg_replace('/[^a-z0-9]+/', '_', $normalized);
        $normalized = trim($normalized, '_');

        $map = [
            'gpu_do_hoa_onboard' => 'gpu_onboard',
            'gpu_onboard' => 'gpu_onboard',
            'card_do_hoa_onboard' => 'gpu_onboard',
            'gpu_roi' => 'gpu_discrete',
            'gpu_do_hoa_roi' => 'gpu_discrete',
            'gpu_discrete' => 'gpu_discrete',
            'ram' => 'ram',
            'ram_max' => 'ram_max',
            'ram_toi_da' => 'ram_max',
            'o_cung' => 'storage',
            'o_toi_da' => 'storage_max',
            'storage' => 'storage',
            'storage_max' => 'storage_max',
            'kich_thuoc_man_hinh' => 'screen_size',
            'man_hinh' => 'screen_resolution',
            'do_phan_giai' => 'screen_resolution',
            'cong_nghe_man_hinh' => 'screen_technology',
            'cong_ket_noi' => 'ports',
            'pin' => 'battery',
            'kich_thuoc' => 'dimensions',
            'trong_luong' => 'weight',
            'chat_lieu' => 'material',
            'ket_noi_khong_day' => 'wireless',
            'webcam' => 'webcam',
            'os' => 'os',
            'he_dieu_hanh' => 'os',
            'cpu' => 'cpu',
        ];

        return $map[$normalized] ?? $normalized;
    }
}
