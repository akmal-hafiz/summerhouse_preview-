<?php

namespace App\Console\Commands;

use App\Models\LodgifyIncident;
use App\Services\LodgifyHealthService;
use App\Services\LodgifyIncidentService;
use Illuminate\Console\Command;

class CheckLodgifyHealth extends Command
{
    protected $signature = 'lodgify:health-check';

    protected $description = 'Evaluate Lodgify data freshness and internal health';

    public function handle(LodgifyHealthService $health, LodgifyIncidentService $incidents): int
    {
        $snapshot = $health->snapshot();
        $age = $snapshot['age_minutes'];
        $criticalAge = (int) config('services.lodgify.health_critical_age_minutes', 30);

        if ($age === null || $age >= $criticalAge) {
            $incidents->open(
                'stale_snapshot',
                LodgifyIncident::SEVERITY_CRITICAL,
                'Lodgify property data is stale',
                $age === null ? 'No successful Lodgify synchronization is available.' : "The last successful synchronization was {$age} minutes ago.",
                ['age_minutes' => $age],
            );
            $this->error('Lodgify health is red.');

            return self::FAILURE;
        }

        $incidents->resolveCategory('stale_snapshot');
        $this->info("Lodgify health is {$snapshot['status']}.");

        return self::SUCCESS;
    }
}
