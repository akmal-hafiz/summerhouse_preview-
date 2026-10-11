<?php

namespace App\Filament\Pages;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Filament\Pages\Concerns\ManagesPageFaqs;
use App\Filament\Resources\ArticleResource;
use App\Models\Article;
use App\Models\PageSection;
use App\Support\AssetUrl;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;
use Livewire\Attributes\Url;
use Throwable;

class AboutPageManager extends Page implements HasForms, HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;
    use ManagesPageFaqs;

    protected static ?string $navigationIcon = 'heroicon-o-information-circle';

    protected static ?string $navigationGroup = 'Website Pages';

    protected static ?string $navigationLabel = 'About';

    protected static ?string $title = 'About Page Manager';

    protected static ?string $slug = 'pages/about';

    protected static ?int $navigationSort = 20;

    protected static string $view = 'filament.pages.about-page-manager';

    public ?array $data = [];

    #[Url(as: 'section')]
    public ?string $activeSection = null;

    public ?string $loadedUpdatedAt = null;

    public ?string $loadedContentHash = null;

    /** @return array<string, array<string, mixed>> */
    public static function sectionRegistry(): array
    {
        return [
            'our_story' => [
                'label' => 'Our Story Hero',
                'description' => 'Opening headline and the story visitors read first.',
                'icon' => 'heroicon-o-document-text',
                'anchor' => 'our-story',
                'order' => 10,
                'required' => ['heading', 'lead', 'body'],
            ],
            'trust_recognition' => [
                'label' => 'Trust and Recognition',
                'description' => 'Trust pillars and their supporting copy.',
                'icon' => 'heroicon-o-shield-check',
                'anchor' => 'trust-recognition',
                'order' => 20,
                'required' => ['heading', 'pillars'],
            ],
            'studio_statement' => [
                'label' => 'Editorial Gallery',
                'description' => 'Gallery introduction, action label, and image rails.',
                'icon' => 'heroicon-o-photo',
                'anchor' => 'editorial-gallery',
                'order' => 30,
                'required' => ['title', 'description', 'left_images', 'right_images'],
            ],
            'booking_process' => [
                'label' => 'Booking Process',
                'description' => 'The guest journey from discovering a villa to arrival.',
                'icon' => 'heroicon-o-calendar-days',
                'anchor' => 'booking-process',
                'order' => 40,
                'required' => ['title', 'steps', 'closing_copy', 'link_label'],
            ],
            'concierge' => [
                'label' => 'Concierge Story',
                'description' => 'Concierge introduction, supporting quote, and action.',
                'icon' => 'heroicon-o-sparkles',
                'anchor' => 'concierge',
                'order' => 50,
                'required' => ['title', 'description', 'quote', 'link_label'],
            ],
            'faq_intro' => [
                'label' => 'Frequently Asked Questions',
                'description' => 'FAQ introduction and the About-specific question list.',
                'icon' => 'heroicon-o-question-mark-circle',
                'anchor' => 'faq',
                'order' => 60,
                'required' => ['title', 'button_label'],
            ],
            'journal_preview' => [
                'label' => 'The Journal',
                'description' => 'Section heading for the latest automatically published stories.',
                'icon' => 'heroicon-o-newspaper',
                'anchor' => 'journal',
                'order' => 70,
                'required' => ['title'],
            ],
        ];
    }

    public function table(Table $table): Table
    {
        return $this->activeSection === 'journal_preview'
            ? $this->journalTable($table)
            : $this->faqTable($table);
    }

    private function journalTable(Table $table): Table
    {
        return $table
            ->query(Article::query())
            ->heading('Journal articles')
            ->description('Create, review, and publish the stories shown automatically on the public About page.')
            ->columns([
                ImageColumn::make('hero_image')
                    ->label('Cover')
                    ->getStateUsing(fn (Article $record): ?string => $this->articleCoverUrl($record))
                    ->square()
                    ->size(52)
                    ->visibleFrom('sm'),
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Article $record): string => $record->category ?: 'Uncategorised')
                    ->wrap(),
                TextColumn::make('date')
                    ->label('Publication date')
                    ->date('d M Y')
                    ->sortable()
                    ->placeholder('Assigned when published')
                    ->visibleFrom('md'),
                TextColumn::make('is_published')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Published' : 'Draft')
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray'),
                TextColumn::make('updated_at')
                    ->label('Last updated')
                    ->since()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->actions([
                \Filament\Tables\Actions\Action::make('edit')
                    ->label('Edit')
                    ->icon('heroicon-o-pencil-square')
                    ->url(fn (Article $record): string => ArticleResource::getUrl('edit', ['record' => $record])),
                \Filament\Tables\Actions\Action::make('view')
                    ->label('View')
                    ->icon('heroicon-o-arrow-up-right')
                    ->url(fn (Article $record): string => $this->publicArticleUrl($record->slug))
                    ->openUrlInNewTab()
                    ->visible(fn (Article $record): bool => $record->is_published),
            ])
            ->defaultSort('updated_at', 'desc')
            ->filters([
                TernaryFilter::make('is_published')
                    ->label('Publication status')
                    ->trueLabel('Published')
                    ->falseLabel('Draft'),
            ])
            ->emptyStateHeading('No Journal articles yet')
            ->emptyStateDescription('Add the first story and keep it as a draft until it is ready to publish.')
            ->emptyStateIcon('heroicon-o-newspaper')
            ->paginated([10, 25, 50]);
    }

    protected function faqPageKey(): string
    {
        return 'about';
    }

    protected function faqPageLabel(): string
    {
        return 'About';
    }

    public function mount(): void
    {
        $requestedSection = $this->activeSection ?? request()->query('section');

        if ($requestedSection !== null && (! is_string($requestedSection) || ! $this->isAllowedSection($requestedSection))) {
            Notification::make()
                ->title('Section not available')
                ->body('Choose one of the About sections shown below.')
                ->warning()
                ->send();
            $requestedSection = null;
        }

        $this->activeSection = $requestedSection;

        if ($this->activeSection !== null) {
            $this->loadActiveSection();
        }
    }

    public function form(Form $form): Form
    {
        return $form
            ->statePath('data')
            ->schema($this->activeSection === null ? [] : $this->sectionFormSchema($this->activeSection));
    }

    /** @return array<int, Forms\Components\Component> */
    private function sectionFormSchema(string $section): array
    {
        $definition = static::sectionRegistry()[$section];

        $fields = match ($section) {
            'our_story' => [
                Forms\Components\TextInput::make('our_story.heading')->label('Heading')->required()->maxLength(120),
                Forms\Components\Textarea::make('our_story.lead')->label('Lead paragraph')->required()->rows(3)->maxLength(500)->columnSpanFull(),
                Forms\Components\Textarea::make('our_story.body')->label('Supporting paragraph')->required()->rows(3)->maxLength(700)->columnSpanFull(),
            ],
            'trust_recognition' => [
                Forms\Components\TextInput::make('trust_recognition.heading')->label('Heading')->required()->maxLength(140)->columnSpanFull(),
                Forms\Components\Repeater::make('trust_recognition.pillars')
                    ->label('Trust pillars')
                    ->reorderable()
                    ->minItems(1)
                    ->maxItems(8)
                    ->itemLabel(fn (array $state): ?string => $state['name'] ?? 'Trust pillar')
                    ->schema([
                        Forms\Components\TextInput::make('id')->label('Stable key')->required()->alphaDash()->maxLength(80)
                            ->helperText('Use a stable value such as verified-villas.'),
                        Forms\Components\TextInput::make('name')->required()->maxLength(100),
                        Forms\Components\TextInput::make('scope')->required()->maxLength(80),
                        Forms\Components\Textarea::make('desc')->label('Description')->required()->rows(3)->maxLength(500),
                    ])->columns(2)->columnSpanFull(),
                Forms\Components\Placeholder::make('trust_dynamic_note')->label('Live villa total')
                    ->content('The current villa total remains automatic and cannot be overridden here.')->columnSpanFull(),
            ],
            'studio_statement' => [
                Forms\Components\TextInput::make('studio_statement.title')->label('Title')->required()->maxLength(160),
                Forms\Components\Textarea::make('studio_statement.description')->label('Description')->required()->rows(4)->maxLength(800)->columnSpanFull(),
                Forms\Components\TextInput::make('studio_statement.button_label')->label('Button label')->required()->maxLength(50),
                ManagedImageUpload::make('studio_statement.left_images')->label('Left image rail')->multiple()->reorderable()->appendFiles()
                    ->minFiles(3)->maxFiles(10)->panelLayout('grid')->imageEditorAspectRatios(['3:4', '4:5', null])
                    ->helperText('Choose at least three images. Drag thumbnails to control the visual rhythm.')->columnSpanFull(),
                ManagedImageUpload::make('studio_statement.right_images')->label('Right image rail')->multiple()->reorderable()->appendFiles()
                    ->minFiles(3)->maxFiles(10)->panelLayout('grid')->imageEditorAspectRatios(['3:4', '4:5', null])
                    ->helperText('Choose at least three images. The website safely repeats them when more frames are needed.')->columnSpanFull(),
            ],
            'booking_process' => [
                Forms\Components\TextInput::make('booking_process.title')->label('Title')->required()->maxLength(100),
                Forms\Components\TextInput::make('booking_process.title_emphasis')->label('Emphasised title')->maxLength(100),
                Forms\Components\Repeater::make('booking_process.steps')->label('Booking steps')->reorderable()->minItems(1)->maxItems(6)
                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'Booking step')
                    ->schema([
                        Forms\Components\TextInput::make('title')->required()->maxLength(120),
                        Forms\Components\Textarea::make('description')->required()->rows(2)->maxLength(500),
                        ManagedImageUpload::make('images')->label('Step images')->multiple()->reorderable()->minFiles(1)->maxFiles(2)
                            ->panelLayout('grid')->imageEditorAspectRatios(['4:3', '3:2', null])
                            ->helperText('Upload one or two images. One image is reused safely in both positions.')->columnSpanFull(),
                    ])->columnSpanFull(),
                Forms\Components\TextInput::make('booking_process.closing_copy')->label('Closing copy')->required()->maxLength(140),
                Forms\Components\TextInput::make('booking_process.link_label')->label('Link label')->required()->maxLength(50),
            ],
            'concierge' => [
                Forms\Components\TextInput::make('concierge.title')->label('Title')->required()->maxLength(120),
                Forms\Components\TextInput::make('concierge.title_emphasis')->label('Emphasised title')->maxLength(120),
                Forms\Components\Textarea::make('concierge.description')->label('Description')->required()->rows(3)->maxLength(500)->columnSpanFull(),
                Forms\Components\Textarea::make('concierge.quote')->label('Closing quote')->required()->rows(3)->maxLength(500)->columnSpanFull(),
                Forms\Components\TextInput::make('concierge.link_label')->label('Link label')->required()->maxLength(50),
            ],
            'faq_intro' => [
                Forms\Components\TextInput::make('faq_intro.title')->label('Title')->required()->maxLength(140),
                Forms\Components\TextInput::make('faq_intro.button_label')->label('Contact button label')->required()->maxLength(50),
            ],
            'journal_preview' => [
                Forms\Components\TextInput::make('journal_preview.title')->label('Title')->required()->maxLength(120),
                Forms\Components\Placeholder::make('journal_dynamic_note')->label('Published stories')
                    ->content('The website automatically shows up to four latest published Journal entries by publication date.')->columnSpanFull(),
            ],
            default => [],
        };

        return [
            Forms\Components\Section::make($definition['label'])
                ->description($definition['description'])->icon($definition['icon'])
                ->schema($this->copyFields($section, $fields))->columns(2),
        ];
    }

    /** @param array<int, Forms\Components\Component> $fields
     * @return array<int, Forms\Components\Component>
     */
    private function copyFields(string $section, array $fields): array
    {
        return array_merge([
            Forms\Components\Toggle::make("{$section}.is_visible")
                ->label('Show section on website')
                ->helperText('Turning this off hides only this section. Its content remains saved.')
                ->default(true)->columnSpanFull(),
        ], $fields);
    }

    /** @return array<string, array<string, mixed>> */
    private function defaults(): array
    {
        return [
            'our_story' => [
                'heading' => 'Our Story.',
                'lead' => 'Summerhouses began as a small collection of villas in Canggu, Bali, built on one belief: a great stay should feel personal before it looks impressive.',
                'body' => 'Years later, that still shapes every home we curate across Canggu, Ubud, Pererenan, and the quiet corners of the island in between.',
                'is_visible' => true,
            ],
            'trust_recognition' => [
                'heading' => 'A decade of stays, thoughtfully hosted.',
                'pillars' => $this->defaultTrustPillars(),
                'is_visible' => true,
            ],
            'studio_statement' => [
                'title' => 'A closer look at the spaces you will actually live in.',
                'description' => 'The light through the morning kitchen, the pool at dusk, the quiet corners between rooms. Every villa is photographed the way you will remember it, so what you see is what you arrive to.',
                'button_label' => 'View the full gallery',
                'is_visible' => true,
            ],
            'booking_process' => [
                'title' => 'Secure your stay',
                'title_emphasis' => 'with ease',
                'steps' => $this->defaultBookingSteps(),
                'closing_copy' => 'Your Bali stay, thoughtfully arranged.',
                'link_label' => 'Explore villas',
                'is_visible' => true,
            ],
            'concierge' => [
                'title' => 'More than a villa',
                'title_emphasis' => 'your Bali stay, considered.',
                'description' => 'Thoughtful support before arrival and throughout your stay.',
                'quote' => 'The best stays feel effortless because the right help is already close.',
                'link_label' => 'Contact concierge',
                'is_visible' => true,
            ],
            'faq_intro' => [
                'title' => 'Everything you need to know.',
                'button_label' => 'Ask Us',
                'is_visible' => true,
            ],
            'journal_preview' => [
                'title' => 'The Journal.',
                'is_visible' => true,
            ],
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

        $row = PageSection::query()->where('page', 'about')->where('section', $this->activeSection)->first();
        $content = array_merge($this->defaults()[$this->activeSection], is_array($row?->content) ? $row->content : []);

        $this->loadedUpdatedAt = $row?->updated_at?->toISOString();
        $this->loadedContentHash = $this->contentHash($row?->content);
        $this->form->fill([$this->activeSection => $content]);
    }

    public function save(): void
    {
        $section = $this->activeSection;

        if ($section === null || ! $this->isAllowedSection($section)) {
            Notification::make()->title('Section not available')
                ->body('Return to the About section overview and choose a valid section.')->danger()->send();

            return;
        }

        $state = $this->form->getState();
        $content = $state[$section] ?? [];
        if ($section === 'trust_recognition' && is_array($content['pillars'] ?? null)) {
            $content['pillars'] = array_map(static function (array $pillar): array {
                unset($pillar['image']);

                return $pillar;
            }, $content['pillars']);
        }
        $definition = static::sectionRegistry()[$section];

        try {
            $saved = DB::transaction(function () use ($section, $content, $definition): ?PageSection {
                $current = PageSection::query()->where('page', 'about')->where('section', $section)->lockForUpdate()->first();
                if (
                    $current?->updated_at?->toISOString() !== $this->loadedUpdatedAt
                    || $this->contentHash($current?->content) !== $this->loadedContentHash
                ) {
                    return null;
                }

                return PageSection::updateOrCreate(
                    ['page' => 'about', 'section' => $section],
                    ['content' => $content, 'sort_order' => $definition['order'], 'is_active' => true],
                );
            }, 3);

            if ($saved === null) {
                Notification::make()->title('A newer edit is already saved')
                    ->body('Reload this section before saving so another administrator’s changes are not overwritten.')
                    ->warning()->persistent()->send();

                return;
            }

            $this->loadedUpdatedAt = $saved->updated_at?->toISOString();
            $this->loadedContentHash = $this->contentHash($saved->content);
            Notification::make()->title($definition['label'].' saved')
                ->body('The public About page now uses this section content.')->success()->send();
        } catch (Throwable $error) {
            report($error);
            Notification::make()->title('Section could not be saved')
                ->body('Your previous published content is still safe. Please try again.')
                ->danger()->persistent()->send();
        }
    }

    /** @return array<int, array<string, mixed>> */
    public function getSectionCards(): array
    {
        $rows = PageSection::query()->where('page', 'about')
            ->whereIn('section', array_keys(static::sectionRegistry()))->get()->keyBy('section');

        return collect(static::sectionRegistry())
            ->map(function (array $definition, string $key) use ($rows): array {
                /** @var PageSection|null $row */
                $row = $rows->get($key);
                $content = array_merge($this->defaults()[$key], is_array($row?->content) ? $row->content : []);

                return array_merge($definition, [
                    'key' => $key,
                    'is_visible' => ($content['is_visible'] ?? true) !== false,
                    'is_complete' => $row !== null && $this->isComplete($content, $definition['required']),
                    'updated_at' => $row?->updated_at,
                    'edit_url' => static::getUrl(['section' => $key]),
                    'preview_url' => $this->publicAboutUrl($definition['anchor']),
                ]);
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

    public function getActiveSectionDefinition(): ?array
    {
        return $this->activeSection === null ? null : (static::sectionRegistry()[$this->activeSection] ?? null);
    }

    public function getHubUrl(): string
    {
        return static::getUrl();
    }

    public function getPublicAboutUrl(): string
    {
        return $this->publicAboutUrl();
    }

    public function getCreateArticleUrl(): string
    {
        return ArticleResource::getUrl('create');
    }

    private function publicAboutUrl(?string $anchor = null): string
    {
        $url = rtrim((string) config('app.frontend_url'), '/').'/about';

        return $anchor === null ? $url : $url.'#'.$anchor;
    }

    private function publicArticleUrl(string $slug): string
    {
        return rtrim((string) config('app.frontend_url'), '/').'/journal/'.rawurlencode($slug);
    }

    private function articleCoverUrl(Article $article): ?string
    {
        $url = AssetUrl::resolve($article->hero_image);

        if ($url !== null && str_starts_with($url, '/')) {
            return asset('images/journal-cover-placeholder.svg');
        }

        return $url;
    }

    private function isAllowedSection(string $section): bool
    {
        return array_key_exists($section, static::sectionRegistry());
    }

    private function contentHash(?array $content): ?string
    {
        if ($content === null) {
            return null;
        }

        return hash('sha256', json_encode($content, JSON_THROW_ON_ERROR));
    }

    private function defaultBookingSteps(): array
    {
        return [
            ['title' => 'Discover your villa', 'description' => 'Browse our collection and find a home that fits the way you want to stay.', 'images' => ['/homepage_villa/curated-1-main.webp', '/homepage_villa/curated-2-detail.webp']],
            ['title' => 'Choose your dates', 'description' => 'Select your travel dates and see live availability for your chosen villa.', 'images' => ['/homepage_villa/curated-4-pool.webp', '/homepage_villa/curated-5-lounge.webp']],
            ['title' => 'Confirm your stay', 'description' => 'Review your details, live rate, and complete a secure checkout.', 'images' => ['/homepage_villa/rumahmimosa.webp', '/homepage_villa/villaarta.webp']],
            ['title' => 'Arrive with ease', 'description' => 'Your Bali stay is confirmed, with our local team close by whenever needed.', 'images' => ['/homepage_villa/curated-3-corner.webp', '/homepage_villa/curated-6-exterior.webp']],
        ];
    }

    private function defaultTrustPillars(): array
    {
        return [
            ['id' => 'verified', 'name' => 'Verified Villas', 'scope' => 'Every home', 'desc' => 'Each villa is personally inspected for comfort, cleanliness, and safety before a guest arrives, so the space feels ready the moment you walk in.'],
            ['id' => 'support', 'name' => '24/7 Guest Support', 'scope' => 'Any time', 'desc' => 'A real person stays reachable around the clock for arrivals, late questions, or anything that shifts once you land.'],
            ['id' => 'concierge', 'name' => 'Local Concierge', 'scope' => 'On the island', 'desc' => 'Drivers, dining, beach days, and trusted recommendations, arranged by a team that actually lives here.'],
            ['id' => 'booking', 'name' => 'Secure Booking', 'scope' => 'Every trip', 'desc' => 'Clear terms, protected payments, and confirmed details before you travel, with no guesswork.'],
            ['id' => 'pricing', 'name' => 'Transparent Pricing', 'scope' => 'No surprises', 'desc' => 'The price you see is the price you pay, with every fee explained up front and nothing added on arrival.'],
        ];
    }

    protected function getFormActions(): array
    {
        if ($this->activeSection === null) {
            return [];
        }

        return [
            Action::make('save')->label('Save section')->color('primary')
                ->icon('heroicon-o-check-circle')->action('save'),
        ];
    }
}
