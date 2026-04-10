<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'url',
        'cloudinary_public_id',
        'sort_order',
        'is_primary',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
