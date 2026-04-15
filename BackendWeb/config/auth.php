<?php

use App\Models\User;

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | Ở đây chúng ta đổi mặc định sang 'api' để Laravel biết là 
    | ứng dụng này ưu tiên xác thực qua Token thay vì Session.
    |
    */

    'defaults' => [
        'guard' => 'api', 
        'passwords' => 'users',
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Đây là phần quan trọng nhất: Khai báo guard 'api' sử dụng driver 'jwt'.
    |
    */

   'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

<<<<<<< HEAD
        'api' => [
            'driver' => 'jwt', // Phải có dòng này thì JWT mới chạy
=======
        // BẠN COPY VÀ PASTE THÊM ĐOẠN NÀY VÀO NHÉ
        'api' => [
            'driver' => 'jwt',
>>>>>>> 9f13fa83b9401ffead9746ad8b7d81ee236cc391
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => User::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];