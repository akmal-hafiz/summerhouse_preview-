<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NewsletterSubscriberResource\Pages;
use App\Models\NewsletterSubscriber;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NewsletterSubscriberResource extends Resource
{
    protected static ?string $model = NewsletterSubscriber::class;
    protected static ?string $navigationIcon = 'heroicon-o-newspaper';
    protected static ?string $navigationGroup = 'People & Enquiries';
    protected static ?string $navigationLabel = 'Newsletter Subscribers';
    protected static ?int $navigationSort = 66;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('email')->email()->required(),
            Forms\Components\Toggle::make('is_active')->label('Subscribed'),
            Forms\Components\DateTimePicker::make('consent_at')->disabled(),
            Forms\Components\DateTimePicker::make('unsubscribed_at')->disabled(),
            Forms\Components\TextInput::make('source')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('email')->searchable()->copyable(),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Subscribed'),
                Tables\Columns\TextColumn::make('source')->badge(),
                Tables\Columns\TextColumn::make('consent_at')->dateTime()->sortable(),
            ])
            ->defaultSort('consent_at', 'desc')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')->label('Subscription status'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListNewsletterSubscribers::route('/'),
            'edit' => Pages\EditNewsletterSubscriber::route('/{record}/edit'),
        ];
    }
}
