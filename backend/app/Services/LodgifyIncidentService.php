<?php

namespace App\Services;

use App\Models\LodgifyIncident;
use App\Models\LodgifySyncRun;
use App\Models\User;
use App\Support\LodgifyLog;
use Filament\Notifications\Notification;
use Illuminate\Support\Str;

class LodgifyIncidentService
{
    public function open(
        string $category,
        string $severity,
        string $title,
        string $message,
        array $context = [],
        ?string $lodgifyId = null,
        ?string $referenceType = null,
        ?string $referenceKey = null,
        ?LodgifySyncRun $run = null,
    ): LodgifyIncident {
        $fingerprint = $this->fingerprint($category, $lodgifyId, $referenceType, $referenceKey);
        $incident = LodgifyIncident::where('fingerprint', $fingerprint)->first();
        $isNew = ! $incident || $incident->status === LodgifyIncident::STATUS_RESOLVED;
        $previousSeverity = $incident?->severity;
        $now = now();

        if (! $incident) {
            $incident = LodgifyIncident::create([
                'incident_uuid' => (string) Str::uuid(),
                'fingerprint' => $fingerprint,
                'severity' => $severity,
                'category' => $category,
                'status' => LodgifyIncident::STATUS_OPEN,
                'title' => Str::limit($title, 255, ''),
                'message' => Str::limit($message, 2000, ''),
                'lodgify_id' => $lodgifyId,
                'reference_type' => $referenceType,
                'reference_key' => $referenceKey,
                'first_seen_at' => $now,
                'last_seen_at' => $now,
                'occurrence_count' => 1,
                'first_run_uuid' => $run?->run_uuid,
                'latest_run_uuid' => $run?->run_uuid,
                'context' => LodgifyLog::sanitize($context),
            ]);
        } else {
            $incident->update([
                'severity' => $severity,
                'status' => LodgifyIncident::STATUS_OPEN,
                'title' => Str::limit($title, 255, ''),
                'message' => Str::limit($message, 2000, ''),
                'last_seen_at' => $now,
                'occurrence_count' => $incident->occurrence_count + 1,
                'latest_run_uuid' => $run?->run_uuid ?? $incident->latest_run_uuid,
                'context' => LodgifyLog::sanitize($context),
                'resolved_at' => null,
                'resolved_by' => null,
            ]);
        }

        $escalated = $previousSeverity !== null && $this->rank($severity) > $this->rank($previousSeverity);
        if ($this->shouldNotify($incident, $isNew, $escalated)) {
            $this->notifyAdmins($incident);
        }

        $logSeverity = match ($severity) {
            LodgifyIncident::SEVERITY_CRITICAL => 'critical',
            LodgifyIncident::SEVERITY_WARNING => 'warning',
            default => 'info',
        };
        LodgifyLog::write($logSeverity, 'lodgify.incident.opened', $message, [
            'category' => $category,
            'property_id' => $lodgifyId,
            'run_uuid' => $run?->run_uuid,
            'incident_uuid' => $incident->incident_uuid,
            'occurrence_count' => $incident->occurrence_count,
        ]);

        return $incident->fresh();
    }

    public function resolve(string $category, ?string $lodgifyId = null, ?string $referenceType = null, ?string $referenceKey = null): ?LodgifyIncident
    {
        $incident = LodgifyIncident::where('fingerprint', $this->fingerprint($category, $lodgifyId, $referenceType, $referenceKey))
            ->unresolved()
            ->first();
        if (! $incident) {
            return null;
        }

        $this->resolveIncident($incident);
        LodgifyLog::write('info', 'lodgify.incident.resolved', "Resolved: {$incident->title}", [
            'category' => $category,
            'incident_uuid' => $incident->incident_uuid,
            'property_id' => $lodgifyId,
        ]);

        return $incident->fresh();
    }

    public function resolveCategory(string $category): int
    {
        $count = 0;
        LodgifyIncident::unresolved()->where('category', $category)->get()->each(function (LodgifyIncident $incident) use (&$count) {
            $this->resolveIncident($incident);
            $count++;
        });

        return $count;
    }

    public function fingerprint(string $category, ?string $lodgifyId = null, ?string $referenceType = null, ?string $referenceKey = null): string
    {
        return hash('sha256', implode('|', [$category, $lodgifyId ?? '', $referenceType ?? '', $referenceKey ?? '']));
    }

    private function shouldNotify(LodgifyIncident $incident, bool $isNew, bool $escalated): bool
    {
        if ($incident->severity === LodgifyIncident::SEVERITY_CRITICAL) {
            return $isNew || $escalated;
        }

        return $incident->severity === LodgifyIncident::SEVERITY_WARNING
            && ($escalated || $incident->occurrence_count === 2);
    }

    private function notifyAdmins(LodgifyIncident $incident, bool $resolved = false): void
    {
        $admins = User::query()->where('role', 'admin')->get();
        if ($admins->isEmpty()) {
            return;
        }

        $notification = Notification::make()
            ->title($resolved ? "Resolved: {$incident->title}" : $incident->title)
            ->body($incident->message);
        if ($resolved) {
            $notification->success();
        } elseif ($incident->severity === LodgifyIncident::SEVERITY_CRITICAL) {
            $notification->danger();
        } else {
            $notification->warning();
        }
        $notification->sendToDatabase($admins);
    }

    private function resolveIncident(LodgifyIncident $incident): void
    {
        $wasCritical = $incident->severity === LodgifyIncident::SEVERITY_CRITICAL;
        $incident->update(['status' => LodgifyIncident::STATUS_RESOLVED, 'resolved_at' => now()]);
        if ($wasCritical) {
            $this->notifyAdmins($incident, true);
        }
    }

    private function rank(string $severity): int
    {
        return match ($severity) {
            LodgifyIncident::SEVERITY_CRITICAL => 3,
            LodgifyIncident::SEVERITY_WARNING => 2,
            default => 1,
        };
    }
}
