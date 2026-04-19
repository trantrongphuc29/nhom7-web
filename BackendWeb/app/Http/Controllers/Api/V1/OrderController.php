<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $payload = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.name' => ['nullable', 'string'],
            'items.*.specSummary' => ['nullable', 'string'],
            'shipping' => ['required', 'array'],
            'shipping.shipName' => ['required', 'string', 'max:255'],
            'shipping.shipPhone' => ['required', 'string', 'max:30'],
            'shipping.shipAddress' => ['required', 'string', 'max:1000'],
            'paymentMethod' => ['required', 'in:cod,bank_transfer,card'],
        ]);

        $productIds = collect($payload['items'])
            ->pluck('productId')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $products = DB::table('products')
            ->whereIn('id', $productIds)
            ->get(['id', 'sale_price'])
            ->keyBy('id');

        foreach ($payload['items'] as $item) {
            $pid = (int) $item['productId'];
            if (!$products->has($pid)) {
                return ApiResponse::error('Không tìm thấy sản phẩm #' . $pid, 422);
            }
        }

        $user = $request->user();
        $subtotal = 0;
        $orderCode = 'ODR-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);

        $orderId = DB::transaction(function () use ($payload, $user, &$subtotal, $orderCode, $products) {
            $shipping = $payload['shipping'];
            $line1 = (string) ($shipping['shipAddress'] ?? '');

            $orderId = DB::table('orders')->insertGetId([
                'code' => $orderCode,
                'user_id' => $user?->id,
                'status' => 'pending',
                'payment_method' => $payload['paymentMethod'],
                'subtotal_amount' => 0,
                'shipping_fee' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'ship_recipient_name' => $shipping['shipName'],
                'ship_phone' => $shipping['shipPhone'],
                'ship_line1' => $line1,
                'ship_line2' => null,
                'ship_ward' => null,
                'ship_district' => null,
                'ship_province' => 'N/A',
                'customer_email' => $user?->email,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($payload['items'] as $item) {
                $pid = (int) $item['productId'];
                $unitPrice = (int) $products->get($pid)->sale_price;
                $quantity = (int) $item['quantity'];
                $subtotal += $unitPrice * $quantity;

                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $item['productId'],
                    'product_name' => $item['name'] ?? ('Sản phẩm #' . $item['productId']),
                    'variant_name' => $item['specSummary'] ?? null,
                    'image_url' => null,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                ]);
            }

            DB::table('orders')
                ->where('id', $orderId)
                ->update([
                    'subtotal_amount' => $subtotal,
                    'shipping_fee' => 0,
                    'total_amount' => $subtotal,
                    'updated_at' => now(),
                ]);

            return $orderId;
        });

        return ApiResponse::success([
            'id' => $orderId,
            'orderCode' => $orderCode,
        ], 'Order created', 201);
    }
}
