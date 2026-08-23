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

class VillasPageManager extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-home-modern';
    protected static ?string $navigationLabel = 'Villas';
    protected static ?string $title = 'Villas Page';
    protected static ?string $slug = 'pages/villas';
    protected static ?int $navigationSort = 50;

    protected static string $view = 'filament.pages.villas-page-manager';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'hero' => array_merge([
                'heading' => 'Find your place in Bali.',
                'description' => 'Private villas and apartments, selected across Bali.',
                'saved_label' => 'Saved Villas',
                'is_visible' => true,
            ], PageSection::getSection('villas', 'hero') ?? []),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Section::make('Collection introduction')->schema([
                Forms\Components\Toggle::make('hero.is_visible')->label('Show introduction')->default(true),
                Forms\Components\TextInput::make('hero.heading')->required()->maxLength(120)->columnSpanFull(),
                Forms\Components\Textarea::make('hero.description')->required()->rows(2)->maxLength(240)->columnSpanFull(),
                Forms\Components\TextInput::make('hero.saved_label')->label('Saved villas label')->required()->maxLength(40),
                Forms\Components\Placeholder::make('lodgify_note')
                    ->label('Live search')
                    ->content('Locations, dates, guests, availability, and pricing remain synchronized from Lodgify.')
                    ->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    protected function getFormActions(): array
    {
        return [\Filament\Actions\Action::make('save')->label('Save Villas Page')->icon('heroicon-o-check-circle')->action('save')];
    }

    public function save(): void
    {
        PageSection::updateOrCreate(
            ['page' => 'villas', 'section' => 'hero'],
            ['content' => $this->form->getState()['hero'], 'is_active' => true]
        );
        Cache::forget('cms.page.villas');
        Notification::make()->title('Villas page saved')->body('Editorial copy is live. Lodgify search data is unchanged.')->success()->send();
    }
}
