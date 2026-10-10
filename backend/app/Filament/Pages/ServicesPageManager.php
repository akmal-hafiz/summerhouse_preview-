<?php

namespace App\Filament\Pages;

use App\Filament\Pages\Concerns\ManagesPageFaqs;
use App\Filament\Resources\ServiceCardResource;
use App\Filament\Resources\TestimonialResource;
use App\Models\PageSection;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;
use Livewire\Attributes\Url;
use Throwable;

class ServicesPageManager extends Page implements HasForms, HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;
    use ManagesPageFaqs;

    protected static ?string $navigationIcon = 'heroicon-o-sparkles';

    protected static ?string $navigationGroup = 'Website Pages';

    protected static ?string $navigationLabel = 'Services';

    protected static ?string $title = 'Services Page Manager';

    protected static ?string $slug = 'pages/services';

    protected static ?int $navigationSort = 30;

    protected static string $view = 'filament.pages.services-page-manager';

    public ?array $data = [];

    #[Url(as: 'section')]
    public ?string $activeSection = null;

    public ?string $loadedUpdatedAt = null;

    public ?string $loadedContentHash = null;

    /** @return array<string, array<string, mixed>> */
    public static function sectionRegistry(): array
    {
        return [
            'hero' => [
                'label' => 'Hero',
                'description' => 'Opening message, video prompt, and primary partnership action.',
                'icon' => 'heroicon-o-play-circle', 'anchor' => 'services-hero', 'order' => 10,
                'required' => ['heading', 'description', 'button_label', 'video_title', 'video_description'],
            ],
            'partnership' => [
                'label' => 'Why Partner With Us',
                'description' => 'The four reasons owners choose Summerhouse as a management partner.',
                'icon' => 'heroicon-o-hand-raised', 'anchor' => 'partnership', 'order' => 20,
                'required' => ['title', 'points'],
            ],
            'management' => [
                'label' => 'What We Manage',
                'description' => 'Overview of the three management disciplines and their introductions.',
                'icon' => 'heroicon-o-squares-2x2', 'anchor' => 'what-we-manage', 'order' => 30,
                'required' => ['heading', 'items'],
            ],
            'owner_testimonials' => [
                'label' => 'Owner Stories',
                'description' => 'Introduction for approved villa-owner testimonials.',
                'icon' => 'heroicon-o-chat-bubble-left-right', 'anchor' => 'owner-stories', 'order' => 40,
                'required' => ['heading', 'description'], 'related' => 'testimonials',
            ],
            'owner_form' => [
                'label' => 'Owner Submission',
                'description' => 'Invitation shown before an owner submits a testimonial for review.',
                'icon' => 'heroicon-o-pencil-square', 'anchor' => 'owner-submission', 'order' => 50,
                'required' => ['title', 'description', 'button_label'],
            ],
            'operational_services' => [
                'label' => 'Operational Management',
                'description' => 'Section introduction paired with the operational service accordion.',
                'icon' => 'heroicon-o-building-office-2', 'anchor' => 'operational-management', 'order' => 60,
                'required' => ['heading', 'description', 'button_label'], 'related' => 'operational',
            ],
            'marketing_services' => [
                'label' => 'Revenue and Guest Demand',
                'description' => 'Section introduction paired with revenue and marketing services.',
                'icon' => 'heroicon-o-chart-bar-square', 'anchor' => 'sales-marketing', 'order' => 70,
                'required' => ['heading', 'description', 'button_label'], 'related' => 'marketing',
            ],
            'project_services' => [
                'label' => 'Project Delivery',
                'description' => 'Section introduction paired with project and renovation services.',
                'icon' => 'heroicon-o-wrench-screwdriver', 'anchor' => 'project-management', 'order' => 80,
                'required' => ['heading', 'description', 'button_label'], 'related' => 'project',
            ],
            'faq_intro' => [
                'label' => 'Frequently Asked Questions',
                'description' => 'FAQ introduction and the Services-specific question list.',
                'icon' => 'heroicon-o-question-mark-circle', 'anchor' => 'services-faq', 'order' => 90,
                'required' => ['title', 'description'], 'related' => 'faqs',
            ],
            'final_cta' => [
                'label' => 'Final Partnership CTA',
                'description' => 'Closing invitation shown before visitors leave the Services page.',
                'icon' => 'heroicon-o-arrow-right-circle', 'anchor' => 'services-contact', 'order' => 100,
                'required' => ['title', 'description', 'button_label'],
            ],
        ];
    }

    public function mount(): void
    {
        $requestedSection = $this->activeSection ?? request()->query('section');
        if ($requestedSection !== null && (! is_string($requestedSection) || ! $this->isAllowedSection($requestedSection))) {
            Notification::make()->title('Section not available')->body('Choose one of the Services sections shown below.')->warning()->send();
            $requestedSection = null;
        }
        $this->activeSection = $requestedSection;
        if ($this->activeSection !== null) {
            $this->loadActiveSection();
        }
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema($this->activeSection === null ? [] : $this->sectionFormSchema($this->activeSection));
    }

    /** @return array<int, Forms\Components\Component> */
    private function sectionFormSchema(string $section): array
    {
        $definition = static::sectionRegistry()[$section];
        $fields = match ($section) {
            'hero' => [
                Forms\Components\Textarea::make('hero.heading')->label('Main heading')->required()->rows(3)->maxLength(180)->columnSpanFull()->helperText('Use a line break where the headline should wrap.'),
                Forms\Components\Textarea::make('hero.description')->required()->rows(3)->maxLength(500)->columnSpanFull(),
                Forms\Components\TextInput::make('hero.button_label')->label('Primary button label')->required()->maxLength(50),
                Forms\Components\TextInput::make('hero.video_title')->label('Video prompt title')->required()->maxLength(60),
                Forms\Components\Textarea::make('hero.video_description')->label('Video prompt description')->required()->rows(2)->maxLength(180)->columnSpanFull(),
                Forms\Components\Placeholder::make('hero_media_note')->label('Hero video')->content('The approved website video remains a managed system asset and cannot be replaced from this text editor.')->columnSpanFull(),
            ],
            'partnership' => [
                Forms\Components\TextInput::make('partnership.title')->label('Heading')->required()->maxLength(140)->columnSpanFull(),
                Forms\Components\Repeater::make('partnership.points')->label('Partnership strengths')->minItems(4)->maxItems(4)->reorderable()
                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'Strength')->schema([
                        Forms\Components\TextInput::make('title')->required()->maxLength(90),
                        Forms\Components\Textarea::make('description')->required()->rows(2)->maxLength(260),
                    ])->columns(2)->columnSpanFull(),
            ],
            'management' => [
                Forms\Components\TextInput::make('management.heading')->label('Heading')->required()->maxLength(100)->columnSpanFull(),
                Forms\Components\Repeater::make('management.items')->label('Management overview')->minItems(3)->maxItems(3)->reorderable(false)
                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'Management area')->schema([
                        Forms\Components\TextInput::make('title')->required()->maxLength(100),
                        Forms\Components\Textarea::make('description')->required()->rows(3)->maxLength(360),
                        Forms\Components\TextInput::make('link_label')->required()->maxLength(40),
                    ])->columns(2)->columnSpanFull(),
            ],
            'owner_testimonials' => [
                Forms\Components\TextInput::make('owner_testimonials.heading')->label('Heading')->required()->maxLength(140)->columnSpanFull(),
                Forms\Components\Textarea::make('owner_testimonials.description')->required()->rows(3)->maxLength(400)->columnSpanFull(),
                Forms\Components\Placeholder::make('testimonial_note')->label('Published owner stories')->content('Only approved owner testimonials marked for Services are displayed. Manage those records in Testimonials.')->columnSpanFull(),
            ],
            'owner_form' => [
                Forms\Components\TextInput::make('owner_form.title')->label('Invitation title')->required()->maxLength(120)->columnSpanFull(),
                Forms\Components\Textarea::make('owner_form.description')->required()->rows(3)->maxLength(400)->columnSpanFull(),
                Forms\Components\TextInput::make('owner_form.button_label')->label('Open form button')->required()->maxLength(50),
                Forms\Components\TextInput::make('owner_form.close_label')->label('Close form button')->required()->maxLength(30),
            ],
            'operational_services', 'marketing_services', 'project_services' => [
                Forms\Components\TextInput::make("{$section}.heading")->label('Heading')->required()->maxLength(140)->columnSpanFull(),
                Forms\Components\Textarea::make("{$section}.description")->required()->rows(4)->maxLength(600)->columnSpanFull(),
                Forms\Components\TextInput::make("{$section}.button_label")->label('Contact button label')->required()->maxLength(50),
                Forms\Components\Placeholder::make("{$section}_cards_note")->label('Accordion points')->content('Accordion points remain separate service records so each item can be ordered and published independently.')->columnSpanFull(),
            ],
            'faq_intro' => [
                Forms\Components\TextInput::make('faq_intro.title')->label('Heading')->required()->maxLength(140)->columnSpanFull(),
                Forms\Components\Textarea::make('faq_intro.description')->required()->rows(3)->maxLength(400)->columnSpanFull(),
            ],
            'final_cta' => [
                Forms\Components\TextInput::make('final_cta.title')->label('Heading')->required()->maxLength(120)->columnSpanFull(),
                Forms\Components\Textarea::make('final_cta.description')->required()->rows(3)->maxLength(400)->columnSpanFull(),
                Forms\Components\TextInput::make('final_cta.button_label')->required()->maxLength(40),
            ],
            default => [],
        };

        return [Forms\Components\Section::make($definition['label'])->description($definition['description'])->icon($definition['icon'])->schema($this->copyFields($section, $fields))->columns(2)];
    }

    /** @param array<int, Forms\Components\Component> $fields
     * @return array<int, Forms\Components\Component>
     */
    private function copyFields(string $section, array $fields): array
    {
        return array_merge([
            Forms\Components\Toggle::make("{$section}.is_visible")->label('Show section on website')->helperText('Turning this off hides only this section. Its content remains saved.')->default(true)->columnSpanFull(),
        ], $fields);
    }

    /** @return array<string, array<string, mixed>> */
    private function defaults(): array
    {
        return [
            'hero' => ['heading' => "Bespoke villa\nmanagement in heart\nof the Bali", 'description' => 'Discover a new standard of villa management, from bespoke Canggu estates to premium cliffside residences across Bali.', 'button_label' => 'Partner With Us', 'video_title' => 'Watch Video', 'video_description' => 'Experience summerhouse management.', 'is_visible' => true],
            'partnership' => ['title' => 'The value of a closer partnership.', 'points' => $this->defaultPartnershipPoints(), 'is_visible' => true],
            'management' => [
                'heading' => 'What we manage.',
                'items' => [
                    ['title' => 'Villa Operation', 'description' => 'Impeccable daily operations, housekeeping, supplies management, and direct hospitality care.', 'link_label' => 'Explore Details'],
                    ['title' => 'Villa Sales & Marketing', 'description' => 'Dynamic pricing, global distribution, SEO, direct booking systems, and revenue strategy.', 'link_label' => 'Explore Details'],
                    ['title' => 'Villa Project & Renovation', 'description' => 'Meticulous contractor sourcing, design planning, legal counsel, and logistics oversight.', 'link_label' => 'Explore Details'],
                ],
                'is_visible' => true,
            ],
            'owner_testimonials' => ['heading' => 'What thoughtful management feels like.', 'description' => 'Direct notes from owners whose homes are cared for by the Summerhouse team.', 'is_visible' => true],
            'owner_form' => ['title' => 'Is your villa managed by Summerhouse?', 'description' => 'Share your honest experience as an owner, published after a quick review. Your email stays private.', 'button_label' => 'Share your experience', 'close_label' => 'Close', 'is_visible' => true],
            'operational_services' => ['heading' => 'Operational Management', 'description' => 'A Bali-based team coordinates the people, property standards, and everyday details that keep each stay running calmly and consistently.', 'button_label' => 'Contact us for inquiry', 'is_visible' => true],
            'marketing_services' => ['heading' => 'Sales, Marketing & Financial Management', 'description' => 'Pricing, positioning, distribution, and reporting work as one system to build qualified demand and give owners a transparent view of performance.', 'button_label' => 'Contact us for inquiry', 'is_visible' => true],
            'project_services' => ['heading' => 'Villa Project Management', 'description' => 'From feasibility and legal coordination to design, construction, procurement, and handover, every project stage remains connected and visible.', 'button_label' => 'Contact us for inquiry', 'is_visible' => true],
            'faq_intro' => ['title' => 'Frequently Asked Questions', 'description' => "Can't find what you are looking for? Reach out to the Summerhouse support team directly.", 'is_visible' => true],
            'final_cta' => ['title' => 'Good care goes a long way.', 'description' => 'We look after the property, the people in it, and everything in between.', 'button_label' => 'Partner With Us', 'is_visible' => true],
        ];
    }

    private function loadActiveSection(): void
    {
        if ($this->activeSection === null || ! $this->isAllowedSection($this->activeSection)) {
            $this->data = [];
            $this->loadedUpdatedAt = null;
            $this->loadedContentHash = null;

            return;
        }
        $row = PageSection::query()->where('page', 'services')->where('section', $this->activeSection)->first();
        $content = array_merge($this->defaults()[$this->activeSection], is_array($row?->content) ? $row->content : []);
        $this->loadedUpdatedAt = $row?->updated_at?->toISOString();
        $this->loadedContentHash = $this->contentHash($row?->content);
        $this->form->fill([$this->activeSection => $content]);
    }

    public function save(): void
    {
        $section = $this->activeSection;
        if ($section === null || ! $this->isAllowedSection($section)) {
            Notification::make()->title('Section not available')->body('Return to the Services section overview and choose a valid section.')->danger()->send();

            return;
        }
        $state = $this->form->getState();
        $content = $state[$section] ?? [];
        $definition = static::sectionRegistry()[$section];
        try {
            $saved = DB::transaction(function () use ($section, $content, $definition): ?PageSection {
                $current = PageSection::query()->where('page', 'services')->where('section', $section)->lockForUpdate()->first();
                if ($current?->updated_at?->toISOString() !== $this->loadedUpdatedAt || $this->contentHash($current?->content) !== $this->loadedContentHash) {
                    return null;
                }

                return PageSection::updateOrCreate(['page' => 'services', 'section' => $section], ['content' => $content, 'sort_order' => $definition['order'], 'is_active' => true]);
            }, 3);
            if ($saved === null) {
                Notification::make()->title('A newer edit is already saved')->body('Reload this section before saving so another administrator’s changes are not overwritten.')->warning()->persistent()->send();

                return;
            }
            $this->loadedUpdatedAt = $saved->updated_at?->toISOString();
            $this->loadedContentHash = $this->contentHash($saved->content);
            Notification::make()->title($definition['label'].' saved')->body('The public Services page now uses this section content.')->success()->send();
        } catch (Throwable $error) {
            report($error);
            Notification::make()->title('Section could not be saved')->body('Your previous published content is still safe. Please try again.')->danger()->persistent()->send();
        }
    }

    /** @return array<int, array<string, mixed>> */
    public function getSectionCards(): array
    {
        $rows = PageSection::query()->where('page', 'services')->whereIn('section', array_keys(static::sectionRegistry()))->get()->keyBy('section');

        return collect(static::sectionRegistry())->map(function (array $definition, string $key) use ($rows): array {
            /** @var PageSection|null $row */
            $row = $rows->get($key);
            $content = array_merge($this->defaults()[$key], is_array($row?->content) ? $row->content : []);

            return array_merge($definition, ['key' => $key, 'is_visible' => ($content['is_visible'] ?? true) !== false, 'is_complete' => $row !== null && $this->isComplete($content, $definition['required']), 'updated_at' => $row?->updated_at, 'edit_url' => static::getUrl(['section' => $key]), 'preview_url' => $this->publicServicesUrl($definition['anchor'])]);
        })->values()->all();
    }

    /** @param array<string, mixed> $content
     * @param  array<int, string>  $required
     */
    private function isComplete(array $content, array $required): bool
    {
        foreach ($required as $path) {
            $value = data_get($content, $path);
            if ($value === null || $value === '' || $value === []) {
                return false;
            }
        }

        return true;
    }

    public function table(Table $table): Table
    {
        return $this->faqTable($table);
    }

    protected function faqPageKey(): string
    {
        return 'services';
    }

    protected function faqPageLabel(): string
    {
        return 'Services';
    }

    public function getActiveSectionDefinition(): ?array
    {
        return $this->activeSection === null ? null : (static::sectionRegistry()[$this->activeSection] ?? null);
    }

    public function getHubUrl(): string
    {
        return static::getUrl();
    }

    public function getPublicServicesUrl(): string
    {
        return $this->publicServicesUrl();
    }

    public function getRelatedContentUrl(): ?string
    {
        $related = $this->getActiveSectionDefinition()['related'] ?? null;
        if ($related === 'testimonials') {
            return TestimonialResource::getUrl('index');
        }
        if (in_array($related, ['operational', 'marketing', 'project'], true)) {
            return ServiceCardResource::getUrl('index', ['tableFilters' => ['category' => ['value' => $related]]]);
        }

        return null;
    }

    public function getRelatedContentLabel(): ?string
    {
        return match ($this->getActiveSectionDefinition()['related'] ?? null) {
            'testimonials' => 'Open Testimonials',
            'operational', 'marketing', 'project' => 'Manage accordion points',
            default => null,
        };
    }

    private function publicServicesUrl(?string $anchor = null): string
    {
        $url = rtrim((string) config('app.frontend_url'), '/').'/services';

        return $anchor === null ? $url : $url.'#'.$anchor;
    }

    private function isAllowedSection(string $section): bool
    {
        return array_key_exists($section, static::sectionRegistry());
    }

    private function contentHash(?array $content): ?string
    {
        return $content === null ? null : hash('sha256', json_encode($content, JSON_THROW_ON_ERROR));
    }

    private function defaultPartnershipPoints(): array
    {
        return [
            ['title' => 'Hands-on local management', 'description' => 'A Bali-based team stays close to the property, its people, and everyday operations.'],
            ['title' => 'Revenue-led decisions', 'description' => 'Pricing, distribution, and reporting are guided by performance, not guesswork.'],
            ['title' => 'Design-conscious positioning', 'description' => 'Every home is presented with a clear point of view that respects its architecture and audience.'],
            ['title' => 'Guest experience that builds value', 'description' => 'Thoughtful stays earn stronger reviews, repeat demand, and long-term property value.'],
        ];
    }

    protected function getFormActions(): array
    {
        return [Action::make('save')->label('Save section')->icon('heroicon-o-check-circle')->action('save')];
    }
}
