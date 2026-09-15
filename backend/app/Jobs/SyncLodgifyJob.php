<?php

namespace App\Jobs;

use App\Services\LodgifyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncLodgifyJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $uniqueFor = 600;

    public int $tries = 1;

    public function uniqueId(): string
    {
        return 'lodgify-full-sync';
    }

    public function handle(): void
    {
        LodgifyService::make()->syncAll();
    }
}
