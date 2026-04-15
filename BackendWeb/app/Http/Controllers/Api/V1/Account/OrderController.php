<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private function composeShippingAddress(object $order): string
    {
        return collect([
            $order->ship_line1,
            $order->ship_line2,
            $order->ship_ward,
            $order->ship_district,
            $order->ship_province,
        ])
            ->map(fn ($part) => is_string($part) ? trim($part) : $part)
            ->filter(fn ($part) => !empty($part) && strtoupper((string) $part) !== 'N/A')
            ->implode(', ');
    }

    public function index()
    {
        $user = request()->user();

        $orders = DB::table('orders')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $orderIds = $orders->pluck('id')->all();

        $itemsByOrder = empty($orderIds)
            ? collect()
            : DB::table('order_items')
                ->whereIn('order_id', $orderIds)
                ->orderBy('id')
                ->get()
                ->groupBy('order_id');

        $records = $orders->map(function ($order) use ($itemsByOrder) {
            $items = collect($itemsByOrder[$order->id] ?? [])->map(function ($item) {
                return [
                    'id' => (int) $item->id,
                    'productName' => $item->product_name,
                    'variantName' => $item->variant_name,
                    'quantity' => (int) $item->quantity,
                    'unitPrice' => (int) $item->unit_price,
                    'image' => $item->image_url,
                ];
            })->values();

            return [
                'id' => (int) $order->id,
                'orderCode' => $order->code,
                'status' => $order->status,
                'createdAt' => $order->created_at,
                'shippingAddress' => $this->composeShippingAddress($order),
                'totalAmount' => (int) $order->total_amount,
                'items' => $items,
            ];
        })->values();

        return ApiResponse::success($records);
    }
}
