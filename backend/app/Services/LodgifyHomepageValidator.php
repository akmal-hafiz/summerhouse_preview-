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
        $hasSafeFallback = VillaCache::publiclyEligible()->exists();
        HomepageVillaSelection::query()->get()->each(function (HomepageVillaSelection $selection) use (&$invalid, $run, $hasSafeFallback) {
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
                    $hasSafeFallback ? LodgifyIncident::SEVERITY_INFO : LodgifyIncident::SEVERITY_CRITICAL,
                    $hasSafeFallback ? 'Homepage villa fallback applied' : 'No safe homepage villa fallback is available',
                    $hasSafeFallback
                        ? "{$selection->slot} references villa {$selection->lodgify_property_id}. A safe active fallback is applied automatically."
                        : "{$selection->slot} references villa {$selection->lodgify_property_id}, and no safe active fallback exists.",
                    ['slot' => $selection->slot, 'automatic_fallback' => $hasSafeFallback],
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
