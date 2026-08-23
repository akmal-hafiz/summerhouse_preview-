<?php

namespace App\Filament\Resources;

use App\Jobs\ProcessUploadedImage;
use App\Filament\Resources\MediaResource\Pages;
use App\Models\Media;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Js;

class MediaResource extends Resource
{
    protected static ?string $model = Media::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationGroup = 'Content Library';

    protected static ?string $navigationLabel = 'Media Library';

    protected static ?int $navigationSort = 80;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Upload')->schema([
                Forms\Components\FileUpload::make('path')
                    ->label('File')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->required()
                    ->afterStateUpdated(function ($state, Forms\Set $set) {
                        if ($state) {
                            $set('filename', $state->getClientOriginalName());
                            $set('mime_type', $state->getMimeType());
                            $set('size', $state->getSize());
                        }
                    })
                    ->dehydrated(true),
                Forms\Components\TextInput::make('filename')->required(),
                Forms\Components\Textarea::make('alt_text')->rows(2),
                Forms\Components\TextInput::make('mime_type')->disabled()->dehydrated(),
                Forms\Components\TextInput::make('size')->numeric()->disabled()->dehydrated(),
                Forms\Components\Hidden::make('disk')->default('public'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('path')
                    ->disk('public')
                    ->getStateUsing(fn (Media $record): ?string => $record->isReady() ? $record->processed_path : null)
                    ->square()
                    ->size(60),
                Tables\Columns\TextColumn::make('filename')->searchable()->weight('bold')->limit(40),
                Tables\Columns\TextColumn::make('mime_type')->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ready' => 'success',
                        'failed' => 'danger',
                        'processing' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('size')
                    ->formatStateUsing(fn ($state) => $state ? round($state / 1024) . ' KB' : '—'),
                Tables\Columns\TextColumn::make('created_at')->dateTime('M j, Y')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                Tables\Actions\Action::make('retry')
                    ->label('Retry processing')
                    ->icon('heroicon-o-arrow-path')
                    ->visible(fn (Media $record): bool => in_array($record->status, ['failed', 'pending'], true))
                    ->action(function (Media $record): void {
                        $record->update(['status' => 'pending', 'error_message' => null]);
                        ProcessUploadedImage::dispatch($record->id)
                            ->onQueue((string) config('media.queue', 'media'))
                            ->afterCommit();
                    }),
                Tables\Actions\Action::make('copyUrl')
                    ->label('Copy URL')
                    ->icon('heroicon-o-clipboard')
                    ->action(fn (Media $record) => null)
                    ->extraAttributes(fn (Media $record) => [
                        'x-on:click' => 'navigator.clipboard.writeText(' . Js::from('/storage/' . $record->path) . ')',
                    ]),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMedia::route('/'),
            'create' => Pages\CreateMedia::route('/create'),
            'edit' => Pages\EditMedia::route('/{record}/edit'),
        ];
    }
}
