<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        Auth::login($user);
        $request->session()->regenerate();

        return ApiResponse::success([
            'user' => $user,
        ], 'Register successful', 201);
    }

    public function login(LoginRequest $request)
    {
        $email = $request->string('email')->lower()->value();
        $user = User::where('email', $email)->first();

        // 1. Kiểm tra Email và Mật khẩu
        if (!$user || !Hash::check($request->string('password')->value(), $user->password_hash)) {
            return ApiResponse::error('Invalid credentials', 401);
        }

        // 2. KIỂM TRA TRẠNG THÁI TÀI KHOẢN (Thêm đoạn này vào)
        if ($user->status === 'blocked') {
            return ApiResponse::error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!', 403);
        }

        // 3. Nếu mọi thứ OK thì mới cho đăng nhập
        Auth::login($user);
        $request->session()->regenerate();

        return ApiResponse::success([
            'user' => $user,
        ], 'Login successful');
    }

    public function me(Request $request)
    {
        return ApiResponse::success($request->user());
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success(null, 'Logout successful');
    }
}