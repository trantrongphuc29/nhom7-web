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
<<<<<<< HEAD

    public function specs(): HasMany
    {
=======
    
    public function specs(){
>>>>>>> 3746f909bc8920b3880178962dc77da94e19005b
        return $this->hasMany(ProductSpec::class);
    }
}
