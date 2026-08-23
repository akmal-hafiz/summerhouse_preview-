<?php

namespace App\Services\Reviews;

use App\Models\Testimonial;
use App\Models\VillaCache;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ReviewRepository
{
    public const CACHE_TTL = 300;

    public function featuredTestimonials(int $limit = 6, ?string $page = null): Collection
    {
        return (function () use ($limit, $page) {
            $baseQuery = Testimonial::query()
                ->published()
                ->whereNotNull('text')
                ->where('text', '!=', '')
                ->with('villa:id,lodgify_id,name,location');

            // Placement toggles decide page visibility; legacy `page` column is
            // only a fallback for rows created before placements existed.
            // About/home testimonials are curated real guest reviews only.
            if ($page === 'about') {
                $baseQuery->placedOn(Testimonial::PLACEMENT_ABOUT)
                    ->ofType(Testimonial::TYPE_GUEST_REVIEW);
            } elseif ($page === 'home') {
                $baseQuery->placedOn(Testimonial::PLACEMENT_HOME)
                    ->ofType(Testimonial::TYPE_GUEST_REVIEW);
            } elseif ($page === 'concierge') {
                $baseQuery->placedOn(Testimonial::PLACEMENT_CONCIERGE)
                    ->ofType(Testimonial::TYPE_GUEST_REVIEW);
            } elseif ($page) {
                $baseQuery->where(function ($q) use ($page) {
                    $q->where('page', $page)->orWhereNull('page');
                });
            }

            $featured = (clone $baseQuery)
                ->featured()
                ->pinnedFirst()
                ->orderByRaw('COALESCE(display_order, sort_order) ASC')
                ->orderByDesc('is_verified')
                ->orderByDesc('stars')
                ->orderByDesc('review_date')
                ->orderByDesc('published_at')
                ->limit($limit)
                ->get();

            if ($featured->count() >= $limit) {
                return $featured;
            }

            $remaining = $limit - $featured->count();
            $excludeIds = $featured->pluck('id')->all();

            $fallback = (clone $baseQuery)
                ->when($excludeIds, fn ($q) => $q->whereNotIn('id', $excludeIds))
                ->pinnedFirst()
                ->orderByRaw('COALESCE(display_order, sort_order) ASC')
                ->orderByDesc('is_verified')
                ->orderByDesc('stars')
                ->orderByDesc('review_date')
                ->orderByDesc('published_at')
                ->limit($remaining)
                ->get();

            return $featured->concat($fallback);
        })();
    }

    public function servicesTestimonials(int $limit = 6): Collection
    {
        return (function () use ($limit) {
            return Testimonial::query()
                ->published()
                ->ofType(Testimonial::TYPE_OWNER_TESTIMONIAL)
                ->placedOn(Testimonial::PLACEMENT_SERVICES)
                ->whereNotNull('text')
                ->where('text', '!=', '')
                ->with('villa:id,lodgify_id,name,location')
                ->pinnedFirst()
                ->orderByRaw('COALESCE(display_order, sort_order) ASC')
                ->orderByDesc('published_at')
                ->limit($limit)
                ->get();
        })();
    }

    public function publishedByVilla(string $lodgifyId, int $limit = 20): Collection
    {
        $cacheKey = "cms.reviews.villa.{$lodgifyId}.list.{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($lodgifyId, $limit) {
            $villa = VillaCache::where('lodgify_id', $lodgifyId)->first();
            if (!$villa) return collect();

            return Testimonial::query()
                ->published()
                ->forVilla($villa->id)
                ->placedOn(Testimonial::PLACEMENT_VILLA)
                ->whereNotNull('text')
                ->where('text', '!=', '')
                ->pinnedFirst()
                ->orderByRaw('COALESCE(display_order, sort_order) ASC')
                ->orderByDesc('is_featured')
                ->orderByDesc('is_verified')
                ->orderByDesc('review_date')
                ->orderByDesc('published_at')
                ->limit($limit)
                ->get();
        });
    }

    public function villaSummary(string $lodgifyId): array
    {
        $cacheKey = "cms.reviews.villa.{$lodgifyId}.summary";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($lodgifyId) {
            $villa = VillaCache::where('lodgify_id', $lodgifyId)->first();
            if (!$villa) {
                return $this->emptySummary();
            }

            $rows = Testimonial::query()
                ->published()
                ->forVilla($villa->id)
                ->placedOn(Testimonial::PLACEMENT_VILLA)
                ->get(['stars', 'is_verified']);

            $total = $rows->count();
            $rated = $rows->filter(fn ($r) => is_numeric($r->stars) && $r->stars > 0);
            $ratedCount = $rated->count();

            $average = $ratedCount > 0
                ? round($rated->sum('stars') / $ratedCount, 2)
                : null;

            $distribution = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
            foreach ($rated as $r) {
                $bucket = (int) max(1, min(5, $r->stars));
                $distribution[$bucket]++;
            }

            return [
                'average_rating' => $average,
                'rated_count' => $ratedCount,
                'total_count' => $total,
                'verified_count' => $rows->filter(fn ($r) => $r->is_verified)->count(),
                'distribution' => $distribution,
            ];
        });
    }

    protected function emptySummary(): array
    {
        return [
            'average_rating' => null,
            'rated_count' => 0,
            'total_count' => 0,
            'verified_count' => 0,
            'distribution' => [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0],
        ];
    }
}
