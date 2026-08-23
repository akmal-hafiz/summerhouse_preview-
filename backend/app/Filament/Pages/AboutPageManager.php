<?php

namespace App\Filament\Pages;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Filament\Pages\Concerns\ManagesPageFaqs;
use App\Models\PageSection;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Cache;

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

    public function table(Table $table): Table
    {
        return $this->faqTable($table);
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
        $this->form->fill([
            'our_story' => $this->section('our_story', [
                'heading' => 'Our Story.',
                'lead' => 'Summerhouses began as a small collection of villas in Canggu, Bali, built on one belief: a great stay should feel personal before it looks impressive.',
                'body' => 'Years later, that still shapes every home we curate across Canggu, Ubud, Pererenan, and the quiet corners of the island in between.',
                'scroll_label' => 'Trusted by travelers worldwide',
                'is_visible' => true,
            ]),
            'trust_recognition' => $this->section('trust_recognition', [
                'heading' => 'A decade of stays, thoughtfully hosted.',
                'pillars' => $this->defaultTrustPillars(),
                'is_visible' => true,
            ]),
            'studio_statement' => $this->section('studio_statement', [
                'eyebrow' => 'The gallery',
                'title' => 'A closer look at the spaces you will actually live in.',
                'description' => 'The light through the morning kitchen, the pool at dusk, the quiet corners between rooms. Every villa is photographed the way you will remember it, so what you see is what you arrive to.',
                'button_label' => 'View the full gallery',
                'is_visible' => true,
            ]),
            'booking_process' => $this->section('booking_process', [
                'eyebrow' => 'Booking process',
                'title' => 'Secure your stay',
                'title_emphasis' => 'with ease',
                'steps' => $this->defaultBookingSteps(),
                'closing_copy' => 'Your Bali stay, thoughtfully arranged.',
                'link_label' => 'Explore villas',
                'is_visible' => true,
            ]),
            'concierge' => $this->section('concierge', [
                'eyebrow' => 'Concierge',
                'title' => 'More than a villa',
                'title_emphasis' => 'your Bali stay, considered.',
                'description' => 'Thoughtful support before arrival and throughout your stay.',
                'quote' => 'The best stays feel effortless because the right help is already close.',
                'link_label' => 'View all Concierge',
                'is_visible' => true,
            ]),
            'faq_intro' => $this->section('faq_intro', [
                'eyebrow' => 'FAQ',
                'title' => 'Everything you need to know.',
                'button_label' => 'Ask Us',
                'is_visible' => true,
            ]),
            'journal_preview' => $this->section('journal_preview', [
                'eyebrow' => 'Featured Stories',
                'title' => 'The Journal.',
                'is_visible' => true,
            ]),
            'destination_footprint' => $this->section('destination_footprint', [
                'eyebrow' => 'Location',
                'title' => 'Where Summerhouses stays unfold.',
                'description' => 'The collection is centered around Bali\'s most requested stay areas, with villas selected for privacy, atmosphere, and access to the island\'s everyday rituals.',
                'is_visible' => true,
            ]),
            'final_cta' => $this->section('final_cta', [
                'eyebrow' => 'Your Bali stay',
                'title' => 'Find the home that feels right.',
                'button_label' => 'Book now',
                'is_visible' => true,
            ]),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Tabs::make('About sections')->tabs([
                Forms\Components\Tabs\Tab::make('Our Story Hero')
                    ->icon('heroicon-o-document-text')
                    ->schema($this->copyFields('our_story', [
                        Forms\Components\TextInput::make('our_story.heading')->label('Heading'),
                        Forms\Components\Textarea::make('our_story.lead')->rows(3)->columnSpanFull(),
                        Forms\Components\Textarea::make('our_story.body')->rows(3)->columnSpanFull(),
                        Forms\Components\TextInput::make('our_story.scroll_label')->label('Scroll cue'),
                    ])),
                Forms\Components\Tabs\Tab::make('Trust and Recognition')
                    ->icon('heroicon-o-shield-check')
                    ->schema($this->copyFields('trust_recognition', [
                        Forms\Components\TextInput::make('trust_recognition.heading')->columnSpanFull(),
                        Forms\Components\Repeater::make('trust_recognition.pillars')
                            ->reorderable()
                            ->minItems(1)
                            ->maxItems(8)
                            ->itemLabel(fn (array $state): ?string => $state['name'] ?? 'Trust pillar')
                            ->schema([
                                Forms\Components\TextInput::make('id')
                                    ->required()
                                    ->helperText('Stable key, for example verified-villas.'),
                                Forms\Components\TextInput::make('name')->required(),
                                Forms\Components\TextInput::make('scope')->required(),
                                Forms\Components\Textarea::make('desc')->required()->rows(3),
                                ManagedImageUpload::make('image')
                                    ->label('Pillar image')
                                    ->required()
                                    ->imageEditorAspectRatios(['4:3', '3:2', null])
                                    ->columnSpanFull(),
                            ])
                            ->columns(2)
                            ->columnSpanFull(),
                        Forms\Components\Placeholder::make('trust_dynamic_note')
                            ->label('Live numbers')
                            ->content('Curated villa totals remain automatic from Lodgify. Admin does not need to maintain them manually.')
                            ->columnSpanFull(),
                    ])),
                Forms\Components\Tabs\Tab::make('Editorial Gallery')
                    ->icon('heroicon-o-photo')
                    ->schema($this->copyFields('studio_statement', [
                        Forms\Components\TextInput::make('studio_statement.eyebrow'),
                        Forms\Components\TextInput::make('studio_statement.title'),
                        Forms\Components\Textarea::make('studio_statement.description')->rows(4)->columnSpanFull(),
                        Forms\Components\TextInput::make('studio_statement.button_label'),
                        ManagedImageUpload::make('studio_statement.left_images')
                            ->label('Left image rail')
                            ->multiple()
                            ->reorderable()
                            ->appendFiles()
                            ->minFiles(3)
                            ->maxFiles(10)
                            ->panelLayout('grid')
                            ->imageEditorAspectRatios(['3:4', '4:5', null])
                            ->helperText('Choose at least three images. Drag thumbnails to control the visual rhythm.')
                            ->columnSpanFull(),
                        ManagedImageUpload::make('studio_statement.right_images')
                            ->label('Right image rail')
                            ->multiple()
                            ->reorderable()
                            ->appendFiles()
                            ->minFiles(3)
                            ->maxFiles(10)
                            ->panelLayout('grid')
                            ->imageEditorAspectRatios(['3:4', '4:5', null])
                            ->helperText('Choose at least three images. The website repeats them safely when more frames are needed.')
                            ->columnSpanFull(),
                    ])),
                Forms\Components\Tabs\Tab::make('Booking Process')
                    ->icon('heroicon-o-calendar-days')
                    ->schema($this->copyFields('booking_process', [
                        Forms\Components\TextInput::make('booking_process.eyebrow'),
                        Forms\Components\TextInput::make('booking_process.title'),
                        Forms\Components\TextInput::make('booking_process.title_emphasis'),
                        Forms\Components\Repeater::make('booking_process.steps')
                            ->reorderable()
                            ->minItems(1)
                            ->maxItems(6)
                            ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'New step')
                            ->schema([
                                Forms\Components\TextInput::make('title')->required(),
                                Forms\Components\Textarea::make('description')->required()->rows(2),
                                ManagedImageUpload::make('images')
                                    ->label('Step images')
                                    ->multiple()
                                    ->reorderable()
                                    ->minFiles(1)
                                    ->maxFiles(2)
                                    ->panelLayout('grid')
                                    ->imageEditorAspectRatios(['4:3', '3:2', null])
                                    ->helperText('Upload one or two images. One image is reused safely in both positions.')
                                    ->columnSpanFull(),
                            ])
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('booking_process.closing_copy'),
                        Forms\Components\TextInput::make('booking_process.link_label'),
                    ])),
                Forms\Components\Tabs\Tab::make('Concierge')
                    ->icon('heroicon-o-sparkles')
                    ->schema($this->copyFields('concierge', [
                        Forms\Components\TextInput::make('concierge.eyebrow'),
                        Forms\Components\TextInput::make('concierge.title'),
                        Forms\Components\TextInput::make('concierge.title_emphasis'),
                        Forms\Components\Textarea::make('concierge.description')->rows(2)->columnSpanFull(),
                        Forms\Components\Textarea::make('concierge.quote')->rows(2)->columnSpanFull(),
                        Forms\Components\TextInput::make('concierge.link_label'),
                    ])),
                Forms\Components\Tabs\Tab::make('FAQ and Journal')
                    ->icon('heroicon-o-question-mark-circle')
                    ->schema([
                        Forms\Components\Section::make('FAQ introduction')->schema($this->copyFields('faq_intro', [
                            Forms\Components\TextInput::make('faq_intro.eyebrow'),
                            Forms\Components\TextInput::make('faq_intro.title'),
                            Forms\Components\TextInput::make('faq_intro.button_label'),
                        ])),
                        Forms\Components\Section::make('Journal preview')->schema($this->copyFields('journal_preview', [
                            Forms\Components\TextInput::make('journal_preview.eyebrow'),
                            Forms\Components\TextInput::make('journal_preview.title'),
                        ])),
                    ]),
                Forms\Components\Tabs\Tab::make('Destination Footprint')
                    ->icon('heroicon-o-map')
                    ->schema($this->copyFields('destination_footprint', [
                        Forms\Components\TextInput::make('destination_footprint.eyebrow'),
                        Forms\Components\TextInput::make('destination_footprint.title'),
                        Forms\Components\Textarea::make('destination_footprint.description')->rows(3)->columnSpanFull(),
                        Forms\Components\Placeholder::make('destination_dynamic_note')
                            ->label('Map and region cards')
                            ->content('Locations and villa counts remain automatic from Lodgify.')
                            ->columnSpanFull(),
                    ])),
                Forms\Components\Tabs\Tab::make('Final CTA')
                    ->icon('heroicon-o-arrow-up-right')
                    ->schema($this->copyFields('final_cta', [
                        Forms\Components\TextInput::make('final_cta.eyebrow'),
                        Forms\Components\TextInput::make('final_cta.title'),
                        Forms\Components\TextInput::make('final_cta.button_label'),
                    ])),
            ])->persistTabInQueryString(),
        ]);
    }

    private function copyFields(string $section, array $fields): array
    {
        return array_merge([
            Forms\Components\Toggle::make("{$section}.is_visible")
                ->label('Show section')
                ->default(true)
                ->columnSpanFull(),
        ], $fields);
    }

    private function section(string $name, array $fallback): array
    {
        return array_merge($fallback, PageSection::getSection('about', $name) ?? []);
    }

    private function defaultBookingSteps(): array
    {
        return [
            [
                'title' => 'Discover your villa',
                'description' => 'Browse our collection and find a home that fits the way you want to stay.',
                'images' => ['/homepage_villa/curated-1-main.webp', '/homepage_villa/curated-2-detail.webp'],
            ],
            [
                'title' => 'Choose your dates',
                'description' => 'Select your travel dates and see live availability for your chosen villa.',
                'images' => ['/homepage_villa/curated-4-pool.webp', '/homepage_villa/curated-5-lounge.webp'],
            ],
            [
                'title' => 'Confirm your stay',
                'description' => 'Review your details, live rate, and complete a secure Lodgify checkout.',
                'images' => ['/homepage_villa/rumahmimosa.webp', '/homepage_villa/villaarta.webp'],
            ],
            [
                'title' => 'Arrive with ease',
                'description' => 'Your Bali stay is confirmed, with our local team close by whenever needed.',
                'images' => ['/homepage_villa/curated-3-corner.webp', '/homepage_villa/curated-6-exterior.webp'],
            ],
        ];
    }

    private function defaultTrustPillars(): array
    {
        return [
            [
                'id' => 'verified',
                'name' => 'Verified Villas',
                'scope' => 'Every home',
                'desc' => 'Each villa is personally inspected for comfort, cleanliness, and safety before a guest arrives, so the space feels ready the moment you walk in.',
                'image' => '/homepage_villa/curated-1-main.webp',
            ],
            [
                'id' => 'support',
                'name' => '24/7 Guest Support',
                'scope' => 'Any time',
                'desc' => 'A real person stays reachable around the clock for arrivals, late questions, or anything that shifts once you land.',
                'image' => '/homepage_villa/curated-5-lounge.webp',
            ],
            [
                'id' => 'concierge',
                'name' => 'Local Concierge',
                'scope' => 'On the island',
                'desc' => 'Drivers, dining, beach days, and trusted recommendations, arranged by a team that actually lives here.',
                'image' => '/homepage_villa/88east.webp',
            ],
            [
                'id' => 'booking',
                'name' => 'Secure Booking',
                'scope' => 'Every trip',
                'desc' => 'Clear terms, protected payments, and confirmed details before you travel, with no guesswork.',
                'image' => '/homepage_villa/curated-8.webp',
            ],
            [
                'id' => 'pricing',
                'name' => 'Transparent Pricing',
                'scope' => 'No surprises',
                'desc' => 'The price you see is the price you pay, with every fee explained up front and nothing added on arrival.',
                'image' => '/homepage_villa/villaarta.webp',
            ],
        ];
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save About Page')
                ->color('primary')
                ->icon('heroicon-o-check-circle')
                ->action('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $section => $content) {
            PageSection::updateOrCreate(
                ['page' => 'about', 'section' => $section],
                ['content' => $content, 'is_active' => true]
            );
            Cache::forget("cms.page.about.{$section}");
        }
        Cache::forget('cms.page.about');

        Notification::make()
            ->title('About page saved')
            ->body('Copy and section visibility are now managed from this page.')
            ->success()
            ->send();
    }
}
