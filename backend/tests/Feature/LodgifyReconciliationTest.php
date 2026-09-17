<?php

namespace Tests\Feature;

use App\Models\LodgifyIncident;
use App\Models\LodgifyPropertyEvent;
use App\Models\VillaCache;
use App\Services\LodgifyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
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

    private function replaceHttpFake(array|callable $responses): void
    {
        // Laravel merges fakes. Replace the factory so the default callback
        // cannot intercept the failure scenario being tested.
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake($responses);
        Http::preventStrayRequests();
    }

    public static function transientStatuses(): array
    {
        return array_map(fn ($status) => [$status], [429, 500, 502, 503, 504]);
    }

    #[DataProvider('transientStatuses')]
    public function test_transient_catalog_failure_retries_once_and_recovers(int $status): void
    {
        $this->replaceHttpFake([
            '*/properties?*' => Http::sequence()->push([], $status)->push(['items' => [['id' => 1, 'name' => 'Recovered']]]),
            '*/rooms' => Http::response([], 200),
        ]);

        $run = $this->service(['retries' => 1])->syncAll();

        $this->assertSame('completed', $run->status);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '1', 'name' => 'Recovered']);
        Http::assertSentCount(3);
    }

    public static function permanentStatuses(): array
    {
        return [[401, 'authentication'], [403, 'authentication'], [404, 'request_failed']];
    }

    #[DataProvider('permanentStatuses')]
    public function test_permanent_failure_never_retries_or_marks_existing_villa_missing(int $status, string $category): void
    {
        VillaCache::create(['lodgify_id' => '99', 'name' => 'Last known good', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        $this->replaceHttpFake(['*' => Http::response([], $status)]);

        $run = $this->service(['retries' => 1])->syncAll();

        $this->assertSame('failed', $run->status);
        $this->assertSame($category, $run->error_category);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '99', 'lodgify_status' => VillaCache::STATUS_ACTIVE, 'consecutive_missing_count' => 0]);
        Http::assertSentCount(1);
    }

    public function test_connect_timeout_has_bounded_retry_and_preserves_last_known_good(): void
    {
        VillaCache::create(['lodgify_id' => '99', 'name' => 'Safe', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        $attempts = 0;
        $this->replaceHttpFake(function () use (&$attempts) {
            $attempts++;
            throw new \Illuminate\Http\Client\ConnectionException('Connect timeout');
        });

        $run = $this->service(['retries' => 1])->syncAll();

        $this->assertSame(2, $attempts);
        $this->assertSame('timeout', $run->error_category);
        $this->assertSame('failed', $run->status);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '99', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
    }

    public function test_failure_on_later_pagination_page_never_promotes_partial_catalog(): void
    {
        VillaCache::create(['lodgify_id' => '99', 'name' => 'Safe', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        $this->replaceHttpFake(['*/properties?*' => Http::sequence()
            ->push(['items' => [['id' => 1], ['id' => 2]]])
            ->push([], 500)]);

        $run = $this->service()->syncAll();

        $this->assertSame('failed', $run->status);
        $this->assertDatabaseCount('villa_caches', 1);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '99', 'consecutive_missing_count' => 0]);
        $this->assertDatabaseCount('lodgify_property_events', 0);
    }

    public function test_all_http_room_failures_preserve_previous_room_snapshots(): void
    {
        $rooms = [['bedrooms' => 3, 'max_people' => 6]];
        VillaCache::create(['lodgify_id' => '1', 'name' => 'One', 'rooms_raw' => $rooms, 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        VillaCache::create(['lodgify_id' => '2', 'name' => 'Two', 'rooms_raw' => $rooms, 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        $this->replaceHttpFake([
            '*/properties?*' => Http::response(['items' => [['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two']]]),
            '*/rooms' => Http::response([], 503),
        ]);

        $run = $this->service(['page_size' => 50])->syncAll();

        $this->assertSame('completed_with_warnings', $run->status);
        $this->assertSame(2, $run->warning_count);
        foreach (VillaCache::all() as $villa) {
            $this->assertSame($rooms, $villa->rooms_raw);
            $this->assertSame(3, $villa->bedrooms);
            $this->assertSame(6, $villa->max_guests);
        }
    }

    public function test_one_room_failure_does_not_discard_other_successful_room_data(): void
    {
        $previous = [['bedrooms' => 2, 'max_people' => 4]];
        VillaCache::create(['lodgify_id' => '1', 'name' => 'One', 'rooms_raw' => $previous]);
        $this->replaceHttpFake([
            '*/properties?*' => Http::response(['items' => [['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two']]]),
            '*/properties/1/rooms' => Http::response([], 500),
            '*/properties/2/rooms' => Http::response([['bedrooms' => 5, 'max_people' => 10]]),
        ]);

        $run = $this->service(['page_size' => 50])->syncAll();

        $this->assertSame('completed_with_warnings', $run->status);
        $this->assertSame(1, $run->warning_count);
        $this->assertSame($previous, VillaCache::where('lodgify_id', '1')->firstOrFail()->rooms_raw);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '2', 'bedrooms' => 5, 'max_guests' => 10]);
    }

    public function test_invalid_response_never_promotes_empty_snapshot(): void
    {
        VillaCache::create(['lodgify_id' => '99', 'name' => 'Safe', 'lodgify_status' => VillaCache::STATUS_ACTIVE]);
        $this->replaceHttpFake(['*' => Http::response(['unexpected' => 'payload'])]);

        $run = $this->service()->syncAll();

        $this->assertSame('invalid_response', $run->error_category);
        $this->assertDatabaseHas('villa_caches', ['lodgify_id' => '99', 'lodgify_status' => VillaCache::STATUS_ACTIVE, 'consecutive_missing_count' => 0]);
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
        $this->assertSame(0, $second->changed_count);
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

    public function test_it_appends_only_meaningful_property_events(): void
    {
        $this->fakeProperties([['id' => 1, 'name' => 'One', 'is_active' => true]]);
        $this->service()->syncAll();

        $this->assertDatabaseHas('lodgify_property_events', ['lodgify_id' => '1', 'event_type' => 'property_discovered']);
        $count = LodgifyPropertyEvent::count();

        $this->service()->syncAll();

        $this->assertSame($count, LodgifyPropertyEvent::count());
    }

    public function test_missing_and_recovery_transitions_are_audited(): void
    {
        $this->fakeProperties([['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two']]);
        $this->service()->syncAll();
        $this->fakeProperties([['id' => 1, 'name' => 'One']]);
        $this->service()->syncAll();
        $this->service()->syncAll();
        $this->fakeProperties([['id' => 1, 'name' => 'One'], ['id' => 2, 'name' => 'Two']]);
        $this->service()->syncAll();

        $types = LodgifyPropertyEvent::where('lodgify_id', '2')->pluck('event_type')->all();
        $this->assertContains('property_suspected_missing', $types);
        $this->assertContains('property_missing_confirmed', $types);
        $this->assertContains('property_reappeared', $types);
    }

    public function test_active_lodgify_property_is_automatically_restored_to_managed(): void
    {
        VillaCache::create([
            'lodgify_id' => '818095',
            'name' => 'Villa Semanggi',
            'lodgify_status' => VillaCache::STATUS_MISSING,
            'management_status' => VillaCache::MANAGEMENT_REMOVED,
        ]);
        $this->fakeProperties([['id' => 818095, 'name' => 'Villa Semanggi', 'is_active' => true]]);

        $this->service()->syncAll();

        $this->assertDatabaseHas('villa_caches', [
            'lodgify_id' => '818095',
            'lodgify_status' => VillaCache::STATUS_ACTIVE,
            'management_status' => VillaCache::MANAGEMENT_MANAGED,
        ]);
        $this->assertDatabaseHas('lodgify_property_events', ['lodgify_id' => '818095', 'event_type' => 'property_reappeared']);
    }

    public function test_property_events_cannot_be_updated_or_deleted(): void
    {
        $this->fakeProperties([['id' => 1, 'name' => 'One']]);
        $this->service()->syncAll();
        $event = LodgifyPropertyEvent::firstOrFail();

        try {
            $event->update(['reason' => 'changed']);
            $this->fail('Expected append-only update protection.');
        } catch (\LogicException) {
            $this->assertDatabaseMissing('lodgify_property_events', ['id' => $event->id, 'reason' => 'changed']);
        }

        $this->expectException(\LogicException::class);
        $event->delete();
    }

    public function test_repeated_authentication_failure_is_deduplicated_and_success_resolves_it(): void
    {
        $options = [
            'timeout' => 2, 'retries' => 0, 'concurrency' => 2,
            'page_size' => 2, 'max_pages' => 3, 'min_ratio' => 0.1,
        ];
        $withoutKey = new LodgifyService('https://lodgify.test/v2', '', $options);
        $withoutKey->syncAll();
        $withoutKey->syncAll();

        $incident = LodgifyIncident::where('category', 'authentication')->firstOrFail();
        $this->assertSame(2, $incident->occurrence_count);
        $this->assertSame(LodgifyIncident::STATUS_OPEN, $incident->status);

        $this->fakeProperties([['id' => 1, 'name' => 'Recovered']]);
        $this->service(['page_size' => 50])->syncAll();

        $this->assertSame(LodgifyIncident::STATUS_RESOLVED, $incident->fresh()->status);
    }
}
