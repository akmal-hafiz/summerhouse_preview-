<?php

namespace App\Http\Requests;

use App\Models\Testimonial;
use App\Models\VillaCache;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PublicReviewSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lodgify_property_id' => [
                'required',
                'string',
                Rule::exists(VillaCache::class, 'lodgify_id'),
            ],
            'author' => ['required', 'string', 'min:2', 'max:120'],
            'reviewer_email' => ['nullable', 'email', 'max:180'],
            'location' => ['nullable', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:180'],
            'text' => ['required', 'string', 'min:20', 'max:4000'],
            'stars' => ['required', 'integer', 'between:1,5'],
            'stay_date' => ['nullable', 'date', 'before_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'text.min' => 'Please share at least 20 characters about your stay.',
            'stars.between' => 'Rating must be between 1 and 5.',
            'lodgify_property_id.exists' => 'This villa is no longer available.',
        ];
    }

    public function toReviewPayload(): array
    {
        $villa = VillaCache::where('lodgify_id', $this->input('lodgify_property_id'))->first();

        return [
            'villa_cache_id' => $villa?->id,
            'page' => 'villa',
            'author' => $this->input('author'),
            'reviewer_email' => $this->input('reviewer_email'),
            'location' => $this->input('location'),
            'title' => $this->input('title'),
            'text' => $this->input('text'),
            'stars' => $this->input('stars'),
            'stay_date' => $this->input('stay_date'),
            'source' => Testimonial::SOURCE_GUEST_SUBMISSION,
        ];
    }
}
