<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class HomepageVillaSelection extends Model
{
    protected static function booted(): void
    {
        $flush = fn () => Cache::forget('cms.homepage.villa-selections');
        static::saved($flush);
        static::deleted($flush);
    }

    protected $fillable = [
        'slot',
        'lodgify_property_id',
        'sort_order',
        'override_title',
        'override_description',
    ];

    public function scopeForSlot(Builder $query, string $slot): Builder
    {
        return $query->where('slot', $slot)->orderBy('sort_order');
    }

    public static function getIdsForSlot(string $slot): array
    {
        return static::forSlot($slot)->pluck('lodgify_property_id')->toArray();
    }

    public static function getAllSlots(): array
    {
        $selections = static::orderBy('slot')->orderBy('sort_order')->get();

        $grouped = [];
        foreach ($selections as $selection) {
            $grouped[$selection->slot][] = [
                'lodgify_property_id' => $selection->lodgify_property_id,
                'override_title' => $selection->override_title,
                'override_description' => $selection->override_description,
            ];
        }

        return $grouped;
    }
}
