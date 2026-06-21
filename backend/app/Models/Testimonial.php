<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Testimonial extends Model
{
    protected static function booted(): void
    {
        $flush = fn (Testimonial $row) => Cache::forget("cms.testimonials.{$row->page}");
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'page',
        'author',
        'location',
        'stars',
        'text',
        'avatar',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'stars' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForPage(Builder $query, string $page): Builder
    {
        return $query->where('page', $page);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
