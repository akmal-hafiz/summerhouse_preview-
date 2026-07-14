<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Testimonial extends Model
{
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_HIDDEN = 'hidden';
    public const STATUS_ARCHIVED = 'archived';
    public const STATUS_SPAM = 'spam';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
        self::STATUS_HIDDEN,
        self::STATUS_ARCHIVED,
        self::STATUS_SPAM,
    ];

    public const PLACEMENT_VILLA = 'show_on_villa';
    public const PLACEMENT_ABOUT = 'show_on_about';
    public const PLACEMENT_HOME = 'show_on_home';
    public const PLACEMENT_SERVICES = 'show_on_services';

    public const TYPE_GUEST_REVIEW = 'guest_review';
    public const TYPE_OWNER_TESTIMONIAL = 'owner_testimonial';

    public const TYPES = [
        self::TYPE_GUEST_REVIEW,
        self::TYPE_OWNER_TESTIMONIAL,
    ];

    public const PUBLIC_STATUSES = [self::STATUS_APPROVED];

    public const SOURCE_MANUAL = 'manual';
    public const SOURCE_GUEST_SUBMISSION = 'guest_submission';
    public const SOURCE_LODGIFY = 'lodgify';
    public const SOURCE_AIRBNB = 'airbnb';
    public const SOURCE_BOOKING_COM = 'booking_com';
    public const SOURCE_VRBO = 'vrbo';
    public const SOURCE_GOOGLE = 'google';
    public const SOURCE_OTHER = 'other';

    public const SOURCES = [
        self::SOURCE_MANUAL,
        self::SOURCE_GUEST_SUBMISSION,
        self::SOURCE_LODGIFY,
        self::SOURCE_AIRBNB,
        self::SOURCE_BOOKING_COM,
        self::SOURCE_VRBO,
        self::SOURCE_GOOGLE,
        self::SOURCE_OTHER,
    ];

    protected $fillable = [
        'page',
        'type',
        'villa_cache_id',
        'author',
        'location',
        'owner_role',
        'metrics',
        'reviewer_email',
        'title',
        'stars',
        'text',
        'avatar',
        'source',
        'source_label',
        'external_review_id',
        'external_url',
        'status',
        'is_verified',
        'is_featured',
        'stay_date',
        'review_date',
        'published_at',
        'sort_order',
        'display_order',
        'is_active',
        'show_on_villa',
        'show_on_about',
        'show_on_home',
        'show_on_services',
        'is_pinned',
        'created_by_id',
        'updated_by_id',
        'moderated_by_id',
        'moderated_at',
        'edited_at',
    ];

    protected $casts = [
        'stars' => 'integer',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'show_on_villa' => 'boolean',
        'show_on_about' => 'boolean',
        'show_on_home' => 'boolean',
        'show_on_services' => 'boolean',
        'metrics' => 'array',
        'is_pinned' => 'boolean',
        'stay_date' => 'date',
        'review_date' => 'date',
        'published_at' => 'datetime',
        'moderated_at' => 'datetime',
        'edited_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        $flush = function (Testimonial $row) {
            Cache::forget("cms.testimonials.{$row->page}");
            // Placements let one review appear on several pages, so flush all page caches.
            foreach (['about', 'home', 'services', 'villa'] as $page) {
                Cache::forget("cms.testimonials.{$page}");
            }
            Cache::forget('cms.testimonials.featured');
            if ($row->villa_cache_id) {
                $villa = VillaCache::find($row->villa_cache_id);
                if ($villa) {
                    Cache::forget("cms.reviews.villa.{$villa->lodgify_id}");
                }
            }
            if ($row->wasChanged('villa_cache_id')) {
                $original = $row->getOriginal('villa_cache_id');
                if ($original) {
                    $prev = VillaCache::find($original);
                    if ($prev) {
                        Cache::forget("cms.reviews.villa.{$prev->lodgify_id}");
                    }
                }
            }
        };

        static::saved($flush);
        static::deleted($flush);
        static::restored($flush);
    }

    public function villa(): BelongsTo
    {
        return $this->belongsTo(VillaCache::class, 'villa_cache_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }

    public function moderatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by_id');
    }

    public function audits()
    {
        return $this->hasMany(TestimonialAudit::class)->latest('created_at');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    // Named onPage (not forPage) — scopeForPage would shadow the query
    // builder's internal forPage() and silently break paginate().
    public function scopeOnPage(Builder $query, string $page): Builder
    {
        return $query->where('page', $page);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderByRaw('COALESCE(display_order, sort_order) ASC');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_APPROVED)
            ->where('is_active', true)
            ->whereNotNull('published_at');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeForVilla(Builder $query, int $villaCacheId): Builder
    {
        return $query->where('villa_cache_id', $villaCacheId);
    }

    public function scopeBySource(Builder $query, string $source): Builder
    {
        return $query->where('source', $source);
    }

    public function scopePlacedOn(Builder $query, string $placement): Builder
    {
        return $query->where($placement, true);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopePinnedFirst(Builder $query): Builder
    {
        return $query->orderByDesc('is_pinned');
    }
}
