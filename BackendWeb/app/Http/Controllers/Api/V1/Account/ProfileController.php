<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function profile()
    {
        return ApiResponse::success(request()->user());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        $user = request()->user();
        $user->fill($data);
        $user->save();

        return ApiResponse::success($user, 'Profile updated');
    }

    public function changePassword(Request $request)
    {
        $payload = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6'],
        ]);

        $user = request()->user();
        if (!Hash::check($payload['current_password'], $user->password)) {
            return ApiResponse::error('Invalid current password', 401);
        }

        $user->password = Hash::make($payload['new_password']);
        $user->save();

        return ApiResponse::success(null, 'Password updated');
    }
}
