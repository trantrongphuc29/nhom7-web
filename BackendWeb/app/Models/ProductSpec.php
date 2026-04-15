<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSpec extends Model
{
    protected $fillable = [
        'product_id',
        'spec_key',
        'spec_value',
    ];

    // Quan hệ ngược lại với Product
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}