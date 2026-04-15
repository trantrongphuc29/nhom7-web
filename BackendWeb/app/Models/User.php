<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Danh sách các cột có thể chèn dữ liệu
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password_hash', // Dùng tên cột của Hoàng
        'role',
        'status',
        'loyalty_points'
    ];

    /**
     * Các trường cần ẩn khi API trả về dữ liệu
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected function casts(): array
    {
        return [
            // Không để 'hashed' ở đây để tránh lỗi băm mật khẩu 2 lần như hồi nãy
        ];
    }

    /**
     * Quan trọng: Báo cho Laravel biết mật khẩu nằm ở cột password_hash
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // =========================================================================
    // CÁC PHƯƠNG THỨC BẮT BUỘC CỦA JWT
    // =========================================================================

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role, // Lưu role vào token cho tiện kiểm tra quyền
        ];
    }
}