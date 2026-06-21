<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class BaliCollection extends Model
{
    protected static function booted(): void
    {
        $flush = fn () => Cache::forget('cms.bali-collections');
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'collection_id',
        'location',
        'category',
        'tag',
        'moods',
        'description',
        'highlights',
        'best_for',
        'facts',
        'villa_count',
        'price',
        'cta',
        'href',
        'image',
        'image_alt',
        'gallery_images',
        'lifestyle_pillars',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'moods' => 'json',
        'highlights' => 'json',
        'best_for' => 'json',
        'facts' => 'json',
        'gallery_images' => 'json',
        'lifestyle_pillars' => 'json',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
