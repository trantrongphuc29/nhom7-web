<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;

    protected $table = 'user_addresses';

    protected $fillable = [
        'user_id',
        'recipient_name',
        'phone',
        'line1',
        'line2',
        'ward',
        'district',
        'province',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];
}
