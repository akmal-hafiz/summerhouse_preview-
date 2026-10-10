<?php

namespace Tests\Feature;

use App\Models\ServiceCard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ServiceCardsEditorialGroupingTest extends TestCase
{
    use RefreshDatabase;

    public function test_editorial_groups_are_the_active_service_baseline(): void
    {
        $this->assertSame(5, ServiceCard::active()->forCategory('operational')->count());
        $this->assertSame(6, ServiceCard::active()->forCategory('marketing')->count());
        $this->assertSame(6, ServiceCard::active()->forCategory('project')->count());
        $this->assertSame(17, ServiceCard::active()->count());

        $this->assertDatabaseHas('service_cards', [
            'slug' => 'operations-housekeeping-property-care',
            'is_active' => true,
        ]);
    }

    public function test_grouping_migration_preserves_custom_service_cards(): void
    {
        ServiceCard::create([
            'category' => 'operational',
            'slug' => 'client-custom-service',
            'title' => 'Client Custom Service',
            'text' => 'A client-authored service must remain active.',
            'sort_order' => 99,
            'is_active' => true,
        ]);

        $migration = require database_path('migrations/2026_09_22_000001_group_service_cards_for_editorial_accordion.php');
        $migration->up();

        $this->assertDatabaseHas('service_cards', [
            'slug' => 'client-custom-service',
            'is_active' => true,
        ]);
    }

    public function test_production_preflight_rejects_retired_queued_mail_payloads(): void
    {
        DB::table('jobs')->insert([
            'queue' => 'default',
            'payload' => json_encode(['displayName' => 'App\\Mail\\OrderInvoiceMail'], JSON_THROW_ON_ERROR),
            'attempts' => 0,
            'reserved_at' => null,
            'available_at' => now()->timestamp,
            'created_at' => now()->timestamp,
        ]);

        Artisan::call('production:preflight');

        $this->assertStringContainsString('FAIL No retired queued mail payloads', Artisan::output());
    }
}
