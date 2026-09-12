<?php

namespace App\Services;

use App\Models\LodgifySyncRun;
use App\Models\VillaCache;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class LodgifyService
{
    public function __construct(protected string $baseUrl, protected string $apiKey, protected array $options) {}

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
            return $this->fail($run, 'authentication', 'Lodgify API key is missing');
        }
        try {
            $properties = $this->fetchAllProperties();
            $previousTotal = (int) LodgifySyncRun::query()->whereIn('status', ['completed', 'completed_with_warnings'])->latest('finished_at')->value('total_count');
            if ($previousTotal > 0 && count($properties) < $previousTotal * $this->options['min_ratio']) {
                return $this->finish($run, 'rejected_as_anomaly', ['total_count' => count($properties), 'error_count' => 1, 'error_category' => 'count_anomaly', 'error_message' => 'Candidate property count fell below the safe ratio']);
            }
            $snapshot = (string) Str::uuid();
            [$roomsById, $warnings] = $this->fetchRoomsForProperties($properties);
            $counts = DB::transaction(fn () => $this->reconcile($properties, $roomsById, $snapshot));

            return $this->finish($run, $warnings ? 'completed_with_warnings' : 'completed', array_merge($counts, ['snapshot_version' => $snapshot, 'warning_count' => $warnings]));
        } catch (Throwable $error) {
            $category = $this->category($error);
            Log::warning('[lodgify:sync]', ['category' => $category, 'message' => $error->getMessage()]);

            if ($category === 'partial_sync') {
                return $this->finish($run, 'partial', ['error_count' => 1, 'error_category' => $category, 'error_message' => Str::limit($error->getMessage(), 1000)]);
            }

            return $this->fail($run, $category, $error->getMessage());
        }
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

    protected function reconcile(array $properties, array $roomsById, string $snapshot): array
    {
        $now = now();
        $seen = [];
        $active = $inactive = $new = $changed = 0;
        foreach ($properties as $property) {
            $id = (string) $property['id'];
            $seen[] = $id;
            $status = ($property['is_active'] ?? true) === false ? VillaCache::STATUS_INACTIVE : VillaCache::STATUS_ACTIVE;
            $existing = VillaCache::where('lodgify_id', $id)->first();
            if (! $existing) {
                $new++;
            } elseif ($existing->lodgify_status !== $status || $existing->raw !== $property) {
                $changed++;
            }
            $roomData = $roomsById[$id] ?? $existing?->rooms_raw;
            [$bedrooms, $guests, $thumb] = $this->aggregateRooms($roomData ?? []);
            VillaCache::updateOrCreate(['lodgify_id' => $id], [
                'name' => $property['name'] ?? "Villa {$id}", 'thumbnail_url' => $thumb ?? $this->extractThumbnail($property) ?? $existing?->thumbnail_url,
                'bedrooms' => $bedrooms ?? $existing?->bedrooms, 'max_guests' => $guests ?? $existing?->max_guests,
                'location' => $this->extractLocation($property), 'raw' => $property, 'rooms_raw' => $roomData,
                'lodgify_status' => $status, 'last_seen_at' => $now, 'last_full_sync_at' => $now,
                'consecutive_missing_count' => 0, 'snapshot_version' => $snapshot, 'synced_at' => $now,
            ]);
            $status === VillaCache::STATUS_ACTIVE ? $active++ : $inactive++;
        }
        $suspected = 0;
        VillaCache::whereNotIn('lodgify_id', $seen)->get()->each(function (VillaCache $villa) use ($now, $snapshot, &$suspected) {
            $count = $villa->consecutive_missing_count + 1;
            $villa->update(['lodgify_status' => $count >= 2 ? VillaCache::STATUS_MISSING : VillaCache::STATUS_SUSPECTED_MISSING, 'consecutive_missing_count' => $count, 'last_full_sync_at' => $now, 'snapshot_version' => $snapshot, 'synced_at' => $now]);
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
