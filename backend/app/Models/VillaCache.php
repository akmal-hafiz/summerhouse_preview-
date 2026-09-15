<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class VillaCache extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUS_SUSPECTED_MISSING = 'suspected_missing';

    public const STATUS_MISSING = 'missing';

    public const MANAGEMENT_MANAGED = 'managed';

    public const MANAGEMENT_REMOVED = 'removed_from_portfolio';

    protected $fillable = [
        'lodgify_id',
        'name',
        'thumbnail_url',
        'bedrooms',
        'max_guests',
        'location',
        'raw',
        'synced_at',
        'lodgify_status',
        'management_status',
        'management_status_changed_at',
        'management_status_changed_by',
        'management_status_note',
        'rooms_raw',
        'last_seen_at',
        'last_full_sync_at',
        'consecutive_missing_count',
        'snapshot_version',
    ];

    protected $casts = [
        'raw' => 'array',
        'synced_at' => 'datetime',
        'bedrooms' => 'integer',
        'max_guests' => 'integer',
        'rooms_raw' => 'array',
        'last_seen_at' => 'datetime',
        'last_full_sync_at' => 'datetime',
        'consecutive_missing_count' => 'integer',
        'management_status_changed_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'lodgify_id';
    }

    public function scopePubliclyEligible(Builder $query): Builder
    {
        return $query
            ->where('lodgify_status', self::STATUS_ACTIVE)
            ->where('management_status', self::MANAGEMENT_MANAGED);
    }

    public function isPubliclyEligible(): bool
    {
        return $this->lodgify_status === self::STATUS_ACTIVE
            && $this->management_status === self::MANAGEMENT_MANAGED;
    }

    public function auditEvents()
    {
        return $this->hasMany(LodgifyPropertyEvent::class)->latest('occurred_at');
    }
}
