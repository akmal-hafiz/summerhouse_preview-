<?php

namespace App\Filament\Pages;

use App\Models\PageSection;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class GalleryPageManager extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationLabel = 'Gallery';
    protected static ?string $title = 'Gallery Page';
    protected static ?string $slug = 'pages/gallery';
    protected static ?int $navigationSort = 60;

    protected static string $view = 'filament.pages.gallery-page-manager';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'intro' => array_merge([
                'heading' => 'Selected Projects.',
                'section_label' => '',
                'subheading' => '',
                'is_visible' => true,
            ], PageSection::getSection('gallery', 'intro') ?? []),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Section::make('Gallery introduction')->schema([
                Forms\Components\Toggle::make('intro.is_visible')->label('Show introduction')->default(true),
                Forms\Components\TextInput::make('intro.section_label')->label('Optional section label')->maxLength(60),
                Forms\Components\TextInput::make('intro.heading')->required()->maxLength(120)->columnSpanFull(),
                Forms\Components\TextInput::make('intro.subheading')->label('Optional short subheading')->maxLength(160)->columnSpanFull(),
                Forms\Components\Placeholder::make('copy_note')
                    ->label('Editorial rule')
                    ->content('The public Gallery intentionally has no body paragraph so its visuals remain the focus.')
                    ->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    protected function getFormActions(): array
    {
        return [\Filament\Actions\Action::make('save')->label('Save Gallery Page')->icon('heroicon-o-check-circle')->action('save')];
    }

    public function save(): void
    {
        PageSection::updateOrCreate(
            ['page' => 'gallery', 'section' => 'intro'],
            ['content' => $this->form->getState()['intro'], 'is_active' => true]
        );
        Cache::forget('cms.page.gallery');
        Notification::make()->title('Gallery page saved')->body('The introduction is now live.')->success()->send();
    }
}
