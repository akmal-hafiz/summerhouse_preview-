<?php

namespace Tests\Feature\Reviews;

use App\Models\Testimonial;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewApiTest extends TestCase
{
    use RefreshDatabase;

    protected function villa(string $id = '999001'): VillaCache
    {
        return VillaCache::create([
            'lodgify_id' => $id,
            'name' => 'Villa Public',
            'synced_at' => now(),
        ]);
    }

    public function test_public_villa_reviews_returns_only_approved_and_hides_private_fields(): void
    {
        $villa = $this->villa();
        /** @var ReviewService $svc */
        $svc = app(ReviewService::class);

        $svc->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Approved',
            'reviewer_email' => 'private@example.com',
            'text' => 'A long enough approved review comment for the public feed.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
        ]);
        $svc->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Pending',
            'text' => 'A long enough pending review that must not be public.',
            'stars' => 3,
            'status' => Testimonial::STATUS_PENDING,
        ]);

        $response = $this->getJson('/api/v1/cms/villas/999001/reviews');

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'reviews');
        $response->assertJsonPath('reviews.0.reviewerName', 'Approved');
        $this->assertStringNotContainsString('private@example.com', $response->getContent());
    }

    public function test_public_submission_creates_pending_review(): void
    {
        $villa = $this->villa();

        $response = $this->postJson('/api/v1/reviews', [
            'lodgify_property_id' => $villa->lodgify_id,
            'author' => 'Guest Person',
            'text' => 'This is a lovely long enough guest submission to test the endpoint.',
            'stars' => 5,
        ]);

        $response->assertStatus(202);
        $review = Testimonial::first();
        $this->assertNotNull($review);
        $this->assertSame(Testimonial::STATUS_PENDING, $review->status);
        $this->assertSame(Testimonial::SOURCE_GUEST_SUBMISSION, $review->source);
        $this->assertFalse((bool) $review->is_featured);
        $this->assertFalse((bool) $review->is_verified);
    }

    public function test_public_submission_rejects_short_text(): void
    {
        $villa = $this->villa();

        $response = $this->postJson('/api/v1/reviews', [
            'lodgify_property_id' => $villa->lodgify_id,
            'author' => 'Guest',
            'text' => 'too short',
            'stars' => 5,
        ]);

        $response->assertStatus(422);
    }

    public function test_public_submission_rejects_unknown_villa(): void
    {
        $response = $this->postJson('/api/v1/reviews', [
            'lodgify_property_id' => 'nonexistent',
            'author' => 'Guest',
            'text' => 'A long enough guest submission comment for the endpoint test.',
            'stars' => 5,
        ]);

        $response->assertStatus(422);
    }

    public function test_public_submission_ignores_privileged_fields(): void
    {
        $villa = $this->villa();

        $this->postJson('/api/v1/reviews', [
            'lodgify_property_id' => $villa->lodgify_id,
            'author' => 'Attacker',
            'text' => 'Long enough comment to satisfy validation for the test suite.',
            'stars' => 5,
            // Attempted mass-assignment. Should be ignored by the form request.
            'status' => 'approved',
            'is_featured' => true,
            'is_verified' => true,
        ]);

        $review = Testimonial::first();
        $this->assertSame(Testimonial::STATUS_PENDING, $review->status);
        $this->assertFalse((bool) $review->is_featured);
        $this->assertFalse((bool) $review->is_verified);
    }
}
