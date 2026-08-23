<?php

namespace App\Console\Commands;

use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneManagedMedia extends Command
{
    protected $signature = 'media:prune {--hours=24}';
    protected $description = 'Remove expired managed-media staging files and stale failed records';

    public function handle(): int
    {
        $cutoff = now()->subHours(max(1, (int) $this->option('hours')));
        $staging = Storage::disk((string) config('media.staging_disk', 'local'));
        $count = 0;

        Media::query()
            ->whereIn('status', ['pending', 'failed'])
            ->where('updated_at', '<', $cutoff)
            ->each(function (Media $media) use ($staging, &$count): void {
                if ($media->source_path) $staging->delete($media->source_path);
                if ($media->status === 'pending') {
                    $media->update([
                        'status' => 'failed',
                        'error_message' => 'Processing expired before a queue worker completed the job.',
                    ]);
                }
                $count++;
            });

        $this->info("Pruned {$count} managed media staging records.");
        return self::SUCCESS;
    }
}
