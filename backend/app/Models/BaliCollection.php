<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BaliCollection extends Model
{
    protected static function booted(): void
    {
        $flush = fn () => Cache::forget('cms.bali-collections');

        static::saving(function (BaliCollection $row) {
            $location = trim((string) $row->location);

            if (empty($row->collection_id) && $location !== '') {
                $row->collection_id = Str::slug($location);
            }

            if ($location !== '') {
                $row->href = '/villas?location=' . rawurlencode($location);
            }

            if (empty($row->cta) && $location !== '') {
                $row->cta = "Explore Villas in {$location}";
            }

            if (empty($row->image_alt) && $location !== '') {
                $row->image_alt = "Summerhouses villas in {$location}";
            }

            if (empty($row->tag) && !empty($row->category)) {
                $row->tag = $row->category;
            }
        });

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
