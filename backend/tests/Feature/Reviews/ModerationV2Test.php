<?php

namespace Tests\Feature\Reviews;

use App\Models\Testimonial;
use App\Models\TestimonialAudit;
use App\Models\User;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewRepository;
use App\Services\Reviews\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class ModerationV2Test extends TestCase
{
    use RefreshDatabase;

    protected ReviewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReviewService::class);
    }

    protected function villa(string $id = '700001'): VillaCache
    {
        return VillaCache::create([
            'lodgify_id' => $id,
            'name' => 'Villa Mod',
            'synced_at' => now(),
        ]);
    }

    protected function admin(): User
    {
        return User::create([
            'name' => 'Mod Admin',
            'email' => 'mod@example.com',
            'password' => bcrypt('secret'),
            'role' => 'admin',
        ]);
    }

    public function test_guest_submission_defaults_to_villa_placement_only(): void
    {
        $villa = $this->villa();

        $review = $this->service->submitGuestReview([
            'villa_cache_id' => $villa->id,
            'author' => 'Guest',
            'text' => 'A sufficiently long guest review for placement default testing.',
            'stars' => 5,
        ]);

        $this->assertTrue($review->show_on_villa);
        $this->assertFalse($review->show_on_about);
        $this->assertFalse($review->show_on_home);
    }

    public function test_spam_and_restore_flow(): void
    {
        $review = $this->service->submitGuestReview([
            'author' => 'Spammer',
            'text' => 'Buy cheap watches online now, best prices guaranteed forever.',
            'stars' => 5,
        ]);

        $spammed = $this->service->markSpam($review, $this->admin());
        $this->assertSame(Testimonial::STATUS_SPAM, $spammed->status);

        $restored = $this->service->restore($spammed);
        $this->assertSame(Testimonial::STATUS_PENDING, $restored->status);
    }

    public function test_spam_cannot_be_approved_directly(): void
    {
        $review = $this->service->submitGuestReview([
            'author' => 'X',
            'text' => 'Another long enough review body used for transition testing.',
            'stars' => 4,
        ]);
        $review = $this->service->markSpam($review);

        $this->expectException(InvalidArgumentException::class);
        $this->service->approve($review);
    }

    public function test_pin_requires_approved_status(): void
    {
        $review = $this->service->submitGuestReview([
            'author' => 'Pin Guest',
            'text' => 'A long enough review body to satisfy validation for pin tests.',
            'stars' => 5,
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->service->setPinned($review, true);
    }

    public function test_moderation_stamps_actor_and_time(): void
    {
        $admin = $this->admin();
        $review = $this->service->submitGuestReview([
            'author' => 'Stamp Guest',
            'text' => 'A long enough review body used to test moderation stamping.',
            'stars' => 5,
        ]);

        $approved = $this->service->approve($review, $admin);

        $this->assertSame($admin->id, $approved->moderated_by_id);
        $this->assertNotNull($approved->moderated_at);
    }

    public function test_audit_trail_records_lifecycle(): void
    {
        $admin = $this->admin();
        $review = $this->service->submitGuestReview([
            'author' => 'Audit Guest',
            'text' => 'A long enough review body used to verify audit history entries.',
            'stars' => 5,
        ]);
        $this->service->approve($review, $admin);
        $this->service->setFeatured($review->refresh(), true, $admin);

        $actions = TestimonialAudit::where('testimonial_id', $review->id)->pluck('action')->all();

        $this->assertContains('submitted', $actions);
        $this->assertContains(Testimonial::STATUS_APPROVED, $actions);
        $this->assertContains('featured', $actions);
    }

    public function test_content_edit_stamps_edited_at_and_audits(): void
    {
        $review = $this->service->create([
            'author' => 'Editable',
            'text' => 'Original review content long enough to be valid for tests.',
            'stars' => 4,
            'status' => Testimonial::STATUS_PENDING,
        ]);
        $this->assertNull($review->edited_at);

        $updated = $this->service->update($review, ['text' => 'Corrected review content long enough to be valid here.']);

        $this->assertNotNull($updated->edited_at);
        $this->assertContains('edited', TestimonialAudit::where('testimonial_id', $review->id)->pluck('action')->all());
    }

    public function test_about_query_respects_placement_toggle(): void
    {
        $onAbout = $this->service->create([
            'author' => 'About Person',
            'text' => 'Long enough approved review shown on the about page section.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'show_on_about' => true,
        ]);
        $notOnAbout = $this->service->create([
            'author' => 'Hidden Person',
            'text' => 'Long enough approved review not placed on the about page.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'page' => 'villa',
            'show_on_about' => false,
        ]);

        $result = app(ReviewRepository::class)->featuredTestimonials(10, 'about');

        $this->assertTrue($result->contains('id', $onAbout->id));
        $this->assertFalse($result->contains('id', $notOnAbout->id));
    }

    public function test_concierge_query_respects_placement_toggle(): void
    {
        $shown = $this->service->create([
            'author' => 'Concierge Guest',
            'text' => 'Long enough approved review shown only in the concierge guest stories.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'page' => 'concierge',
        ]);
        $hidden = $this->service->create([
            'author' => 'Villa Guest',
            'text' => 'Long enough approved review that is not placed on the concierge page.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'page' => 'villa',
            'show_on_concierge' => false,
        ]);

        $result = app(ReviewRepository::class)->featuredTestimonials(10, 'concierge');

        $this->assertTrue($shown->show_on_concierge);
        $this->assertTrue($result->contains('id', $shown->id));
        $this->assertFalse($result->contains('id', $hidden->id));
    }

    public function test_villa_reviews_respect_villa_placement(): void
    {
        $villa = $this->villa('700002');

        $shown = $this->service->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Shown',
            'text' => 'Long enough approved villa review that is placed on villa page.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'show_on_villa' => true,
        ]);
        $hidden = $this->service->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Not Shown',
            'text' => 'Long enough approved villa review pulled from the villa page.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'show_on_villa' => false,
        ]);

        $result = app(ReviewRepository::class)->publishedByVilla('700002');

        $this->assertTrue($result->contains('id', $shown->id));
        $this->assertFalse($result->contains('id', $hidden->id));
    }

    public function test_pinned_reviews_rank_first(): void
    {
        $villa = $this->villa('700003');
        $admin = $this->admin();

        $normal = $this->service->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Normal',
            'text' => 'Long enough approved villa review without any pin applied.',
            'stars' => 5,
            'status' => Testimonial::STATUS_APPROVED,
            'show_on_villa' => true,
            'review_date' => '2026-07-01',
        ]);
        $pinned = $this->service->create([
            'villa_cache_id' => $villa->id,
            'author' => 'Pinned',
            'text' => 'Long enough approved villa review that receives the pin flag.',
            'stars' => 3,
            'status' => Testimonial::STATUS_APPROVED,
            'show_on_villa' => true,
            'review_date' => '2026-01-01',
        ]);
        $this->service->setPinned($pinned, true, $admin);

        $result = app(ReviewRepository::class)->publishedByVilla('700003');

        $this->assertSame($pinned->id, $result->first()->id);
    }
}
