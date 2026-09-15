<?php

namespace App\Console\Commands;

use App\Models\LodgifyIncident;
use App\Models\LodgifySyncRun;
use Illuminate\Console\Command;

class PruneLodgifyOperations extends Command
{
    protected $signature = 'lodgify:prune-operations {--dry-run : Report counts without deleting operational records}';

    protected $description = 'Prune old Lodgify sync runs and resolved incidents while preserving the audit ledger';

    public function handle(): int
    {
        $syncCutoff = now()->subDays((int) config('services.lodgify.sync_run_retention_days', 90));
        $incidentCutoff = now()->subDays((int) config('services.lodgify.incident_retention_days', 730));
        $syncQuery = LodgifySyncRun::query()->whereNotNull('finished_at')->where('finished_at', '<', $syncCutoff);
        $incidentQuery = LodgifyIncident::query()
            ->where('status', LodgifyIncident::STATUS_RESOLVED)
            ->where('resolved_at', '<', $incidentCutoff);
        $syncCount = $syncQuery->count();
        $incidentCount = $incidentQuery->count();

        if (! $this->option('dry-run')) {
            $syncQuery->delete();
            $incidentQuery->delete();
        }

        $verb = $this->option('dry-run') ? 'Would prune' : 'Pruned';
        $this->info("{$verb} {$syncCount} sync runs and {$incidentCount} resolved incidents. Audit events were preserved.");

        return self::SUCCESS;
    }
}
