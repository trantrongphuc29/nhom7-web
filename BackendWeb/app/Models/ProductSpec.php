<?php

namespace App\Models;

<<<<<<< HEAD
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ProductSpec extends Model
{
    public $timestamps = false;

=======
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSpec extends Model
{
>>>>>>> 3746f909bc8920b3880178962dc77da94e19005b
    protected $fillable = [
        'product_id',
        'spec_key',
        'spec_value',
    ];

<<<<<<< HEAD
=======
    // Quan hệ ngược lại với Product
>>>>>>> 3746f909bc8920b3880178962dc77da94e19005b
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> 3746f909bc8920b3880178962dc77da94e19005b
