<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, min(100, (int) $request->query('limit', 10)));

        $query = User::query()
            ->where('role', 'user')
            ->select(['id', 'full_name', 'email', 'phone', 'status', 'loyalty_points']);

        $paginator = $query
            ->orderByDesc('id')
            ->paginate($limit, ['*'], 'page', $page);

        $userIds = collect($paginator->items())->pluck('id')->all();

        $spentByUserId = empty($userIds)
            ? collect()
            : DB::table('orders')
                ->selectRaw('user_id, COALESCE(SUM(total_amount), 0) as total_spent')
                ->whereIn('user_id', $userIds)
                ->groupBy('user_id')
                ->pluck('total_spent', 'user_id');

        $records = collect($paginator->items())->map(function (User $user) use ($spentByUserId) {
            return [
                'id' => $user->id,
                'fullName' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'loyaltyPoints' => (int) $user->loyalty_points,
                'totalSpent' => (int) ($spentByUserId[$user->id] ?? 0),
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

    public function updateStatus(Request $request, int $id)
    {
        $payload = $request->validate([
            'status' => ['required', 'in:active,blocked'],
        ]);

        $user = User::query()
            ->where('role', 'user')
            ->find($id);

        if (!$user) {
            return ApiResponse::error('Customer not found', 404);
        }

        $user->status = $payload['status'];
        $user->save();

        return ApiResponse::success([
            'id' => $user->id,
            'status' => $user->status,
        ], 'Customer status updated');
    }
}
