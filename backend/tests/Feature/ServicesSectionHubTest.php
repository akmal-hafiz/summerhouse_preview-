<?php

namespace Tests\Feature;

use App\Filament\Pages\ServicesPageManager;
use App\Models\PageSection;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Livewire\Livewire;
use Tests\TestCase;

class ServicesSectionHubTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        Filament::bootCurrentPanel();
    }

    public function test_registry_matches_the_public_services_flow(): void
    {
        $registry = ServicesPageManager::sectionRegistry();
        $this->assertSame([
            'hero', 'partnership', 'management', 'owner_testimonials', 'owner_form',
            'operational_services', 'marketing_services', 'project_services', 'faq_intro', 'final_cta',
        ], array_keys($registry));
        $this->assertSame('services-hero', $registry['hero']['anchor']);
        $this->assertSame('sales-marketing', $registry['marketing_services']['anchor']);
        $this->assertSame('services-contact', $registry['final_cta']['anchor']);
    }

    public function test_unknown_section_query_returns_to_the_hub(): void
    {
        Livewire::withQueryParams(['section' => 'not-allowed'])
            ->test(ServicesPageManager::class)
            ->assertSet('activeSection', null);
    }

    public function test_one_section_save_is_isolated_and_invalidates_editorial_cache(): void
    {
        PageSection::create([
            'page' => 'services', 'section' => 'final_cta',
            'content' => ['title' => 'Existing CTA', 'description' => 'Existing description', 'button_label' => 'Contact', 'is_visible' => true],
            'sort_order' => 100, 'is_active' => true,
        ]);
        Cache::put('cms.page.services', ['stale'], 300);
        Cache::put('cms.page.services.operational_services', ['stale'], 300);

        Livewire::withQueryParams(['section' => 'operational_services'])
            ->test(ServicesPageManager::class)
            ->fillForm(['operational_services' => $this->serviceIntro('Operations, considered.')])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Operations, considered.', PageSection::getSection('services', 'operational_services')['heading']);
        $this->assertSame('Existing CTA', PageSection::getSection('services', 'final_cta')['title']);
        $this->assertFalse(Cache::has('cms.page.services'));
        $this->assertFalse(Cache::has('cms.page.services.operational_services'));
    }

    public function test_repeated_saves_update_one_row_without_duplicates(): void
    {
        $editor = Livewire::withQueryParams(['section' => 'operational_services'])
            ->test(ServicesPageManager::class)
            ->fillForm(['operational_services' => $this->serviceIntro('First heading')])
            ->call('save')->assertHasNoFormErrors();

        $editor->fillForm(['operational_services' => $this->serviceIntro('Second heading')])
            ->call('save')->assertHasNoFormErrors();

        $this->assertSame(1, PageSection::query()->where('page', 'services')->where('section', 'operational_services')->count());
        $this->assertSame('Second heading', PageSection::getSection('services', 'operational_services')['heading']);
    }

    public function test_stale_editor_cannot_overwrite_a_newer_services_edit(): void
    {
        PageSection::create([
            'page' => 'services', 'section' => 'operational_services',
            'content' => $this->serviceIntro('Original heading'), 'sort_order' => 60, 'is_active' => true,
        ]);
        $first = Livewire::withQueryParams(['section' => 'operational_services'])->test(ServicesPageManager::class);
        $stale = Livewire::withQueryParams(['section' => 'operational_services'])->test(ServicesPageManager::class);

        $first->fillForm(['operational_services' => $this->serviceIntro('Newest heading')])->call('save')->assertHasNoFormErrors();
        $stale->fillForm(['operational_services' => $this->serviceIntro('Stale heading')])->call('save')->assertHasNoFormErrors();

        $this->assertSame('Newest heading', PageSection::getSection('services', 'operational_services')['heading']);
    }

    /** @return array<string, mixed> */
    private function serviceIntro(string $heading): array
    {
        return [
            'heading' => $heading,
            'description' => 'A clear introduction for this management discipline.',
            'button_label' => 'Contact us',
            'is_visible' => true,
        ];
    }
}
