<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $addresses = UserAddress::where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->get();

        return ApiResponse::success($addresses);
    }

    public function store(Request $request)
    {
        $user = request()->user();
        $data = $request->validate([
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'ward' => ['sometimes', 'nullable', 'string', 'max:255'],
            'district' => ['sometimes', 'nullable', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($user, &$data, &$address) {
            if (!empty($data['is_default'])) {
                UserAddress::where('user_id', $user->id)->update(['is_default' => 0]);
            }
            $data['user_id'] = $user->id;
            $address = UserAddress::create($data);
        });

        return ApiResponse::success($address, 'Address created', 201);
    }

    public function update(Request $request, $id)
    {
        $user = request()->user();
        $address = UserAddress::where('id', $id)->where('user_id', $user->id)->first();
        if (!$address) return ApiResponse::error('Address not found', 404);

        $data = $request->validate([
            'recipient_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'line1' => ['sometimes', 'string', 'max:255'],
            'line2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'ward' => ['sometimes', 'nullable', 'string', 'max:255'],
            'district' => ['sometimes', 'nullable', 'string', 'max:255'],
            'province' => ['sometimes', 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($user, $address, $data, &$updated) {
            if (array_key_exists('is_default', $data) && $data['is_default']) {
                UserAddress::where('user_id', $user->id)->update(['is_default' => 0]);
            }
            $address->fill($data);
            $updated = $address->save();
        });

        return ApiResponse::success($address, 'Address updated');
    }

    public function destroy($id)
    {
        $user = request()->user();
        $address = UserAddress::where('id', $id)->where('user_id', $user->id)->first();
        if (!$address) return ApiResponse::error('Address not found', 404);

        $address->delete();
        return ApiResponse::success(null, 'Address deleted');
    }
}
