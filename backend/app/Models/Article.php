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

        static::saving(function (Article $row) {
            if (empty($row->read_time)) {
                $words = 0;
                foreach ((array) $row->content as $block) {
                    if (in_array($block['type'] ?? null, ['paragraph', 'heading', 'subheading', 'quote'], true)) {
                        $words += str_word_count((string) ($block['text'] ?? ''));
                    }
                }
                $minutes = max(1, (int) ceil($words / 220));
                $row->read_time = "{$minutes} min read";
            }
        });

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
