<?php

namespace App\Filament\Forms\Components;

use App\Services\Media\ManagedMediaService;
use Filament\Forms\Components\BaseFileUpload;
use Filament\Forms\Components\FileUpload;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ManagedImageUpload extends FileUpload
{
    protected function setUp(): void
    {
        parent::setUp();
        $batchUuid = (string) Str::uuid();

        $this
            ->image()
            ->imageEditor()
            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->maxSize((int) config('media.max_upload_kb', 15360))
            ->maxParallelUploads(2)
            ->orientImagesFromExif()
            ->fetchFileInformation(false)
            ->visibility('public')
            ->saveUploadedFileUsing(function (
                BaseFileUpload $component,
                TemporaryUploadedFile $file,
            ) use ($batchUuid): string {
                $oldState = $component->getOldState();
                $fallback = null;
                if (is_string($oldState)) {
                    $fallback = $oldState;
                } elseif (is_array($oldState)) {
                    $candidate = collect($oldState)->first(fn ($item) => is_string($item));
                    $fallback = is_string($candidate) ? $candidate : null;
                }

                return app(ManagedMediaService::class)->stage($file, $fallback, $batchUuid);
            })
            ->getUploadedFileUsing(
                fn (string $file): ?array => app(ManagedMediaService::class)->fileInfo($file)
            )
            ->deleteUploadedFileUsing(function (string $file): void {
                // Physical deletion is deferred. A reference can be shared by
                // several CMS sections, so immediate deletion is unsafe.
            });
    }
}
