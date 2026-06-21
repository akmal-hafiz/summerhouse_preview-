<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VillaCache extends Model
{
    protected $fillable = [
        'lodgify_id',
        'name',
        'thumbnail_url',
        'bedrooms',
        'max_guests',
        'location',
        'raw',
        'synced_at',
    ];

    protected $casts = [
        'raw' => 'array',
        'synced_at' => 'datetime',
        'bedrooms' => 'integer',
        'max_guests' => 'integer',
    ];

    public function getRouteKeyName(): string
    {
        return 'lodgify_id';
    }
}
