<?php

namespace Tests\Feature\Reviews;

use App\Models\Testimonial;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewRepository;
use App\Services\Reviews\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerTestimonialTest extends TestCase
{
    use RefreshDatabase;

    protected ReviewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReviewService::class);
    }

    public function test_owner_submission_lands_pending_with_services_placement(): void
    {
        $t = $this->service->submitOwnerTestimonial([
            'author' => 'Owner One',
            'owner_role' => 'Villa Owner',
            'location' => 'Villa Custom, Umalas',
            'text' => 'Summerhouse has managed our property with great care and results.',
        ]);

        $this->assertSame(Testimonial::STATUS_PENDING, $t->status);
        $this->assertSame(Testimonial::TYPE_OWNER_TESTIMONIAL, $t->type);
        $this->assertTrue($t->show_on_services);
        $this->assertFalse($t->show_on_villa);
        $this->assertFalse($t->show_on_about);
        $this->assertFalse($t->show_on_home);
    }

    public function test_owner_submission_cannot_set_metrics_or_status(): void
    {
        $t = $this->service->submitOwnerTestimonial([
            'author' => 'Sneaky Owner',
            'text' => 'Trying to sneak privileged fields into the submission payload.',
            'status' => Testimonial::STATUS_APPROVED,
            'metrics' => [['label' => 'Fake', 'value' => '+999%']],
            'is_featured' => true,
        ]);

        $this->assertSame(Testimonial::STATUS_PENDING, $t->status);
        $this->assertNull($t->metrics);
        $this->assertFalse($t->is_featured);
    }

    public function test_services_query_returns_only_approved_owner_testimonials(): void
    {
        $approved = $this->service->submitOwnerTestimonial([
            'author' => 'Approved Owner',
            'text' => 'A great long enough owner testimonial for the services page.',
        ]);
        $this->service->approve($approved);

        $pending = $this->service->submitOwnerTestimonial([
            'author' => 'Pending Owner',
            'text' => 'Another long enough owner testimonial still in moderation.',
        ]);

        // Approved guest review must not leak into the services section.
        $guest = $this->service->submitGuestReview([
            'author' => 'Guest Person',
            'text' => 'A long enough guest review that stays on villa pages only.',
            'stars' => 5,
        ]);
        $this->service->approve($guest);

        $result = app(ReviewRepository::class)->servicesTestimonials();

        $this->assertTrue($result->contains('id', $approved->id));
        $this->assertFalse($result->contains('id', $pending->id));
        $this->assertFalse($result->contains('id', $guest->id));
    }

    public function test_about_query_excludes_owner_testimonials(): void
    {
        $owner = $this->service->submitOwnerTestimonial([
            'author' => 'Owner About',
            'text' => 'Owner testimonial that should never reach the About section.',
        ]);
        $this->service->approve($owner);
        // Even if someone flips the about placement on an owner testimonial…
        $owner->refresh()->update(['show_on_about' => true]);

        $result = app(ReviewRepository::class)->featuredTestimonials(10, 'about');

        $this->assertFalse($result->contains('id', $owner->id));
    }

    public function test_public_endpoint_creates_owner_testimonial(): void
    {
        $villa = VillaCache::create([
            'lodgify_id' => '800001',
            'name' => 'Villa Endpoint',
            'synced_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/owner-testimonials', [
            'author' => 'Endpoint Owner',
            'owner_role' => 'Property Investor',
            'lodgify_property_id' => '800001',
            'text' => 'Submitting through the public endpoint works wonderfully well.',
        ]);

        $response->assertStatus(202);
        $t = Testimonial::where('author', 'Endpoint Owner')->first();
        $this->assertNotNull($t);
        $this->assertSame($villa->id, $t->villa_cache_id);
        $this->assertSame(Testimonial::TYPE_OWNER_TESTIMONIAL, $t->type);
    }

    public function test_public_endpoint_rejects_short_text(): void
    {
        $this->postJson('/api/v1/owner-testimonials', [
            'author' => 'Owner',
            'text' => 'too short',
        ])->assertStatus(422);
    }

    public function test_cms_create_route_removed(): void
    {
        $this->assertFalse(
            collect(app('router')->getRoutes())->contains(
                fn ($route) => str_contains($route->uri(), 'admin/testimonials/create')
            ),
            'CMS create route for testimonials should no longer exist.'
        );
    }
}
