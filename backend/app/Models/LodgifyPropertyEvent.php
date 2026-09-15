<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use LogicException;

class LodgifyPropertyEvent extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected $casts = [
        'changes' => 'array',
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Lodgify audit events are append-only.'));
        static::deleting(fn () => throw new LogicException('Lodgify audit events are append-only.'));
    }

    public function villa()
    {
        return $this->belongsTo(VillaCache::class, 'villa_cache_id');
    }

    public function syncRun()
    {
        return $this->belongsTo(LodgifySyncRun::class, 'sync_run_id');
    }
}
