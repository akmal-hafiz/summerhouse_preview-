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
            ->get(['lodgify_id', 'name', 'thumbnail_url', 'bedrooms', 'max_guests', 'location', 'lodgify_status', 'management_status'])
            ->map(fn (VillaCache $v) => [
                'id' => $v->lodgify_id,
                'name' => $v->name,
                'thumbnail' => $v->thumbnail_url,
                'bedrooms' => $v->bedrooms,
                'max_guests' => $v->max_guests,
                'location' => $v->location,
                'lodgify_status' => $v->lodgify_status,
                'management_status' => $v->management_status,
                'selectable' => $v->isPubliclyEligible(),
                'status_label' => match (true) {
                    $v->management_status === VillaCache::MANAGEMENT_REMOVED => 'No longer managed',
                    $v->lodgify_status === VillaCache::STATUS_INACTIVE => 'Temporarily unavailable',
                    $v->lodgify_status === VillaCache::STATUS_SUSPECTED_MISSING => 'Connection pending',
                    $v->lodgify_status === VillaCache::STATUS_MISSING => 'Missing from Lodgify',
                    default => 'Active',
                },
            ])
            ->values()
            ->all();
    }

    public function getBedroomBuckets(): array
    {
        return [1, 2, 3, 4, 5];
    }
}
