<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'status',
        'sale_price',
        'original_price',
        'stock_quantity',
        'short_description',
        'detail_html',
    ];

    public function images() {
        return $this->hasMany(ProductImage::class);
    }
    
    public function specs(){
        return $this->hasMany(ProductSpec::class);
    }
}
