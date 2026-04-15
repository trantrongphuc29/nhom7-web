<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
<<<<<<< HEAD
use Tymon\JWTAuth\Contracts\JWTSubject; // Interface bắt buộc để dùng JWT

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Danh sách các cột có thể chèn dữ liệu (Mass Assignment)
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password_hash', // Đã đổi tên khớp với DB của bạn
        'role',
        'status',
        'loyalty_points'
    ];

    /**
     * Các trường cần ẩn khi API trả về dữ liệu (Bảo mật)
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Ép kiểu dữ liệu (Casts)
     * Laravel 11 sẽ tự động Hash mật khẩu khi bạn gán giá trị vào 'password_hash'
     */
=======
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

>>>>>>> 9f13fa83b9401ffead9746ad8b7d81ee236cc391
    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
        ];
    }

<<<<<<< HEAD
    /**
     * Cực kỳ quan trọng: Báo cho Laravel biết mật khẩu nằm ở cột nào
     * Vì mặc định Laravel tìm cột 'password'
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // =========================================================================
    // CÁC PHƯƠNG THỨC BẮT BUỘC CỦA JWT
    // =========================================================================

    /**
     * Lấy định danh người dùng (thường là khóa chính ID)
=======
    // --- 2 HÀM BẮT BUỘC CỦA JWT ---
    
    /**
     * Lấy ID của user để nhét vào Token
>>>>>>> 9f13fa83b9401ffead9746ad8b7d81ee236cc391
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
<<<<<<< HEAD
     * Lưu thêm thông tin tùy chỉnh vào bên trong Token (Payload)
     * Ở đây chúng ta lưu 'role' để Middleware có thể kiểm tra quyền Admin/Staff nhanh chóng
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
=======
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
>>>>>>> 9f13fa83b9401ffead9746ad8b7d81ee236cc391
    }
}