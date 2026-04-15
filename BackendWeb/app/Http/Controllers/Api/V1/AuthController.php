<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Models\User;
use App\Services\JwtService;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'full_name' => $request->string('full_name')->value(),
            'email' => $request->string('email')->lower()->value(),
            'phone' => $request->input('phone'),
            // CHÚ Ý: Đổi thành password_hash. 
            // KHÔNG dùng Hash::make vì Model User đã có casts 'hashed' tự động làm việc này.
            'password_hash' => $request->string('password')->value(), 
            'role' => 'user',
            'status' => 'active',
            'loyalty_points' => 0,
        ]);

        $token = app(JwtService::class)->makeToken($user);
        return ApiResponse::success([
            'token' => $token,
            'user' => $user,
        ], 'Register successful', 201);
    }

    public function login(LoginRequest $request)
    {
        $email = $request->string('email')->lower()->value();
        $user = User::where('email', $email)->first();

        // CHÚ Ý: Phải kiểm tra cột 'password_hash' thay vì 'password'
        if (!$user || !Hash::check($request->string('password')->value(), $user->password_hash)) {
            return ApiResponse::error('Invalid credentials', 401);
        }

        $token = app(JwtService::class)->makeToken($user);
        return ApiResponse::success([
            'token' => $token,
            'user' => $user,
        ], 'Login successful');
    }

    public function me()
    {
        return ApiResponse::success(request()->user());
    }

    public function logout()
    {
        return ApiResponse::success(null, 'Logout successful');
    }
}