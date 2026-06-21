<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestimonialResource\Pages;
use App\Models\Testimonial;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-ellipsis';

    protected static ?string $navigationGroup = 'Static Pages';

    protected static ?int $navigationSort = 30;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Testimonial')->columns(2)->schema([
                Forms\Components\Select::make('page')
                    ->options(['about' => 'About', 'services' => 'Services', 'home' => 'Homepage'])
                    ->required()
                    ->default('about'),
                Forms\Components\TextInput::make('author')->required()->maxLength(120),
                Forms\Components\TextInput::make('location')->placeholder('Australia'),
                Forms\Components\Select::make('stars')
                    ->options([5 => '5 stars', 4 => '4 stars', 3 => '3 stars', 2 => '2 stars', 1 => '1 star'])
                    ->default(5)
                    ->required(),
                Forms\Components\FileUpload::make('avatar')
                    ->label('Avatar')
                    ->image()
                    ->imageEditor()
                    ->avatar()
                    ->disk('public')
                    ->directory('uploads/testimonials')
                    ->visibility('public')
                    ->maxSize(2048)
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('text')->required()->rows(4)->columnSpanFull(),
            ]),
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
                Tables\Columns\TextColumn::make('page')->badge(),
                Tables\Columns\TextColumn::make('author')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('location'),
                Tables\Columns\TextColumn::make('stars'),
                Tables\Columns\TextColumn::make('text')->limit(50),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('page')->options(['about' => 'About', 'services' => 'Services', 'home' => 'Homepage']),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTestimonials::route('/'),
            'create' => Pages\CreateTestimonial::route('/create'),
            'edit' => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
