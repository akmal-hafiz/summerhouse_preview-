<?php

namespace App\Services;

use App\Models\LodgifyIncident;
use App\Models\LodgifySyncRun;
use App\Models\VillaCache;

class LodgifyHealthService
{
    public function snapshot(): array
    {
        $lastSuccessful = LodgifySyncRun::query()
            ->whereIn('status', ['completed', 'completed_with_warnings'])
            ->latest('finished_at')
            ->first();
        $ageMinutes = $lastSuccessful?->finished_at?->diffInMinutes(now());
        $incidents = LodgifyIncident::unresolved()->get();
        $criticalAge = (int) config('services.lodgify.health_critical_age_minutes', 30);
        $healthyAge = (int) config('services.lodgify.health_healthy_age_minutes', 10);

        $status = 'green';
        $reasons = [];
        if (! $lastSuccessful) {
            $status = 'red';
            $reasons[] = 'No successful Lodgify synchronization is available.';
        } elseif ($ageMinutes >= $criticalAge || $incidents->contains('severity', LodgifyIncident::SEVERITY_CRITICAL)) {
            $status = 'red';
            $reasons[] = $ageMinutes >= $criticalAge ? 'Lodgify data is stale.' : 'A critical Lodgify incident is open.';
        } elseif ($ageMinutes >= $healthyAge || $incidents->contains('severity', LodgifyIncident::SEVERITY_WARNING)) {
            $status = 'yellow';
            $reasons[] = $ageMinutes >= $healthyAge ? 'Lodgify data is becoming stale.' : 'A Lodgify warning is open.';
        }

        $counts = VillaCache::query()
            ->where('management_status', VillaCache::MANAGEMENT_MANAGED)
            ->selectRaw('lodgify_status, count(*) as aggregate')
            ->groupBy('lodgify_status')
            ->pluck('aggregate', 'lodgify_status');

        return [
            'status' => $status,
            'reasons' => $reasons,
            'last_successful_sync' => $lastSuccessful,
            'age_minutes' => $ageMinutes,
            'counts' => [
                'active' => (int) ($counts[VillaCache::STATUS_ACTIVE] ?? 0),
                'inactive' => (int) ($counts[VillaCache::STATUS_INACTIVE] ?? 0),
                'suspected_missing' => (int) ($counts[VillaCache::STATUS_SUSPECTED_MISSING] ?? 0),
                'missing' => (int) ($counts[VillaCache::STATUS_MISSING] ?? 0),
                'removed' => VillaCache::where('management_status', VillaCache::MANAGEMENT_REMOVED)->count(),
            ],
            'open_incidents' => $incidents->count(),
            'critical_incidents' => $incidents->where('severity', LodgifyIncident::SEVERITY_CRITICAL)->count(),
        ];
    }
}
