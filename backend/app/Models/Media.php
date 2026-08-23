<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media extends Model
{
    protected $fillable = [
        'disk',
        'uuid',
        'path',
        'source_path',
        'processed_path',
        'filename',
        'mime_type',
        'original_mime_type',
        'size',
        'original_size',
        'width',
        'height',
        'source_checksum',
        'output_checksum',
        'status',
        'batch_uuid',
        'fallback_reference',
        'processor_version',
        'error_message',
        'processed_at',
        'alt_text',
        'uploaded_by',
    ];

    protected $casts = [
        'size' => 'integer',
        'original_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'processor_version' => 'integer',
        'processed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Media $media): void {
            $media->uuid ??= (string) Str::uuid();
        });
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): string
    {
        $path = $this->processed_path ?: $this->path;

        return Storage::disk($this->disk)->url($path);
    }

    public function getReferenceAttribute(): string
    {
        return "media:{$this->uuid}";
    }

    public function isReady(): bool
    {
        return $this->status === 'ready' && filled($this->processed_path);
    }
}
