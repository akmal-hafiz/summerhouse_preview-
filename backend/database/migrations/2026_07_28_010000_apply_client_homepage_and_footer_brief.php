<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->mergeHomeSection('stay_styles', [
            'heading' => 'A home, not a hotel',
            'is_visible' => true,
        ], ['description']);

        $this->mergeHomeSection('signature_villa', [], [
            'eyebrow',
            'title',
            'description',
        ]);

        $this->mergeHomeSection('explore_bali', [
            'kicker' => '',
            'title' => 'Bali, by Neighbourhood',
            'description' => 'A closer look at the neighbourhoods, landscapes, and local rhythms around our homes.',
            'is_visible' => true,
        ]);

        $this->mergeHomeSection('testimonials', [
            'eyebrow' => 'Guest stories',
            'title' => 'What guests remember',
            'title_emphasis' => 'after the stay',
            'trust_label' => 'Loved by Summerhouse guests',
            'is_visible' => true,
        ]);

        $this->mergeHomeSection('why_stay', [
            'title' => 'Why stay with Summerhouse',
            'introduction' => 'A smaller collection, local care, and homes chosen for how naturally they fit the Bali experience.',
            'items' => [
                [
                    'title' => 'Homes with a point of view',
                    'description' => 'A considered collection shaped by setting, privacy, and the way each home feels to live in.',
                ],
                [
                    'title' => 'Local care, close by',
                    'description' => 'A Bali-based team stays close from the first question through the final day of your stay.',
                ],
                [
                    'title' => 'Clear from the beginning',
                    'description' => 'Real homes, useful details, and a booking experience designed to keep decisions straightforward.',
                ],
                [
                    'title' => 'Standards that stay personal',
                    'description' => 'Every property is presented with the same attention, while its individual character remains intact.',
                ],
            ],
            'awards_heading' => 'Recognition, quietly earned',
            'awards' => [],
            'is_visible' => true,
        ]);

        $settings = [
            'footer.newsletter_title' => 'Join Our Newsletter',
            'footer.newsletter_description' => 'Occasional notes on Bali, new stays, and places worth knowing.',
            'footer.newsletter_consent' => 'I agree to receive occasional Summerhouse updates.',
            'footer.closing_statement' => 'Stay well. Know Bali better.',
            'footer.stay_heading' => 'Stay',
            'footer.stay_locations' => [
                ['label' => 'Canggu, Berawa', 'location' => 'Canggu - Berawa'],
                ['label' => 'Canggu, Padonan', 'location' => 'Canggu - Padonan'],
                ['label' => 'Pererenan', 'location' => 'Pererenan'],
                ['label' => 'Ubud', 'location' => 'Ubud'],
            ],
            'footer.owners_heading' => 'For Villa Owners',
            'footer.owner_links' => [
                ['label' => 'Property Management', 'href' => '/services'],
                ['label' => 'List Your Property', 'href' => '/contact'],
            ],
            'footer.navigation_heading' => 'Navigation',
            'footer.navigation_links' => [
                ['label' => 'About us', 'href' => '/about'],
                ['label' => 'Gallery', 'href' => '/gallery'],
                ['label' => 'Contact us', 'href' => '/contact'],
            ],
            'footer.inquiries_heading' => 'Inquiries',
            'footer.social_links' => [
                ['label' => 'Instagram', 'href' => 'https://www.instagram.com/summerhouse.bali/'],
                ['label' => 'Pinterest', 'href' => 'https://pin.it/3CgvbgIq5'],
            ],
            'footer.copyright_suffix' => 'SUMMERHOUSE / ALL RIGHTS RESERVED',
        ];

        foreach ($settings as $key => $value) {
            DB::table('site_settings')->insertOrIgnore([
                'key' => $key,
                'value' => json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('page_sections')
            ->where('page', 'home')
            ->where('section', 'why_stay')
            ->delete();

        DB::table('site_settings')
            ->where('key', 'like', 'footer.%')
            ->delete();
    }

    private function mergeHomeSection(string $section, array $values, array $remove = []): void
    {
        $row = DB::table('page_sections')
            ->where('page', 'home')
            ->where('section', $section)
            ->first();

        $content = [];
        if ($row?->content) {
            $decoded = json_decode((string) $row->content, true);
            $content = is_array($decoded) ? $decoded : [];
        }

        foreach ($remove as $key) {
            unset($content[$key]);
        }

        $content = array_replace($content, $values);

        DB::table('page_sections')->updateOrInsert(
            ['page' => 'home', 'section' => $section],
            [
                'content' => json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'sort_order' => $row?->sort_order ?? 0,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => $row?->created_at ?? now(),
            ]
        );
    }
};
