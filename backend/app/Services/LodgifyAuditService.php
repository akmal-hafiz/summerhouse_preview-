<?php

namespace App\Services;

use App\Models\LodgifyPropertyEvent;
use App\Models\LodgifySyncRun;
use App\Models\VillaCache;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class LodgifyAuditService
{
    private const SENSITIVE_PATTERN = '/key|token|secret|password|authorization|cookie/i';

    public function state(?VillaCache $villa): array
    {
        if (! $villa) {
            return [];
        }

        return [
            'lodgify_status' => $villa->lodgify_status,
            'management_status' => $villa->management_status,
            'name' => $villa->name,
            'thumbnail_url' => $villa->thumbnail_url,
            'bedrooms' => $villa->bedrooms,
            'max_guests' => $villa->max_guests,
            'location' => $villa->location,
            'raw' => $villa->raw,
            'rooms_raw' => $villa->rooms_raw,
            'consecutive_missing_count' => $villa->consecutive_missing_count,
        ];
    }

    public function append(
        VillaCache $villa,
        string $eventType,
        ?LodgifySyncRun $run,
        array $before,
        array $after,
        array $metadata = [],
        string $actorType = 'system',
        ?string $reason = null,
    ): LodgifyPropertyEvent {
        $before = $this->sanitize($before);
        $after = $this->sanitize($after);
        $changes = $this->changes($before, $after);
        $previousHash = $before === [] ? null : $this->hash($before);
        $currentHash = $after === [] ? null : $this->hash($after);
        $eventKey = hash('sha256', implode(':', [
            $run?->run_uuid ?? 'manual',
            $villa->lodgify_id,
            $eventType,
            $previousHash ?? 'none',
            $currentHash ?? 'none',
        ]));

        return LodgifyPropertyEvent::firstOrCreate(
            ['event_key' => $eventKey],
            [
                'event_uuid' => (string) Str::uuid(),
                'sync_run_id' => $run?->id,
                'villa_cache_id' => $villa->id,
                'lodgify_id' => $villa->lodgify_id,
                'event_type' => $eventType,
                'previous_lodgify_status' => $before['lodgify_status'] ?? null,
                'new_lodgify_status' => $after['lodgify_status'] ?? null,
                'previous_management_status' => $before['management_status'] ?? null,
                'new_management_status' => $after['management_status'] ?? null,
                'changes' => $changes,
                'previous_hash' => $previousHash,
                'current_hash' => $currentHash,
                'actor_type' => $actorType,
                'reason' => $reason,
                'metadata' => $this->sanitize($metadata),
                'occurred_at' => now(),
            ],
        );
    }

    private function changes(array $before, array $after): array
    {
        $changes = [];
        foreach (array_unique(array_merge(array_keys($before), array_keys($after))) as $key) {
            $old = $before[$key] ?? null;
            $new = $after[$key] ?? null;
            if ($old !== $new) {
                $changes[$key] = ['from' => $old, 'to' => $new];
            }
        }

        return $changes;
    }

    private function hash(array $value): string
    {
        return hash('sha256', json_encode($this->canonicalize($value), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
    }

    private function canonicalize(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }
        if (Arr::isAssoc($value)) {
            ksort($value);
        }
        foreach ($value as $key => $item) {
            $value[$key] = $this->canonicalize($item);
        }

        return $value;
    }

    private function sanitize(mixed $value): mixed
    {
        if (! is_array($value)) {
            return is_string($value) ? Str::limit($value, 2000, '') : $value;
        }

        $clean = [];
        foreach ($value as $key => $item) {
            if (is_string($key) && preg_match(self::SENSITIVE_PATTERN, $key)) {
                continue;
            }
            $clean[$key] = $this->sanitize($item);
        }

        return $clean;
    }
}
