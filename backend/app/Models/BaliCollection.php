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
        $flush = function (BaliCollection $row): void {
            Cache::forget('cms.bali-collections');
            Cache::forget("cms.destination.{$row->collection_id}");
        };

        static::saving(function (BaliCollection $row) {
            $location = trim((string) $row->location);

            if ($location !== '' && (empty($row->collection_id) || !$row->exists)) {
                $row->collection_id = Str::slug($location);
            }

            if ($location !== '') {
                $row->href = '/villas?location=' . rawurlencode(
                    (string) ($row->lodgify_location ?: $location)
                ) . '&match=exact';
            }

            // Kept for compatibility with the original schema. The public
            // destination card is intentionally CTA-free.
            $row->cta = $row->cta ?: 'View destination';

            if (empty($row->image_alt) && $location !== '') {
                $row->image_alt = "Summerhouse destination guide to {$location}";
            }

            if (empty($row->image) && !empty($row->video_poster)) {
                $row->image = $row->video_poster;
            }

            if (empty($row->tag) && !empty($row->category)) {
                $row->tag = $row->category;
            }

            $row->location_key = $row->location_key ?: Str::slug((string) ($row->lodgify_location ?: $location));
            $row->lodgify_location = $row->lodgify_location ?: $location;
            if (empty($row->villa_count)) {
                $count = VillaCache::query()->where('location', $row->lodgify_location)->count();
                $row->villa_count = "{$count} " . ($count === 1 ? 'villa' : 'villas');
            }
            $row->price = $row->price ?: 'Price confirmed at booking';
            $row->eyebrow = $row->eyebrow ?: 'Bali Destination Guide';
            $row->hero_title = $row->hero_title ?: $location;
            $row->introduction = $row->introduction ?: $row->description;
            $row->hero_image = $row->hero_image ?: $row->image;
            $row->related_villas_heading = $row->related_villas_heading ?: "Stay in {$location}";
            $row->seo_title = $row->seo_title ?: "{$location} Guide";
            $row->seo_description = $row->seo_description ?: $row->description;
        });

        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'collection_id',
        'location',
        'location_key',
        'category',
        'tag',
        'status',
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
        'media_type',
        'video',
        'video_poster',
        'mobile_poster',
        'image_alt',
        'media_accessibility_label',
        'gallery_images',
        'lifestyle_pillars',
        'eyebrow',
        'hero_title',
        'introduction',
        'hero_media_type',
        'hero_image',
        'hero_video',
        'hero_video_poster',
        'editorial_gallery',
        'editorial_chapters',
        'related_journal_tags',
        'lodgify_location',
        'show_related_villas',
        'related_villas_heading',
        'manual_villa_overrides',
        'seo_title',
        'seo_description',
        'social_image',
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
        'editorial_gallery' => 'json',
        'editorial_chapters' => 'json',
        'related_journal_tags' => 'json',
        'manual_villa_overrides' => 'json',
        'show_related_villas' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
