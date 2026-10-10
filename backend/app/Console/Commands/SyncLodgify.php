<?php

namespace App\Console\Commands;

use App\Services\LodgifyService;
use Illuminate\Console\Command;

class SyncLodgify extends Command
{
    protected $signature = 'lodgify:sync {--dry-run : Inspect complete upstream catalog without database writes}';

    protected $description = 'Reconcile the local Lodgify property snapshot';

    public function handle(): int
    {
        if ($this->option('dry-run')) {
            try {
                $catalog = LodgifyService::make()->inspect();
                $this->line("Inspection only: {$catalog['total']} properties, {$catalog['active']} active. No data changed.");
                return self::SUCCESS;
            } catch (\Throwable $error) {
                $this->error('Inspection failed. No data changed. Check connectivity and credentials.');
                return self::FAILURE;
            }
        }
        $run = LodgifyService::make()->syncAll();
        $this->line("Lodgify sync {$run->status}: {$run->total_count} properties");

        return $run->succeeded() ? self::SUCCESS : self::FAILURE;
    }
}
