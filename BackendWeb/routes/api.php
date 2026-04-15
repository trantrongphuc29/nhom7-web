<?php

use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Account routes (profile, password, addresses)
        Route::prefix('account')->group(function () {
            Route::get('/profile', [\App\Http\Controllers\Api\V1\Account\ProfileController::class, 'profile']);
            Route::patch('/profile', [\App\Http\Controllers\Api\V1\Account\ProfileController::class, 'update']);
            Route::post('/password', [\App\Http\Controllers\Api\V1\Account\ProfileController::class, 'changePassword']);

            Route::get('/addresses', [\App\Http\Controllers\Api\V1\Account\AddressController::class, 'index']);
            Route::post('/addresses', [\App\Http\Controllers\Api\V1\Account\AddressController::class, 'store']);
            Route::patch('/addresses/{id}', [\App\Http\Controllers\Api\V1\Account\AddressController::class, 'update']);
            Route::delete('/addresses/{id}', [\App\Http\Controllers\Api\V1\Account\AddressController::class, 'destroy']);
        });
    });

    // Public Product Routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Admin Routes
    Route::prefix('admin')->middleware(['jwt.auth', 'role:admin,staff'])->group(function () {
        
        // Upload
        Route::post('/uploads/images', [AdminUploadController::class, 'image']);

        // Admin Product Routes
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        
        // CẢNH BÁO: Phải đặt route tĩnh (bulk-delete) TRƯỚC route động ({id})
        Route::delete('/products/bulk-delete', [AdminProductController::class, 'bulkDelete']);
        
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    });
});