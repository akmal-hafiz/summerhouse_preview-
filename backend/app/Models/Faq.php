<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Faq extends Model
{
    protected static function booted(): void
    {
        $flush = fn (Faq $row) => Cache::forget("cms.faqs.{$row->page}");
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'page',
        'question',
        'answer',
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

    // Named onPage (not forPage) — scopeForPage would shadow the query
    // builder's internal forPage() and silently break paginate().
    public function scopeOnPage(Builder $query, string $page): Builder
    {
        return $query->where('page', $page);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
