<?php

namespace App\Support;

class AssetUrl
{
    /**
     * Keys whose string values are treated as media paths and resolved to absolute URLs.
     */
    public const MEDIA_KEYS = [
        'image', 'image_url', 'images',
        'hero_image', 'heroImage',
        'poster', 'poster_image', 'video_poster',
        'video', 'video_url', 'videoUrl',
        'avatar', 'author_avatar', 'authorAvatar',
        'thumbnail', 'thumbnail_url',
        'background', 'background_image', 'bg_image',
        'src', 'cover', 'cover_image',
        'gallery_images', 'galleryImages',
        'logo', 'icon',
    ];

    public static function resolve(?string $value): ?string
    {
        if ($value === null || $value === '') return $value;

        $value = trim($value);

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
