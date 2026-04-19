<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
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

    public function index(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, min(100, (int) $request->query('limit', 10)));

        $query = DB::table('orders')->orderByDesc('created_at');

        if ($status = trim((string) $request->query('status', ''))) {
            $query->where('status', $status);
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $records = collect($paginator->items())->map(function ($order) {
            return [
                'id' => (int) $order->id,
                'code' => $order->code,
                'customerName' => $order->ship_recipient_name,
                'customerPhone' => $order->ship_phone,
                'status' => $order->status,
                'totalAmount' => (int) $order->total_amount,
                'createdAt' => $order->created_at,
            ];
        })->values();

        return ApiResponse::success([
            'records' => $records,
            'pagination' => [
                'page' => $paginator->currentPage(),
                'totalPages' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(int $id)
    {
        $order = DB::table('orders')->where('id', $id)->first();

        if (!$order) {
            return ApiResponse::error('Order not found', 404);
        }

        $items = DB::table('order_items')
            ->where('order_id', $id)
            ->orderBy('id')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (int) $item->id,
                    'productName' => $item->product_name,
                    'variantName' => $item->variant_name,
                    'quantity' => (int) $item->quantity,
                    'unitPrice' => (int) $item->unit_price,
                    'lineTotal' => (int) $item->unit_price * (int) $item->quantity,
                ];
            })
            ->values();

        return ApiResponse::success([
            'id' => (int) $order->id,
            'code' => $order->code,
            'customerName' => $order->ship_recipient_name,
            'customerPhone' => $order->ship_phone,
            'customerEmail' => $order->customer_email,
            'status' => $order->status,
            'createdAt' => $order->created_at,
            'subtotalAmount' => (int) $order->subtotal_amount,
            'totalAmount' => (int) $order->total_amount,
            'shippingAddress' => $this->composeShippingAddress($order),
            'items' => $items,
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $payload = $request->validate([
            'status' => ['required', 'in:pending,confirmed,shipping,completed,cancelled'],
        ]);

        $updated = DB::table('orders')
            ->where('id', $id)
            ->update([
                'status' => $payload['status'],
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return ApiResponse::error('Order not found', 404);
        }

        return ApiResponse::success([
            'id' => $id,
            'status' => $payload['status'],
        ], 'Order status updated');
    }
}
