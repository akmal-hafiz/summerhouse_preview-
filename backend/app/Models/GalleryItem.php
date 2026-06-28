<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class GalleryItem extends Model
{
    protected static function booted(): void
    {
        $flush = fn () => Cache::forget('cms.gallery');

        static::creating(function (GalleryItem $row) {
            if (empty($row->label)) {
                $next = (int) static::max('sort_order') + 1;
                $row->label = str_pad((string) $next, 2, '0', STR_PAD_LEFT);
                if (empty($row->sort_order)) {
                    $row->sort_order = $next;
                }
            }
        });

        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'type',
        'src',
        'alt',
        'label',
        'title',
        'text',
        'video_url',
        'video_poster',
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

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
