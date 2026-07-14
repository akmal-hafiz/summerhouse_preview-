<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestimonialAudit extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'testimonial_id',
        'action',
        'actor_id',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function testimonial(): BelongsTo
    {
        return $this->belongsTo(Testimonial::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
