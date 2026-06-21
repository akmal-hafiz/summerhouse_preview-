<?php

namespace App\Services;

use App\Models\VillaCache;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LodgifyService
{
    public function __construct(
        protected string $baseUrl,
        protected string $apiKey,
        protected int $ttlMinutes,
    ) {
    }

    public static function make(): self
    {
        return new self(
            rtrim((string) config('services.lodgify.base_url'), '/'),
            (string) config('services.lodgify.key'),
            (int) config('services.lodgify.sync_ttl_minutes'),
        );
    }

    public function syncIfStale(): int
    {
        $latest = VillaCache::query()->max('synced_at');

        if ($latest && Carbon::parse($latest)->gt(now()->subMinutes($this->ttlMinutes))) {
            return 0;
        }

        return $this->syncAll();
    }

    public function syncAll(): int
    {
        if (!$this->apiKey) {
            Log::warning('[lodgify] missing API key');
            return 0;
        }

        $properties = $this->fetchProperties();
        $count = 0;

        foreach ($properties as $prop) {
            $id = (string) ($prop['id'] ?? '');
            if ($id === '') continue;

            $rooms = $this->fetchRooms($id);
            [$bedrooms, $guests, $thumb] = $this->aggregateRooms($rooms);

            VillaCache::updateOrCreate(
                ['lodgify_id' => $id],
                [
                    'name' => $prop['name'] ?? "Villa {$id}",
                    'thumbnail_url' => $thumb ?? $this->extractThumbnail($prop),
                    'bedrooms' => $bedrooms,
                    'max_guests' => $guests,
                    'location' => $this->extractLocation($prop),
                    'raw' => $prop,
                    'synced_at' => now(),
                ]
            );
            $count++;
        }

        return $count;
    }

    protected function fetchRooms(string $propertyId): array
    {
        try {
            $response = Http::withHeaders([
                'X-ApiKey' => $this->apiKey,
                'Accept' => 'application/json',
            ])->timeout(12)->get("{$this->baseUrl}/properties/{$propertyId}/rooms");

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            return is_array($data) ? $data : [];
        } catch (\Throwable $e) {
            return [];
        }
    }

    protected function aggregateRooms(array $rooms): array
    {
        $bedrooms = 0;
        $guests = 0;
        $thumb = null;

        foreach ($rooms as $room) {
            if (!is_array($room)) continue;
            $bedrooms += (int) ($room['bedrooms'] ?? 0);
            $guests += (int) ($room['max_people'] ?? 0);
            if (!$thumb && !empty($room['image_url'])) {
                $url = (string) $room['image_url'];
                $thumb = str_starts_with($url, 'http') ? $url : 'https:' . ltrim($url, ':');
            }
        }

        return [
            $bedrooms ?: null,
            $guests ?: null,
            $thumb,
        ];
    }

    protected function fetchProperties(): array
    {
        try {
            $response = Http::withHeaders([
                'X-ApiKey' => $this->apiKey,
                'Accept' => 'application/json',
            ])->timeout(15)->get("{$this->baseUrl}/properties");

            if (!$response->successful()) {
                Log::warning('[lodgify] non-200', ['status' => $response->status()]);
                return [];
            }

            $data = $response->json();
            return is_array($data['items'] ?? null) ? $data['items'] : (is_array($data) ? $data : []);
        } catch (\Throwable $e) {
            Log::error('[lodgify] fetch failed', ['err' => $e->getMessage()]);
            return [];
        }
    }

    protected function extractThumbnail(array $prop): ?string
    {
        $candidates = [
            $prop['image_url'] ?? null,
            $prop['main_image_url'] ?? null,
            $prop['images'][0]['url'] ?? null,
            $prop['rooms'][0]['image_url'] ?? null,
            $prop['rooms'][0]['photos'][0]['url'] ?? null,
        ];

        foreach ($candidates as $url) {
            if (is_string($url) && $url !== '') {
                return str_starts_with($url, 'http') ? $url : 'https:' . ltrim($url, ':');
            }
        }

        return null;
    }

    protected function extractInt(array $prop, array $keys): ?int
    {
        foreach ($keys as $k) {
            if (isset($prop[$k]) && is_numeric($prop[$k])) {
                return (int) $prop[$k];
            }
        }

        $rooms = $prop['rooms'][0] ?? null;
        if (is_array($rooms)) {
            foreach ($keys as $k) {
                if (isset($rooms[$k]) && is_numeric($rooms[$k])) {
                    return (int) $rooms[$k];
                }
            }
        }

        return null;
    }

    protected function extractLocation(array $prop): ?string
    {
        $parts = array_filter([
            $prop['address'] ?? null,
            $prop['city'] ?? null,
            $prop['country'] ?? null,
        ], fn ($v) => is_string($v) && $v !== '');

        return $parts ? implode(', ', array_slice($parts, 0, 2)) : null;
    }
}
