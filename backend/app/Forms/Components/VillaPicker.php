<?php

namespace App\Forms\Components;

use App\Models\VillaCache;
use Filament\Forms\Components\Field;

class VillaPicker extends Field
{
    protected string $view = 'filament.forms.components.villa-picker';

    public function getVillas(): array
    {
        return VillaCache::query()
            ->orderBy('name')
            ->get(['lodgify_id', 'name', 'thumbnail_url', 'bedrooms', 'max_guests', 'location'])
            ->map(fn (VillaCache $v) => [
                'id' => $v->lodgify_id,
                'name' => $v->name,
                'thumbnail' => $v->thumbnail_url,
                'bedrooms' => $v->bedrooms,
                'max_guests' => $v->max_guests,
                'location' => $v->location,
            ])
            ->values()
            ->all();
    }

    public function getBedroomBuckets(): array
    {
        return [1, 2, 3, 4, 5];
    }
}
