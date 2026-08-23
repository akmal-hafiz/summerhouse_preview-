<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FaqResource\Pages;
use App\Models\Faq;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FaqResource extends Resource
{
    protected static ?string $model = Faq::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';

    protected static ?string $navigationGroup = 'Content Library';

    protected static ?int $navigationSort = 40;

    protected static ?string $navigationLabel = 'FAQs';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('FAQ')->schema([
                Forms\Components\Select::make('page')
                    ->options(['about' => 'About', 'services' => 'Services', 'contact' => 'Contact', 'home' => 'Homepage'])
                    ->required()
                    ->default('about'),
                Forms\Components\Textarea::make('question')->required()->rows(2),
                Forms\Components\Textarea::make('answer')->required()->rows(4),
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
                Tables\Columns\TextColumn::make('question')->searchable()->limit(60)->weight('bold'),
                Tables\Columns\TextColumn::make('answer')->limit(60),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('page')->options(['about' => 'About', 'services' => 'Services', 'contact' => 'Contact', 'home' => 'Homepage']),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFaqs::route('/'),
            'create' => Pages\CreateFaq::route('/create'),
            'edit' => Pages\EditFaq::route('/{record}/edit'),
        ];
    }
}
