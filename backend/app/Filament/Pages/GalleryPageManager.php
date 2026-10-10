<?php

namespace App\Filament\Pages;

use App\Filament\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Models\PageSection;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;
use Throwable;

class GalleryPageManager extends Page implements HasForms, HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationGroup = 'Website Pages';
    protected static ?string $navigationLabel = 'Gallery';
    protected static ?string $title = 'Gallery Page';
    protected static ?string $slug = 'pages/gallery';
    protected static ?int $navigationSort = 15;
    protected static string $view = 'filament.pages.gallery-page-manager';

    public ?array $data = [];
    public ?string $loadedUpdatedAt = null;
    public ?string $loadedContentHash = null;

    public function mount(): void
    {
        $row = PageSection::query()->where('page', 'gallery')->where('section', 'intro')->first();
        $saved = is_array($row?->content) ? $row->content : [];

        $this->loadedUpdatedAt = $row?->updated_at?->toISOString();
        $this->loadedContentHash = $this->contentHash($row?->content);

        $this->form->fill([
            'intro' => array_merge([
                'heading' => 'A closer look at Summerhouse.',
                'description' => 'Villas, quiet interiors, island light, and the moments that make a stay feel personal.',
                'show_filters' => true,
                'is_visible' => true,
            ], $saved, [
                'description' => $saved['description'] ?? $saved['subheading'] ?? 'Villas, quiet interiors, island light, and the moments that make a stay feel personal.',
            ]),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Section::make('Gallery opening')
                ->description('Keep this concise. The photography is the main content of the page.')
                ->schema([
                    Forms\Components\Toggle::make('intro.is_visible')
                        ->label('Show opening')->default(true),
                    Forms\Components\Toggle::make('intro.show_filters')
                        ->label('Show category filters')->default(true),
                    Forms\Components\TextInput::make('intro.heading')
                        ->label('Heading')->required()->maxLength(120)->columnSpanFull(),
                    Forms\Components\Textarea::make('intro.description')
                        ->label('Short description')->rows(3)->maxLength(220)->columnSpanFull(),
                ])->columns(2),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->heading('Gallery media')
            ->description('Drag to reorder. Open an item to control its crop, caption, category, linked villa, and publishing status.')
            ->query(GalleryItem::query()->whereIn('type', ['image', 'video']))
            ->columns(GalleryItemResource::tableColumns())
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters(GalleryItemResource::tableFilters())
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add gallery media')
                    ->icon('heroicon-o-plus')
                    ->model(GalleryItem::class)
                    ->form(GalleryItemResource::formSchema())
                    ->successNotificationTitle('Gallery media added'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->form(GalleryItemResource::formSchema())
                    ->successNotificationTitle('Gallery media updated'),
                Tables\Actions\DeleteAction::make()
                    ->modalDescription('This removes the database entry. The managed media file remains protected while references are checked.'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No gallery media yet')
            ->emptyStateDescription('Add the first image or film to begin the editorial gallery.')
            ->emptyStateIcon('heroicon-o-photo');
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save opening')
                ->icon('heroicon-o-check-circle')
                ->action('save'),
        ];
    }

    public function save(): void
    {
        $content = $this->form->getState()['intro'];

        try {
            $saved = DB::transaction(function () use ($content): ?PageSection {
                $current = PageSection::query()
                    ->where('page', 'gallery')
                    ->where('section', 'intro')
                    ->lockForUpdate()
                    ->first();

                if (
                    $current?->updated_at?->toISOString() !== $this->loadedUpdatedAt
                    || $this->contentHash($current?->content) !== $this->loadedContentHash
                ) {
                    return null;
                }

                return PageSection::updateOrCreate(
                    ['page' => 'gallery', 'section' => 'intro'],
                    ['content' => $content, 'sort_order' => 10, 'is_active' => true],
                );
            }, 3);

            if ($saved === null) {
                Notification::make()
                    ->title('A newer edit is already saved')
                    ->body('Reload the Gallery page before saving so another administrator’s work is not overwritten.')
                    ->warning()->persistent()->send();

                return;
            }

            $this->loadedUpdatedAt = $saved->updated_at?->toISOString();
            $this->loadedContentHash = $this->contentHash($saved->content);

            Notification::make()
                ->title('Gallery opening saved')
                ->body('The public Gallery now uses this content.')
                ->success()->send();
        } catch (Throwable $error) {
            report($error);
            Notification::make()
                ->title('Gallery opening could not be saved')
                ->body('Your previous published content is still safe. Please try again.')
                ->danger()->persistent()->send();
        }
    }

    public function getPublicGalleryUrl(): string
    {
        return rtrim((string) config('app.frontend_url'), '/').'/gallery';
    }

    private function contentHash(?array $content): ?string
    {
        return $content === null
            ? null
            : hash('sha256', json_encode($content, JSON_THROW_ON_ERROR));
    }
}
