<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LodgifySyncRun extends Model
{
    protected $guarded = [];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function succeeded(): bool
    {
        return in_array($this->status, ['completed', 'completed_with_warnings'], true);
    }

    public function propertyEvents()
    {
        return $this->hasMany(LodgifyPropertyEvent::class, 'sync_run_id');
    }
}
