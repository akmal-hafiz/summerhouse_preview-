<?php

namespace App\Services;

use App\Models\LodgifyIncident;
use App\Models\LodgifySyncRun;
use App\Models\VillaCache;
use App\Support\LodgifyLog;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class LodgifyService
{
    protected LodgifyAuditService $audit;

    protected LodgifyIncidentService $incidents;

    protected LodgifyHomepageValidator $homepageValidator;

    public function __construct(protected string $baseUrl, protected string $apiKey, protected array $options)
    {
        $this->audit = app(LodgifyAuditService::class);
        $this->incidents = app(LodgifyIncidentService::class);
        $this->homepageValidator = app(LodgifyHomepageValidator::class);
    }

    public static function make(): self
    {
        return new self(rtrim((string) config('services.lodgify.base_url'), '/'), (string) config('services.lodgify.key'), [
            'timeout' => (int) config('services.lodgify.request_timeout_seconds', 12),
            'retries' => (int) config('services.lodgify.max_retries', 1),
            'concurrency' => (int) config('services.lodgify.rooms_concurrency', 5),
            'page_size' => (int) config('services.lodgify.page_size', 50),
            'max_pages' => (int) config('services.lodgify.max_pages', 20),
            'min_ratio' => (float) config('services.lodgify.sync_min_count_ratio', 0.5),
        ]);
    }

    public function syncAll(): LodgifySyncRun
    {
        $run = LodgifySyncRun::create(['run_uuid' => (string) Str::uuid(), 'status' => 'running', 'started_at' => now()]);
        if ($this->apiKey === '') {
            $run = $this->fail($run, 'authentication', 'Lodgify API key is missing');
            $this->incidents->open('authentication', LodgifyIncident::SEVERITY_CRITICAL, 'Lodgify authentication is unavailable', 'The Lodgify API key is missing.', [], null, null, null, $run);

            return $run;
        }
        try {
            $properties = $this->fetchAllProperties();
            $previousRun = LodgifySyncRun::query()->whereIn('status', ['completed', 'completed_with_warnings'])->latest('finished_at')->first();
            $previousTotal = (int) ($previousRun?->total_count ?? 0);
            if ($previousTotal > 0 && count($properties) < $previousTotal * $this->options['min_ratio']) {
                $run = $this->finish($run, 'rejected_as_anomaly', ['total_count' => count($properties), 'error_count' => 1, 'error_category' => 'count_anomaly', 'error_message' => 'Candidate property count fell below the safe ratio']);
                $this->incidents->open('count_anomaly', LodgifyIncident::SEVERITY_WARNING, 'Lodgify property count was rejected', 'The candidate property count fell below the configured safe ratio. The previous snapshot was preserved.', ['previous_total' => $previousTotal, 'candidate_total' => count($properties)], null, null, null, $run);

                return $run;
            }
            $snapshot = (string) Str::uuid();
            [$roomsById, $warnings] = $this->fetchRoomsForProperties($properties);
            $counts = DB::transaction(fn () => $this->reconcile($properties, $roomsById, $snapshot, $run));
            $run = $this->finish($run, $warnings ? 'completed_with_warnings' : 'completed', array_merge($counts, ['snapshot_version' => $snapshot, 'warning_count' => $warnings]));
            $this->afterSuccessfulSync($run, $previousRun, $warnings);

            return $run;
        } catch (Throwable $error) {
            $category = $this->category($error);
            LodgifyLog::write($category === 'authentication' ? 'critical' : 'warning', 'lodgify.sync.failed', $error->getMessage(), [
                'category' => $category,
                'run_uuid' => $run->run_uuid,
                'operation' => 'full_sync',
            ]);

            if ($category === 'partial_sync') {
                $run = $this->finish($run, 'partial', ['error_count' => 1, 'error_category' => $category, 'error_message' => Str::limit($error->getMessage(), 1000)]);
            } else {
                $run = $this->fail($run, $category, $error->getMessage());
            }
            $severity = $category === 'authentication' ? LodgifyIncident::SEVERITY_CRITICAL : LodgifyIncident::SEVERITY_WARNING;
            $incidentCategory = $category === 'authentication' ? 'authentication' : 'sync_failure';
            $this->incidents->open($incidentCategory, $severity, 'Lodgify synchronization failed', 'The last-known-good property snapshot remains active.', ['error_category' => $category], null, null, null, $run);

            return $run;
        }
    }

    protected function afterSuccessfulSync(LodgifySyncRun $run, ?LodgifySyncRun $previousRun, int $roomWarnings): void
    {
        $this->incidents->resolveCategory('sync_failure');
        $this->incidents->resolveCategory('authentication');
        $this->incidents->resolveCategory('count_anomaly');

        $roomRatio = $run->total_count > 0 ? $roomWarnings / $run->total_count : 0;
        if ($roomRatio >= (float) config('services.lodgify.room_warning_ratio', 0.2)) {
            $this->incidents->open('room_degradation', LodgifyIncident::SEVERITY_WARNING, 'Lodgify room data is degraded', 'Several room requests failed. Previous room snapshots were retained.', ['warning_count' => $roomWarnings, 'total_count' => $run->total_count], null, null, null, $run);
        } else {
            $this->incidents->resolveCategory('room_degradation');
        }

        if ($previousRun && $previousRun->active_count > 0) {
            $drop = $previousRun->active_count - $run->active_count;
            $ratio = $drop / $previousRun->active_count;
            if ($drop >= min(5, max(1, (int) ceil($previousRun->active_count * (float) config('services.lodgify.active_drop_ratio', 0.2))))) {
                $this->incidents->open('active_count_anomaly', LodgifyIncident::SEVERITY_WARNING, 'Active villa count changed sharply', 'The active villa count dropped more than the configured threshold.', ['previous_active' => $previousRun->active_count, 'current_active' => $run->active_count, 'drop_ratio' => round($ratio, 4)], null, null, null, $run);
            } else {
                $this->incidents->resolveCategory('active_count_anomaly');
            }
        }

        $this->homepageValidator->validate($run);
        LodgifyLog::write('info', 'lodgify.sync.completed', 'Lodgify synchronization completed.', [
            'run_uuid' => $run->run_uuid,
            'operation' => 'full_sync',
            'total_count' => $run->total_count,
            'active_count' => $run->active_count,
            'inactive_count' => $run->inactive_count,
            'warning_count' => $run->warning_count,
            'duration_ms' => $run->finished_at?->diffInMilliseconds($run->started_at),
        ]);
    }

    protected function fetchAllProperties(): array
    {
        $seen = [];
        $terminated = false;
        for ($page = 1; $page <= $this->options['max_pages']; $page++) {
            $json = $this->request("/properties?page={$page}&size={$this->options['page_size']}")->json();
            $items = is_array($json['items'] ?? null) ? $json['items'] : (is_array($json) && array_is_list($json) ? $json : null);
            if (! is_array($items)) {
                throw new \RuntimeException('invalid_response: unsupported properties response');
            }
            foreach ($items as $property) {
                if (! is_array($property) || empty($property['id'])) {
                    throw new \RuntimeException('invalid_response: property ID is missing');
                }
                $seen[(string) $property['id']] = $property;
            }
            if (count($items) < $this->options['page_size']) {
                $terminated = true;
                break;
            }
        }
        if (! $terminated) {
            throw new \RuntimeException('partial_sync: property pagination did not terminate');
        }

        return array_values($seen);
    }

    protected function fetchRoomsForProperties(array $properties): array
    {
        $rooms = [];
        $warnings = 0;
        foreach (array_chunk($properties, $this->options['concurrency']) as $chunk) {
            $responses = Http::pool(fn ($pool) => array_map(fn ($property) => $pool->withHeaders($this->headers())->timeout($this->options['timeout'])->get($this->baseUrl.'/properties/'.rawurlencode((string) $property['id']).'/rooms'), $chunk));
            foreach ($chunk as $index => $property) {
                $id = (string) $property['id'];
                $response = $responses[$index] ?? null;
                if ($response instanceof Response && $response->successful() && is_array($response->json())) {
                    $rooms[$id] = $response->json();
                } else {
                    $warnings++;
                }
            }
        }

        return [$rooms, $warnings];
    }

    protected function reconcile(array $properties, array $roomsById, string $snapshot, LodgifySyncRun $run): array
    {
        $now = now();
        $seen = [];
        $active = $inactive = $new = $changed = 0;
        foreach ($properties as $property) {
            $id = (string) $property['id'];
            $seen[] = $id;
            $status = ($property['is_active'] ?? true) === false ? VillaCache::STATUS_INACTIVE : VillaCache::STATUS_ACTIVE;
            $existing = VillaCache::where('lodgify_id', $id)->first();
            $before = $this->audit->state($existing);
            if (! $existing) {
                $new++;
            } elseif ($existing->lodgify_status !== $status || $existing->raw !== $property) {
                $changed++;
            }
            $roomData = $roomsById[$id] ?? $existing?->rooms_raw;
            [$bedrooms, $guests, $thumb] = $this->aggregateRooms($roomData ?? []);
            $managementStatus = $status === VillaCache::STATUS_ACTIVE
                ? VillaCache::MANAGEMENT_MANAGED
                : ($existing?->management_status ?? VillaCache::MANAGEMENT_MANAGED);
            $villa = VillaCache::updateOrCreate(['lodgify_id' => $id], [
                'name' => $property['name'] ?? "Villa {$id}", 'thumbnail_url' => $thumb ?? $this->extractThumbnail($property) ?? $existing?->thumbnail_url,
                'bedrooms' => $bedrooms ?? $existing?->bedrooms, 'max_guests' => $guests ?? $existing?->max_guests,
                'location' => $this->extractLocation($property), 'raw' => $property, 'rooms_raw' => $roomData,
                'lodgify_status' => $status, 'management_status' => $managementStatus,
                'management_status_changed_at' => $existing && $existing->management_status !== $managementStatus ? $now : $existing?->management_status_changed_at,
                'management_status_note' => $existing && $existing->management_status !== $managementStatus ? 'Restored automatically because Lodgify reported the property active.' : $existing?->management_status_note,
                'last_seen_at' => $now, 'last_full_sync_at' => $now,
                'consecutive_missing_count' => 0, 'snapshot_version' => $snapshot, 'synced_at' => $now,
            ]);
            $after = $this->audit->state($villa);
            if (! $existing) {
                $this->audit->append($villa, 'property_discovered', $run, [], $after);
            } elseif ($before['lodgify_status'] !== $after['lodgify_status'] || $before['management_status'] !== $after['management_status']) {
                $eventType = $after['lodgify_status'] === VillaCache::STATUS_ACTIVE
                    && in_array($before['lodgify_status'], [VillaCache::STATUS_SUSPECTED_MISSING, VillaCache::STATUS_MISSING], true)
                    ? 'property_reappeared'
                    : 'lodgify_status_changed';
                $this->audit->append($villa, $eventType, $run, $before, $after);
            } elseif ($before !== $after) {
                $this->audit->append($villa, 'public_fields_changed', $run, $before, $after);
            }
            $status === VillaCache::STATUS_ACTIVE ? $active++ : $inactive++;
        }
        $suspected = 0;
        VillaCache::whereNotIn('lodgify_id', $seen)->get()->each(function (VillaCache $villa) use ($now, $snapshot, $run, &$suspected) {
            $before = $this->audit->state($villa);
            $count = $villa->consecutive_missing_count + 1;
            $villa->update(['lodgify_status' => $count >= 2 ? VillaCache::STATUS_MISSING : VillaCache::STATUS_SUSPECTED_MISSING, 'consecutive_missing_count' => $count, 'last_full_sync_at' => $now, 'snapshot_version' => $snapshot, 'synced_at' => $now]);
            $eventType = $count >= 2 ? 'property_missing_confirmed' : 'property_suspected_missing';
            $this->audit->append($villa, $eventType, $run, $before, $this->audit->state($villa->fresh()));
            if ($count === 1) {
                $suspected++;
            }
        });

        return ['total_count' => count($properties), 'active_count' => $active, 'inactive_count' => $inactive, 'new_count' => $new, 'changed_count' => $changed, 'suspected_missing_count' => $suspected];
    }

    protected function request(string $path): Response
    {
        $attempt = 0;
        do {
            try {
                $response = Http::withHeaders($this->headers())->timeout($this->options['timeout'])->get($this->baseUrl.$path);
            } catch (Throwable $error) {
                if ($attempt++ < $this->options['retries']) {
                    usleep(300000);

                    continue;
                } throw $error;
            }
            if ($response->successful()) {
                return $response;
            }
            if (! in_array($response->status(), [429, 500, 502, 503, 504], true) || $attempt++ >= $this->options['retries']) {
                throw new \RuntimeException("http_{$response->status()}: Lodgify request failed");
            }
            usleep(300000);
        } while (true);
    }

    protected function headers(): array
    {
        return ['X-ApiKey' => $this->apiKey, 'Accept' => 'application/json'];
    }

    protected function finish(LodgifySyncRun $run, string $status, array $values = []): LodgifySyncRun
    {
        $run->update(array_merge($values, ['status' => $status, 'finished_at' => now()]));

        return $run->fresh();
    }

    protected function fail(LodgifySyncRun $run, string $category, string $message): LodgifySyncRun
    {
        return $this->finish($run, 'failed', ['error_count' => 1, 'error_category' => $category, 'error_message' => Str::limit($message, 1000)]);
    }

    protected function category(Throwable $error): string
    {
        $message = strtolower($error->getMessage());

        if (str_starts_with($message, 'partial_sync:')) {
            return 'partial_sync';
        }

        if (str_starts_with($message, 'invalid_response:')) {
            return 'invalid_response';
        }

        return str_contains($message, 'timeout') ? 'timeout' : (str_contains($message, '401') || str_contains($message, '403') ? 'authentication' : 'request_failed');
    }

    protected function aggregateRooms(array $rooms): array
    {
        $bedrooms = $guests = 0;
        $thumb = null;
        foreach ($rooms as $room) {
            if (! is_array($room)) {
                continue;
            } $bedrooms += (int) ($room['bedrooms'] ?? 0);
            $guests += (int) ($room['max_people'] ?? 0);
            if (! $thumb && ! empty($room['image_url'])) {
                $thumb = $this->normalizeMediaUrl((string) $room['image_url']);
            }
        }

        return [$bedrooms ?: null, $guests ?: null, $thumb];
    }

    protected function extractThumbnail(array $property): ?string
    {
        foreach ([$property['image_url'] ?? null, $property['main_image_url'] ?? null, $property['images'][0]['url'] ?? null] as $url) {
            if (is_string($url) && ($value = $this->normalizeMediaUrl($url))) {
                return $value;
            }
        }

        return null;
    }

    protected function normalizeMediaUrl(string $url): ?string
    {
        $value = trim($url);
        if ($value === '' || preg_match('/[\x00-\x1F\x7F]/', $value)) {
            return null;
        } if (str_starts_with($value, '//')) {
            $value = 'https:'.$value;
        }

        return preg_match('/^https?:\/\//i', $value) ? $value : null;
    }

    protected function extractLocation(array $property): ?string
    {
        $parts = array_filter([$property['address'] ?? null, $property['city'] ?? null, $property['country'] ?? null], fn ($value) => is_string($value) && $value !== '');

        return $parts ? implode(', ', array_slice($parts, 0, 2)) : null;
    }
}
