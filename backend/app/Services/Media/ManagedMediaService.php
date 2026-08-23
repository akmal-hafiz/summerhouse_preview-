<?php

namespace App\Services\Media;

use App\Jobs\ProcessUploadedImage;
use App\Models\Media;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ManagedMediaService
{
    public const REFERENCE_PREFIX = 'media:';

    public function stage(
        TemporaryUploadedFile $file,
        ?string $fallbackReference = null,
        ?string $batchUuid = null,
    ): string {
        $realPath = $file->getRealPath();
        $mime = (string) mime_content_type($realPath);
        $size = (int) $file->getSize();
        $dimensions = @getimagesize($realPath);

        if (!in_array($mime, config('media.allowed_mime_types', []), true)) {
            throw ValidationException::withMessages([
                'media' => 'Only JPEG, PNG, and WebP images are supported.',
            ]);
        }

        if ($size > ((int) config('media.max_upload_kb', 15360) * 1024)) {
            throw ValidationException::withMessages([
                'media' => 'The image is larger than the 15 MB upload limit.',
            ]);
        }

        if (!$dimensions) {
            throw ValidationException::withMessages([
                'media' => 'The uploaded image could not be decoded.',
            ]);
        }

        [$width, $height] = $dimensions;
        $maxDimension = (int) config('media.max_dimension', 8192);
        $maxPixels = (int) config('media.max_pixels', 40000000);

        if ($width > $maxDimension || $height > $maxDimension || ($width * $height) > $maxPixels) {
            throw ValidationException::withMessages([
                'media' => 'The image dimensions are too large to process safely.',
            ]);
        }

        $checksum = hash_file('sha256', $realPath);
        $processorVersion = (int) config('media.processor_version', 1);
        $existing = Media::query()
            ->where('source_checksum', $checksum)
            ->where('processor_version', $processorVersion)
            ->first();

        if ($existing) {
            if ($existing->status === 'failed' && $existing->source_path) {
                $existing->forceFill([
                    'status' => 'pending',
                    'error_message' => null,
                    'batch_uuid' => $batchUuid ?: $existing->batch_uuid,
                    'fallback_reference' => $fallbackReference ?: $existing->fallback_reference,
                ])->save();

                ProcessUploadedImage::dispatch($existing->id)
                    ->onQueue((string) config('media.queue', 'media'))
                    ->afterCommit();
            }

            return $existing->reference;
        }

        $uuid = (string) Str::uuid();
        $extension = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            default => 'webp',
        };
        $sourcePath = "media/staging/{$uuid}.{$extension}";
        $stagingDisk = (string) config('media.staging_disk', 'local');
        Storage::disk($stagingDisk)->put($sourcePath, file_get_contents($realPath));

        try {
            $media = Media::create([
                'uuid' => $uuid,
                'disk' => (string) config('media.disk', 'public'),
                'path' => $sourcePath,
                'source_path' => $sourcePath,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $mime,
                'original_mime_type' => $mime,
                'size' => $size,
                'original_size' => $size,
                'width' => $width,
                'height' => $height,
                'source_checksum' => $checksum,
                'status' => 'pending',
                'batch_uuid' => $batchUuid,
                'fallback_reference' => $fallbackReference,
                'processor_version' => $processorVersion,
                'uploaded_by' => Auth::id(),
            ]);
        } catch (QueryException $exception) {
            Storage::disk($stagingDisk)->delete($sourcePath);
            $duplicate = Media::query()
                ->where('source_checksum', $checksum)
                ->where('processor_version', $processorVersion)
                ->first();

            if ($duplicate) {
                if ($duplicate->status === 'failed' && $duplicate->source_path) {
                    $duplicate->forceFill([
                        'status' => 'pending',
                        'error_message' => null,
                        'batch_uuid' => $batchUuid ?: $duplicate->batch_uuid,
                        'fallback_reference' => $fallbackReference ?: $duplicate->fallback_reference,
                    ])->save();

                    ProcessUploadedImage::dispatch($duplicate->id)
                        ->onQueue((string) config('media.queue', 'media'))
                        ->afterCommit();
                }

                return $duplicate->reference;
            }

            throw $exception;
        }

        ProcessUploadedImage::dispatch($media->id)
            ->onQueue((string) config('media.queue', 'media'))
            ->afterCommit();

        return $media->reference;
    }

    public function fileInfo(string $reference): ?array
    {
        if ($this->isReference($reference)) {
            $media = $this->findByReference($reference);
            if (!$media) return null;

            $url = $this->resolve($reference);

            return [
                'name' => $media->filename,
                'size' => $media->size,
                'type' => $media->mime_type,
                'url' => $url ?: $this->pendingPreviewDataUrl(),
            ];
        }

        if (str_starts_with($reference, '/')) {
            return [
                'name' => basename($reference),
                'size' => 0,
                'type' => 'image/webp',
                'url' => rtrim((string) config('app.frontend_url'), '/') . $reference,
            ];
        }

        $disk = Storage::disk((string) config('media.disk', 'public'));
        if (!$disk->exists($reference)) return null;

        return [
            'name' => basename($reference),
            'size' => $disk->size($reference),
            'type' => $disk->mimeType($reference),
            'url' => $disk->url($reference),
        ];
    }

    public function resolve(?string $reference, array $seen = []): ?string
    {
        if (!$reference) return $reference;
        if (!$this->isReference($reference)) return $this->resolveLegacyReference($reference);
        if (in_array($reference, $seen, true)) return null;

        $media = $this->findByReference($reference);
        if (!$media) return null;
        $batchIsReady = !$media->batch_uuid || !Media::query()
            ->where('batch_uuid', $media->batch_uuid)
            ->where('status', '!=', 'ready')
            ->exists();

        if ($media->isReady() && $batchIsReady) return $media->url;

        $fallback = $media->fallback_reference;
        if (!$fallback) return null;
        if ($this->isReference($fallback)) {
            return $this->resolve($fallback, [...$seen, $reference]);
        }

        return $this->resolveLegacyReference($fallback);
    }

    public function isReference(?string $value): bool
    {
        return is_string($value) && str_starts_with($value, self::REFERENCE_PREFIX);
    }

    public function findByReference(string $reference): ?Media
    {
        return Media::query()
            ->where('uuid', Str::after($reference, self::REFERENCE_PREFIX))
            ->first();
    }

    private function pendingPreviewDataUrl(): string
    {
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="100%" height="100%" fill="#f2f1ed"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#446b4a" font-family="sans-serif" font-size="22">Processing image</text></svg>';
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    private function resolveLegacyReference(string $reference): string
    {
        if (
            str_starts_with($reference, '/')
            || str_starts_with($reference, 'http://')
            || str_starts_with($reference, 'https://')
            || str_starts_with($reference, '//')
            || str_starts_with($reference, 'data:')
        ) {
            return $reference;
        }

        return Storage::disk((string) config('media.disk', 'public'))->url($reference);
    }
}
