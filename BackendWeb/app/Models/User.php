<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
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
    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
        ];
    }

    /**
     * Cực kỳ quan trọng: Báo cho Laravel biết mật khẩu nằm ở cột nào
     * Vì mặc định Laravel tìm cột 'password'
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

}