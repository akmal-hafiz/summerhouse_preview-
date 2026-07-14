<?php

namespace App\Filament\Pages;

use App\Forms\Components\VillaPicker;
use App\Models\HomepageVillaSelection;
use App\Models\PageSection;
use App\Models\VillaCache;
use App\Services\LodgifyService;
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

    protected static ?string $navigationGroup = 'Homepage';

    protected static ?string $title = 'Homepage Manager';

    protected static ?int $navigationSort = 10;

    protected static string $view = 'filament.pages.homepage-manager';

    public ?array $data = [];

    public function mount(): void
    {
        LodgifyService::make()->syncIfStale();

        $this->form->fill([
            'hero' => PageSection::getSection('home', 'hero') ?? [],
            'stay_styles' => PageSection::getSection('home', 'stay_styles') ?? [],
            'signature_villa' => PageSection::getSection('home', 'signature_villa') ?? [],
            'featured_collection_copy' => PageSection::getSection('home', 'featured_collection') ?? [],
            'explore_bali' => PageSection::getSection('home', 'explore_bali') ?? [],
            'slots' => [
                'featured_collection' => $this->loadSlot('featured_collection'),
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
            ->get(['lodgify_property_id', 'override_title', 'override_description'])
            ->map(fn ($row) => [
                'lodgify_property_id' => $row->lodgify_property_id,
                'override_title' => $row->override_title,
                'override_description' => $row->override_description,
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
                    Forms\Components\FileUpload::make('hero.poster_image')
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
                    Forms\Components\Textarea::make('stay_styles.description')->label('Section Description')->rows(2),

                    Forms\Components\Section::make('Short Stays')->schema([
                        $this->villaSlotRepeater('slots.short_stays'),
                    ])->collapsible(),

                    Forms\Components\Section::make('Extended Stays')->schema([
                        $this->villaSlotRepeater('slots.extended_stays'),
                    ])->collapsible(),

                    Forms\Components\Section::make('Featured Homes')->schema([
                        $this->villaSlotRepeater('slots.featured_homes'),
                    ])->collapsible(),
                ]),

                Forms\Components\Tabs\Tab::make('Signature Villa')->icon('heroicon-o-star')->schema([
                    Forms\Components\TextInput::make('signature_villa.eyebrow')->label('Eyebrow'),
                    Forms\Components\TextInput::make('signature_villa.title')->label('Title'),
                    Forms\Components\Textarea::make('signature_villa.description')
                        ->label('Description')
                        ->rows(3)
                        ->helperText('Shown beside the price, e.g. "A five-bedroom tropical estate with private pool…".'),
                    Forms\Components\Textarea::make('signature_villa.why_this_home')
                        ->label('"Why this home" text')
                        ->rows(3)
                        ->helperText('Shown in the "Why this home" card. Leave blank to auto-generate from the villa location.'),
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

                Forms\Components\Tabs\Tab::make('Featured Collection')->icon('heroicon-o-sparkles')->schema([
                    Forms\Components\TextInput::make('featured_collection_copy.title')->label('Section Title'),
                    Forms\Components\Textarea::make('featured_collection_copy.description')->label('Section Description')->rows(2),
                    Forms\Components\Section::make('Villas (up to 4)')->schema([
                        $this->villaSlotRepeater('slots.featured_collection', maxItems: 4),
                    ]),
                ]),

                Forms\Components\Tabs\Tab::make('Explore Bali')->icon('heroicon-o-map')->schema([
                    Forms\Components\TextInput::make('explore_bali.kicker')->label('Kicker'),
                    Forms\Components\TextInput::make('explore_bali.title')->label('Section Title'),
                    Forms\Components\Textarea::make('explore_bali.description')->label('Section Description')->rows(2),
                    Forms\Components\Placeholder::make('cms_note')
                        ->label('')
                        ->content('Bali destination cards managed in the "Bali Collections" resource.'),
                ]),
            ])->persistTabInQueryString(),
        ]);
    }

    private function villaSlotRepeater(string $statePath, ?int $maxItems = null): Forms\Components\Repeater
    {
        $isSignature = str_ends_with($statePath, '.signature');

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
            ])
            ->columns(2)
            ->reorderable()
            ->collapsed()
            ->itemLabel(function (array $state, ?string $uuid) use ($statePath, $isSignature): ?string {
                $id = $state['lodgify_property_id'] ?? null;
                if (!$id) return 'New villa';
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

        return $repeater;
    }

    private function renderActiveSignaturePreview(): string
    {
        $row = HomepageVillaSelection::forSlot('signature')->first();
        $isFallback = false;
        $villa = null;
        $lodgifyId = null;

        if ($row) {
            $lodgifyId = (string) $row->lodgify_property_id;
            $villa = VillaCache::where('lodgify_id', $lodgifyId)->first();
        } else {
            /* Mirror frontend fallback: highest-priced villa from Lodgify cache. */
            $villa = VillaCache::all()
                ->sortByDesc(fn (VillaCache $v) => (float) ($v->raw['max_price'] ?? 0))
                ->first();
            if ($villa) {
                $isFallback = true;
                $lodgifyId = (string) $villa->lodgify_id;
            }
        }

        if (!$villa) {
            return '<div class="sh-signature-empty">No villa data yet. Pick one in the bench below to control which villa appears on the homepage.</div>';
        }

        $name = e($villa->name ?? "Villa #{$lodgifyId}");
        $thumb = AssetUrl::resolve($villa->thumbnail_url ?: ($villa->raw['image_url'] ?? null));
        $thumb = $thumb ? e($thumb) : null;
        $location = e($villa->location ?? $villa->raw['city'] ?? '');
        $bedrooms = $villa->bedrooms ? e((string) $villa->bedrooms) . ' BR' : '';
        $id = e((string) $lodgifyId);

        $thumbHtml = $thumb
            ? "<img src=\"{$thumb}\" alt=\"\" class=\"sh-signature-thumb\">"
            : "<div class=\"sh-signature-thumb sh-signature-thumb--fallback\">★</div>";

        $pillClass = $isFallback ? 'sh-signature-pill sh-signature-pill--fallback' : 'sh-signature-pill';
        $pillText = $isFallback ? '● Live (auto-pick — highest priced)' : '● Live on homepage';
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

        foreach (['hero', 'stay_styles', 'signature_villa', 'explore_bali'] as $section) {
            PageSection::updateOrCreate(
                ['page' => 'home', 'section' => $section],
                ['content' => $data[$section] ?? [], 'is_active' => true]
            );
        }

        PageSection::updateOrCreate(
            ['page' => 'home', 'section' => 'featured_collection'],
            ['content' => $data['featured_collection_copy'] ?? [], 'is_active' => true]
        );

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
                ]);
            }
        }

        $this->flushHomepageCache();

        Notification::make()
            ->title('Homepage saved')
            ->body('Changes go live within 5 minutes (cache TTL).')
            ->success()
            ->send();
    }

    private function flushHomepageCache(): void
    {
        Cache::forget('cms.page.home');
        Cache::forget('cms.homepage.villa-selections');
        foreach (['hero', 'stay_styles', 'signature_villa', 'featured_collection', 'explore_bali'] as $s) {
            Cache::forget("cms.page.home.{$s}");
        }
    }
}
