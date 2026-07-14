<?php

namespace App\Filament\Resources;

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

    protected static ?string $navigationGroup = 'Static Pages';

    protected static ?int $navigationSort = 60;

    protected static ?string $recordTitleAttribute = 'title';

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'label', 'alt'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Type')->schema([
                Forms\Components\Select::make('type')
                    ->options(['image' => 'Image', 'text' => 'Text', 'video' => 'Video'])
                    ->required()
                    ->live()
                    ->default('image'),
                Forms\Components\TextInput::make('label')->placeholder('01')->maxLength(20),
                Forms\Components\TextInput::make('category')
                    ->label('Category')
                    ->helperText('Groups this photo under a filter tab on the gallery page (e.g. Interiors, Pools, Canggu). Leave blank to keep it in “All” only. Reuse an existing name to avoid duplicate tabs.')
                    ->datalist(fn () => GalleryItem::distinctCategories())
                    ->maxLength(40)
                    ->visible(fn (Forms\Get $get) => $get('type') !== 'text'),
            ])->columns(2),

            Forms\Components\Section::make('Image')->schema([
                Forms\Components\FileUpload::make('src')
                    ->label('Image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/gallery/images')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->required(fn (Forms\Get $get) => $get('type') === 'image'),
                Forms\Components\Textarea::make('alt')->label('Alt Text')->rows(2),
            ])->visible(fn (Forms\Get $get) => $get('type') === 'image' || $get('type') === null),

            Forms\Components\Section::make('Text Block')->schema([
                Forms\Components\TextInput::make('title'),
                Forms\Components\Textarea::make('text')->rows(4),
            ])->visible(fn (Forms\Get $get) => $get('type') === 'text'),

            Forms\Components\Section::make('Video')->schema([
                Forms\Components\FileUpload::make('video_url')
                    ->label('Video')
                    ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/quicktime'])
                    ->maxSize(204800)
                    ->disk('public')
                    ->directory('uploads/gallery/videos')
                    ->visibility('public')
                    ->required(fn (Forms\Get $get) => $get('type') === 'video'),
                Forms\Components\FileUpload::make('video_poster')
                    ->label('Poster Image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/gallery/posters')
                    ->visibility('public')
                    ->maxSize(5120),
                Forms\Components\Textarea::make('alt')->label('Alt / Caption')->rows(2),
            ])->visible(fn (Forms\Get $get) => $get('type') === 'video'),

            Forms\Components\Section::make('Linked Property')
                ->description('Tag this post to one of your houses. Visitors who open it in the gallery get a "Stay at …" button that goes straight to the property page.')
                ->schema([
                    Forms\Components\Select::make('lodgify_property_id')
                        ->label('Property')
                        ->options(fn () => VillaCache::query()->orderBy('name')->pluck('name', 'lodgify_id')->all())
                        ->searchable()
                        ->nullable()
                        ->placeholder('Not linked to a property'),
                ])
                ->visible(fn (Forms\Get $get) => $get('type') !== 'text'),

            Forms\Components\Section::make('Visibility & Order')->columns(2)->schema([
                Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                Forms\Components\Toggle::make('is_active')->default(true),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('label')->weight('bold'),
                Tables\Columns\TextColumn::make('type')->badge()->color(fn (string $state) => match ($state) {
                    'image' => 'info',
                    'video' => 'success',
                    'text' => 'gray',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('category')->badge()->color('gray')->placeholder('—'),
                Tables\Columns\TextColumn::make('title')->limit(40),
                Tables\Columns\TextColumn::make('lodgify_property_id')
                    ->label('Property')
                    ->formatStateUsing(fn (?string $state) => $state
                        ? (VillaCache::query()->where('lodgify_id', $state)->value('name') ?? $state)
                        : null)
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('src')->limit(40)->placeholder('—'),
                Tables\Columns\TextColumn::make('video_url')->limit(40)->placeholder('—'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('type')->options(['image' => 'Image', 'text' => 'Text', 'video' => 'Video']),
                Tables\Filters\SelectFilter::make('category')
                    ->options(fn () => array_combine(GalleryItem::distinctCategories(), GalleryItem::distinctCategories())),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
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
