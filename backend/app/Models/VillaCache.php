<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VillaCache extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUS_SUSPECTED_MISSING = 'suspected_missing';

    public const STATUS_MISSING = 'missing';

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
    ];

    public function getRouteKeyName(): string
    {
        return 'lodgify_id';
    }
}
