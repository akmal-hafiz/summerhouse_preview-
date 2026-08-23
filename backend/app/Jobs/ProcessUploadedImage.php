<?php

namespace App\Jobs;

use App\Models\Media;
use App\Services\Media\ImageProcessor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ProcessUploadedImage implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;
    public int $uniqueFor = 600;

    public function __construct(public int $mediaId)
    {
    }

    public function uniqueId(): string
    {
        $media = Media::find($this->mediaId);
        return $media?->source_checksum ?: "media-{$this->mediaId}";
    }

    public function backoff(): array
    {
        return [10, 30, 90];
    }

    public function handle(ImageProcessor $processor): void
    {
        $media = Media::find($this->mediaId);
        if (!$media || $media->isReady()) return;
        $processor->process($media);
    }

    public function failed(Throwable $exception): void
    {
        Media::whereKey($this->mediaId)->update([
            'status' => 'failed',
            'error_message' => mb_substr($exception->getMessage(), 0, 2000),
        ]);
    }
}
