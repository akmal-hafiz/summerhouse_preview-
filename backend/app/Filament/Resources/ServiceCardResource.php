<?php

namespace App\Filament\Resources;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Filament\Resources\ServiceCardResource\Pages;
use App\Models\ServiceCard;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ServiceCardResource extends Resource
{
    protected static ?string $model = ServiceCard::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Content Library';

    protected static ?int $navigationSort = 50;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Service Card')->schema([
                Forms\Components\Select::make('category')
                    ->options(['concierge' => 'Concierge', 'operational' => 'Operational', 'marketing' => 'Marketing', 'project' => 'Project'])
                    ->required(),
                Forms\Components\TextInput::make('title')->required()->maxLength(200),
                Forms\Components\TextInput::make('slug')->maxLength(200),
                Forms\Components\Textarea::make('text')->required()->rows(3),
                ManagedImageUpload::make('image')->image(),
                Forms\Components\TextInput::make('alt_text')->maxLength(240),
            ]),
            Forms\Components\Section::make('Visibility & Order')->columns(2)->schema([
                Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                Forms\Components\Toggle::make('is_active')->default(true),
                Forms\Components\Toggle::make('featured_on_about')->label('Featured on About'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('category')->badge()->color(fn (string $state) => match ($state) {
                    'operational' => 'success',
                    'marketing' => 'warning',
                    'project' => 'info',
                    default => 'gray',
                }),
                Tables\Columns\TextColumn::make('title')->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('text')->limit(60),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('category')->options(['concierge' => 'Concierge', 'operational' => 'Operational', 'marketing' => 'Marketing', 'project' => 'Project']),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListServiceCards::route('/'),
            'create' => Pages\CreateServiceCard::route('/create'),
            'edit' => Pages\EditServiceCard::route('/{record}/edit'),
        ];
    }
}
