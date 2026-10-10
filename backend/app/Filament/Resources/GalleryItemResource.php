<?php

namespace App\Filament\Resources;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Filament\Resources\GalleryItemResource\Pages;
use App\Models\GalleryItem;
use App\Models\VillaCache;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GalleryItemResource extends Resource
{
    protected static ?string $model = GalleryItem::class;
    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationGroup = 'Content Library';
    protected static ?int $navigationSort = 60;
    protected static ?string $recordTitleAttribute = 'title';

    /** Gallery media now lives in the Gallery Page hub. Keep routes available for old bookmarks. */
    protected static bool $shouldRegisterNavigation = false;

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'label', 'alt'];
    }

    /** @return array<int, Forms\Components\Component> */
    public static function formSchema(): array
    {
        return [
            Forms\Components\Section::make('Media')->schema([
                Forms\Components\Select::make('type')
                    ->options(['image' => 'Image', 'video' => 'Video'])
                    ->required()->live()->default('image'),
                Forms\Components\TextInput::make('title')
                    ->label('Title')->helperText('Displayed directly below the media.')
                    ->required()->maxLength(120),
                Forms\Components\TextInput::make('category')
                    ->label('Category')
                    ->helperText('Reuse an existing category to avoid duplicate filters.')
                    ->datalist(fn () => GalleryItem::distinctCategories())->maxLength(40),
                Forms\Components\Textarea::make('text')
                    ->label('Short caption')
                    ->helperText('Shown in the lightbox. Keep it concise and factual.')
                    ->rows(3)->maxLength(500)->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Image')->schema([
                ManagedImageUpload::make('src')
                    ->label('Gallery image')->disk('public')->directory('uploads/gallery/images')
                    ->visibility('public')->required(fn (Forms\Get $get) => $get('type') === 'image'),
            ])->visible(fn (Forms\Get $get) => ($get('type') ?? 'image') === 'image'),

            Forms\Components\Section::make('Video')->schema([
                Forms\Components\FileUpload::make('video_url')
                    ->label('Video file')
                    ->helperText('Use a compressed MP4 or WebM. The gallery loads only the poster until opened.')
                    ->acceptedFileTypes(['video/mp4', 'video/webm'])->maxSize(51200)
                    ->disk('public')->directory('uploads/gallery/videos')->visibility('public')
                    ->required(fn (Forms\Get $get) => $get('type') === 'video'),
                ManagedImageUpload::make('video_poster')
                    ->label('Poster image')
                    ->helperText('Required so browsing never downloads the full video.')
                    ->disk('public')->directory('uploads/gallery/posters')->visibility('public')
                    ->required(fn (Forms\Get $get) => $get('type') === 'video'),
            ])->visible(fn (Forms\Get $get) => $get('type') === 'video'),

            Forms\Components\Section::make('Editorial presentation')->schema([
                Forms\Components\Select::make('layout_variant')
                    ->label('Display shape')->options([
                        'landscape' => 'Landscape 4:3',
                        'portrait' => 'Portrait 4:5',
                        'square' => 'Square 1:1',
                        'tall' => 'Tall 3:4',
                        'wide' => 'Wide 16:9',
                    ])->default('landscape')->required(),
                Forms\Components\Select::make('focal_point')
                    ->label('Image focus')->options([
                        'center' => 'Center',
                        'top' => 'Top',
                        'bottom' => 'Bottom',
                        'left' => 'Left',
                        'right' => 'Right',
                    ])->default('center')->required(),
                Forms\Components\Textarea::make('alt')
                    ->label('Alternative text')
                    ->helperText('Describe what is visible. Required for accessibility and search engines.')
                    ->required(fn (Forms\Get $get) => in_array($get('type'), ['image', 'video'], true))
                    ->rows(2)->maxLength(240)->columnSpanFull(),
            ])->columns(2),

            Forms\Components\Section::make('Linked villa')
                ->description('Optional. A linked item receives a direct villa action inside the lightbox.')
                ->schema([
                    Forms\Components\Select::make('lodgify_property_id')
                        ->label('Villa')
                        ->options(fn () => VillaCache::query()->publiclyEligible()->orderBy('name')->pluck('name', 'lodgify_id')->all())
                        ->searchable()->nullable()->placeholder('Not linked to a villa'),
                ]),

            Forms\Components\Section::make('Publishing')->columns(2)->schema([
                Forms\Components\TextInput::make('sort_order')
                    ->label('Order')->numeric()
                    ->default(fn () => ((int) GalleryItem::max('sort_order')) + 1)->minValue(0),
                Forms\Components\Toggle::make('is_active')
                    ->label('Published')
                    ->helperText('Unpublish to hide this item without deleting it.')->default(true),
            ]),
        ];
    }

    public static function form(Form $form): Form
    {
        return $form->schema(static::formSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->whereIn('type', ['image', 'video']))
            ->columns(static::tableColumns())
            ->defaultSort('sort_order')->reorderable('sort_order')
            ->filters(static::tableFilters())
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([
                Tables\Actions\DeleteBulkAction::make(),
            ])]);
    }

    /** @return array<int, Tables\Columns\Column> */
    public static function tableColumns(): array
    {
        return [
            Tables\Columns\ImageColumn::make('preview')
                ->label('Preview')
                ->getStateUsing(fn (GalleryItem $record) => $record->type === 'video' ? $record->video_poster : $record->src)
                ->disk('public')->height(64)->width(84)
                ->extraImgAttributes(['style' => 'object-fit: cover; border-radius: 4px;']),
            Tables\Columns\TextColumn::make('sort_order')->label('#')->sortable()->width('60px'),
            Tables\Columns\TextColumn::make('title')->weight('semibold')->searchable()->limit(44),
            Tables\Columns\TextColumn::make('category')->badge()->color('gray')->placeholder('All'),
            Tables\Columns\TextColumn::make('type')->badge()
                ->color(fn (string $state) => $state === 'video' ? 'success' : 'info'),
            Tables\Columns\TextColumn::make('layout_variant')->label('Shape')->badge()->color('gray'),
            Tables\Columns\TextColumn::make('lodgify_property_id')
                ->label('Villa')
                ->formatStateUsing(fn (?string $state) => $state
                    ? (VillaCache::query()->where('lodgify_id', $state)->value('name') ?? $state)
                    : null)
                ->placeholder('Not linked')->toggleable(),
            Tables\Columns\IconColumn::make('is_active')->label('Published')->boolean(),
        ];
    }

    /** @return array<int, Tables\Filters\BaseFilter> */
    public static function tableFilters(): array
    {
        return [
            Tables\Filters\SelectFilter::make('type')->options(['image' => 'Image', 'video' => 'Video']),
            Tables\Filters\SelectFilter::make('category')
                ->options(fn () => array_combine(GalleryItem::distinctCategories(), GalleryItem::distinctCategories())),
            Tables\Filters\TernaryFilter::make('is_active')->label('Published'),
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListGalleryItems::route('/'),
            'create' => Pages\CreateGalleryItem::route('/create'),
            'edit' => Pages\EditGalleryItem::route('/{record}/edit'),
        ];
    }
}
