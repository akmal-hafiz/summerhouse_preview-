<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BaliCollectionResource\Pages;
use App\Models\BaliCollection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BaliCollectionResource extends Resource
{
    protected static ?string $model = BaliCollection::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Homepage';

    protected static ?string $navigationLabel = 'Bali Collections';

    protected static ?int $navigationSort = 20;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Identity')->columns(2)->schema([
                Forms\Components\TextInput::make('collection_id')
                    ->required()
                    ->maxLength(80)
                    ->helperText('URL-safe slug. Example: canggu-berawa')
                    ->disabledOn('edit'),
                Forms\Components\TextInput::make('location')->required(),
                Forms\Components\TextInput::make('category')->required()->helperText('Display category, e.g. Cafe Coastline'),
                Forms\Components\TextInput::make('tag')->required()->helperText('Card tag/eyebrow text'),
            ]),

            Forms\Components\Section::make('Copy')->schema([
                Forms\Components\Textarea::make('description')->required()->rows(3),
                Forms\Components\TextInput::make('villa_count')->required()->placeholder('15 villas'),
                Forms\Components\TextInput::make('price')->required()->placeholder('From Rp 700.000 / night'),
                Forms\Components\TextInput::make('cta')->required(),
                Forms\Components\TextInput::make('href')->required()->prefix('/'),
            ]),

            Forms\Components\Section::make('Tags & Moods')->columns(2)->schema([
                Forms\Components\TagsInput::make('moods')->placeholder('Beach, Cafes, Design'),
                Forms\Components\TagsInput::make('highlights')->placeholder('Beach Clubs, Cafe Culture'),
                Forms\Components\TagsInput::make('best_for')->label('Best For')->placeholder('Friends, Couples'),
            ]),

            Forms\Components\Section::make('Facts')->schema([
                Forms\Components\Repeater::make('facts')->schema([
                    Forms\Components\TextInput::make('label')->required(),
                    Forms\Components\TextInput::make('value')->required(),
                ])->columns(2)->defaultItems(3)->maxItems(6),
            ]),

            Forms\Components\Section::make('Media')->schema([
                Forms\Components\FileUpload::make('image')
                    ->label('Primary Card Image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/collections/cards')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->required(),
                Forms\Components\TextInput::make('image_alt'),
                Forms\Components\FileUpload::make('gallery_images')
                    ->label('Gallery Images (for flipbook)')
                    ->image()
                    ->imageEditor()
                    ->multiple()
                    ->reorderable()
                    ->maxFiles(8)
                    ->disk('public')
                    ->directory('uploads/collections/gallery')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->helperText('5–8 images. Drag to reorder.'),
            ]),

            Forms\Components\Section::make('Lifestyle Pillars (optional)')->schema([
                Forms\Components\Repeater::make('lifestyle_pillars')->schema([
                    Forms\Components\TextInput::make('title')->required(),
                    Forms\Components\Textarea::make('description')->required()->rows(2),
                ])->columns(2)->maxItems(3),
            ])->collapsed(),

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
                Tables\Columns\TextColumn::make('sort_order')->sortable()->label('#'),
                Tables\Columns\TextColumn::make('location')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('category')->badge()->color('primary'),
                Tables\Columns\TextColumn::make('villa_count')->label('Villas'),
                Tables\Columns\TextColumn::make('price')->limit(28),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
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
