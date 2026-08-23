<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Services\Media\ImageProcessor;
use App\Support\AssetUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ManagedMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('public');
        config()->set('media.staging_disk', 'local');
        config()->set('media.disk', 'public');
        config()->set('media.output_max_dimension', 2560);
        config()->set('media.webp_quality', 82);
    }

    public function test_four_k_image_is_scaled_down_and_encoded_as_webp(): void
    {
        $source = $this->jpeg(3840, 2160);
        $media = $this->pendingMedia('media/staging/four-k.jpg', $source);

        app(ImageProcessor::class)->process($media);
        $media->refresh();

        $this->assertSame('ready', $media->status);
        $this->assertSame('image/webp', $media->mime_type);
        $this->assertSame(2560, $media->width);
        $this->assertSame(1440, $media->height);
        $this->assertStringEndsWith('.webp', $media->processed_path);
        Storage::disk('public')->assertExists($media->processed_path);
        Storage::disk('local')->assertMissing('media/staging/four-k.jpg');

        $info = getimagesizefromstring(Storage::disk('public')->get($media->processed_path));
        $this->assertSame('image/webp', $info['mime']);
    }

    public function test_identical_processed_output_reuses_the_same_file(): void
    {
        $source = $this->jpeg(1200, 800);
        $first = $this->pendingMedia('media/staging/first.jpg', $source, hash('sha256', $source));
        $second = $this->pendingMedia('media/staging/second.jpg', $source, hash('sha256', $source . 'second'));

        app(ImageProcessor::class)->process($first);
        app(ImageProcessor::class)->process($second);

        $this->assertSame($first->fresh()->processed_path, $second->fresh()->processed_path);
        $this->assertCount(1, Storage::disk('public')->allFiles('uploads/managed'));
    }

    public function test_pending_media_resolves_to_legacy_fallback(): void
    {
        $media = Media::create([
            'disk' => 'public',
            'path' => 'media/staging/pending.jpg',
            'source_path' => 'media/staging/pending.jpg',
            'filename' => 'pending.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 100,
            'status' => 'pending',
            'fallback_reference' => '/homepage_villa/VillaZen.webp',
        ]);

        $this->assertSame(
            '/homepage_villa/VillaZen.webp',
            AssetUrl::resolve($media->reference)
        );
    }

    public function test_relative_legacy_media_path_resolves_through_the_public_disk(): void
    {
        Storage::disk('public')->put('uploads/about/legacy.webp', 'legacy');
        $media = Media::create([
            'disk' => 'public',
            'path' => 'media/staging/pending.jpg',
            'source_path' => 'media/staging/pending.jpg',
            'filename' => 'pending.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 100,
            'status' => 'pending',
            'fallback_reference' => 'uploads/about/legacy.webp',
        ]);

        $this->assertSame(
            Storage::disk('public')->url('uploads/about/legacy.webp'),
            app(\App\Services\Media\ManagedMediaService::class)->resolve($media->reference)
        );
    }

    public function test_a_batch_stays_on_fallback_until_every_image_is_ready(): void
    {
        $batch = (string) \Illuminate\Support\Str::uuid();
        $ready = Media::create([
            'disk' => 'public',
            'path' => 'uploads/managed/ready.webp',
            'processed_path' => 'uploads/managed/ready.webp',
            'filename' => 'ready.webp',
            'mime_type' => 'image/webp',
            'size' => 100,
            'status' => 'ready',
            'batch_uuid' => $batch,
            'fallback_reference' => '/homepage_villa/VillaZen.webp',
        ]);
        Media::create([
            'disk' => 'public',
            'path' => 'media/staging/pending.jpg',
            'source_path' => 'media/staging/pending.jpg',
            'filename' => 'pending.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 100,
            'status' => 'pending',
            'batch_uuid' => $batch,
        ]);

        $this->assertSame(
            '/homepage_villa/VillaZen.webp',
            AssetUrl::resolve($ready->reference)
        );
    }

    private function pendingMedia(string $path, string $bytes, ?string $checksum = null): Media
    {
        Storage::disk('local')->put($path, $bytes);

        return Media::create([
            'disk' => 'public',
            'path' => $path,
            'source_path' => $path,
            'filename' => basename($path),
            'mime_type' => 'image/jpeg',
            'original_mime_type' => 'image/jpeg',
            'size' => strlen($bytes),
            'original_size' => strlen($bytes),
            'source_checksum' => $checksum ?: hash('sha256', $bytes),
            'status' => 'pending',
            'processor_version' => 1,
        ]);
    }

    private function jpeg(int $width, int $height): string
    {
        $image = imagecreatetruecolor($width, $height);
        $background = imagecolorallocate($image, 68, 107, 74);
        imagefill($image, 0, 0, $background);

        ob_start();
        imagejpeg($image, null, 90);
        $bytes = (string) ob_get_clean();
        imagedestroy($image);

        return $bytes;
    }
}
