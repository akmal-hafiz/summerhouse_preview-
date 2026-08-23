<?php

namespace Tests\Feature;

use App\Filament\Pages\AboutPageManager;
use App\Filament\Pages\ContactPageManager;
use App\Filament\Pages\ServicesPageManager;
use App\Filament\Resources\FaqResource;
use App\Models\Faq;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Livewire\Livewire;
use Tests\TestCase;

class PageFaqManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        Filament::bootCurrentPanel();
    }

    public function test_each_page_manager_only_lists_its_own_faqs(): void
    {
        $contact = $this->faq('contact', 'Contact question');
        $about = $this->faq('about', 'About question');
        $services = $this->faq('services', 'Services question');

        Livewire::test(ContactPageManager::class)
            ->assertCanSeeTableRecords([$contact])
            ->assertCanNotSeeTableRecords([$about, $services]);

        Livewire::test(AboutPageManager::class)
            ->assertCanSeeTableRecords([$about])
            ->assertCanNotSeeTableRecords([$contact, $services]);

        Livewire::test(ServicesPageManager::class)
            ->assertCanSeeTableRecords([$services])
            ->assertCanNotSeeTableRecords([$contact, $about]);
    }

    public function test_contact_manager_creates_updates_and_deletes_contact_faqs(): void
    {
        $component = Livewire::test(ContactPageManager::class)
            ->callTableAction('create', data: [
                'question' => 'How can I reach the team?',
                'answer' => 'Contact the Summerhouses team through WhatsApp.',
                'sort_order' => 3,
                'is_active' => true,
            ])
            ->assertHasNoTableActionErrors();

        $faq = Faq::query()->where('question', 'How can I reach the team?')->firstOrFail();

        $this->assertSame('contact', $faq->page);

        $component
            ->callTableAction('edit', $faq, data: [
                'question' => 'How do I reach the team?',
                'answer' => 'Message the Summerhouses team through WhatsApp.',
                'sort_order' => 1,
                'is_active' => true,
            ])
            ->assertHasNoTableActionErrors();

        $this->assertDatabaseHas('faqs', [
            'id' => $faq->id,
            'page' => 'contact',
            'question' => 'How do I reach the team?',
            'sort_order' => 1,
        ]);

        $component->callTableAction('delete', $faq);

        $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
    }

    public function test_question_must_be_unique_only_within_the_same_page(): void
    {
        $this->faq('contact', 'Can I request airport pickup?');

        Livewire::test(ContactPageManager::class)
            ->callTableAction('create', data: [
                'question' => 'Can I request airport pickup?',
                'answer' => 'Yes, contact our team before arrival.',
                'sort_order' => 2,
                'is_active' => true,
            ])
            ->assertHasTableActionErrors(['question' => 'unique']);

        Livewire::test(AboutPageManager::class)
            ->callTableAction('create', data: [
                'question' => 'Can I request airport pickup?',
                'answer' => 'Yes, the concierge team can arrange it.',
                'sort_order' => 2,
                'is_active' => true,
            ])
            ->assertHasNoTableActionErrors();

        $this->assertDatabaseCount('faqs', 2);
        $this->assertDatabaseHas('faqs', [
            'page' => 'about',
            'question' => 'Can I request airport pickup?',
        ]);
    }

    public function test_public_faq_api_returns_active_records_in_display_order(): void
    {
        $this->faq('contact', 'Second question', sortOrder: 2);
        $this->faq('contact', 'First question', sortOrder: 1);
        $this->faq('contact', 'Hidden question', sortOrder: 0, isActive: false);
        $this->faq('about', 'About question', sortOrder: 0);

        $this->getJson('/api/v1/cms/faqs/contact')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('page', 'contact')
            ->assertJsonCount(2, 'faqs')
            ->assertJsonPath('faqs.0.question', 'First question')
            ->assertJsonPath('faqs.1.question', 'Second question');
    }

    public function test_saving_and_deleting_a_faq_clears_its_page_cache(): void
    {
        $faq = $this->faq('contact', 'Cached question');

        Cache::put('cms.faqs.contact', ['stale'], 300);
        $faq->update(['answer' => 'Updated answer']);
        $this->assertFalse(Cache::has('cms.faqs.contact'));

        Cache::put('cms.faqs.contact', ['stale'], 300);
        $faq->delete();
        $this->assertFalse(Cache::has('cms.faqs.contact'));
    }

    public function test_global_faq_resource_is_hidden_from_navigation(): void
    {
        $this->assertFalse(FaqResource::shouldRegisterNavigation());
    }

    private function faq(
        string $page,
        string $question,
        int $sortOrder = 0,
        bool $isActive = true,
    ): Faq {
        return Faq::create([
            'page' => $page,
            'question' => $question,
            'answer' => "Answer for {$question}",
            'sort_order' => $sortOrder,
            'is_active' => $isActive,
        ]);
    }
}
