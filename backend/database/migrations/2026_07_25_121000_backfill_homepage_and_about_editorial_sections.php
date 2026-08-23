<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $sections = [
            ['page' => 'home', 'section' => 'testimonials', 'content' => [
                'eyebrow' => 'Guest stories',
                'title' => 'Stays made easier',
                'title_emphasis' => 'by thoughtful care',
                'trust_label' => 'Loved by Summerhouse guests',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'our_story', 'content' => [
                'heading' => 'Our Story.',
                'lead' => 'Summerhouses began as a small collection of villas in Canggu, Bali, built on one belief: a great stay should feel personal before it looks impressive.',
                'body' => 'Years later, that still shapes every home we curate across Canggu, Ubud, Pererenan, and the quiet corners of the island in between.',
                'scroll_label' => 'Trusted by travelers worldwide',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'trust_recognition', 'content' => [
                'heading' => 'A decade of stays, thoughtfully hosted.',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'studio_statement', 'content' => [
                'eyebrow' => 'The gallery',
                'title' => 'A closer look at the spaces you will actually live in.',
                'description' => 'The light through the morning kitchen, the pool at dusk, the quiet corners between rooms. Every villa is photographed the way you will remember it, so what you see is what you arrive to.',
                'button_label' => 'View the full gallery',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'booking_process', 'content' => [
                'eyebrow' => 'Booking process',
                'title' => 'Secure your stay',
                'title_emphasis' => 'with ease',
                'steps' => [
                    [
                        'title' => 'Discover your villa',
                        'description' => 'Browse our collection and find a home that fits the way you want to stay.',
                        'images' => ['/homepage_villa/curated-1-main.webp', '/homepage_villa/curated-2-detail.webp'],
                    ],
                    [
                        'title' => 'Choose your dates',
                        'description' => 'Select your travel dates and see live availability for your chosen villa.',
                        'images' => ['/homepage_villa/curated-4-pool.webp', '/homepage_villa/curated-5-lounge.webp'],
                    ],
                    [
                        'title' => 'Confirm your stay',
                        'description' => 'Review your details, live rate, and complete a secure Lodgify checkout.',
                        'images' => ['/homepage_villa/rumahmimosa.webp', '/homepage_villa/villaarta.webp'],
                    ],
                    [
                        'title' => 'Arrive with ease',
                        'description' => 'Your Bali stay is confirmed, with our local team close by whenever needed.',
                        'images' => ['/homepage_villa/curated-3-corner.webp', '/homepage_villa/curated-6-exterior.webp'],
                    ],
                ],
                'closing_copy' => 'Your Bali stay, thoughtfully arranged.',
                'link_label' => 'Explore villas',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'concierge', 'content' => [
                'eyebrow' => 'Concierge',
                'title' => 'More than a villa',
                'title_emphasis' => 'your Bali stay, considered.',
                'description' => 'Thoughtful support before arrival and throughout your stay.',
                'quote' => 'The best stays feel effortless because the right help is already close.',
                'link_label' => 'View all Concierge',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'faq_intro', 'content' => [
                'eyebrow' => 'FAQ',
                'title' => 'Everything you need to know.',
                'button_label' => 'Ask Us',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'journal_preview', 'content' => [
                'eyebrow' => 'Featured Stories',
                'title' => 'The Journal.',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'destination_footprint', 'content' => [
                'eyebrow' => 'Location',
                'title' => 'Where Summerhouses stays unfold.',
                'description' => 'The collection is centered around Bali\'s most requested stay areas, with villas selected for privacy, atmosphere, and access to the island\'s everyday rituals.',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'final_cta', 'content' => [
                'eyebrow' => 'Your Bali stay',
                'title' => 'Find the home that feels right.',
                'button_label' => 'Book now',
                'is_visible' => true,
            ]],
        ];

        foreach ($sections as $index => $section) {
            DB::table('page_sections')->insertOrIgnore([
                'page' => $section['page'],
                'section' => $section['section'],
                'content' => json_encode($section['content'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'sort_order' => 100 + $index,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // Editorial copy is intentionally retained on rollback so content edited
        // by an administrator is never destroyed by a code deployment rollback.
    }
};
