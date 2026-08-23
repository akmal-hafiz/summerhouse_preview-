<?php

namespace App\Filament\Resources;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Filament\Resources\BaliCollectionResource\Pages;
use App\Models\BaliCollection;
use App\Models\VillaCache;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class BaliCollectionResource extends Resource
{
    protected static ?string $model = BaliCollection::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';
    protected static ?string $navigationGroup = 'Content Library';
    protected static ?string $navigationLabel = 'Destination Guides';
    protected static ?int $navigationSort = 20;
    protected static ?string $recordTitleAttribute = 'location';

    public static function getGloballySearchableAttributes(): array
    {
        return ['location', 'category', 'tag', 'seo_title'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Destination guide')->tabs([
                Forms\Components\Tabs\Tab::make('Card')
                    ->icon('heroicon-o-photo')
                    ->schema([
                        Forms\Components\Section::make('Location and automatic route')
                            ->description('Choose a Lodgify location once. Slug, route, related villas, and accessibility labels are filled automatically.')
                            ->columns(2)
                            ->schema([
                                Forms\Components\Select::make('location')
                                    ->label('Lodgify location')
                                    ->required()
                                    ->searchable()
                                    ->native(false)
                                    ->options(fn (): array => VillaCache::query()
                                        ->whereNotNull('location')
                                        ->orderBy('location')
                                        ->pluck('location', 'location')
                                        ->filter()
                                        ->all())
                                    ->getSearchResultsUsing(fn (string $search): array =>
                                        VillaCache::query()
                                            ->where('location', 'like', "%{$search}%")
                                            ->orderBy('location')
                                            ->limit(20)
                                            ->pluck('location', 'location')
                                            ->all()
                                    )
                                    ->live()
                                    ->afterStateUpdated(function (Forms\Set $set, ?string $state): void {
                                        if (!$state) {
                                            return;
                                        }

                                        $set('collection_id', Str::slug($state));
                                        $set('location_key', Str::slug($state));
                                        $set('lodgify_location', $state);
                                        $set('image_alt', "Summerhouse destination guide to {$state}");
                                        $set('media_accessibility_label', "View Summerhouse villas in {$state}");
                                        $set('hero_title', $state);
                                        $set('related_villas_heading', "Stay in {$state}");
                                        $set('seo_title', "{$state} Guide");
                                    })
                                    ->helperText('Locations come from active villas synchronized from Lodgify.'),
                                Forms\Components\TextInput::make('category')
                                    ->label('Editorial category')
                                    ->required()
                                    ->placeholder('Quiet Coast'),
                                Forms\Components\Hidden::make('collection_id'),
                                Forms\Components\Hidden::make('location_key'),
                                Forms\Components\Placeholder::make('route_preview')
                                    ->label('Public villas result')
                                    ->content(function (Forms\Get $get): string {
                                        $location = (string) ($get('lodgify_location') ?: $get('location'));
                                        return '/villas?location=' . rawurlencode($location) . '&match=exact';
                                    }),
                                Forms\Components\Placeholder::make('villa_preview')
                                    ->label('Related villa data')
                                    ->content(function (Forms\Get $get): string {
                                        $location = $get('lodgify_location') ?: $get('location');
                                        if (!$location) {
                                            return 'Choose a location first';
                                        }

                                        $count = VillaCache::query()->where('location', $location)->count();
                                        return "{$count} active villa records currently match";
                                    }),
                            ]),
                        Forms\Components\Section::make('Card copy')
                            ->schema([
                                Forms\Components\Textarea::make('description')
                                    ->required()
                                    ->rows(3)
                                    ->helperText('Short lifestyle description. No CTA is shown on the public card.'),
                                Forms\Components\TagsInput::make('moods')
                                    ->placeholder('Beach, Cafes, Design'),
                            ]),
                        self::cardMediaSection(),
                    ]),

                Forms\Components\Tabs\Tab::make('Destination story')
                    ->icon('heroicon-o-book-open')
                    ->schema([
                        Forms\Components\Section::make('Editorial introduction')
                            ->columns(2)
                            ->schema([
                                Forms\Components\TextInput::make('eyebrow')
                                    ->default('Bali Destination Guide'),
                                Forms\Components\TextInput::make('hero_title')
                                    ->helperText('Defaults to the location name.'),
                                Forms\Components\Textarea::make('introduction')
                                    ->rows(4)
                                    ->columnSpanFull(),
                            ]),
                        self::heroMediaSection(),
                        Forms\Components\Section::make('Editorial chapters')
                            ->description('Build the guide in reading order. Each chapter can feature an uploaded image.')
                            ->schema([
                                Forms\Components\Repeater::make('editorial_chapters')
                                    ->reorderable()
                                    ->collapsed()
                                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'New chapter')
                                    ->schema([
                                        Forms\Components\TextInput::make('eyebrow')
                                            ->placeholder('01 / Morning rhythm'),
                                        Forms\Components\TextInput::make('title')->required(),
                                        Forms\Components\Textarea::make('description')
                                            ->required()
                                            ->rows(4),
                                        ManagedImageUpload::make('image')
                                            ->image()
                                            ->imageEditor()
                                            ->disk('public')
                                            ->directory('uploads/collections/chapters')
                                            ->visibility('public')
                                            ->maxSize(8192),
                                        Forms\Components\TextInput::make('image_alt'),
                                    ])->columns(2),
                            ]),
                        Forms\Components\Section::make('Highlights and field notes')
                            ->columns(2)
                            ->schema([
                                Forms\Components\TagsInput::make('highlights'),
                                Forms\Components\TagsInput::make('best_for')->label('Best for'),
                                Forms\Components\Repeater::make('facts')
                                    ->schema([
                                        Forms\Components\TextInput::make('label')->required(),
                                        Forms\Components\TextInput::make('value')->required(),
                                    ])
                                    ->columns(2)
                                    ->columnSpanFull(),
                                Forms\Components\TagsInput::make('related_journal_tags')
                                    ->label('Related journal tags')
                                    ->columnSpanFull(),
                            ]),
                    ]),

                Forms\Components\Tabs\Tab::make('Villas and SEO')
                    ->icon('heroicon-o-magnifying-glass')
                    ->schema([
                        Forms\Components\Section::make('Related villas')
                            ->description('The public page automatically reads active villas from the selected Lodgify location.')
                            ->columns(2)
                            ->schema([
                                Forms\Components\TextInput::make('lodgify_location')
                                    ->label('Lodgify match key')
                                    ->helperText('Auto-filled from the card location. Adjust only when Lodgify uses a different label.'),
                                Forms\Components\Toggle::make('show_related_villas')
                                    ->default(true),
                                Forms\Components\TextInput::make('related_villas_heading'),
                            ]),
                        Forms\Components\Section::make('Search and social preview')
                            ->columns(2)
                            ->schema([
                                Forms\Components\TextInput::make('seo_title')->maxLength(70),
                                Forms\Components\Textarea::make('seo_description')
                                    ->rows(3)
                                    ->maxLength(180),
                                ManagedImageUpload::make('social_image')
                                    ->image()
                                    ->imageEditor()
                                    ->disk('public')
                                    ->directory('uploads/collections/social')
                                    ->visibility('public')
                                    ->maxSize(8192),
                            ]),
                        Forms\Components\Section::make('Publishing')
                            ->columns(3)
                            ->schema([
                                Forms\Components\Select::make('status')
                                    ->options([
                                        'draft' => 'Draft',
                                        'published' => 'Published',
                                    ])
                                    ->default('published')
                                    ->required(),
                                Forms\Components\TextInput::make('sort_order')
                                    ->numeric()
                                    ->default(0),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Visible on website')
                                    ->default(true),
                            ]),
                    ]),
            ])->persistTabInQueryString(),
        ]);
    }

    private static function cardMediaSection(): Forms\Components\Section
    {
        return Forms\Components\Section::make('Card media')
            ->columns(2)
            ->schema([
                Forms\Components\Select::make('media_type')
                    ->options(['image' => 'Image', 'video' => 'Video'])
                    ->default('image')
                    ->live()
                    ->required(),
                ManagedImageUpload::make('image')
                    ->label('Card image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/cards')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->required(fn (Forms\Get $get): bool => $get('media_type') === 'image'),
                Forms\Components\FileUpload::make('video')
                    ->label('Card video')
                    ->acceptedFileTypes(['video/mp4', 'video/webm'])
                    ->disk('public')
                    ->directory('uploads/collections/videos')
                    ->visibility('public')
                    ->maxSize(102400)
                    ->visible(fn (Forms\Get $get): bool => $get('media_type') === 'video')
                    ->required(fn (Forms\Get $get): bool => $get('media_type') === 'video'),
                ManagedImageUpload::make('video_poster')
                    ->label('Video poster')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/posters')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->visible(fn (Forms\Get $get): bool => $get('media_type') === 'video')
                    ->required(fn (Forms\Get $get): bool => $get('media_type') === 'video')
                    ->helperText('Required so the card is never blank while video is loading.'),
                ManagedImageUpload::make('mobile_poster')
                    ->label('Mobile poster, optional')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/posters')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->helperText('Falls back to the main image or video poster.'),
                Forms\Components\TextInput::make('image_alt')
                    ->label('Image alternative text'),
                Forms\Components\TextInput::make('media_accessibility_label')
                    ->label('Card accessibility label')
                    ->columnSpanFull(),
            ]);
    }

    private static function heroMediaSection(): Forms\Components\Section
    {
        return Forms\Components\Section::make('Destination hero media')
            ->columns(2)
            ->schema([
                Forms\Components\Select::make('hero_media_type')
                    ->options(['image' => 'Image', 'video' => 'Video'])
                    ->default('image')
                    ->live(),
                ManagedImageUpload::make('hero_image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/heroes')
                    ->visibility('public')
                    ->maxSize(12288)
                    ->visible(fn (Forms\Get $get): bool => $get('hero_media_type') !== 'video'),
                Forms\Components\FileUpload::make('hero_video')
                    ->acceptedFileTypes(['video/mp4', 'video/webm'])
                    ->disk('public')
                    ->directory('uploads/collections/heroes')
                    ->visibility('public')
                    ->maxSize(204800)
                    ->visible(fn (Forms\Get $get): bool => $get('hero_media_type') === 'video'),
                ManagedImageUpload::make('hero_video_poster')
                    ->label('Hero video poster')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/heroes')
                    ->visibility('public')
                    ->maxSize(12288)
                    ->visible(fn (Forms\Get $get): bool => $get('hero_media_type') === 'video')
                    ->required(fn (Forms\Get $get): bool => $get('hero_media_type') === 'video'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')->sortable()->label('#'),
                Tables\Columns\TextColumn::make('location')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('category')->badge()->color('primary'),
                Tables\Columns\TextColumn::make('media_type')->badge()->label('Media'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Visible'),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'published' => 'Published']),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBaliCollections::route('/'),
            'create' => Pages\CreateBaliCollection::route('/create'),
            'edit' => Pages\EditBaliCollection::route('/{record}/edit'),
        ];
    }
}
