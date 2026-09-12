<?php

namespace Tests\Feature;

use App\Models\VillaCache;
use App\Services\LodgifyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LodgifyReconciliationTest extends TestCase
{
    use RefreshDatabase;

    private array $properties = [];

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(function (Request $request) {
            if (str_contains($request->url(), '/rooms')) {
                return Http::response([], 200);
            }
            parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);
            $page = (int) ($query['page'] ?? 1);
            $size = (int) ($query['size'] ?? 2);

            return Http::response(['items' => array_slice($this->properties, ($page - 1) * $size, $size)], 200);
        });
    }

    private function service(array $overrides = []): LodgifyService
    {
        return new LodgifyService('https://lodgify.test/v2', 'secret', array_merge([
            'timeout' => 2, 'retries' => 0, 'concurrency' => 2,
            'page_size' => 2, 'max_pages' => 3, 'min_ratio' => 0.1,
        ], $overrides));
    }

    private function fakeProperties(array $properties): void
    {
        $this->properties = $properties;
    }

    public function test_it_reconciles_paginated_active_and_inactive_properties_idempotently(): void
    {
        $this->fakeProperties([
            ['id' => 1, 'name' => 'One', 'is_active' => true],
            ['id' => 2, 'name' => 'Two', 'is_active' => false],
            ['id' => 3, 'name' => 'Three', 'is_active' => true],
        ]);

        $first = $this->service()->syncAll();
        $second = $this->service()->syncAll();

        $this->assertTrue($first->succeeded());
        $this->assertTrue($second->succeeded());
        $this->assertSame(3, VillaCache::count());
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '2', 'lodgify_status' => VillaCache::STATUS_INACTIVE]);
    }

    public function test_property_becomes_missing_only_after_two_complete_absences_and_can_recover(): void
    {
        $this->fakeProperties([['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two']]);
        $this->service()->syncAll();

        $this->fakeProperties([['id' => 1, 'name' => 'One']]);
        $this->service()->syncAll();
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '2', 'lodgify_status' => VillaCache::STATUS_SUSPECTED_MISSING, 'consecutive_missing_count' => 1]);

        $this->service()->syncAll();
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '2', 'lodgify_status' => VillaCache::STATUS_MISSING, 'consecutive_missing_count' => 2]);

        $this->fakeProperties([['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two']]);
        $this->service()->syncAll();
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '2', 'lodgify_status' => VillaCache::STATUS_ACTIVE, 'consecutive_missing_count' => 0]);
    }

    public function test_partial_pagination_does_not_change_existing_property_state(): void
    {
        VillaCache::create(['lodgify_id' => '99', 'name' => 'Safe', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        $this->fakeProperties([['id' => 1, 'name' => 'One']]);

        $run = $this->service(['page_size' => 1, 'max_pages' => 1])->syncAll();

        $this->assertSame('partial', $run->status);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '99', 'lodgify_status' => VillaCache::STATUS_ACTIVE, 'consecutive_missing_count' => 0]);
    }

    public function test_anomalous_count_drop_is_rejected(): void
    {
        $this->fakeProperties([['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two'], ['id' => 3, 'name' => 'Three']]);
        $this->service()->syncAll();
        $this->fakeProperties([['id' => 1, 'name' => 'One']]);

        $run = $this->service(['min_ratio' => 0.5])->syncAll();

        $this->assertSame('rejected_as_anomaly', $run->status);
        $this->assertSame(3, VillaCache::count());
    }
}
