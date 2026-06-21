<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Article extends Model
{
    protected static function booted(): void
    {
        $flush = function (Article $row) {
            Cache::forget('cms.articles');
            Cache::forget("cms.article.{$row->slug}");
        };
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'excerpt',
        'category',
        'date',
        'read_time',
        'hero_image',
        'hero_alt',
        'tags',
        'content',
        'author_name',
        'author_role',
        'author_bio',
        'author_avatar',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'tags' => 'json',
        'content' => 'json',
        'date' => 'date',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderByDesc('date');
    }
}
