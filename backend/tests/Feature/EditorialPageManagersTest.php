<?php

namespace Tests\Feature;

use App\Filament\Pages\GalleryPageManager;
use App\Filament\Pages\HomepageManager;
use App\Filament\Pages\ServicesPageManager;
use App\Filament\Pages\VillasPageManager;
use App\Models\PageSection;
use App\Models\BaliCollection;
use App\Models\GalleryItem;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Livewire\Livewire;
use Tests\TestCase;

class EditorialPageManagersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        Filament::bootCurrentPanel();
    }

    public function test_villas_and_gallery_editorial_copy_can_be_saved(): void
    {
        Cache::put('cms.page.villas', ['stale'], 300);
        Livewire::test(VillasPageManager::class)
            ->fillForm(['hero' => [
                'heading' => 'Find a considered stay.',
                'description' => 'Private homes selected across Bali.',
                'saved_label' => 'Saved stays',
                'is_visible' => true,
            ]])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Find a considered stay.', PageSection::getSection('villas', 'hero')['heading']);
        $this->assertFalse(Cache::has('cms.page.villas'));

        Livewire::test(GalleryPageManager::class)
            ->fillForm(['intro' => [
                'heading' => 'A closer look at Summerhouse.',
                'description' => 'Where island light meets considered living.',
                'show_filters' => true,
                'is_visible' => true,
            ]])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Where island light meets considered living.', PageSection::getSection('gallery', 'intro')['description']);
        $this->assertTrue(PageSection::getSection('gallery', 'intro')['show_filters']);
    }

    public function test_gallery_endpoint_returns_only_visual_media_with_editorial_layout(): void
    {
        GalleryItem::create([
            'type' => 'text',
            'title' => 'Legacy text block',
            'text' => 'Not part of the visual gallery.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $image = GalleryItem::create([
            'type' => 'image',
            'src' => '/uploads/gallery/images/pool.webp',
            'alt' => 'Pool overlooking tropical gardens',
            'title' => 'The Pool Pavilion',
            'category' => 'Pools',
            'layout_variant' => 'portrait',
            'focal_point' => 'top',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/cms/gallery')
            ->assertOk()
            ->assertJsonCount(1, 'items')
            ->assertJsonPath('items.0.title', 'The Pool Pavilion')
            ->assertJsonPath('items.0.layout_variant', 'portrait')
            ->assertJsonPath('items.0.focal_point', 'top');

        Cache::put('cms.gallery', ['stale'], 300);
        $image->update(['title' => 'The Pool Pavilion at Dusk']);
        $this->assertFalse(Cache::has('cms.gallery'));

        $this->getJson('/api/v1/cms/gallery')
            ->assertJsonPath('items.0.title', 'The Pool Pavilion at Dusk');
    }

    public function test_services_editorial_sections_save_exactly_four_partnership_points(): void
    {
        $points = collect(range(1, 4))->map(fn (int $index) => [
            'title' => "Strength {$index}",
            'description' => "Description {$index}",
        ])->all();

        Livewire::withQueryParams(['section' => 'partnership'])
            ->test(ServicesPageManager::class)
            ->fillForm(['partnership' => ['title' => 'Why owners choose us.', 'points' => $points, 'is_visible' => true]])
            ->call('save')
            ->assertHasNoFormErrors();

        Livewire::withQueryParams(['section' => 'final_cta'])
            ->test(ServicesPageManager::class)
            ->fillForm(['final_cta' => [
                'title' => 'Good care goes a long way.',
                'description' => 'We look after every detail.',
                'button_label' => 'Partner With Us',
                'is_visible' => true,
            ]])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertCount(4, PageSection::getSection('services', 'partnership')['points']);
        $this->assertSame('Partner With Us', PageSection::getSection('services', 'final_cta')['button_label']);
    }

    public function test_homepage_destination_editor_updates_existing_guide_without_duplicates(): void
    {
        $guide = BaliCollection::create([
            'location' => 'Ubud',
            'category' => 'Jungle Retreats',
            'description' => 'Old description.',
            'image' => '/homepage_villa/VillaZen.webp',
            'status' => 'published',
            'is_active' => true,
        ]);

        Cache::put('cms.bali-collections', ['stale'], 300);
        Livewire::test(HomepageManager::class)
            ->fillForm(['destinations' => [[
                'id' => $guide->id,
                'collection_id' => 'ubud',
                'location' => 'Ubud',
                'category' => 'Jungle Retreats',
                'description' => 'A slower journey among the rice fields.',
                'image_alt' => 'Villa among Ubud greenery',
                'hero_title' => 'A quieter side of Ubud',
                'introduction' => 'Discover the green heart of Bali.',
                'moods' => ['Nature'],
                'highlights' => ['Rice fields'],
                'best_for' => ['Couples'],
                'facts' => [['label' => 'Pace', 'value' => 'Slow']],
                'show_related_villas' => true,
                'status' => 'published',
                'is_active' => true,
            ]]])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame(1, BaliCollection::count());
        $this->assertSame('A quieter side of Ubud', $guide->fresh()->hero_title);
        $this->assertSame('A slower journey among the rice fields.', $guide->fresh()->description);
        $this->assertSame(['Nature'], $guide->fresh()->moods);
        $this->assertFalse(Cache::has('cms.bali-collections'));
        $this->getJson('/api/v1/cms/bali-collections')
            ->assertOk()
            ->assertJsonPath('collections.0.description', 'A slower journey among the rice fields.');
    }

    public function test_homepage_destination_editor_can_save_a_new_guide_twice_without_duplicating_it(): void
    {
        Livewire::test(HomepageManager::class)
            ->fillForm(['destinations' => [[
                'location' => 'Pererenan',
                'category' => 'Quiet Coast',
                'description' => 'A calm stretch of coast for unhurried stays.',
                'status' => 'published',
                'is_active' => true,
            ]]])
            ->call('save')
            ->assertHasNoFormErrors()
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame(1, BaliCollection::count());
        $this->assertSame('pererenan', BaliCollection::first()->collection_id);
    }
}
