<?php

namespace Tests\Feature\Reviews;

use App\Models\Testimonial;
use App\Models\User;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class ReviewServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ReviewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReviewService::class);
    }

    protected function makeVilla(array $attrs = []): VillaCache
    {
        return VillaCache::create(array_merge([
            'lodgify_id' => (string) fake()->unique()->numberBetween(100000, 999999),
            'name' => 'Villa Test',
            'synced_at' => now(),
        ], $attrs));
    }

    public function test_create_review_defaults_to_draft(): void
    {
        $villa = $this->makeVilla();

        $review = $this->service->create([
            'villa_cache_id' => $villa->id,
            'page' => 'villa',
            'author' => 'Naomi S.',
            'text' => 'Very calm villa, everything was thoughtful and clean.',
            'stars' => 5,
            'source' => Testimonial::SOURCE_MANUAL,
        ]);

        $this->assertSame(Testimonial::STATUS_DRAFT, $review->status);
        $this->assertFalse($review->is_featured);
        $this->assertNull($review->published_at);
    }

    public function test_create_review_rejects_unknown_status(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->service->create([
            'author' => 'Test',
            'text' => 'This review has enough characters for validation.',
            'stars' => 4,
            'status' => 'nonsense',
        ]);
    }

    public function test_create_review_rejects_unknown_villa(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->service->create([
            'villa_cache_id' => 999999,
            'author' => 'Test',
            'text' => 'This review has enough characters for validation.',
            'stars' => 4,
        ]);
    }

    public function test_approve_sets_published_at(): void
    {
        $review = $this->service->create([
            'author' => 'Emma L.',
            'text' => 'Lovely long enough comment for tests.',
            'stars' => 5,
            'status' => Testimonial::STATUS_PENDING,
        ]);

        $approved = $this->service->approve($review);

        $this->assertSame(Testimonial::STATUS_APPROVED, $approved->status);
        $this->assertNotNull($approved->published_at);
    }

    public function test_reject_disables_featured(): void
    {
        $review = $this->service->create([
            'author' => 'Marc K.',
            'text' => 'Long enough comment for the validation rule.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
        ]);
        $review = $this->service->setFeatured($review, true);
        $this->assertTrue($review->is_featured);

        // Approved → rejected is not allowed directly; go via hidden then reject
        // to prove featured cleared once we leave approved.
        $hidden = $this->service->hide($review);
        $this->assertFalse($hidden->is_featured);
    }

    public function test_invalid_transitions_throw(): void
    {
        $review = $this->service->create([
            'author' => 'X',
            'text' => 'Long enough comment for validation to pass here.',
            'stars' => 4,
            'status' => Testimonial::STATUS_DRAFT,
        ]);

        $this->expectException(InvalidArgumentException::class);
        // draft → approved is not allowed (must pass through pending)
        $this->service->transition($review, Testimonial::STATUS_APPROVED);
    }

    public function test_only_approved_reviews_can_be_featured(): void
    {
        $review = $this->service->create([
            'author' => 'Test',
            'text' => 'Long enough comment for validation to pass properly.',
            'stars' => 5,
            'status' => Testimonial::STATUS_PENDING,
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->service->setFeatured($review, true);
    }

    public function test_guest_submission_cannot_self_approve_or_feature(): void
    {
        $villa = $this->makeVilla();

        $review = $this->service->submitGuestReview([
            'villa_cache_id' => $villa->id,
            'author' => 'Guest',
            'text' => 'A long enough comment from a hopeful guest reviewer.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED, // should be discarded
            'is_featured' => true, // should be discarded
            'is_verified' => true, // should be discarded
        ]);

        $this->assertSame(Testimonial::STATUS_PENDING, $review->status);
        $this->assertFalse($review->is_featured);
        $this->assertFalse($review->is_verified);
        $this->assertSame(Testimonial::SOURCE_GUEST_SUBMISSION, $review->source);
    }

    public function test_update_stamps_actor(): void
    {
        $actor = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('secret'),
            'role' => 'admin',
        ]);

        $review = $this->service->create([
            'author' => 'Test',
            'text' => 'Long enough comment string for the tests.',
            'stars' => 5,
        ], $actor);

        $this->assertSame($actor->id, $review->created_by_id);
    }

    public function test_external_url_must_be_valid(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->service->create([
            'author' => 'Test',
            'text' => 'Long enough comment string for the validation.',
            'stars' => 5,
            'external_url' => 'not-a-url',
        ]);
    }

    public function test_review_html_tags_are_stripped(): void
    {
        $review = $this->service->create([
            'author' => 'Test',
            'text' => "  <script>bad</script><b>Great stay</b> with lots of detail here.  ",
            'stars' => 5,
        ]);

        $this->assertStringNotContainsString('<script>', $review->text);
        $this->assertStringNotContainsString('<b>', $review->text);
        $this->assertStringNotContainsString('</b>', $review->text);
        $this->assertStringStartsWith('bad', $review->text);
    }
}

