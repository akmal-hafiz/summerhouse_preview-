<?php

namespace Tests\Feature\Reviews;

use App\Models\Testimonial;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewMapper;
use App\Services\Reviews\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewMapperTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_dto_excludes_email_and_moderation_metadata(): void
    {
        $villa = VillaCache::create([
            'lodgify_id' => '888',
            'name' => 'Villa Mapper',
            'synced_at' => now(),
        ]);

        $review = app(ReviewService::class)->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Guest',
            'reviewer_email' => 'private@example.com',
            'text' => 'A long enough review to satisfy the validation minimum length.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
        ]);
        $review->load('villa');

        $dto = ReviewMapper::toPublic($review);

        $this->assertArrayNotHasKey('reviewer_email', $dto);
        $this->assertArrayNotHasKey('reviewerEmail', $dto);
        $this->assertArrayNotHasKey('created_by_id', $dto);
        $this->assertArrayNotHasKey('updated_by_id', $dto);
        $this->assertSame('Guest', $dto['reviewerName']);
        $this->assertSame('Villa Mapper', $dto['villaName']);
    }
}
