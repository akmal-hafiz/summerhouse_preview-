<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ArticlePublicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_publication_assigns_the_bali_calendar_date_without_editor_input(): void
    {
        Carbon::setTestNow('2026-09-22 17:30:00 UTC');

        $article = Article::create([
            'slug' => 'new-story',
            'title' => 'New story',
            'is_published' => false,
        ]);

        $this->assertNull($article->date);
        $this->assertNull($article->published_at);

        $article->update(['is_published' => true]);
        $this->assertSame('2026-09-23', $article->fresh()->date->toDateString());
        $this->assertNotNull($article->fresh()->published_at);

        $this->getJson('/api/v1/cms/articles')
            ->assertOk()
            ->assertJsonPath('articles.0.date', '2026-09-23');
    }

    public function test_edits_and_republishing_preserve_the_first_publication_date(): void
    {
        Carbon::setTestNow('2026-09-22 17:30:00 UTC');
        $article = Article::create(['slug' => 'story', 'title' => 'Story', 'is_published' => true]);
        $firstPublishedAt = $article->published_at->toDateTimeString();

        Carbon::setTestNow('2026-10-01 12:00:00 UTC');
        $article->update(['title' => 'Edited story', 'is_published' => false]);
        $article->update(['is_published' => true]);

        $this->assertSame('2026-09-23', $article->fresh()->date->toDateString());
        $this->assertSame($firstPublishedAt, $article->fresh()->published_at->toDateTimeString());
    }

    public function test_article_endpoints_never_wait_for_the_five_minute_cache(): void
    {
        $article = Article::create([
            'slug' => 'instant-story',
            'title' => 'Original title',
            'category' => 'Lifestyle',
            'is_published' => true,
        ]);

        Cache::put('cms.articles', [['slug' => 'stale-story', 'title' => 'Stale title']], 300);
        Cache::put('cms.article.instant-story', ['slug' => 'instant-story', 'title' => 'Stale title'], 300);

        $article->update(['title' => 'Updated immediately']);

        $this->getJson('/api/v1/cms/articles')
            ->assertOk()
            ->assertJsonPath('articles.0.title', 'Updated immediately')
            ->assertJsonMissing(['slug' => 'stale-story']);

        $this->getJson('/api/v1/cms/articles/instant-story')
            ->assertOk()
            ->assertJsonPath('article.title', 'Updated immediately');
    }

    public function test_articles_published_on_the_same_bali_date_have_a_stable_latest_first_order(): void
    {
        Carbon::setTestNow('2026-09-23 01:00:00 UTC');
        Article::create(['slug' => 'first-story', 'title' => 'First story', 'is_published' => true]);

        Carbon::setTestNow('2026-09-23 03:00:00 UTC');
        Article::create(['slug' => 'second-story', 'title' => 'Second story', 'is_published' => true]);

        $this->getJson('/api/v1/cms/articles')
            ->assertOk()
            ->assertJsonPath('articles.0.slug', 'second-story')
            ->assertJsonPath('articles.1.slug', 'first-story');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }
}
