<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\BaliCollection;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\HomepageVillaSelection;
use App\Models\PageSection;
use App\Models\ServiceCard;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewMapper;
use App\Services\Reviews\ReviewRepository;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CmsController extends Controller
{
    private const CACHE_TTL = 300;

    public function pageSections(string $page): JsonResponse
    {
        $sections = Cache::remember("cms.page.{$page}", self::CACHE_TTL, function () use ($page) {
            return PageSection::active()
                ->onPage($page)
                ->ordered()
                ->get()
                ->mapWithKeys(fn ($row) => [$row->section => $row->content]);
        });
        $sectionData = $sections instanceof \Illuminate\Support\Collection
            ? $sections->toArray()
            : $sections;

        if ($page === 'home' && is_array($sectionData['why_stay'] ?? null)) {
            $sectionData['why_stay'] = $this->withoutRecognitionLogos($sectionData['why_stay']);
        }

        return response()->json([
            'success' => true,
            'page' => $page,
            'sections' => AssetUrl::walk($sectionData),
        ]);
    }

    public function pageSection(string $page, string $section): JsonResponse
    {
        $content = Cache::remember("cms.page.{$page}.{$section}", self::CACHE_TTL, function () use ($page, $section) {
            return PageSection::getSection($page, $section);
        });

        if ($content === null) {
            return response()->json(['success' => false, 'error' => 'Section not found'], 404);
        }

        if ($page === 'home' && $section === 'why_stay') {
            $content = $this->withoutRecognitionLogos($content);
        }

        return response()->json([
            'success' => true,
            'page' => $page,
            'section' => $section,
            'content' => AssetUrl::walk($content),
        ]);
    }

    private function withoutRecognitionLogos(array $content): array
    {
        foreach (['recognitions', 'awards'] as $collection) {
            if (!is_array($content[$collection] ?? null)) {
                continue;
            }

            $content[$collection] = array_values(array_map(
                function ($item) {
                    if (!is_array($item)) {
                        return $item;
                    }

                    unset($item['logo'], $item['logo_alt']);
                    return $item;
                },
                $content[$collection]
            ));
        }

        return $content;
    }

    public function homepageVillaSelections(): JsonResponse
    {
        $data = Cache::remember('cms.homepage.villa-selections', self::CACHE_TTL, function () {
            $slots = HomepageVillaSelection::getAllSlots();
            if (!empty($slots['signature'])) {
                $slots['signature'] = array_map(function (array $row): array {
                    $row['award_logo'] = AssetUrl::resolve($row['award_logo'] ?? null);
                    return $row;
                }, $slots['signature']);
            }
            return $slots;
        });

        return response()->json([
            'success' => true,
            'slots' => $data,
        ]);
    }

    public function baliCollections(): JsonResponse
    {
        $collections = Cache::remember('cms.bali-collections', self::CACHE_TTL, function () {
            return BaliCollection::active()
                ->published()
                ->ordered()
                ->get()
                ->map(fn (BaliCollection $collection) => $this->serializeDestination($collection, false));
        });

        return response()->json([
            'success' => true,
            'collections' => $collections,
        ]);
    }

    public function destination(string $slug): JsonResponse
    {
        $destination = Cache::remember("cms.destination.{$slug}", self::CACHE_TTL, function () use ($slug) {
            $collection = BaliCollection::active()
                ->published()
                ->where('collection_id', $slug)
                ->first();

            return $collection ? $this->serializeDestination($collection, true) : null;
        });

        if (!$destination) {
            return response()->json([
                'success' => false,
                'error' => 'Destination not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'destination' => $destination,
        ]);
    }

    private function serializeDestination(BaliCollection $collection, bool $withEditorial): array
    {
        $location = $collection->lodgify_location ?: $collection->location;
        $villas = VillaCache::query()
            ->where('location', $location)
            ->get(['lodgify_id', 'name', 'thumbnail_url', 'bedrooms', 'max_guests', 'location', 'raw']);
        $villaCount = $villas->count();

        $summary = [
            'id' => $collection->collection_id,
            'location' => $collection->location,
            'locationKey' => $collection->location_key,
            'category' => $collection->category,
            'tag' => $collection->tag,
            'moods' => $collection->moods ?? [],
            'description' => $collection->description,
            'highlights' => $collection->highlights ?? [],
            'bestFor' => $collection->best_for ?? [],
            'facts' => $collection->facts ?? [],
            'villaCount' => "{$villaCount} " . ($villaCount === 1 ? 'villa' : 'villas'),
            'price' => $collection->price,
            'href' => '/villas?location=' . rawurlencode((string) $location) . '&match=exact',
            'mediaType' => $collection->media_type ?: 'image',
            'image' => AssetUrl::resolve($collection->image),
            'video' => AssetUrl::resolve($collection->video),
            'videoPoster' => AssetUrl::resolve($collection->video_poster ?: $collection->image),
            'mobilePoster' => AssetUrl::resolve(
                $collection->mobile_poster ?: $collection->video_poster ?: $collection->image
            ),
            'imageAlt' => $collection->image_alt,
            'mediaAccessibilityLabel' => $collection->media_accessibility_label
                ?: "View Summerhouse villas in {$collection->location}",
            'galleryImages' => array_values(array_filter(array_map(
                [AssetUrl::class, 'resolve'],
                $collection->gallery_images ?? []
            ))),
            'lifestylePillars' => $collection->lifestyle_pillars ?? [],
        ];

        if (!$withEditorial) {
            return $summary;
        }

        $editorialChapters = $collection->editorial_chapters ?? [];
        if ($editorialChapters === []) {
            $sourceChapters = $collection->lifestyle_pillars ?: array_map(
                fn (string $title): array => [
                    'title' => $title,
                    'description' => "{$title} is part of the everyday character that makes {$collection->location} worth exploring slowly.",
                ],
                array_slice($collection->highlights ?? [], 0, 3)
            );
            $gallery = $collection->gallery_images ?? [];
            $editorialChapters = array_values(array_map(
                function (array $chapter, int $index) use ($gallery, $collection): array {
                    return [
                        'eyebrow' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) . ' / Field note',
                        'title' => $chapter['title'] ?? "Discover {$collection->location}",
                        'description' => $chapter['description'] ?? $collection->description,
                        'image' => AssetUrl::resolve($gallery[$index] ?? $collection->image),
                        'image_alt' => ($chapter['title'] ?? 'Field note') . " in {$collection->location}",
                    ];
                },
                $sourceChapters,
                array_keys($sourceChapters)
            ));
        }

        return array_merge($summary, [
            'eyebrow' => $collection->eyebrow ?: 'Bali Destination Guide',
            'heroTitle' => $collection->hero_title ?: $collection->location,
            'introduction' => $collection->introduction ?: $collection->description,
            'heroMediaType' => $collection->hero_media_type ?: 'image',
            'heroImage' => AssetUrl::resolve($collection->hero_image ?: $collection->image),
            'heroVideo' => AssetUrl::resolve($collection->hero_video),
            'heroVideoPoster' => AssetUrl::resolve(
                $collection->hero_video_poster ?: $collection->hero_image ?: $collection->image
            ),
            'editorialGallery' => AssetUrl::walk($collection->editorial_gallery ?? []),
            'editorialChapters' => AssetUrl::walk($editorialChapters),
            'relatedJournalTags' => $collection->related_journal_tags ?? [],
            'lodgifyLocation' => $location,
            'showRelatedVillas' => (bool) $collection->show_related_villas,
            'relatedVillasHeading' => $collection->related_villas_heading ?: "Stay in {$collection->location}",
            'manualVillaOverrides' => $collection->manual_villa_overrides ?? [],
            'seoTitle' => $collection->seo_title ?: "{$collection->location} Guide",
            'seoDescription' => $collection->seo_description ?: $collection->description,
            'socialImage' => AssetUrl::resolve(
                $collection->social_image ?: $collection->hero_image ?: $collection->image
            ),
        ]);
    }

    public function articles(): JsonResponse
    {
        $articles = Cache::remember('cms.articles', self::CACHE_TTL, function () {
            return Article::published()->ordered()->get()->map(fn ($a) => $this->serializeArticle($a, false));
        });

        return response()->json([
            'success' => true,
            'articles' => $articles,
        ]);
    }

    public function article(string $slug): JsonResponse
    {
        $article = Cache::remember("cms.article.{$slug}", self::CACHE_TTL, function () use ($slug) {
            $a = Article::published()->where('slug', $slug)->first();

            return $a ? $this->serializeArticle($a, true) : null;
        });

        if (!$article) {
            return response()->json(['success' => false, 'error' => 'Article not found'], 404);
        }

        return response()->json([
            'success' => true,
            'article' => $article,
        ]);
    }

    public function testimonials(string $page, ReviewRepository $repo): JsonResponse
    {
        $testimonials = Cache::remember("cms.testimonials.{$page}", self::CACHE_TTL, function () use ($page, $repo) {
            if ($page === 'services') {
                return $repo->servicesTestimonials(limit: 6)
                    ->map(fn (Testimonial $t) => $this->publicOwnerTestimonialCard($t));
            }

            $featured = $repo->featuredTestimonials(limit: $page === 'home' ? 6 : 12, page: $page);
            return $featured->map(fn (Testimonial $t) => $this->publicTestimonialCard($t));
        });

        return response()->json([
            'success' => true,
            'page' => $page,
            'testimonials' => $testimonials,
        ]);
    }

    public function villaReviews(string $lodgifyId, ReviewRepository $repo): JsonResponse
    {
        $villa = VillaCache::where('lodgify_id', $lodgifyId)->first();

        if (!$villa) {
            return response()->json(['success' => false, 'error' => 'Villa not found'], 404);
        }

        $summary = $repo->villaSummary($lodgifyId);
        $reviews = $repo->publishedByVilla($lodgifyId, 20)->load('villa:id,lodgify_id,name,location');

        return response()->json([
            'success' => true,
            'lodgifyId' => $lodgifyId,
            'summary' => $summary,
            'reviews' => $reviews->map(fn (Testimonial $r) => ReviewMapper::toPublic($r))->values(),
        ]);
    }

    /**
     * Owner testimonial card for the Services page. Excludes private fields.
     */
    private function publicOwnerTestimonialCard(Testimonial $t): array
    {
        return [
            'owner' => $t->author,
            'role' => $t->owner_role,
            'villaName' => $t->villa?->name ?? $t->location,
            'quote' => $t->text,
            'metrics' => collect($t->metrics ?? [])
                ->filter(fn ($m) => is_array($m) && !empty($m['label']) && !empty($m['value']))
                ->values(),
            'avatar' => AssetUrl::resolve($t->avatar),
            'villaImage' => $t->villa?->thumbnail_url,
            'isVerified' => (bool) $t->is_verified,
        ];
    }

    /**
     * Compact card shape used by the About page slider. Excludes private
     * moderation and reviewer fields.
     */
    private function publicTestimonialCard(Testimonial $t): array
    {
        return [
            'author' => $t->author,
            'location' => $t->location,
            'stars' => (int) $t->stars,
            'text' => $t->text,
            'avatar' => AssetUrl::resolve($t->avatar),
            'source' => $t->source,
            'sourceLabel' => $t->source_label,
            'isVerified' => (bool) $t->is_verified,
            'reviewDate' => $t->review_date?->toDateString(),
            'villaName' => $t->villa?->name,
            'villaLocation' => $t->villa?->location,
        ];
    }

    public function faqs(string $page): JsonResponse
    {
        $faqs = Cache::remember("cms.faqs.{$page}", self::CACHE_TTL, function () use ($page) {
            return Faq::active()->onPage($page)->ordered()->get(['question', 'answer']);
        });

        return response()->json([
            'success' => true,
            'page' => $page,
            'faqs' => $faqs,
        ]);
    }

    public function serviceCards(string $category): JsonResponse
    {
        $cards = Cache::remember("cms.service-cards.{$category}", self::CACHE_TTL, function () use ($category) {
            return ServiceCard::active()->forCategory($category)->ordered()->get(['slug', 'title', 'text', 'image', 'alt_text', 'featured_on_about']);
        });

        return response()->json([
            'success' => true,
            'category' => $category,
            'cards' => $cards,
        ]);
    }

    public function gallery(): JsonResponse
    {
        $items = Cache::remember('cms.gallery', self::CACHE_TTL, function () {
            $rows = GalleryItem::active()->ordered()->get([
                'type', 'src', 'alt', 'label', 'category', 'title', 'text',
                'video_url', 'video_poster', 'lodgify_property_id', 'created_at',
            ]);

            $villas = VillaCache::query()
                ->whereIn('lodgify_id', $rows->pluck('lodgify_property_id')->filter()->unique())
                ->get(['lodgify_id', 'name', 'location'])
                ->keyBy('lodgify_id');

            return $rows->map(function ($g) use ($villas) {
                $villa = $g->lodgify_property_id ? $villas->get($g->lodgify_property_id) : null;

                return array_merge($g->toArray(), [
                    'src' => AssetUrl::resolve($g->src),
                    'video_url' => AssetUrl::resolve($g->video_url),
                    'video_poster' => AssetUrl::resolve($g->video_poster),
                    'property_name' => $villa?->name,
                    'property_location' => $villa?->location,
                ]);
            });
        });

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    public function setting(string $key): JsonResponse
    {
        $value = Cache::remember("cms.setting.{$key}", self::CACHE_TTL, function () use ($key) {
            return SiteSetting::getByKey($key);
        });

        return response()->json([
            'success' => true,
            'key' => $key,
            'value' => $value,
        ]);
    }

    public function settingsBulk(\Illuminate\Http\Request $request): JsonResponse
    {
        $keys = explode(',', (string) $request->query('keys', ''));
        $keys = array_filter(array_map('trim', $keys));

        if (empty($keys)) {
            return response()->json(['success' => true, 'settings' => []]);
        }

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Cache::remember("cms.setting.{$key}", self::CACHE_TTL, function () use ($key) {
                return SiteSetting::getByKey($key);
            });
        }

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    private function serializeArticle(Article $a, bool $withContent): array
    {
        $data = [
            'slug' => $a->slug,
            'title' => $a->title,
            'subtitle' => $a->subtitle,
            'excerpt' => $a->excerpt,
            'category' => $a->category,
            'date' => $a->date?->format('Y-m-d'),
            'readTime' => $a->read_time,
            'heroImage' => AssetUrl::resolve($a->hero_image),
            'heroAlt' => $a->hero_alt,
            'tags' => $a->tags ?? [],
            'author' => [
                'name' => $a->author_name,
                'role' => $a->author_role,
                'bio' => $a->author_bio,
                'avatar' => AssetUrl::resolve($a->author_avatar),
            ],
        ];

        if ($withContent) {
            $data['content'] = AssetUrl::walk($a->content ?? []);
        }

        return $data;
    }
}
