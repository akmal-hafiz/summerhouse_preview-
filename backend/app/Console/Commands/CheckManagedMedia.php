<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CheckManagedMedia extends Command
{
    protected $signature = 'media:check';

    protected $description = 'Verify that managed image processing is ready for production';

    public function handle(): int
    {
        $checks = [
            'GD extension' => extension_loaded('gd'),
            'WebP encoding' => function_exists('imagewebp'),
            'Staging disk' => $this->diskIsWritable((string) config('media.staging_disk', 'local')),
            'Published media disk' => $this->diskIsWritable((string) config('media.disk', 'public')),
            'Database queue in production' => !app()->environment('production')
                || config('queue.default') !== 'sync',
        ];

        foreach ($checks as $label => $passed) {
            $this->line(sprintf('%s %s', $passed ? '[OK]' : '[FAIL]', $label));
        }

        if (in_array(false, $checks, true)) {
            $this->error('Managed media is not ready. Fix every failed check before deployment.');
            return self::FAILURE;
        }

        $this->info('Managed media is ready.');
        return self::SUCCESS;
    }

    private function diskIsWritable(string $disk): bool
    {
        $path = 'media/health-check-' . uniqid('', true) . '.txt';

        try {
            if (!Storage::disk($disk)->put($path, 'ok')) {
                return false;
            }

            return Storage::disk($disk)->delete($path);
        } catch (\Throwable) {
            return false;
        }
    }
}
