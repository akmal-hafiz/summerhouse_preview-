<?php

namespace App\Services\Reviews;

use App\Models\Testimonial;
use App\Models\TestimonialAudit;
use App\Models\User;
use App\Models\VillaCache;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class ReviewService
{
    /**
     * Allowed status transitions. Enforced server-side, not just in UI.
     */
    public const TRANSITIONS = [
        Testimonial::STATUS_DRAFT => [Testimonial::STATUS_PENDING, Testimonial::STATUS_ARCHIVED],
        Testimonial::STATUS_PENDING => [
            Testimonial::STATUS_APPROVED,
            Testimonial::STATUS_REJECTED,
            Testimonial::STATUS_DRAFT,
            Testimonial::STATUS_ARCHIVED,
            Testimonial::STATUS_SPAM,
        ],
        Testimonial::STATUS_APPROVED => [Testimonial::STATUS_HIDDEN, Testimonial::STATUS_ARCHIVED],
        Testimonial::STATUS_REJECTED => [Testimonial::STATUS_PENDING, Testimonial::STATUS_ARCHIVED, Testimonial::STATUS_SPAM],
        Testimonial::STATUS_HIDDEN => [Testimonial::STATUS_APPROVED, Testimonial::STATUS_ARCHIVED],
        Testimonial::STATUS_ARCHIVED => [Testimonial::STATUS_DRAFT],
        Testimonial::STATUS_SPAM => [Testimonial::STATUS_PENDING],
    ];

    /** Statuses reachable via moderation that pull a review off the public site. */
    public const NON_PUBLIC_TARGETS = [
        Testimonial::STATUS_REJECTED,
        Testimonial::STATUS_HIDDEN,
        Testimonial::STATUS_ARCHIVED,
        Testimonial::STATUS_SPAM,
    ];

    public function create(array $data, ?User $actor = null): Testimonial
    {
        $data = $this->normalize($data);
        $data['status'] = $data['status'] ?? Testimonial::STATUS_DRAFT;

        if (!in_array($data['status'], Testimonial::STATUSES, true)) {
            throw new InvalidArgumentException("Invalid status: {$data['status']}");
        }

        $this->guardFeatureRules($data);

        if ($actor) {
            $data['created_by_id'] = $actor->id;
            $data['updated_by_id'] = $actor->id;
        }

        if ($data['status'] === Testimonial::STATUS_APPROVED && empty($data['published_at'])) {
            $data['published_at'] = Carbon::now();
        }

        $data['page'] = $data['page'] ?? ($data['villa_cache_id'] ?? null ? 'villa' : 'about');
        $data['is_featured'] = $data['is_featured'] ?? false;
        $data['is_verified'] = $data['is_verified'] ?? false;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['source'] = $data['source'] ?? Testimonial::SOURCE_MANUAL;
        $data['stars'] = $data['stars'] ?? 0;

        // Sensible placement defaults: villa-linked reviews go to the villa page,
        // page-scoped testimonials to their page.
        $data[Testimonial::PLACEMENT_VILLA] = $data[Testimonial::PLACEMENT_VILLA] ?? !empty($data['villa_cache_id']);
        $data[Testimonial::PLACEMENT_ABOUT] = $data[Testimonial::PLACEMENT_ABOUT] ?? ($data['page'] === 'about');
        $data[Testimonial::PLACEMENT_HOME] = $data[Testimonial::PLACEMENT_HOME] ?? ($data['page'] === 'home');
        $data[Testimonial::PLACEMENT_CONCIERGE] = $data[Testimonial::PLACEMENT_CONCIERGE] ?? ($data['page'] === 'concierge');

        $review = Testimonial::create($data)->refresh();
        $this->audit($review, 'submitted', $actor);

        return $review;
    }

    public function update(Testimonial $review, array $data, ?User $actor = null): Testimonial
    {
        $data = $this->normalize($data);

        if (isset($data['status']) && $data['status'] !== $review->status) {
            $this->assertTransitionAllowed($review->status, $data['status']);
        }

        $merged = array_merge($review->only(['is_featured', 'is_verified', 'status']), $data);
        $this->guardFeatureRules($merged);

        if ($actor) {
            $data['updated_by_id'] = $actor->id;
        }

        if (
            isset($data['status'])
            && $data['status'] === Testimonial::STATUS_APPROVED
            && empty($review->published_at)
            && empty($data['published_at'])
        ) {
            $data['published_at'] = Carbon::now();
        }

        $review->fill($data);

        // Track content edits (not moderation flips) for the audit trail.
        $contentEdited = $review->isDirty(['text', 'title', 'stars', 'author', 'location']);
        if ($contentEdited) {
            $review->edited_at = Carbon::now();
        }

        $review->save();

        if ($contentEdited) {
            $this->audit($review, 'edited', $actor);
        }

        return $review->refresh();
    }

    public function transition(Testimonial $review, string $target, ?User $actor = null): Testimonial
    {
        $this->assertTransitionAllowed($review->status, $target);
        $payload = [
            'status' => $target,
            'moderated_at' => Carbon::now(),
            'moderated_by_id' => $actor?->id,
        ];

        if ($target === Testimonial::STATUS_APPROVED && !$review->published_at) {
            $payload['published_at'] = Carbon::now();
        }
        if (in_array($target, self::NON_PUBLIC_TARGETS, true)) {
            $payload['is_featured'] = false;
            $payload['is_pinned'] = false;
        }

        $updated = $this->update($review, $payload, $actor);
        $this->audit($updated, $target, $actor);

        return $updated;
    }

    public function approve(Testimonial $r, ?User $a = null): Testimonial
    {
        return $this->transition($r, Testimonial::STATUS_APPROVED, $a);
    }

    public function reject(Testimonial $r, ?User $a = null): Testimonial
    {
        return $this->transition($r, Testimonial::STATUS_REJECTED, $a);
    }

    public function hide(Testimonial $r, ?User $a = null): Testimonial
    {
        return $this->transition($r, Testimonial::STATUS_HIDDEN, $a);
    }

    public function archive(Testimonial $r, ?User $a = null): Testimonial
    {
        return $this->transition($r, Testimonial::STATUS_ARCHIVED, $a);
    }

    public function markSpam(Testimonial $r, ?User $a = null): Testimonial
    {
        return $this->transition($r, Testimonial::STATUS_SPAM, $a);
    }

    public function restore(Testimonial $r, ?User $a = null): Testimonial
    {
        // Spam and rejected reviews go back to the moderation queue, not straight to public.
        return $this->transition($r, Testimonial::STATUS_PENDING, $a);
    }

    public function setFeatured(Testimonial $review, bool $featured, ?User $actor = null): Testimonial
    {
        if ($featured && $review->status !== Testimonial::STATUS_APPROVED) {
            throw new InvalidArgumentException('Only approved reviews can be featured.');
        }

        $updated = $this->update($review, ['is_featured' => $featured], $actor);
        $this->audit($updated, $featured ? 'featured' : 'unfeatured', $actor);

        return $updated;
    }

    public function setPinned(Testimonial $review, bool $pinned, ?User $actor = null): Testimonial
    {
        if ($pinned && $review->status !== Testimonial::STATUS_APPROVED) {
            throw new InvalidArgumentException('Only approved reviews can be pinned.');
        }

        $updated = $this->update($review, ['is_pinned' => $pinned], $actor);
        $this->audit($updated, $pinned ? 'pinned' : 'unpinned', $actor);

        return $updated;
    }

    /**
     * Toggle where an approved review appears. Placement changes on
     * non-approved reviews are stored but have no public effect until approval.
     */
    public function setPlacements(Testimonial $review, array $placements, ?User $actor = null): Testimonial
    {
        $payload = [];
        foreach ([
            Testimonial::PLACEMENT_VILLA,
            Testimonial::PLACEMENT_ABOUT,
            Testimonial::PLACEMENT_HOME,
            Testimonial::PLACEMENT_SERVICES,
            Testimonial::PLACEMENT_CONCIERGE,
        ] as $key) {
            if (array_key_exists($key, $placements)) {
                $payload[$key] = (bool) $placements[$key];
            }
        }

        if ($payload === []) {
            return $review;
        }

        $updated = $this->update($review, $payload, $actor);
        $this->audit($updated, 'placements_changed', $actor, json_encode($payload));

        return $updated;
    }

    public function submitGuestReview(array $data): Testimonial
    {
        $forbidden = ['status', 'is_featured', 'is_verified', 'published_at', 'created_by_id', 'updated_by_id'];
        foreach ($forbidden as $key) {
            unset($data[$key]);
        }

        $data['source'] = Testimonial::SOURCE_GUEST_SUBMISSION;
        $data['type'] = Testimonial::TYPE_GUEST_REVIEW;
        $data['status'] = Testimonial::STATUS_PENDING;
        $data['is_featured'] = false;
        $data['is_verified'] = false;
        $data['is_active'] = true;
        $data['page'] = $data['page'] ?? 'villa';
        $data['review_date'] = $data['review_date'] ?? Carbon::now()->toDateString();
        // Guest reviews default to the villa page only; admin opts into other placements.
        $data[Testimonial::PLACEMENT_VILLA] = !empty($data['villa_cache_id']);
        $data[Testimonial::PLACEMENT_ABOUT] = false;
        $data[Testimonial::PLACEMENT_HOME] = false;
        $data[Testimonial::PLACEMENT_SERVICES] = false;
        $data[Testimonial::PLACEMENT_CONCIERGE] = false;

        $review = Testimonial::create($this->normalize($data))->refresh();
        $this->audit($review, 'submitted');

        return $review;
    }

    /**
     * Public submission from villa owners on the Services page. Always lands
     * in the moderation queue; metrics and imagery are curated by admins.
     */
    public function submitOwnerTestimonial(array $data): Testimonial
    {
        $forbidden = [
            'status', 'is_featured', 'is_verified', 'is_pinned', 'published_at',
            'created_by_id', 'updated_by_id', 'moderated_by_id', 'metrics',
            'show_on_villa', 'show_on_about', 'show_on_home', 'show_on_concierge',
        ];
        foreach ($forbidden as $key) {
            unset($data[$key]);
        }

        $data['source'] = Testimonial::SOURCE_GUEST_SUBMISSION;
        $data['type'] = Testimonial::TYPE_OWNER_TESTIMONIAL;
        $data['status'] = Testimonial::STATUS_PENDING;
        $data['is_featured'] = false;
        $data['is_verified'] = false;
        $data['is_active'] = true;
        $data['page'] = 'services';
        $data['review_date'] = $data['review_date'] ?? Carbon::now()->toDateString();
        $data[Testimonial::PLACEMENT_SERVICES] = true;
        $data[Testimonial::PLACEMENT_VILLA] = false;
        $data[Testimonial::PLACEMENT_ABOUT] = false;
        $data[Testimonial::PLACEMENT_HOME] = false;
        $data[Testimonial::PLACEMENT_CONCIERGE] = false;

        $review = Testimonial::create($this->normalize($data))->refresh();
        $this->audit($review, 'submitted');

        return $review;
    }

    protected function normalize(array $data): array
    {
        if (isset($data['text'])) {
            $data['text'] = trim(strip_tags($data['text']));
        }
        if (isset($data['title'])) {
            $data['title'] = trim(strip_tags($data['title']));
        }
        if (isset($data['author'])) {
            $data['author'] = trim(strip_tags($data['author']));
        }
        if (isset($data['owner_role'])) {
            $data['owner_role'] = trim(strip_tags($data['owner_role']));
        }
        if (isset($data['location'])) {
            $data['location'] = trim(strip_tags($data['location']));
        }
        if (isset($data['reviewer_email'])) {
            $data['reviewer_email'] = strtolower(trim($data['reviewer_email']));
        }
        if (array_key_exists('villa_cache_id', $data) && $data['villa_cache_id']) {
            if (!VillaCache::whereKey($data['villa_cache_id'])->exists()) {
                throw new InvalidArgumentException('Villa not found for this review.');
            }
        }
        if (isset($data['external_url']) && $data['external_url'] !== '') {
            $url = filter_var($data['external_url'], FILTER_VALIDATE_URL);
            if (!$url) {
                throw new InvalidArgumentException('Invalid external URL.');
            }
            $data['external_url'] = $url;
        }

        return $data;
    }

    protected function guardFeatureRules(array $data): void
    {
        if (!empty($data['is_featured']) && ($data['status'] ?? null) !== Testimonial::STATUS_APPROVED) {
            throw new InvalidArgumentException('Featured reviews must be approved.');
        }
    }

    protected function assertTransitionAllowed(string $current, string $target): void
    {
        if ($current === $target) return;
        $allowed = self::TRANSITIONS[$current] ?? [];
        if (!in_array($target, $allowed, true)) {
            throw new InvalidArgumentException(
                "Invalid status transition: {$current} → {$target}"
            );
        }
    }

    protected function audit(Testimonial $review, string $action, ?User $actor = null, ?string $notes = null): void
    {
        TestimonialAudit::create([
            'testimonial_id' => $review->id,
            'action' => $action,
            'actor_id' => $actor?->id,
            'notes' => $notes,
        ]);
    }
}
