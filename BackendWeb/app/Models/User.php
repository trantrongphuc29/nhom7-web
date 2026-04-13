<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// Khai báo thêm thư viện JWT
use Tymon\JWTAuth\Contracts\JWTSubject; 

// Thêm đoạn "implements JWTSubject" vào đây
class User extends Authenticatable implements JWTSubject 
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'full_name', 
        'email', 
        'phone', 
        'password', 
        'role', 
        'status', 
        'loyalty_points'
    ];

    protected $hidden = [
        'password', 
        'remember_token'
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // --- 2 HÀM BẮT BUỘC CỦA JWT ---
    
    /**
     * Lấy ID của user để nhét vào Token
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Thêm các thông tin custom (role, email...) vào Token nếu muốn
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    // ------------------------------

    // Hàm hỗ trợ cột password_hash cũ
    public function getPasswordAttribute()
    {
        return $this->attributes['password_hash'] ?? null;
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password_hash'] = $value;
    }
}