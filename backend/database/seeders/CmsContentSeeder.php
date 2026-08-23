<?php

namespace Database\Seeders;

use App\Models\BaliCollection;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\HomepageVillaSelection;
use App\Models\PageSection;
use App\Models\ServiceCard;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class CmsContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedPageSections();
        $this->seedHomepageVillaSelections();
        $this->seedBaliCollections();
        // Testimonials are curated in the CMS ("Reviews & Testimonials"). No seed
        // data is created here to avoid publishing placeholder guest quotes.
        $this->seedFaqs();
        $this->seedServiceCards();
        $this->seedGalleryItems();
        $this->seedSiteSettings();
    }

    private function seedPageSections(): void
    {
        $sections = [
            ['page' => 'home', 'section' => 'hero', 'content' => [
                'video_url' => '/video/herosection_summerhouse.mp4',
                'poster_image' => '/homepage_villa/curated-1-main.webp',
                'badge_text' => 'Villas / Jungle Stays / Private Pools',
                'heading_text' => "Own Your World,\nOne Property at a Time.",
                'description' => "Curated homes in Bali\nFor a slower rhythm.",
                'show_badge' => false,
                'show_heading' => false,
            ]],
            ['page' => 'home', 'section' => 'stay_styles', 'content' => [
                'heading' => 'A home, not a hotel',
                'is_visible' => true,
                'groups' => [
                    ['id' => 'short-stays', 'label' => 'Short Stays', 'description' => 'Weekend escapes and easy Bali breaks for a lighter, flexible stay.'],
                    ['id' => 'extended-stays', 'label' => 'Extended Stays', 'description' => 'Private homes made for settling in, working slowly, and living with more room.'],
                    ['id' => 'featured-homes', 'label' => 'Featured Homes', 'description' => 'Handpicked SummerHouse stays with standout design, setting, and guest comfort.'],
                ],
            ]],
            ['page' => 'home', 'section' => 'signature_villa', 'content' => [
                'why_this_home' => '',
            ]],
            ['page' => 'home', 'section' => 'why_stay', 'content' => [
                'eyebrow' => 'Why Summerhouse',
                'title' => 'A considered way to stay in Bali.',
                'introduction' => 'Carefully chosen homes, local care you can count on, and clear guidance for a stay that feels right.',
                'trust_points' => [
                    [
                        'title' => 'Curated homes',
                        'description' => 'A smaller collection chosen for design, setting, and guest comfort.',
                        'is_visible' => true,
                    ],
                    [
                        'title' => 'Local care',
                        'description' => 'Practical support from people who know Bali and its neighbourhoods.',
                        'is_visible' => true,
                    ],
                    [
                        'title' => 'Clear guidance',
                        'description' => 'Useful details and straightforward booking guidance from the start.',
                        'is_visible' => true,
                    ],
                ],
                'awards' => [],
                'recognitions' => [
                    [
                        'type' => 'award',
                        'name' => 'Honeycombers',
                        'issuer' => 'Gold Winner',
                        'title' => 'Best Villa in Bali 2024',
                        'year' => '2024',
                        'villa_name' => 'Ubud Zen River House',
                        'is_visible' => true,
                    ],
                ],
                'is_visible' => true,
            ]],
            ['page' => 'home', 'section' => 'featured_collection', 'content' => [
                'title' => 'FEATURED COLLECTION',
                'description' => 'A curated selection of SummerHouse villas, personally chosen for exceptional design, location, comfort, and guest experience.',
            ]],
            ['page' => 'home', 'section' => 'explore_bali', 'content' => [
                'kicker' => '',
                'title' => 'Bali, by Neighbourhood',
                'description' => 'A closer look at the neighbourhoods, landscapes, and local rhythms around our homes.',
                'is_visible' => true,
            ]],
            ['page' => 'home', 'section' => 'testimonials', 'content' => [
                'eyebrow' => 'Guest stories',
                'title' => 'What guests remember',
                'title_emphasis' => 'after the stay',
                'trust_label' => 'Loved by Summerhouse guests',
                'is_visible' => true,
            ]],
            ['page' => 'about', 'section' => 'stats', 'content' => [
                'items' => [
                    ['value' => '200+', 'label' => 'Happy guests hosted'],
                    ['value' => '26%', 'label' => 'Repeat visitors'],
                    ['value' => '24/7', 'label' => 'Guest support'],
                ],
            ]],
            ['page' => 'about', 'section' => 'features', 'content' => [
                'items' => ['Trusted Hospitality', 'Premium Locations', 'Full-Service Management', 'Personal Concierge', 'Transparent Ownership'],
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
            ['page' => 'services', 'section' => 'hero', 'content' => [
                'video_url' => '/video/herosection_summerhouse.mp4',
            ]],
            ['page' => 'contact', 'section' => 'hero', 'content' => [
                'image' => '/homepage_villa/curated-5-lounge.webp',
            ]],
            ['page' => 'contact', 'section' => 'options', 'content' => [
                'items' => [
                    ['type' => 'whatsapp', 'label' => 'WhatsApp', 'value' => '+62 819 3238 7121'],
                    ['type' => 'email', 'label' => 'Email', 'value' => 'info@summerhousebali.com'],
                    ['type' => 'location', 'label' => 'Location', 'value' => 'Bali, Indonesia'],
                    ['type' => 'response', 'label' => 'Response Time', 'value' => 'Within 2 hours'],
                ],
            ]],
        ];

        foreach ($sections as $i => $section) {
            PageSection::updateOrCreate(
                ['page' => $section['page'], 'section' => $section['section']],
                ['content' => $section['content'], 'sort_order' => $i, 'is_active' => true]
            );
        }
    }

    private function seedHomepageVillaSelections(): void
    {
        $slots = [
            'featured_collection' => ['475365', '475366', '475372', '703452'],
            'short_stays' => ['703452', '475366', '761507'],
            'extended_stays' => ['796460', '761507', '762712'],
            'featured_homes' => ['796460', '475365', '475372'],
        ];

        foreach ($slots as $slot => $ids) {
            foreach ($ids as $order => $id) {
                HomepageVillaSelection::updateOrCreate(
                    ['slot' => $slot, 'lodgify_property_id' => $id],
                    ['sort_order' => $order]
                );
            }
        }
    }

    private function seedBaliCollections(): void
    {
        $collections = [
            [
                'collection_id' => 'canggu-berawa',
                'location' => 'Canggu - Berawa',
                'category' => 'Cafe Coastline',
                'tag' => 'Cafe Coastline',
                'moods' => ['Beach', 'Cafes', 'Design', 'Social'],
                'description' => 'Stylish homes close to cafes, beach clubs, and the polished rhythm of Berawa.',
                'highlights' => ['Beach Clubs', 'Cafe Culture', 'Design Villas', 'Easy Dining'],
                'best_for' => ['Friends', 'Couples', 'Lifestyle Stays'],
                'facts' => [
                    ['label' => 'Mood', 'value' => 'Social coastal living'],
                    ['label' => 'Pace', 'value' => 'Easy and connected'],
                    ['label' => 'Stay style', 'value' => 'Design villas'],
                ],
                'villa_count' => '15 villas',
                'price' => 'From Rp 700.000 / night',
                'cta' => 'Explore Villas in Canggu - Berawa',
                'href' => '/villas?location=Canggu%20-%20Berawa',
                'image' => '/homepage_villa/curated-3-corner.webp',
                'image_alt' => 'SummerHouse villa collection in Canggu Berawa',
                'gallery_images' => ['/homepage_villa/curated-3-corner.webp', '/homepage_villa/88east.webp', '/homepage_villa/curated-1-main.webp', '/homepage_villa/rumahmimosa.webp', '/homepage_villa/villaarta.webp'],
                'lifestyle_pillars' => [
                    ['title' => 'Beach Clubs', 'description' => 'World-class venues for golden hour sunset sessions.'],
                    ['title' => 'Bespoke Cafes', 'description' => 'Artisan coffee roasters and high-end brunch spots.'],
                    ['title' => 'Surf Culture', 'description' => 'Warm waters perfect for longboards and beach breaks.'],
                ],
            ],
            [
                'collection_id' => 'pererenan',
                'location' => 'Pererenan',
                'category' => 'Quiet Coast',
                'tag' => 'Quiet Coast',
                'moods' => ['Surf', 'Village', 'Privacy', 'Slow Living'],
                'description' => 'A quieter coastal pocket for surf mornings, private villas, and slower evenings.',
                'highlights' => ['Surf Mornings', 'Village Calm', 'Private Pools', 'Dining Nearby'],
                'best_for' => ['Longer Stays', 'Couples', 'Families'],
                'facts' => [
                    ['label' => 'Mood', 'value' => 'Quiet coastal calm'],
                    ['label' => 'Pace', 'value' => 'Slow and spacious'],
                    ['label' => 'Stay style', 'value' => 'Private estates'],
                ],
                'villa_count' => '6 villas',
                'price' => 'From Rp 1.100.000 / night',
                'cta' => 'Explore Villas in Pererenan',
                'href' => '/villas?location=Pererenan',
                'image' => '/homepage_villa/curated-6-exterior.webp',
                'image_alt' => 'SummerHouse villa collection in Pererenan',
                'gallery_images' => ['/homepage_villa/curated-6-exterior.webp', '/homepage_villa/CactusEstate.webp', '/homepage_villa/VillaZen.webp', '/homepage_villa/curated-8.webp', '/homepage_villa/curated-5-lounge.webp'],
                'lifestyle_pillars' => [
                    ['title' => 'Surf Breaks', 'description' => 'Easy walks to uncrowded surf spots and sandy bays.'],
                    ['title' => 'Village Life', 'description' => 'Local warungs, quiet lanes, and a slower coastal rhythm.'],
                    ['title' => 'Private Estates', 'description' => 'Spacious grounds with pools, gardens, and full privacy.'],
                ],
            ],
            [
                'collection_id' => 'canggu',
                'location' => 'Canggu',
                'category' => 'Creative Coast',
                'tag' => 'Creative Coast',
                'moods' => ['Surf', 'Social', 'Modern', 'Active'],
                'description' => 'Modern villa living close to surf, cafes, and sunset scenes.',
                'highlights' => ['Surf Spots', 'Modern Villas', 'Sunset Views', 'Social Scene'],
                'best_for' => ['Friends', 'Couples', 'Active Stays'],
                'facts' => [
                    ['label' => 'Mood', 'value' => 'Creative coastal energy'],
                    ['label' => 'Pace', 'value' => 'Active and social'],
                    ['label' => 'Stay style', 'value' => 'Modern homes'],
                ],
                'villa_count' => '4 villas',
                'price' => 'From Rp 1.030.000 / night',
                'cta' => 'Explore Villas in Canggu',
                'href' => '/villas?location=Canggu',
                'image' => '/homepage_villa/curated-1-main.webp',
                'image_alt' => 'SummerHouse villa collection in Canggu',
                'gallery_images' => ['/homepage_villa/curated-1-main.webp', '/homepage_villa/curated-2-detail.webp', '/homepage_villa/curated-3-corner.webp', '/homepage_villa/curated-4-pool.webp', '/homepage_villa/curated-5-lounge.webp'],
                'lifestyle_pillars' => null,
            ],
            [
                'collection_id' => 'canggu-padonan',
                'location' => 'Canggu - Padonan',
                'category' => 'Calm Canggu',
                'tag' => 'Calm Canggu',
                'moods' => ['Local', 'Quiet', 'Modern', 'Practical'],
                'description' => 'Design-led homes in a calmer Canggu neighborhood with easy access to the coast.',
                'highlights' => ['Quiet Lanes', 'Modern Lofts', 'Local Rhythm', 'Canggu Access'],
                'best_for' => ['Remote Work', 'Couples', 'Slow Trips'],
                'facts' => [
                    ['label' => 'Mood', 'value' => 'Residential calm'],
                    ['label' => 'Pace', 'value' => 'Balanced and practical'],
                    ['label' => 'Stay style', 'value' => 'Modern homes'],
                ],
                'villa_count' => '4 villas',
                'price' => 'From Rp 900.000 / night',
                'cta' => 'Explore Villas in Canggu - Padonan',
                'href' => '/villas?location=Canggu%20-%20Padonan',
                'image' => '/homepage_villa/curated-8.webp',
                'image_alt' => 'SummerHouse villa collection in Canggu Padonan',
                'gallery_images' => ['/homepage_villa/curated-8.webp', '/homepage_villa/curated-1-main.webp', '/homepage_villa/88east.webp', '/homepage_villa/rumahmimosa.webp', '/homepage_villa/VillaZen.webp'],
                'lifestyle_pillars' => null,
            ],
            [
                'collection_id' => 'umalas',
                'location' => 'Umalas',
                'category' => 'Leafy Privacy',
                'tag' => 'Leafy Privacy',
                'moods' => ['Leafy', 'Private', 'Central', 'Relaxed'],
                'description' => 'Leafy villas with quiet privacy, central access, and a softer rhythm for private downtime.',
                'highlights' => ['Leafy Streets', 'Private Pools', 'Central Access', 'Quiet Dining'],
                'best_for' => ['Families', 'Couples', 'Long Stays'],
                'facts' => [
                    ['label' => 'Mood', 'value' => 'Soft privacy'],
                    ['label' => 'Pace', 'value' => 'Calm and central'],
                    ['label' => 'Stay style', 'value' => 'Private villas'],
                ],
                'villa_count' => '4 villas',
                'price' => 'From Rp 1.120.000 / night',
                'cta' => 'Explore Villas in Umalas',
                'href' => '/villas?location=Umalas',
                'image' => '/homepage_villa/VillaZen.webp',
                'image_alt' => 'SummerHouse villa collection in Umalas',
                'gallery_images' => ['/homepage_villa/VillaZen.webp', '/homepage_villa/curated-6-exterior.webp', '/homepage_villa/CactusEstate.webp', '/homepage_villa/rumahmimosa.webp', '/homepage_villa/curated-3-corner.webp'],
                'lifestyle_pillars' => null,
            ],
            [
                'collection_id' => 'ubud',
                'location' => 'Ubud',
                'category' => 'Jungle Retreats',
                'tag' => 'Jungle Retreats',
                'moods' => ['Jungle', 'Wellness', 'River', 'Culture'],
                'description' => 'Peaceful villas surrounded by rice fields, rivers, and tropical jungle.',
                'highlights' => ['River Views', 'Jungle Calm', 'Wellness Rituals', 'Cultural Days'],
                'best_for' => ['Couples', 'Wellness', 'Nature Lovers'],
                'facts' => [
                    ['label' => 'Mood', 'value' => 'Restorative nature'],
                    ['label' => 'Pace', 'value' => 'Slow and quiet'],
                    ['label' => 'Stay style', 'value' => 'Jungle villas'],
                ],
                'villa_count' => '2 villas',
                'price' => 'From Rp 1.240.000 / night',
                'cta' => 'Explore Villas in Ubud',
                'href' => '/villas?location=Ubud',
                'image' => '/homepage_villa/curated-2-detail.webp',
                'image_alt' => 'SummerHouse villa collection in Ubud',
                'gallery_images' => ['/homepage_villa/curated-2-detail.webp', '/homepage_villa/curated-5-lounge.webp', '/homepage_villa/VillaZen.webp', '/homepage_villa/CactusEstate.webp', '/homepage_villa/curated-8.webp'],
                'lifestyle_pillars' => null,
            ],
        ];

        foreach ($collections as $i => $data) {
            BaliCollection::updateOrCreate(
                ['collection_id' => $data['collection_id']],
                array_merge($data, ['sort_order' => $i, 'is_active' => true])
            );
        }
    }

    private function seedFaqs(): void
    {
        $faqs = [
            ['page' => 'about', 'question' => 'How do I book a villa?', 'answer' => 'You can browse our villa collection, check availability for your dates, and book directly through our secure checkout. Our team is also available via WhatsApp for personalized assistance.'],
            ['page' => 'about', 'question' => 'What is included in the villa rate?', 'answer' => 'Each villa rate includes the accommodation, daily housekeeping, pool maintenance, and access to all in-villa amenities. Some villas also include breakfast or airport transfers.'],
            ['page' => 'about', 'question' => 'Can I request special services?', 'answer' => 'Yes, our concierge team can arrange private chefs, spa treatments, excursions, airport transfers, and more. Just let us know your preferences when booking.'],
            ['page' => 'about', 'question' => 'What is the cancellation policy?', 'answer' => 'Cancellation policies vary by villa and season. Full details are provided during the booking process. We recommend booking with flexibility when possible.'],
            ['page' => 'services', 'question' => 'Do you manage villas for owners?', 'answer' => 'Yes, we offer full-service villa management including scheduling, cleaning, maintenance, marketing, and revenue optimization for villa owners in Bali.'],
            ['page' => 'services', 'question' => 'How does the revenue strategy work?', 'answer' => 'We analyze market data, seasonal trends, and competitor pricing to optimize your villa rates. Our dynamic pricing approach maximizes occupancy and revenue.'],
            ['page' => 'services', 'question' => 'Can you help me buy a villa in Bali?', 'answer' => 'We connect owners with trusted property finders, legal advisors, and architects to guide you through the process of finding and developing your ideal villa.'],
            ['page' => 'services', 'question' => 'What platforms do you list on?', 'answer' => 'We list on major platforms including Airbnb, Booking.com, and our direct booking site. We also drive direct bookings through social media and marketing.'],
            ['page' => 'contact', 'question' => 'What is the fastest way to reach you?', 'answer' => 'WhatsApp is the fastest way to reach our team. We typically respond within 2 hours during business hours.'],
            ['page' => 'contact', 'question' => 'Can I visit a villa before booking?', 'answer' => 'Villa visits can be arranged for guests currently in Bali, subject to availability. Please contact us to schedule a viewing.'],
            ['page' => 'contact', 'question' => 'Do you offer long-term rental discounts?', 'answer' => 'Yes, we offer discounted rates for extended stays of 14 nights or more. Contact us for a personalized quote.'],
        ];

        foreach ($faqs as $i => $data) {
            Faq::updateOrCreate(
                ['page' => $data['page'], 'question' => $data['question']],
                array_merge($data, ['sort_order' => $i, 'is_active' => true])
            );
        }
    }

    private function seedServiceCards(): void
    {
        $cards = [
            ['category' => 'operational', 'title' => 'Scheduling & Cleaning', 'text' => 'Automated booking sync with professional cleaning teams on every turnover.'],
            ['category' => 'operational', 'title' => 'HR Management', 'text' => 'Staff hiring, training, scheduling, and payroll handled for your villa team.'],
            ['category' => 'operational', 'title' => 'Maintenance', 'text' => 'Regular property inspections, pool care, garden upkeep, and emergency repairs.'],
            ['category' => 'operational', 'title' => 'Guest Relations', 'text' => 'Pre-arrival coordination, check-in support, and in-stay concierge service.'],
            ['category' => 'operational', 'title' => 'Inventory Management', 'text' => 'Linen, amenities, and supplies tracked and restocked before every guest.'],
            ['category' => 'operational', 'title' => 'Quality Assurance', 'text' => 'Photo-verified standards after each turnover to ensure consistent quality.'],
            ['category' => 'operational', 'title' => 'Security & Insurance', 'text' => 'Property insurance guidance, key management, and security coordination.'],
            ['category' => 'operational', 'title' => 'Utility Management', 'text' => 'Electricity, water, internet, and gas managed and monitored monthly.'],
            ['category' => 'operational', 'title' => 'Vendor Coordination', 'text' => 'Trusted network of local vendors for repairs, upgrades, and emergencies.'],
            ['category' => 'operational', 'title' => 'Reporting', 'text' => 'Monthly performance reports with occupancy, revenue, and expense breakdowns.'],
            ['category' => 'marketing', 'title' => 'Financial Forecasting', 'text' => 'Data-driven revenue projections and seasonal pricing strategy.'],
            ['category' => 'marketing', 'title' => 'Revenue Strategy', 'text' => 'Dynamic pricing optimization across all booking channels.'],
            ['category' => 'marketing', 'title' => 'Photography & Content', 'text' => 'Professional photography, video, and drone content for listings.'],
            ['category' => 'marketing', 'title' => 'Platform Management', 'text' => 'Listing optimization on Airbnb, Booking.com, and direct channels.'],
            ['category' => 'marketing', 'title' => 'Social Media', 'text' => 'Instagram and social content strategy to build brand and drive bookings.'],
            ['category' => 'marketing', 'title' => 'SEO & Website', 'text' => 'Direct booking website with SEO optimization for organic traffic.'],
            ['category' => 'marketing', 'title' => 'Guest Reviews', 'text' => 'Review management and response strategy across all platforms.'],
            ['category' => 'marketing', 'title' => 'Email Marketing', 'text' => 'Automated guest communication and re-engagement campaigns.'],
            ['category' => 'marketing', 'title' => 'Competitive Analysis', 'text' => 'Market positioning and competitor benchmarking for your area.'],
            ['category' => 'marketing', 'title' => 'Brand Development', 'text' => 'Villa branding, naming, and story development for premium positioning.'],
            ['category' => 'project', 'title' => 'Property Finding', 'text' => 'Sourcing and evaluating investment-grade villas across Bali.'],
            ['category' => 'project', 'title' => 'Legal Counsel', 'text' => 'Foreign ownership structures, permits, and compliance guidance.'],
            ['category' => 'project', 'title' => 'Architecture & Design', 'text' => 'Connecting owners with top architects for build and renovation projects.'],
            ['category' => 'project', 'title' => 'Interior Design', 'text' => 'Curated furnishing and styling for guest-ready villa interiors.'],
            ['category' => 'project', 'title' => 'Contractor Management', 'text' => 'Build oversight, quality checks, and timeline management.'],
            ['category' => 'project', 'title' => 'Permit & Licensing', 'text' => 'Tourism license (Pondok Wisata) and operational permit handling.'],
            ['category' => 'project', 'title' => 'Landscaping', 'text' => 'Tropical garden design, pool installation, and outdoor living spaces.'],
            ['category' => 'project', 'title' => 'Smart Home Setup', 'text' => 'WiFi, security cameras, smart locks, and automation systems.'],
            ['category' => 'project', 'title' => 'Pre-Launch Preparation', 'text' => 'Final staging, photography, listing creation, and soft-launch bookings.'],
        ];

        foreach ($cards as $i => $data) {
            ServiceCard::updateOrCreate(
                ['category' => $data['category'], 'title' => $data['title']],
                array_merge($data, ['sort_order' => $i, 'is_active' => true])
            );
        }
    }

    private function seedGalleryItems(): void
    {
        // Cinematic / lifestyle showcase set — editorial photography from /public,
        // never Lodgify property listing photos. The gallery page is the admin's
        // space to post brand-mood content, not villa inventory.
        $items = [
            ['type' => 'image', 'src' => '/bellevoire/editorial_large.png', 'alt' => 'Editorial photograph of slow island living at Summerhouse', 'label' => '01', 'category' => 'Editorial', 'title' => 'The Long Afternoon'],
            ['type' => 'text', 'title' => 'Curated Comfort', 'text' => 'Every SummerHouse is chosen for design, privacy, and the kind of comfort that makes Bali feel like home.', 'label' => '02'],
            ['type' => 'image', 'src' => '/bellevoire/editorial_small.png', 'alt' => 'Quiet editorial still from a Summerhouse morning', 'label' => '03', 'category' => 'Editorial', 'title' => 'Still Morning'],
            ['type' => 'image', 'src' => '/bellevoire/beach_stay.png', 'alt' => 'Beachside stay moment near a Summerhouse villa', 'label' => '04', 'category' => 'Escapes', 'title' => 'Beach Stay'],
            ['type' => 'text', 'title' => 'Island Rhythm', 'text' => 'Slower mornings, longer sunsets, and the sound of Bali settling around you.', 'label' => '05'],
            ['type' => 'image', 'src' => '/bellevoire/landscape.png', 'alt' => 'Bali landscape stretching beyond the villa grounds', 'label' => '06', 'category' => 'Escapes', 'title' => 'Across the Ridge'],
            ['type' => 'image', 'src' => '/herosection1.jpg', 'alt' => 'Golden hour light across a Summerhouse stay', 'label' => '07', 'category' => 'Lifestyle', 'title' => 'Golden Hour'],
            ['type' => 'text', 'title' => 'Private by Design', 'text' => 'Gated compounds, private pools, and villa grounds that feel entirely yours.', 'label' => '08'],
            ['type' => 'image', 'src' => '/images_canggu.jpg', 'alt' => 'Slow afternoon scene in Canggu', 'label' => '09', 'category' => 'Lifestyle', 'title' => 'Canggu, Slow'],
            ['type' => 'image', 'src' => '/Found_myself..jpg', 'alt' => 'A quiet found moment during a Summerhouse stay', 'label' => '10', 'category' => 'Lifestyle', 'title' => 'Found Myself Here'],
            ['type' => 'video', 'src' => null, 'video_url' => '/video/herosection_summerhouse.mp4', 'video_poster' => '/Hero_Section.png', 'alt' => 'Cinematic film of Summerhouse Bali island living', 'label' => '11', 'category' => 'Films', 'title' => 'Summerhouse, In Motion'],
            ['type' => 'text', 'title' => 'Living Spaces', 'text' => 'Open-plan interiors that blur the line between indoor living and the tropical outdoors.', 'label' => '12'],
            ['type' => 'text', 'title' => 'Your Stay Awaits', 'text' => 'Browse the collection, pick your dates, and step into a quieter side of Bali.', 'label' => '20'],
        ];

        foreach ($items as $i => $data) {
            GalleryItem::updateOrCreate(
                ['label' => $data['label']],
                array_merge($data, ['sort_order' => $i, 'is_active' => true])
            );
        }

        // Retire earlier seeded rows that pointed at villa listing photos.
        // Model events fire per row so the cms.gallery cache is flushed.
        GalleryItem::query()
            ->where('src', 'like', '/homepage_villa/%')
            ->get()
            ->each(fn (GalleryItem $row) => $row->update(['is_active' => false]));
    }

    private function seedSiteSettings(): void
    {
        $settings = [
            'contact.general_email' => 'info@summerhousebali.com',
            'contact.reservation_email' => 'reservation.summerhouse@gmail.com',
            'contact.phone' => '+6281932387121',
            'contact.whatsapp' => '+6281932387121',
            'contact.address' => 'Bali, Indonesia',
            'contact.response_time' => 'Within 2 hours',
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
            SiteSetting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
