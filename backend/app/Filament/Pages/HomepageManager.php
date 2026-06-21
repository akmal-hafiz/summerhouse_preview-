<?php

namespace App\Filament\Pages;

use App\Forms\Components\VillaPicker;
use App\Models\HomepageVillaSelection;
use App\Models\PageSection;
use App\Models\VillaCache;
use App\Services\LodgifyService;
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
                        ->preserveFilenames()
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
                    Forms\Components\TextInput::make('hero.badge_text')->label('Badge Text')->helperText('Separated by " / "'),
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
                    Forms\Components\Textarea::make('signature_villa.description')->label('Description')->rows(3),
                    Forms\Components\Section::make('Villa Selection')->schema([
                        $this->villaSlotRepeater('slots.signature', maxItems: 1),
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
            ->itemLabel(function (array $state): ?string {
                $id = $state['lodgify_property_id'] ?? null;
                if (!$id) return 'New villa';
                $villa = VillaCache::where('lodgify_id', (string) $id)->first();
                return $villa?->name ?? "Villa #{$id}";
            });

        if ($maxItems) {
            $repeater->maxItems($maxItems);
        }

        return $repeater;
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
