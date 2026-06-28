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
                ->forPage($page)
                ->ordered()
                ->get()
                ->mapWithKeys(fn ($row) => [$row->section => $row->content]);
        });

        return response()->json([
            'success' => true,
            'page' => $page,
            'sections' => AssetUrl::walk($sections instanceof \Illuminate\Support\Collection ? $sections->toArray() : $sections),
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

        return response()->json([
            'success' => true,
            'page' => $page,
            'section' => $section,
            'content' => AssetUrl::walk($content),
        ]);
    }

    public function homepageVillaSelections(): JsonResponse
    {
        $data = Cache::remember('cms.homepage.villa-selections', self::CACHE_TTL, function () {
            return HomepageVillaSelection::getAllSlots();
        });

        return response()->json([
            'success' => true,
            'slots' => $data,
        ]);
    }

    public function baliCollections(): JsonResponse
    {
        $collections = Cache::remember('cms.bali-collections', self::CACHE_TTL, function () {
            return BaliCollection::active()->ordered()->get()->map(fn ($c) => [
                'id' => $c->collection_id,
                'location' => $c->location,
                'category' => $c->category,
                'tag' => $c->tag,
                'moods' => $c->moods ?? [],
                'description' => $c->description,
                'highlights' => $c->highlights ?? [],
                'bestFor' => $c->best_for ?? [],
                'facts' => $c->facts ?? [],
                'villaCount' => $c->villa_count,
                'price' => $c->price,
                'cta' => $c->cta,
                'href' => $c->href,
                'image' => AssetUrl::resolve($c->image),
                'imageAlt' => $c->image_alt,
                'galleryImages' => array_map([AssetUrl::class, 'resolve'], $c->gallery_images ?? []),
                'lifestylePillars' => $c->lifestyle_pillars,
            ]);
        });

        return response()->json([
            'success' => true,
            'collections' => $collections,
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

    public function testimonials(string $page): JsonResponse
    {
        $testimonials = Cache::remember("cms.testimonials.{$page}", self::CACHE_TTL, function () use ($page) {
            return Testimonial::active()->forPage($page)->ordered()->get(['author', 'location', 'stars', 'text', 'avatar'])
                ->map(fn ($t) => array_merge($t->toArray(), ['avatar' => AssetUrl::resolve($t->avatar)]));
        });

        return response()->json([
            'success' => true,
            'page' => $page,
            'testimonials' => $testimonials,
        ]);
    }

    public function faqs(string $page): JsonResponse
    {
        $faqs = Cache::remember("cms.faqs.{$page}", self::CACHE_TTL, function () use ($page) {
            return Faq::active()->forPage($page)->ordered()->get(['question', 'answer']);
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
            return ServiceCard::active()->forCategory($category)->ordered()->get(['title', 'text']);
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
            return GalleryItem::active()->ordered()->get(['type', 'src', 'alt', 'label', 'title', 'text', 'video_url', 'video_poster'])
                ->map(fn ($g) => array_merge($g->toArray(), [
                    'src' => AssetUrl::resolve($g->src),
                    'video_url' => AssetUrl::resolve($g->video_url),
                    'video_poster' => AssetUrl::resolve($g->video_poster),
                ]));
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
