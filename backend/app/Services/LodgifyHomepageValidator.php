<?php

namespace App\Services;

use App\Models\HomepageVillaSelection;
use App\Models\LodgifyIncident;
use App\Models\LodgifySyncRun;
use App\Models\VillaCache;

class LodgifyHomepageValidator
{
    public function __construct(protected LodgifyIncidentService $incidents) {}

    public function validate(?LodgifySyncRun $run = null): array
    {
        $invalid = [];
        HomepageVillaSelection::query()->get()->each(function (HomepageVillaSelection $selection) use (&$invalid, $run) {
            $villa = VillaCache::where('lodgify_id', $selection->lodgify_property_id)->first();
            $invalidStatus = ! $villa
                || $villa->management_status === VillaCache::MANAGEMENT_REMOVED
                || $villa->lodgify_status === VillaCache::STATUS_MISSING;
            $referenceKey = "{$selection->slot}:{$selection->lodgify_property_id}";

            if ($invalidStatus) {
                $invalid[] = [
                    'slot' => $selection->slot,
                    'lodgify_id' => $selection->lodgify_property_id,
                    'name' => $villa?->name,
                    'status' => $villa?->management_status === VillaCache::MANAGEMENT_REMOVED ? VillaCache::MANAGEMENT_REMOVED : ($villa?->lodgify_status ?? 'unknown'),
                ];
                $this->incidents->open(
                    'homepage_reference',
                    LodgifyIncident::SEVERITY_CRITICAL,
                    'Homepage villa needs an automatic fallback',
                    "{$selection->slot} references villa {$selection->lodgify_property_id}, which is not publicly eligible.",
                    ['slot' => $selection->slot],
                    (string) $selection->lodgify_property_id,
                    'homepage_selection',
                    $referenceKey,
                    $run,
                );

                return;
            }

            $this->incidents->resolve('homepage_reference', (string) $selection->lodgify_property_id, 'homepage_selection', $referenceKey);
        });

        return $invalid;
    }
}
