<?php

namespace App\Console\Commands;

use App\Services\LodgifyService;
use Illuminate\Console\Command;

class SyncLodgify extends Command
{
    protected $signature = 'lodgify:sync';

    protected $description = 'Reconcile the local Lodgify property snapshot';

    public function handle(): int
    {
        $run = LodgifyService::make()->syncAll();
        $this->line("Lodgify sync {$run->status}: {$run->total_count} properties");

        return $run->succeeded() ? self::SUCCESS : self::FAILURE;
    }
}
