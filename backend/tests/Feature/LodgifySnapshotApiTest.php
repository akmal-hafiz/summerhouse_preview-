<?php

namespace Tests\Feature;

use App\Models\LodgifySyncRun;
use App\Models\VillaCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LodgifySnapshotApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_snapshot_contains_only_active_sanitized_public_data(): void
    {
        $run = LodgifySyncRun::create(['run_uuid' => fake()->uuid(), 'snapshot_version' => fake()->uuid(), 'status' => 'completed', 'started_at' => now(), 'finished_at' => now()]);
        VillaCache::create(['lodgify_id' => '1', 'name' => 'Public Villa', 'lodgify_status' => VillaCache::STATUS_ACTIVE,
            'raw' => ['id' => 1, 'name' => 'Public Villa', 'city' => 'Canggu', 'contact' => ['email' => 'private@example.com']],
            'rooms_raw' => [['id' => 5, 'name' => 'Room', 'max_people' => 2, 'private' => 'hidden']], 'snapshot_version' => $run->snapshot_version]);
        VillaCache::create(['lodgify_id' => '2', 'name' => 'Inactive', 'lodgify_status' => VillaCache::STATUS_INACTIVE, 'raw' => ['id' => 2, 'name' => 'Inactive']]);
        VillaCache::create([
            'lodgify_id' => '3',
            'name' => 'Removed but active',
            'lodgify_status' => VillaCache::STATUS_ACTIVE,
            'management_status' => VillaCache::MANAGEMENT_REMOVED,
            'raw' => ['id' => 3, 'name' => 'Removed but active', 'is_active' => true],
        ]);

        $response = $this->getJson('/api/v1/cms/lodgify/snapshot');

        $response->assertOk()->assertJsonCount(1, 'properties')->assertJsonPath('properties.0.property.name', 'Public Villa');
        $this->assertArrayNotHasKey('contact', $response->json('properties.0.property'));
        $this->assertArrayNotHasKey('private', $response->json('properties.0.rooms.0'));
        $this->assertSame(['1'], collect($response->json('properties'))->pluck('property.id')->map(fn ($id) => (string) $id)->all());
    }
}
