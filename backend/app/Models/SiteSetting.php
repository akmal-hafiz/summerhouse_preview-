<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected static function booted(): void
    {
        $flush = fn (SiteSetting $row) => Cache::forget("cms.setting.{$row->key}");
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'json',
    ];

    public static function getByKey(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        return $setting?->value ?? $default;
    }

    public static function setByKey(string $key, mixed $value): static
    {
        return static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
