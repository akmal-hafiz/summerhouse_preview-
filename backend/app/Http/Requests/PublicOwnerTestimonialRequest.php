<?php

namespace App\Http\Requests;

use App\Models\VillaCache;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublicOwnerTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'author' => ['required', 'string', 'min:2', 'max:120'],
            'reviewer_email' => ['nullable', 'email', 'max:180'],
            'owner_role' => ['nullable', 'string', 'max:120'],
            'villa_name' => ['nullable', 'string', 'max:160'],
            'lodgify_property_id' => [
                'nullable',
                'string',
                Rule::exists(VillaCache::class, 'lodgify_id'),
            ],
            'text' => ['required', 'string', 'min:20', 'max:4000'],
        ];
    }

    public function messages(): array
    {
        return [
            'text.min' => 'Please share at least 20 characters about your experience.',
        ];
    }

    public function toTestimonialPayload(): array
    {
        $villa = $this->filled('lodgify_property_id')
            ? VillaCache::where('lodgify_id', $this->input('lodgify_property_id'))->first()
            : null;

        return [
            'villa_cache_id' => $villa?->id,
            'author' => $this->input('author'),
            'reviewer_email' => $this->input('reviewer_email'),
            'owner_role' => $this->input('owner_role'),
            // Free-text villa name lands in `location` when no cached villa matches.
            'location' => $villa ? null : $this->input('villa_name'),
            'text' => $this->input('text'),
        ];
    }
}
