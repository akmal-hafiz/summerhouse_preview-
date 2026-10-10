<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const LEGACY_TITLES = [
        'operational' => [
            'Scheduling & Cleaning', 'HR Management', 'Maintenance', 'Guest Relations', 'Inventory Management',
            'Quality Assurance', 'Security & Insurance', 'Utility Management', 'Vendor Coordination', 'Reporting',
        ],
        'marketing' => [
            'Financial Forecasting', 'Revenue Strategy', 'Photography & Content', 'Platform Management', 'Social Media',
            'SEO & Website', 'Guest Reviews', 'Email Marketing', 'Competitive Analysis', 'Brand Development',
        ],
        'project' => [
            'Property Finding', 'Legal Counsel', 'Architecture & Design', 'Interior Design', 'Contractor Management',
            'Permit & Licensing', 'Landscaping', 'Smart Home Setup', 'Pre-Launch Preparation',
        ],
    ];

    private const GROUPED_CARDS = [
        ['operational', 'operations-housekeeping-property-care', 'Housekeeping & Property Care', 'Cleaning schedules, inspections, pool and garden care, and responsive maintenance coordinated to one consistent standard.'],
        ['operational', 'operations-people-staff-management', 'People, Training & Staff Management', 'Hiring, payroll, workplace support, training, scheduling, and performance supervision for the villa team.'],
        ['operational', 'operations-guest-journey', 'Guest Relations, Check-in & Check-out', 'Thoughtful pre-arrival coordination, welcoming check-ins, in-stay support, and smooth departures.'],
        ['operational', 'operations-supplies-inventory', 'Supplies & Inventory Management', 'Linen, amenities, utilities, and property assets tracked and replenished before they become operational issues.'],
        ['operational', 'operations-cost-vendor-services', 'Cost, Vendor & Additional Services', 'Trusted local vendors, transparent cost control, security coordination, and optional guest services managed through one team.'],
        ['marketing', 'revenue-forecasting-strategy', 'Forecasting & Revenue Strategy', 'Market-informed projections and commercial goals turn seasonality into a practical plan for occupancy and returns.'],
        ['marketing', 'revenue-positioning-copywriting', 'Property Positioning & Copywriting', 'Distinctive photography, storytelling, and listing copy present each villa with a clear point of view.'],
        ['marketing', 'revenue-distribution-direct-booking', 'Distribution & Direct Booking', 'Coordinated OTA, agent, and direct channels extend reach while reducing avoidable commission costs.'],
        ['marketing', 'revenue-advertising-search', 'Advertising & Search Visibility', 'Targeted campaigns, social content, and search optimization help qualified guests discover the property.'],
        ['marketing', 'revenue-pricing-reservations', 'Dynamic Pricing & Reservations', 'Live market signals guide nightly pricing while the reservation team supports guests throughout the booking journey.'],
        ['marketing', 'revenue-reporting-transparency', 'Reporting & Financial Transparency', 'Monthly reporting connects bookings, revenue, operating expenditure, and owner payouts in one understandable view.'],
        ['project', 'project-property-feasibility', 'Property Finding & Feasibility', 'Potential sites and existing villas are assessed for location, rental demand, condition, and commercial viability.'],
        ['project', 'project-legal-assessment', 'Legal Counsel & Project Assessment', 'Local specialists coordinate ownership structures, permits, compliance, scope, and renovation priorities.'],
        ['project', 'project-design-planning', 'Design & Planning Coordination', 'Architecture, interiors, landscape, and guest experience are aligned before construction decisions are locked.'],
        ['project', 'project-contractors-vendors', 'Contractor & Vendor Management', 'Trusted teams are selected, briefed, scheduled, and held to agreed quality and delivery standards.'],
        ['project', 'project-procurement-logistics', 'Procurement & Logistics', 'Materials, furniture, fixtures, technology, and site logistics are coordinated against budget and programme.'],
        ['project', 'project-quality-reporting', 'Construction Quality & Project Reporting', 'Progress, workmanship, cost, risks, and pre-launch preparation remain visible from build through handover.'],
    ];

    public function up(): void
    {
        if (! Schema::hasTable('service_cards') || ! Schema::hasColumn('service_cards', 'slug')) {
            return;
        }

        DB::transaction(function (): void {
            foreach (self::LEGACY_TITLES as $category => $titles) {
                DB::table('service_cards')
                    ->where('category', $category)
                    ->whereIn('title', $titles)
                    ->update(['is_active' => false, 'updated_at' => now()]);
            }

            $categoryOrder = [];
            foreach (self::GROUPED_CARDS as [$category, $slug, $title, $text]) {
                $sortOrder = $categoryOrder[$category] ?? 0;
                $categoryOrder[$category] = $sortOrder + 1;

                DB::table('service_cards')->updateOrInsert(
                    ['slug' => $slug],
                    [
                        'category' => $category,
                        'title' => $title,
                        'text' => $text,
                        'sort_order' => $sortOrder,
                        'is_active' => true,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('service_cards') || ! Schema::hasColumn('service_cards', 'slug')) {
            return;
        }

        DB::transaction(function (): void {
            DB::table('service_cards')
                ->whereIn('slug', array_column(self::GROUPED_CARDS, 1))
                ->update(['is_active' => false, 'updated_at' => now()]);

            foreach (self::LEGACY_TITLES as $category => $titles) {
                DB::table('service_cards')
                    ->where('category', $category)
                    ->whereIn('title', $titles)
                    ->update(['is_active' => true, 'updated_at' => now()]);
            }
        });
    }
};
