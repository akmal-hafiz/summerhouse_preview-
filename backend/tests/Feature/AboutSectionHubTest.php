<?php

namespace Tests\Feature;

use App\Filament\Pages\AboutPageManager;
use App\Filament\Pages\JournalPageManager;
use App\Filament\Resources\ArticleResource;
use App\Models\Article;
use App\Models\PageSection;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Livewire\Livewire;
use Tests\TestCase;

class AboutSectionHubTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        Filament::bootCurrentPanel();
    }

    public function test_section_registry_has_the_approved_order_and_public_anchors(): void
    {
        $registry = AboutPageManager::sectionRegistry();

        $this->assertSame([
            'our_story',
            'trust_recognition',
            'studio_statement',
            'booking_process',
            'concierge',
            'faq_intro',
            'journal_preview',
        ], array_keys($registry));

        $this->assertSame('our-story', $registry['our_story']['anchor']);
        $this->assertSame('journal', $registry['journal_preview']['anchor']);
        $this->assertArrayNotHasKey('destination_footprint', $registry);
        $this->assertArrayNotHasKey('final_cta', $registry);
    }

    public function test_unknown_section_query_returns_to_the_hub(): void
    {
        Livewire::withQueryParams(['section' => 'not-allowed'])
            ->test(AboutPageManager::class)
            ->assertSet('activeSection', null);
    }

    public function test_saving_one_section_does_not_change_another_and_clears_cache(): void
    {
        PageSection::updateOrCreate([
            'page' => 'about', 'section' => 'faq_intro',
        ], [
            'content' => ['title' => 'Existing FAQ title', 'button_label' => 'Contact us', 'is_visible' => true],
            'sort_order' => 60,
            'is_active' => true,
        ]);

        Cache::put('cms.page.about', ['stale'], 300);
        Cache::put('cms.page.about.our_story', ['stale'], 300);

        Livewire::withQueryParams(['section' => 'our_story'])
            ->test(AboutPageManager::class)
            ->fillForm(['our_story' => $this->ourStory('A more considered story.')])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('A more considered story.', PageSection::getSection('about', 'our_story')['heading']);
        $this->assertSame('Existing FAQ title', PageSection::getSection('about', 'faq_intro')['title']);
        $this->assertFalse(Cache::has('cms.page.about'));
        $this->assertFalse(Cache::has('cms.page.about.our_story'));
    }

    public function test_repeated_saves_update_one_row_without_duplicates(): void
    {
        $editor = Livewire::withQueryParams(['section' => 'our_story'])
            ->test(AboutPageManager::class)
            ->fillForm(['our_story' => $this->ourStory('First heading')])
            ->call('save')
            ->assertHasNoFormErrors();

        $editor
            ->fillForm(['our_story' => $this->ourStory('Second heading')])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame(1, PageSection::query()->where('page', 'about')->where('section', 'our_story')->count());
        $this->assertSame('Second heading', PageSection::getSection('about', 'our_story')['heading']);
    }

    public function test_trust_pillars_no_longer_expose_or_save_images(): void
    {
        PageSection::updateOrCreate([
            'page' => 'about', 'section' => 'trust_recognition',
        ], [
            'content' => [
                'heading' => 'A decade of stays, thoughtfully hosted.',
                'pillars' => [[
                    'id' => 'verified',
                    'name' => 'Verified Villas',
                    'scope' => 'Every home',
                    'desc' => 'Every villa is inspected before arrival.',
                    'image' => '/homepage_villa/curated-1-main.webp',
                ]],
                'is_visible' => true,
            ],
            'sort_order' => 20,
            'is_active' => true,
        ]);

        Livewire::withQueryParams(['section' => 'trust_recognition'])
            ->test(AboutPageManager::class)
            ->assertDontSee('Pillar image')
            ->call('save')
            ->assertHasNoFormErrors();

        $content = PageSection::getSection('about', 'trust_recognition');
        $this->assertSame('Verified Villas', $content['pillars'][0]['name']);
        $this->assertArrayNotHasKey('image', $content['pillars'][0]);
    }

    public function test_stale_editor_cannot_overwrite_a_newer_save(): void
    {
        PageSection::updateOrCreate([
            'page' => 'about', 'section' => 'our_story',
        ], [
            'content' => $this->ourStory('Original heading'),
            'sort_order' => 10,
            'is_active' => true,
        ]);

        $firstEditor = Livewire::withQueryParams(['section' => 'our_story'])->test(AboutPageManager::class);
        $staleEditor = Livewire::withQueryParams(['section' => 'our_story'])->test(AboutPageManager::class);

        $firstEditor
            ->fillForm(['our_story' => $this->ourStory('Newest heading')])
            ->call('save')
            ->assertHasNoFormErrors();

        $staleEditor
            ->fillForm(['our_story' => $this->ourStory('Stale heading')])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Newest heading', PageSection::getSection('about', 'our_story')['heading']);
        $this->assertSame(1, PageSection::query()->where('page', 'about')->where('section', 'our_story')->count());
    }

    public function test_visibility_change_is_scoped_to_the_selected_section(): void
    {
        PageSection::updateOrCreate([
            'page' => 'about', 'section' => 'journal_preview',
        ], [
            'content' => ['eyebrow' => 'Stories', 'title' => 'The Journal.', 'is_visible' => true],
            'sort_order' => 70,
            'is_active' => true,
        ]);

        Livewire::withQueryParams(['section' => 'our_story'])
            ->test(AboutPageManager::class)
            ->fillForm(['our_story' => $this->ourStory('Hidden story', false)])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertFalse(PageSection::getSection('about', 'our_story')['is_visible']);
        $this->assertTrue(PageSection::getSection('about', 'journal_preview')['is_visible']);
    }

    public function test_journal_section_is_the_single_navigation_home_for_articles(): void
    {
        $this->assertFalse(ArticleResource::shouldRegisterNavigation());
        $this->assertFalse(JournalPageManager::shouldRegisterNavigation());
        $this->assertStringContainsString('section=journal_preview', AboutPageManager::getUrl(['section' => 'journal_preview']));
    }

    public function test_journal_section_lists_drafts_and_published_articles(): void
    {
        Article::create([
            'slug' => 'cms-journal-test',
            'title' => 'CMS Journal Test',
            'category' => 'Design',
            'is_published' => false,
        ]);

        Livewire::withQueryParams(['section' => 'journal_preview'])
            ->test(AboutPageManager::class)
            ->assertSee('CMS Journal Test')
            ->assertSee('Draft')
            ->assertSee('Add article');
    }

    /** @return array<string, mixed> */
    private function ourStory(string $heading, bool $visible = true): array
    {
        return [
            'heading' => $heading,
            'lead' => 'A personal introduction to Summerhouses.',
            'body' => 'A supporting paragraph that explains the collection and its approach.',
            'scroll_label' => 'Continue to trust and recognition',
            'is_visible' => $visible,
        ];
    }
}
