<?php

namespace Tests\Feature;

use App\Filament\Pages\GalleryPageManager;
use App\Filament\Pages\ServicesPageManager;
use App\Filament\Pages\VillasPageManager;
use App\Models\PageSection;
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
                'heading' => 'Selected spaces.',
                'section_label' => '02 / Mood',
                'subheading' => 'Where peace has a texture.',
                'is_visible' => true,
            ]])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Where peace has a texture.', PageSection::getSection('gallery', 'intro')['subheading']);
    }

    public function test_services_editorial_sections_save_exactly_four_partnership_points(): void
    {
        $points = collect(range(1, 4))->map(fn (int $index) => [
            'title' => "Strength {$index}",
            'description' => "Description {$index}",
        ])->all();

        Livewire::test(ServicesPageManager::class)
            ->fillForm([
                'partnership' => ['title' => 'Why owners choose us.', 'points' => $points, 'is_visible' => true],
                'management' => ['heading' => 'What we manage.', 'is_visible' => true],
                'owner_testimonials' => ['heading' => 'Owner stories.', 'is_visible' => true],
                'final_cta' => [
                    'title' => 'Good care goes a long way.',
                    'description' => 'We look after every detail.',
                    'button_label' => 'Partner With Us',
                    'is_visible' => true,
                ],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertCount(4, PageSection::getSection('services', 'partnership')['points']);
        $this->assertSame('Partner With Us', PageSection::getSection('services', 'final_cta')['button_label']);
    }
}
