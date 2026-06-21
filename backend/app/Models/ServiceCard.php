<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ServiceCard extends Model
{
    protected static function booted(): void
    {
        $flush = fn (ServiceCard $row) => Cache::forget("cms.service-cards.{$row->category}");
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'category',
        'title',
        'text',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
