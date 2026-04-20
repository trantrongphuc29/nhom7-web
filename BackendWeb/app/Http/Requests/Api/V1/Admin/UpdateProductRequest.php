<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'min:3', 'max:255'],
            'status' => ['sometimes', 'in:active,inactive,out_of_stock,coming_soon'],
            'sale_price' => ['sometimes', 'integer', 'min:0'],
            'original_price' => ['sometimes', 'integer', 'min:0'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'short_description' => ['nullable', 'string'],
            'detail_html' => ['nullable', 'string'],
            'specs' => ['nullable', 'array'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['nullable', 'string', 'max:1024'],
        ];
    }
}
