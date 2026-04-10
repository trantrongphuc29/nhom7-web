<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'status' => ['required', 'in:active,inactive,out_of_stock,coming_soon'],
            'sale_price' => ['required', 'integer', 'min:0'],
            'original_price' => ['required', 'integer', 'min:0', 'gte:sale_price'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'short_description' => ['nullable', 'string'],
            'detail_html' => ['nullable', 'string'],
        ];
    }
}
