<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PageSection extends Model
{
    protected static function booted(): void
    {
        $flush = function (PageSection $row) {
            Cache::forget("cms.page.{$row->page}");
            Cache::forget("cms.page.{$row->page}.{$row->section}");
        };
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'page',
        'section',
        'content',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'content' => 'json',
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

    public static function getSection(string $page, string $section): ?array
    {
        $row = static::active()->onPage($page)->where('section', $section)->first();

        return $row?->content;
    }
}
