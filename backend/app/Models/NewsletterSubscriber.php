<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'is_active',
        'consent_at',
        'unsubscribed_at',
        'source',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'consent_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];
}
