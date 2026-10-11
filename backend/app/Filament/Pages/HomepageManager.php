<?php

namespace App\Filament\Pages;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Forms\Components\VillaPicker;
use App\Models\BaliCollection;
use App\Models\HomepageVillaSelection;
use App\Models\PageSection;
use App\Models\VillaCache;
use App\Support\AssetUrl;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class HomepageManager extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-home-modern';

    protected static ?string $navigationGroup = 'Website Pages';

    protected static ?string $title = 'Homepage Manager';

    protected static ?int $navigationSort = 10;

    protected static string $view = 'filament.pages.homepage-manager';

    public ?array $data = [];

    public function mount(): void
    {
        $whyStay = $this->normalizeWhyStayContent(PageSection::getSection('home', 'why_stay') ?? []);
        $this->form->fill([
            'hero' => PageSection::getSection('home', 'hero') ?? [],
            'stay_styles' => PageSection::getSection('home', 'stay_styles') ?? [],
            'signature_villa' => PageSection::getSection('home', 'signature_villa') ?? [],
            'why_stay' => $whyStay,
            'explore_bali' => PageSection::getSection('home', 'explore_bali') ?? [],
            'destinations' => BaliCollection::ordered()
                ->get()
                ->map(fn (BaliCollection $row): array => $row->toArray())
                ->toArray(),
            'slots' => [
                'short_stays' => $this->loadSlot('short_stays'),
                'extended_stays' => $this->loadSlot('extended_stays'),
                'featured_homes' => $this->loadSlot('featured_homes'),
                'signature' => $this->loadSlot('signature'),
            ],
        ]);
    }

    private function loadSlot(string $slot): array
    {
        return HomepageVillaSelection::forSlot($slot)
            ->get([
                'lodgify_property_id',
                'override_title',
                'override_description',
                'award_name',
                'award_issuer',
                'award_year',
                'award_url',
                'award_logo',
                'show_award',
            ])
            ->map(fn ($row) => [
                'lodgify_property_id' => $row->lodgify_property_id,
                'override_title' => $row->override_title,
                'override_description' => $row->override_description,
                'award_name' => $row->award_name,
                'award_issuer' => $row->award_issuer,
                'award_year' => $row->award_year,
                'award_url' => $row->award_url,
                'award_logo' => $row->award_logo,
                'show_award' => $row->show_award,
            ])
            ->toArray();
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Tabs::make('Homepage')->tabs([
                Forms\Components\Tabs\Tab::make('Hero')->icon('heroicon-o-film')->schema([
                    Forms\Components\FileUpload::make('hero.video_url')
                        ->label('Hero Video')
                        ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/quicktime'])
                        ->maxSize(204800)
                        ->disk('public')
                        ->directory('uploads/hero/videos')
                        ->visibility('public')
                        ->helperText('MP4/WebM/MOV up to 200MB'),
                    ManagedImageUpload::make('hero.poster_image')
                        ->label('Poster Image')
                        ->image()
                        ->imageEditor()
                        ->disk('public')
                        ->directory('uploads/hero/posters')
                        ->visibility('public')
                        ->maxSize(5120)
                        ->helperText('Shown while video loads'),
                    Forms\Components\TagsInput::make('hero.badge_text')
                        ->label('Badge Text')
                        ->placeholder('Add a chip and press Enter')
                        ->helperText('Each chip becomes a slash-separated word in the hero badge.')
                        ->afterStateHydrated(function (Forms\Components\TagsInput $component, $state) {
                            if (is_string($state)) {
                                $parts = array_filter(array_map('trim', explode('/', $state)));
                                $component->state(array_values($parts));
                            }
                        })
                        ->dehydrateStateUsing(fn ($state) => is_array($state) ? implode(' / ', $state) : (string) $state),
                    Forms\Components\Textarea::make('hero.heading_text')->label('Heading')->rows(2),
                    Forms\Components\Textarea::make('hero.description')->label('Description')->rows(2),
                    Forms\Components\Toggle::make('hero.show_badge')->label('Show Badge'),
                    Forms\Components\Toggle::make('hero.show_heading')->label('Show Heading'),
                ]),

                Forms\Components\Tabs\Tab::make('Stay Styles')->icon('heroicon-o-rectangle-group')->schema([
                    Forms\Components\TextInput::make('stay_styles.heading')->label('Section Heading'),
                    Forms\Components\Toggle::make('stay_styles.is_visible')
                        ->label('Show this section')
                        ->default(true),

                    Forms\Components\Section::make('Short Stays')->schema([
                        $this->villaSlotRepeater('slots.short_stays', maxItems: 6),
                    ])->collapsible(),

                    Forms\Components\Section::make('Extended Stays')->schema([
                        $this->villaSlotRepeater('slots.extended_stays', maxItems: 6),
                    ])->collapsible(),

                    Forms\Components\Section::make('Featured Homes')->schema([
                        $this->villaSlotRepeater('slots.featured_homes', maxItems: 6),
                    ])->collapsible(),
                ]),

                Forms\Components\Tabs\Tab::make('Signature Villa')->icon('heroicon-o-star')->schema([
                    Forms\Components\TextInput::make('signature_villa.title')->hidden(),
                    Forms\Components\Textarea::make('signature_villa.description')
                        ->hidden()
                        ->label('Description')
                        ->rows(3)
                        ->helperText('Shown beside the price, e.g. "A five-bedroom tropical estate with private pool…".'),
                    Forms\Components\Textarea::make('signature_villa.why_this_home')
                        ->label('What makes this stay distinct')
                        ->rows(5)
                        ->helperText('Editorial copy shown beside the villa features. Leave blank to use the location-based fallback.'),
                    Forms\Components\Section::make('Currently live on homepage')
                        ->description('This villa is what visitors see right now. To swap it, drag a different villa to the top of the list below.')
                        ->schema([
                            Forms\Components\Placeholder::make('signature_live_preview')
                                ->label('')
                                ->content(fn () => new \Illuminate\Support\HtmlString($this->renderActiveSignaturePreview())),
                        ]),
                    Forms\Components\Section::make('Signature villa bench')
                        ->description('The top row is what shows on the homepage. Drag any row to the top to activate it. Bench villas stay saved for one-click swaps later.')
                        ->schema([
                            $this->villaSlotRepeater('slots.signature'),
                        ]),
                ]),

                Forms\Components\Tabs\Tab::make('Recognition & Reviews')->icon('heroicon-o-trophy')->schema([
                    Forms\Components\Section::make('Honeycombers recognition')
                        ->description('The homepage has one recognition feature. Changes here are published immediately.')
                        ->schema([
                            Forms\Components\TextInput::make('why_stay.context_title')
                                ->label('Section title')
                                ->default('A stay recognised for the details.')
                                ->required()
                                ->maxLength(180),
                            Forms\Components\Textarea::make('why_stay.supporting_copy')
                                ->label('Supporting copy')
                                ->default('Ubud Zen River House was named Gold Winner for Best Villa in Bali 2024 by Honeycombers. A recognition of the thoughtful design, setting, and care behind the stay.')
                                ->rows(3)
                                ->required()
                                ->maxLength(500),
                            Forms\Components\Toggle::make('why_stay.is_visible')
                                ->label('Show recognition')
                                ->default(true),
                            Forms\Components\Hidden::make('why_stay.recognition.type')->default('award'),
                            Forms\Components\TextInput::make('why_stay.recognition.name')
                                ->label('Publication')
                                ->default('Honeycombers')
                                ->required()
                                ->maxLength(180),
                            Forms\Components\TextInput::make('why_stay.recognition.issuer')
                                ->label('Result')
                                ->default('Gold Winner')
                                ->maxLength(180),
                            Forms\Components\TextInput::make('why_stay.recognition.title')
                                ->label('Award title')
                                ->default('Best Villa in Bali 2024')
                                ->required()
                                ->maxLength(220),
                            Forms\Components\TextInput::make('why_stay.recognition.year')
                                ->label('Year')
                                ->default('2024')
                                ->maxLength(12),
                            Forms\Components\Select::make('why_stay.recognition.lodgify_property_id')
                                ->label('Recognised villa')
                                ->searchable()
                                ->preload()
                                ->native(false)
                                ->options(fn (): array => VillaCache::query()->publiclyEligible()->orderBy('name')->pluck('name', 'lodgify_id')->all())
                                ->live()
                                ->afterStateUpdated(function (Forms\Set $set, ?string $state): void {
                                    $set('why_stay.recognition.villa_name', $state
                                        ? VillaCache::query()->where('lodgify_id', $state)->value('name')
                                        : null);
                                })
                                ->helperText('Villa choices come from Lodgify. The recognition content itself updates immediately.'),
                            Forms\Components\TextInput::make('why_stay.recognition.villa_name')
                                ->label('Villa display name')
                                ->default('Ubud Zen River House')
                                ->maxLength(180),
                            Forms\Components\TextInput::make('why_stay.recognition.url')
                                ->label('Verification URL')
                                ->url()
                                ->maxLength(2048),
                            ManagedImageUpload::make('why_stay.recognition.image')
                                ->label('Supporting image')
                                ->directory('uploads/homepage/recognition')
                                ->helperText('Optional. Ubud Zen River House is used as the fallback image.'),
                            Forms\Components\TextInput::make('why_stay.recognition.image_alt')
                                ->label('Image description')
                                ->maxLength(220),
                            Forms\Components\Hidden::make('why_stay.recognition.is_visible')->default(true),
                        ]),
                ]),

                Forms\Components\Tabs\Tab::make('Bali Destinations')->icon('heroicon-o-map')->schema([
                    Forms\Components\TextInput::make('explore_bali.title')->label('Section heading')->default('Bali, by Neighbourhood'),
                    Forms\Components\Textarea::make('explore_bali.description')->label('Short introduction')->rows(2),
                    Forms\Components\Toggle::make('explore_bali.is_visible')
                        ->label('Show this section')
                        ->default(true),
                    Forms\Components\Section::make('Destination Guides')
                        ->description('Manage the homepage panorama and each destination page here. Reorder the destinations to change their display order. Each Explore villas link uses the selected location.')
                        ->schema([
                            $this->destinationRepeater(),
                        ]),
                ]),
            ])->persistTabInQueryString(),
        ]);
    }

    private function villaSlotRepeater(string $statePath, ?int $maxItems = null): Forms\Components\Repeater
    {
        $isSignature = str_ends_with($statePath, '.signature');
        $isStayCategory = in_array($statePath, [
            'slots.short_stays',
            'slots.extended_stays',
            'slots.featured_homes',
        ], true);

        $repeater = Forms\Components\Repeater::make($statePath)
            ->label('Villas')
            ->schema([
                VillaPicker::make('lodgify_property_id')
                    ->label('Villa')
                    ->required()
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('override_title')
                    ->label('Title Override (optional)')
                    ->columnSpan(1),
                Forms\Components\Textarea::make('override_description')
                    ->label('Description Override (optional)')
                    ->rows(2)
                    ->columnSpan(1),
                Forms\Components\Section::make('Verified award credential')
                    ->description('Shown only when the award name is verified and the visibility toggle is enabled.')
                    ->visible($isSignature)
                    ->columnSpanFull()
                    ->schema([
                        Forms\Components\Toggle::make('show_award')
                            ->label('Show award on Most Exclusive Stay')
                            ->default(false),
                        Forms\Components\TextInput::make('award_name')
                            ->label('Award name')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('award_issuer')
                            ->label('Award issuer')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('award_year')
                            ->label('Award year')
                            ->maxLength(12),
                        Forms\Components\TextInput::make('award_url')
                            ->label('Verification URL')
                            ->url()
                            ->maxLength(2048),
                        ManagedImageUpload::make('award_logo')
                            ->label('Approved award logo (optional)')
                            ->image()
                            ->disk('public')
                            ->directory('uploads/awards')
                            ->visibility('public')
                            ->maxSize(2048),
                    ])
                    ->columns(2),
            ])
            ->columns(2)
            ->reorderable()
            ->collapsed()
            ->itemLabel(function (array $state, ?string $uuid) use ($statePath, $isSignature): ?string {
                $id = $state['lodgify_property_id'] ?? null;
                if (! $id) {
                    return 'New villa';
                }
                $villa = VillaCache::where('lodgify_id', (string) $id)->first();
                $name = $villa?->name ?? "Villa #{$id}";

                if ($isSignature) {
                    $rows = data_get($this->data, $statePath, []);
                    $keys = array_keys(is_array($rows) ? $rows : []);
                    $firstKey = $keys[0] ?? null;
                    $isFirst = $uuid !== null ? ($uuid === $firstKey) : false;

                    return $isFirst
                        ? "🟢 ACTIVE  ·  {$name}"
                        : "○ On bench  ·  {$name}";
                }

                return $name;
            });

        if ($maxItems) {
            $repeater->maxItems($maxItems);
        }

        if ($isStayCategory) {
            $repeater->helperText('Choose up to six villas in display order. Any empty positions are filled automatically from active villas that fit this category.');
        }

        return $repeater;
    }

    private function destinationRepeater(): Forms\Components\Repeater
    {
        return Forms\Components\Repeater::make('destinations')
            ->label('')
            ->reorderable()
            ->collapsed()
            ->itemLabel(fn (array $state): ?string => $state['location'] ?? 'New destination')
            ->schema([
                Forms\Components\Hidden::make('id'),
                Forms\Components\Hidden::make('collection_id'),
                Forms\Components\Select::make('location')
                    ->label('Destination')
                    ->required()
                    ->distinct()
                    ->searchable()
                    ->native(false)
                    ->options(fn (): array => VillaCache::query()
                        ->publiclyEligible()
                        ->whereNotNull('location')
                        ->orderBy('location')
                        ->pluck('location', 'location')
                        ->filter()
                        ->all())
                    ->getSearchResultsUsing(fn (string $search): array => VillaCache::query()
                        ->publiclyEligible()
                        ->where('location', 'like', "%{$search}%")
                        ->limit(20)
                        ->pluck('location', 'location')
                        ->all()
                    )
                    ->live()
                    ->afterStateUpdated(function (Forms\Set $set, ?string $state): void {
                        if (! $state) {
                            return;
                        }
                        $set('collection_id', \Illuminate\Support\Str::slug($state));
                        $set('image_alt', "Summerhouse destination guide to {$state}");
                    })
                    ->helperText('Only locations with an active villa are offered.'),
                Forms\Components\TextInput::make('category')
                    ->label('Short category label')
                    ->required()
                    ->placeholder('Quiet Coast'),
                Forms\Components\Textarea::make('description')
                    ->label('Description below the panorama')
                    ->required()
                    ->rows(2)
                    ->columnSpanFull(),
                ManagedImageUpload::make('image')
                    ->label('Homepage panorama image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/cards')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->helperText('Use a wide villa photo. Existing images in public remain available until you replace them.'),
                Forms\Components\TextInput::make('image_alt')
                    ->label('Describe the image for accessibility'),
                Forms\Components\Section::make('Destination page content')
                    ->description('Optional detail page content. Open only when editing the destination story.')
                    ->collapsed()
                    ->schema([
                        Forms\Components\TextInput::make('hero_title')->label('Page title'),
                        Forms\Components\Textarea::make('introduction')->label('Page introduction')->rows(3),
                        ManagedImageUpload::make('hero_image')
                            ->label('Page hero image')
                            ->image()->imageEditor()->disk('public')
                            ->directory('uploads/collections/heroes')->visibility('public')->maxSize(12288),
                        Forms\Components\TagsInput::make('moods')->label('Destination themes'),
                        Forms\Components\TagsInput::make('highlights'),
                        Forms\Components\TagsInput::make('best_for')->label('Best for'),
                        Forms\Components\Repeater::make('editorial_chapters')
                            ->label('Story chapters')->collapsed()->reorderable()
                            ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'New chapter')
                            ->schema([
                                Forms\Components\TextInput::make('title')->required(),
                                Forms\Components\Textarea::make('description')->required()->rows(3),
                                ManagedImageUpload::make('image')->image()->imageEditor()->disk('public')
                                    ->directory('uploads/collections/chapters')->visibility('public')->maxSize(8192),
                                Forms\Components\TextInput::make('image_alt')->label('Image description'),
                            ])->columnSpanFull(),
                        Forms\Components\Repeater::make('facts')
                            ->label('Quick facts')->collapsed()
                            ->schema([
                                Forms\Components\TextInput::make('label')->required(),
                                Forms\Components\TextInput::make('value')->required(),
                            ])->columns(2)->columnSpanFull(),
                        Forms\Components\TagsInput::make('related_journal_tags')
                            ->label('Related journal tags')->columnSpanFull(),
                    ])->columns(2)->columnSpanFull(),
                Forms\Components\Section::make('Related villas on the destination page')
                    ->description('Villas are matched automatically. Adjust the match only if the destination name differs from the villa location.')
                    ->collapsed()
                    ->schema([
                        Forms\Components\Toggle::make('show_related_villas')->label('Show matching villas')->default(true),
                        Forms\Components\TextInput::make('related_villas_heading')->label('Section heading'),
                        Forms\Components\TextInput::make('lodgify_location')->label('Villa location match'),
                    ])->columns(2)->columnSpanFull(),
                Forms\Components\Section::make('Search preview')
                    ->collapsed()
                    ->schema([
                        Forms\Components\TextInput::make('seo_title')->label('Search title')->maxLength(70),
                        Forms\Components\Textarea::make('seo_description')->label('Search description')->rows(2)->maxLength(180),
                        ManagedImageUpload::make('social_image')->label('Social sharing image')
                            ->image()->imageEditor()->disk('public')->directory('uploads/collections/social')
                            ->visibility('public')->maxSize(8192),
                    ])->columns(2)->columnSpanFull(),
                Forms\Components\Select::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published'])
                    ->default('published')
                    ->required(),
                Forms\Components\Toggle::make('is_active')
                    ->label('Visible')
                    ->default(true),
            ])
            ->columns(2);
    }

    private function renderActiveSignaturePreview(): string
    {
        $row = HomepageVillaSelection::forSlot('signature')->first();
        $isFallback = false;
        $villa = null;
        $lodgifyId = null;

        if ($row) {
            $lodgifyId = (string) $row->lodgify_property_id;
            $villa = VillaCache::publiclyEligible()->where('lodgify_id', $lodgifyId)->first();
        } else {
            /* Mirror frontend fallback: highest-priced villa from Lodgify cache. */
            $villa = VillaCache::publiclyEligible()->get()
                ->sortByDesc(fn (VillaCache $v) => (float) ($v->raw['max_price'] ?? 0))
                ->first();
            if ($villa) {
                $isFallback = true;
                $lodgifyId = (string) $villa->lodgify_id;
            }
        }

        if (! $villa) {
            return '<div class="sh-signature-empty">No villa data yet. Pick one in the bench below to control which villa appears on the homepage.</div>';
        }

        $name = e($villa->name ?? "Villa #{$lodgifyId}");
        $thumb = AssetUrl::resolve($villa->thumbnail_url ?: ($villa->raw['image_url'] ?? null));
        $thumb = $thumb ? e($thumb) : null;
        $location = e($villa->location ?? $villa->raw['city'] ?? '');
        $bedrooms = $villa->bedrooms ? e((string) $villa->bedrooms).' BR' : '';
        $id = e((string) $lodgifyId);

        $thumbHtml = $thumb
            ? "<img src=\"{$thumb}\" alt=\"\" class=\"sh-signature-thumb\">"
            : '<div class="sh-signature-thumb sh-signature-thumb--fallback">★</div>';

        $pillClass = $isFallback ? 'sh-signature-pill sh-signature-pill--fallback' : 'sh-signature-pill';
        $pillText = $isFallback ? '● Live (auto-pick, highest priced)' : '● Live on homepage';
        $hint = $isFallback
            ? '<span class="sh-signature-hint">No manual pick yet. The site auto-shows the highest-priced villa. Drop one in the bench to lock it.</span>'
            : '';

        return <<<HTML
        <div class="sh-signature-live">
            {$thumbHtml}
            <div class="sh-signature-meta">
                <span class="{$pillClass}">{$pillText}</span>
                <strong class="sh-signature-name">{$name}</strong>
                <span class="sh-signature-sub">#{$id} · {$bedrooms} · {$location}</span>
                {$hint}
            </div>
        </div>
        HTML;
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save Homepage')
                ->color('primary')
                ->icon('heroicon-o-check-circle')
                ->action('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach (['hero', 'stay_styles', 'signature_villa', 'why_stay', 'explore_bali'] as $section) {
            $content = $data[$section] ?? [];
            if ($section === 'why_stay') {
                $legacy = PageSection::getSection('home', $section) ?? [];
                $content = array_replace_recursive($legacy, $content);
            }
            PageSection::updateOrCreate(
                ['page' => 'home', 'section' => $section],
                ['content' => $content, 'is_active' => true]
            );
        }

        foreach ($data['slots'] ?? [] as $slot => $rows) {
            HomepageVillaSelection::where('slot', $slot)->delete();
            foreach ($rows as $i => $row) {
                if (empty($row['lodgify_property_id'])) {
                    continue;
                }
                HomepageVillaSelection::create([
                    'slot' => $slot,
                    'lodgify_property_id' => $row['lodgify_property_id'],
                    'sort_order' => $i,
                    'override_title' => $row['override_title'] ?? null,
                    'override_description' => $row['override_description'] ?? null,
                    'award_name' => $slot === 'signature' ? ($row['award_name'] ?? null) : null,
                    'award_issuer' => $slot === 'signature' ? ($row['award_issuer'] ?? null) : null,
                    'award_year' => $slot === 'signature' ? ($row['award_year'] ?? null) : null,
                    'award_url' => $slot === 'signature' ? ($row['award_url'] ?? null) : null,
                    'award_logo' => $slot === 'signature' ? ($row['award_logo'] ?? null) : null,
                    'show_award' => $slot === 'signature' ? (bool) ($row['show_award'] ?? false) : false,
                ]);
            }
        }

        $keptDestinationIds = [];
        foreach ($data['destinations'] ?? [] as $index => $destination) {
            $location = trim((string) ($destination['location'] ?? ''));
            if ($location === '') {
                continue;
            }

            $slug = $destination['collection_id'] ?: \Illuminate\Support\Str::slug($location);
            $identity = ! empty($destination['id'])
                ? ['id' => $destination['id']]
                : ['collection_id' => $slug];
            $row = BaliCollection::updateOrCreate(
                $identity,
                [
                    'collection_id' => $slug,
                    'location' => $location,
                    'location_key' => \Illuminate\Support\Str::slug($location),
                    'lodgify_location' => ($destination['lodgify_location'] ?? null) ?: $location,
                    'category' => $destination['category'] ?: 'Bali Guide',
                    'tag' => $destination['category'] ?: 'Bali Guide',
                    'description' => $destination['description'],
                    'moods' => $destination['moods'] ?? [],
                    'media_type' => 'image',
                    'image' => $destination['image'] ?: '/homepage_villa/curated-1-main.webp',
                    'image_alt' => $destination['image_alt'] ?: "Summerhouse destination guide to {$location}",
                    'hero_title' => ($destination['hero_title'] ?? null) ?: $location,
                    'introduction' => ($destination['introduction'] ?? null) ?: $destination['description'],
                    'hero_image' => ($destination['hero_image'] ?? null) ?: ($destination['image'] ?: '/homepage_villa/curated-1-main.webp'),
                    'highlights' => $destination['highlights'] ?? [],
                    'best_for' => $destination['best_for'] ?? [],
                    'facts' => $destination['facts'] ?? [],
                    'editorial_chapters' => $destination['editorial_chapters'] ?? [],
                    'related_journal_tags' => $destination['related_journal_tags'] ?? [],
                    'show_related_villas' => (bool) ($destination['show_related_villas'] ?? true),
                    'related_villas_heading' => ($destination['related_villas_heading'] ?? null) ?: "Stay in {$location}",
                    'seo_title' => ($destination['seo_title'] ?? null) ?: "{$location} Guide",
                    'seo_description' => ($destination['seo_description'] ?? null) ?: $destination['description'],
                    'social_image' => $destination['social_image'] ?? null,
                    'media_accessibility_label' => "View Summerhouse villas in {$location}",
                    'status' => $destination['status'] ?? 'published',
                    'is_active' => (bool) ($destination['is_active'] ?? true),
                    'sort_order' => $index,
                    'villa_count' => $this->villaCountLabel($location),
                    'price' => 'Price confirmed at booking',
                    'cta' => 'View destination',
                    'href' => '/villas?location='.rawurlencode($location).'&match=exact',
                ]
            );
            $keptDestinationIds[] = $row->id;
        }

        if ($keptDestinationIds !== []) {
            BaliCollection::query()
                ->whereNotIn('id', $keptDestinationIds)
                ->update(['is_active' => false]);
        }

        $this->flushHomepageCache();

        Notification::make()
            ->title('Homepage saved')
            ->body('Editorial content is live now. Lodgify villa selections can take up to 5 minutes.')
            ->success()
            ->send();
    }

    private function flushHomepageCache(): void
    {
        Cache::forget('cms.page.home');
        Cache::forget('cms.homepage.villa-selections');
        foreach (['hero', 'stay_styles', 'signature_villa', 'why_stay', 'explore_bali'] as $s) {
            Cache::forget("cms.page.home.{$s}");
        }
        Cache::forget('cms.bali-collections');
    }

    private function normalizeWhyStayContent(array $content): array
    {
        $content['context_title'] = trim((string) ($content['context_title'] ?? ''))
            ?: 'A stay recognised for the details.';
        $content['supporting_copy'] = trim((string) ($content['supporting_copy'] ?? ''))
            ?: 'Ubud Zen River House was named Gold Winner for Best Villa in Bali 2024 by Honeycombers. A recognition of the thoughtful design, setting, and care behind the stay.';

        $legacyRecognitions = $content['recognitions'] ?? [];
        if ($legacyRecognitions === [] && ! empty($content['awards']) && is_array($content['awards'])) {
            $legacyRecognitions = array_values(array_map(
                fn (array $award): array => [
                    'type' => 'award',
                    'name' => $award['name'] ?? null,
                    'issuer' => $award['issuer'] ?? null,
                    'title' => null,
                    'year' => $award['year'] ?? null,
                    'url' => $award['url'] ?? null,
                    'is_visible' => true,
                ],
                $content['awards']
            ));
        }

        $recognition = $content['recognition'] ?? null;
        if (! is_array($recognition) || empty(array_filter([
            $recognition['name'] ?? null,
            $recognition['title'] ?? null,
            $recognition['issuer'] ?? null,
        ]))) {
            $recognition = collect($legacyRecognitions)
                ->first(fn (array $item): bool => str_contains(
                    strtolower(implode(' ', array_filter([
                        $item['name'] ?? null,
                        $item['issuer'] ?? null,
                        $item['title'] ?? null,
                    ]))),
                    'honeycombers'
                )) ?? collect($legacyRecognitions)->first();
        }

        if (! is_array($recognition)) {
            $recognition = [
                'type' => 'award',
                'name' => 'Honeycombers',
                'issuer' => 'Gold Winner',
                'title' => 'Best Villa in Bali 2024',
                'year' => '2024',
                'villa_name' => 'Ubud Zen River House',
                'is_visible' => true,
            ];
        }

        unset($recognition['logo'], $recognition['logo_alt']);
        $recognition['type'] = 'award';
        $recognition['is_visible'] = (bool) ($recognition['is_visible'] ?? true);
        $content['recognition'] = $recognition;

        return $content;
    }

    private function villaCountLabel(string $location): string
    {
        $count = VillaCache::query()->publiclyEligible()->where('location', $location)->count();

        return "{$count} ".($count === 1 ? 'villa' : 'villas');
    }
}
