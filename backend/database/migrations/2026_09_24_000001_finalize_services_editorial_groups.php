<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Known pre-accordion records may have been seeded after the original grouping
     * migration on long-lived installations. Only those exact legacy titles are
     * retired; client-authored records and the grouped editorial cards are preserved.
     */
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

    public function up(): void
    {
        if (! Schema::hasTable('service_cards')) {
            return;
        }

        DB::transaction(function (): void {
            foreach (self::LEGACY_TITLES as $category => $titles) {
                DB::table('service_cards')
                    ->where('category', $category)
                    ->whereIn('title', $titles)
                    ->update(['is_active' => false, 'updated_at' => now()]);
            }
        });

        foreach (array_keys(self::LEGACY_TITLES) as $category) {
            Cache::forget("cms.service-cards.{$category}");
        }
    }

    public function down(): void
    {
        // Intentionally non-destructive. Retired legacy rows stay available for
        // manual review and can be reactivated from the CMS if ever needed.
    }
};
