<?php

namespace Tests\Feature;

use App\Forms\Components\VillaPicker;
use App\Jobs\SyncLodgifyJob;
use App\Models\HomepageVillaSelection;
use App\Models\LodgifyIncident;
use App\Models\LodgifySyncRun;
use App\Models\User;
use App\Models\VillaCache;
use App\Services\LodgifyHealthService;
use App\Services\LodgifyHomepageValidator;
use App\Services\LodgifyIncidentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LodgifyOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_incidents_are_deduplicated_and_warning_notifies_only_on_second_occurrence(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $service = app(LodgifyIncidentService::class);

        $first = $service->open('sync_failure', 'warning', 'Sync failed', 'Temporary network failure.');
        $this->assertCount(0, $admin->fresh()->notifications);

        $second = $service->open('sync_failure', 'warning', 'Sync failed', 'Temporary network failure.');

        $this->assertSame($first->id, $second->id);
        $this->assertSame(2, $second->occurrence_count);
        $this->assertCount(1, $admin->fresh()->notifications);
    }

    public function test_health_snapshot_changes_from_green_to_yellow_and_red(): void
    {
        $run = LodgifySyncRun::create([
            'run_uuid' => fake()->uuid(),
            'status' => 'completed',
            'started_at' => now(),
            'finished_at' => now(),
        ]);
        $service = app(LodgifyHealthService::class);
        $this->assertSame('green', $service->snapshot()['status']);

        $run->update(['finished_at' => now()->subMinutes(15)]);
        $this->assertSame('yellow', $service->snapshot()['status']);

        $run->update(['finished_at' => now()->subMinutes(31)]);
        $this->assertSame('red', $service->snapshot()['status']);
    }

    public function test_homepage_validator_creates_and_resolves_one_incident_per_reference(): void
    {
        $villa = VillaCache::create([
            'lodgify_id' => '796460',
            'name' => 'Bawa House',
            'lodgify_status' => VillaCache::STATUS_MISSING,
            'management_status' => VillaCache::MANAGEMENT_REMOVED,
        ]);
        HomepageVillaSelection::create(['slot' => 'featured_homes', 'lodgify_property_id' => $villa->lodgify_id, 'sort_order' => 0]);

        $validator = app(LodgifyHomepageValidator::class);
        $this->assertCount(1, $validator->validate());
        $this->assertCount(1, $validator->validate());
        $this->assertSame(1, LodgifyIncident::count());
        $this->assertSame(2, LodgifyIncident::first()->occurrence_count);

        $villa->update(['lodgify_status' => VillaCache::STATUS_ACTIVE, 'management_status' => VillaCache::MANAGEMENT_MANAGED]);
        $this->assertCount(0, $validator->validate());
        $this->assertSame(LodgifyIncident::STATUS_RESOLVED, LodgifyIncident::first()->fresh()->status);
    }

    public function test_admin_can_render_lodgify_health_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/lodgify-health')->assertOk();
    }

    public function test_sync_job_has_a_stable_unique_lock(): void
    {
        $job = new SyncLodgifyJob;

        $this->assertSame('lodgify-full-sync', $job->uniqueId());
        $this->assertSame(600, $job->uniqueFor);
    }

    public function test_health_check_opens_and_recovers_a_stale_snapshot_incident(): void
    {
        $this->artisan('lodgify:health-check')->assertFailed();
        $incident = LodgifyIncident::where('category', 'stale_snapshot')->firstOrFail();
        $this->assertSame(LodgifyIncident::SEVERITY_CRITICAL, $incident->severity);

        LodgifySyncRun::create([
            'run_uuid' => fake()->uuid(),
            'status' => 'completed',
            'started_at' => now(),
            'finished_at' => now(),
        ]);

        $this->artisan('lodgify:health-check')->assertSuccessful();
        $this->assertSame(LodgifyIncident::STATUS_RESOLVED, $incident->fresh()->status);
    }

    public function test_villa_picker_preserves_invalid_values_but_only_active_managed_villas_are_selectable(): void
    {
        VillaCache::create(['lodgify_id' => '1', 'name' => 'Active', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        VillaCache::create(['lodgify_id' => '2', 'name' => 'Inactive', 'lodgify_status' => VillaCache::STATUS_INACTIVE]);
        VillaCache::create(['lodgify_id' => '3', 'name' => 'Removed', 'lodgify_status' => VillaCache::STATUS_ACTIVE, 'management_status' => VillaCache::MANAGEMENT_REMOVED]);

        $villas = collect(VillaPicker::make('villa')->getVillas())->keyBy('id');

        $this->assertTrue($villas['1']['selectable']);
        $this->assertFalse($villas['2']['selectable']);
        $this->assertSame('Temporarily unavailable', $villas['2']['status_label']);
        $this->assertFalse($villas['3']['selectable']);
        $this->assertSame('No longer managed', $villas['3']['status_label']);
    }
}
