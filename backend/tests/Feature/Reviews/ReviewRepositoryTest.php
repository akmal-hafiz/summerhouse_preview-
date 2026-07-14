<?php

namespace Tests\Feature\Reviews;

use App\Models\Testimonial;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewRepository;
use App\Services\Reviews\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected ReviewRepository $repo;

    protected ReviewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repo = app(ReviewRepository::class);
        $this->service = app(ReviewService::class);
    }

    protected function villa(string $lodgifyId = '111111', string $name = 'Villa Sunlit'): VillaCache
    {
        return VillaCache::create([
            'lodgify_id' => $lodgifyId,
            'name' => $name,
            'synced_at' => now(),
        ]);
    }

    protected function approved(array $overrides = []): Testimonial
    {
        return $this->service->create(array_merge([
            'author' => 'Reviewer ' . fake()->firstName(),
            'text' => 'This is a long enough review text to pass the validation minimum.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'source' => Testimonial::SOURCE_MANUAL,
        ], $overrides));
    }

    public function test_featured_query_excludes_non_public_statuses(): void
    {
        $draft = $this->service->create([
            'author' => 'Draft',
            'text' => 'Long enough draft review text for the test to work correctly.',
            'stars' => 5,
            'status' => Testimonial::STATUS_DRAFT,
        ]);
        $pending = $this->service->create([
            'author' => 'Pending',
            'text' => 'Long enough pending review text for the test suite here.',
            'stars' => 5,
            'status' => Testimonial::STATUS_PENDING,
        ]);
        $approved = $this->approved(['author' => 'Approved One']);
        $rejected = $this->service->create([
            'author' => 'Rejected',
            'text' => 'Long enough rejected review text to satisfy validation.',
            'stars' => 4,
            'status' => Testimonial::STATUS_PENDING,
        ]);
        $this->service->reject($rejected);

        $result = $this->repo->featuredTestimonials(10);

        $this->assertCount(1, $result);
        $this->assertSame($approved->id, $result->first()->id);
    }

    public function test_featured_ranked_before_non_featured(): void
    {
        $a = $this->approved(['author' => 'A']);
        $b = $this->approved(['author' => 'B']);
        $this->service->setFeatured($b, true);

        $result = $this->repo->featuredTestimonials(10);

        $this->assertSame($b->id, $result->first()->id);
    }

    public function test_villa_summary_averages_only_rated_reviews(): void
    {
        $villa = $this->villa('222222', 'Villa Two');
        $this->approved(['villa_cache_id' => $villa->id, 'author' => 'Rated1', 'stars' => 5]);
        $this->approved(['villa_cache_id' => $villa->id, 'author' => 'Rated2', 'stars' => 3]);
        // Unrated review — stars 0 must not drag average down.
        $this->approved(['villa_cache_id' => $villa->id, 'author' => 'Unrated', 'stars' => 0]);

        $summary = $this->repo->villaSummary('222222');

        $this->assertSame(2, $summary['rated_count']);
        $this->assertSame(3, $summary['total_count']);
        $this->assertSame(4.0, $summary['average_rating']);
    }

    public function test_villa_summary_handles_no_reviews(): void
    {
        $this->villa('333333');
        $summary = $this->repo->villaSummary('333333');
        $this->assertNull($summary['average_rating']);
        $this->assertSame(0, $summary['total_count']);
    }

    public function test_published_by_villa_excludes_other_villas(): void
    {
        $a = $this->villa('444444', 'A');
        $b = $this->villa('555555', 'B');
        $this->approved(['villa_cache_id' => $a->id, 'author' => 'A1']);
        $this->approved(['villa_cache_id' => $b->id, 'author' => 'B1']);
        $this->approved(['villa_cache_id' => $b->id, 'author' => 'B2']);

        $forB = $this->repo->publishedByVilla('555555');

        $this->assertCount(2, $forB);
        $this->assertTrue($forB->every(fn ($r) => $r->villa_cache_id === $b->id));
    }
}
