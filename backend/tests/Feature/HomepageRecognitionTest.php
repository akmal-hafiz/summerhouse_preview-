<?php

namespace Tests\Feature;

use App\Models\PageSection;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomepageRecognitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_single_homepage_recognition_is_exposed_to_the_frontend(): void
    {
        PageSection::updateOrCreate(
            ['page' => 'home', 'section' => 'why_stay'],
            [
                'content' => [
                    'recognition' => [
                        'type' => 'award',
                        'name' => 'Honeycombers',
                        'issuer' => 'Gold Winner',
                        'title' => 'Best Villa in Bali 2024',
                        'year' => '2024',
                        'villa_name' => 'Ubud Zen River House',
                        'image' => '/uploads/homepage/recognition/zen.webp',
                        'url' => 'https://example.com/honeycombers',
                        'is_visible' => true,
                    ],
                    'is_visible' => true,
                ],
                'sort_order' => 4,
                'is_active' => true,
            ]
        );

        $this->getJson('/api/v1/cms/page/home/section/why_stay')
            ->assertOk()
            ->assertJsonPath('content.recognition.name', 'Honeycombers')
            ->assertJsonPath('content.recognition.title', 'Best Villa in Bali 2024')
            ->assertJsonPath('content.recognition.villa_name', 'Ubud Zen River House')
            ->assertJsonPath('content.recognition.url', 'https://example.com/honeycombers')
            ->assertJsonPath('content.recognition.is_visible', true);
    }

    public function test_homepage_guest_reviews_update_immediately_after_moderation(): void
    {
        $review = Testimonial::query()->create([
            'page' => 'home',
            'type' => Testimonial::TYPE_GUEST_REVIEW,
            'author' => 'Maya',
            'stars' => 5,
            'text' => 'The original review.',
            'status' => Testimonial::STATUS_APPROVED,
            'is_active' => true,
            'is_featured' => true,
            'show_on_home' => true,
            'published_at' => now(),
        ]);

        $this->getJson('/api/v1/cms/testimonials/home')
            ->assertOk()
            ->assertJsonPath('testimonials.0.text', 'The original review.');

        $review->update(['text' => 'The updated review.']);

        $this->getJson('/api/v1/cms/testimonials/home')
            ->assertOk()
            ->assertJsonPath('testimonials.0.text', 'The updated review.');
    }

    public function test_homepage_guest_reviews_are_limited_to_six_cards(): void
    {
        foreach (range(1, 7) as $index) {
            Testimonial::query()->create([
                'page' => 'home',
                'type' => Testimonial::TYPE_GUEST_REVIEW,
                'author' => "Guest {$index}",
                'stars' => 5,
                'text' => "Review {$index}",
                'status' => Testimonial::STATUS_APPROVED,
                'is_active' => true,
                'show_on_home' => true,
                'published_at' => now(),
                'display_order' => $index,
            ]);
        }

        $this->getJson('/api/v1/cms/testimonials/home')
            ->assertOk()
            ->assertJsonCount(6, 'testimonials');
    }
}
