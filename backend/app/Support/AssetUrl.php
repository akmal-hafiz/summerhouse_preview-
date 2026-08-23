<?php

namespace App\Support;

use App\Services\Media\ManagedMediaService;

class AssetUrl
{
    /**
     * Keys whose string values are treated as media paths and resolved to absolute URLs.
     */
    public const MEDIA_KEYS = [
        'image', 'image_url', 'images',
        'hero_image', 'heroImage',
        'poster', 'poster_image', 'video_poster', 'videoPoster',
        'mobile_poster', 'mobilePoster',
        'video', 'video_url', 'videoUrl',
        'avatar', 'author_avatar', 'authorAvatar',
        'thumbnail', 'thumbnail_url',
        'background', 'background_image', 'bg_image',
        'src', 'cover', 'cover_image', 'social_image', 'socialImage',
        'hero_video', 'heroVideo', 'hero_video_poster', 'heroVideoPoster',
        'gallery_images', 'galleryImages',
        'left_images', 'leftImages', 'right_images', 'rightImages',
        'uploaded_images', 'uploadedImages',
        'logo', 'award_logo', 'awardLogo', 'icon',
    ];

    public static function resolve(?string $value): ?string
    {
        if ($value === null || $value === '') return $value;

        $value = trim($value);

        if (str_starts_with($value, ManagedMediaService::REFERENCE_PREFIX)) {
            return app(ManagedMediaService::class)->resolve($value);
        }

        if ($value === '' || preg_match('/[\x00-\x1F\x7F]/', $value)) {
            return null;
        }

        if (str_starts_with($value, '//')) {
            return 'https:' . $value;
        }

        if (preg_match('/^https?:\/\//i', $value)) {
            return $value;
        }

        if (preg_match('/^[a-z][a-z0-9+.-]*:/i', $value)) {
            return null;
        }

        if (str_starts_with($value, '/storage/') || str_starts_with($value, 'storage/')) {
            return rtrim(config('app.url', ''), '/') . '/' . ltrim($value, '/');
        }

        if (str_starts_with($value, '/')) {
            return $value;
        }

        return rtrim(config('app.url', ''), '/') . '/storage/' . ltrim($value, '/');
    }

    public static function walk($data)
    {
        if (is_array($data)) {
            $isList = array_is_list($data);
            $out = [];
            foreach ($data as $k => $v) {
                if ($isList) {
                    $out[$k] = self::walk($v);
                } elseif (in_array($k, self::MEDIA_KEYS, true) && is_string($v)) {
                    $out[$k] = self::resolve($v);
                } elseif (in_array($k, self::MEDIA_KEYS, true) && is_array($v)) {
                    $out[$k] = array_map(fn ($x) => is_string($x) ? self::resolve($x) : self::walk($x), $v);
                } else {
                    $out[$k] = self::walk($v);
                }
            }
            return $out;
        }

        return $data;
    }
}
