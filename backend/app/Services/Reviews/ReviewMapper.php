<?php

namespace App\Services\Reviews;

use App\Models\Testimonial;
use App\Support\AssetUrl;

/**
 * Maps Testimonial models to public DTOs. Public DTOs must never expose
 * reviewer email, internal user IDs, or moderation metadata.
 */
class ReviewMapper
{
    public static function toPublic(Testimonial $review): array
    {
        $villa = $review->relationLoaded('villa') ? $review->villa : null;

        return [
            'id' => (string) $review->id,
            'villaLodgifyId' => $villa?->lodgify_id,
            'villaName' => $villa?->name,
            'villaLocation' => $villa?->location,
            'reviewerName' => $review->author,
            'reviewerLocation' => $review->location,
            'reviewerAvatarUrl' => AssetUrl::resolve($review->avatar),
            'title' => $review->title,
            'comment' => $review->text,
            'rating' => $review->stars ? (int) $review->stars : null,
            'sourceLabel' => self::sourceLabel($review),
            'source' => $review->source,
            'isVerified' => (bool) $review->is_verified,
            'isFeatured' => (bool) $review->is_featured,
            'reviewDate' => $review->review_date?->toDateString(),
            'stayDate' => $review->stay_date?->toDateString(),
            'publishedAt' => $review->published_at?->toIso8601String(),
        ];
    }

    protected static function sourceLabel(Testimonial $review): ?string
    {
        if ($review->source_label) return $review->source_label;

        return match ($review->source) {
            Testimonial::SOURCE_MANUAL => null,
            Testimonial::SOURCE_GUEST_SUBMISSION => 'Guest submission',
            Testimonial::SOURCE_LODGIFY => 'Lodgify',
            Testimonial::SOURCE_AIRBNB => 'Airbnb',
            Testimonial::SOURCE_BOOKING_COM => 'Booking.com',
            Testimonial::SOURCE_VRBO => 'Vrbo',
            Testimonial::SOURCE_GOOGLE => 'Google',
            default => null,
        };
    }
}
