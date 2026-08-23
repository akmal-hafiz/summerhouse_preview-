<?php

namespace App\Services\Media;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use RuntimeException;

class ImageProcessor
{
    public function process(Media $media): void
    {
        if ($media->isReady()) return;
        if (!$media->source_path) {
            throw new RuntimeException('Media source path is missing.');
        }

        $stagingDisk = Storage::disk((string) config('media.staging_disk', 'local'));
        if (!$stagingDisk->exists($media->source_path)) {
            throw new RuntimeException('Media staging file is missing.');
        }

        $media->forceFill(['status' => 'processing', 'error_message' => null])->save();
        $source = $stagingDisk->get($media->source_path);
        $manager = new ImageManager(new Driver());
        $image = $manager->read($source)->orient();
        $max = (int) config('media.output_max_dimension', 2560);
        $image->scaleDown(width: $max, height: $max);
        $encoded = $image->toWebp(quality: (int) config('media.webp_quality', 82));
        $bytes = (string) $encoded;
        $outputChecksum = hash('sha256', $bytes);

        $duplicate = Media::query()
            ->where('id', '!=', $media->id)
            ->where('output_checksum', $outputChecksum)
            ->where('status', 'ready')
            ->first();

        $diskName = (string) config('media.disk', 'public');
        $disk = Storage::disk($diskName);
        $finalPath = $duplicate?->processed_path
            ?: 'uploads/managed/' . substr($outputChecksum, 0, 2) . "/{$outputChecksum}.webp";

        if (!$duplicate) {
            $temporaryPath = "{$finalPath}.processing-{$media->uuid}";
            if (!$disk->put($temporaryPath, $bytes)) {
                throw new RuntimeException('Unable to write processed media.');
            }

            $verification = $manager->read($disk->get($temporaryPath));
            if ($verification->width() < 1 || $verification->height() < 1) {
                $disk->delete($temporaryPath);
                throw new RuntimeException('Processed media verification failed.');
            }

            if ($disk->exists($finalPath)) {
                $disk->delete($temporaryPath);
            } elseif (!$disk->move($temporaryPath, $finalPath)) {
                $disk->delete($temporaryPath);
                throw new RuntimeException('Unable to publish processed media atomically.');
            }
        }

        $media->forceFill([
            'disk' => $diskName,
            'path' => $finalPath,
            'processed_path' => $finalPath,
            'mime_type' => 'image/webp',
            'size' => strlen($bytes),
            'width' => $image->width(),
            'height' => $image->height(),
            'output_checksum' => $outputChecksum,
            'status' => 'ready',
            'processed_at' => now(),
            'error_message' => null,
        ])->save();

        $stagingDisk->delete($media->source_path);
    }
}
