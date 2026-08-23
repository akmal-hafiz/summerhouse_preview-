<?php

namespace App\Filament\Pages;

use App\Filament\Pages\Concerns\ManagesPageFaqs;
use App\Models\PageSection;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Cache;

class ServicesPageManager extends Page implements HasForms, HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;
    use ManagesPageFaqs;

    protected static ?string $navigationIcon = 'heroicon-o-sparkles';

    protected static ?string $navigationLabel = 'Services';

    protected static ?string $title = 'Services Page';

    protected static ?string $slug = 'pages/services';

    protected static ?int $navigationSort = 30;

    protected static string $view = 'filament.pages.services-page-manager';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'partnership' => array_merge([
                'title' => 'The value of a closer partnership.',
                'points' => $this->defaultPartnershipPoints(),
                'is_visible' => true,
            ], PageSection::getSection('services', 'partnership') ?? []),
            'management' => array_merge([
                'heading' => 'What we manage.',
                'is_visible' => true,
            ], PageSection::getSection('services', 'management') ?? []),
            'owner_testimonials' => array_merge([
                'heading' => 'What thoughtful management feels like.',
                'is_visible' => true,
            ], PageSection::getSection('services', 'owner_testimonials') ?? []),
            'final_cta' => array_merge([
                'title' => 'Good care goes a long way.',
                'description' => 'We look after the property, the people in it, and everything in between.',
                'button_label' => 'Partner With Us',
                'is_visible' => true,
            ], PageSection::getSection('services', 'final_cta') ?? []),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Tabs::make('Services sections')->tabs([
                Forms\Components\Tabs\Tab::make('Why Partner')->schema([
                    Forms\Components\Toggle::make('partnership.is_visible')->label('Show section')->default(true),
                    Forms\Components\TextInput::make('partnership.title')->required()->maxLength(140)->columnSpanFull(),
                    Forms\Components\Repeater::make('partnership.points')
                        ->label('Partnership strengths')
                        ->minItems(4)->maxItems(4)->reorderable()
                        ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'Strength')
                        ->schema([
                            Forms\Components\TextInput::make('title')->required()->maxLength(90),
                            Forms\Components\Textarea::make('description')->required()->rows(2)->maxLength(260),
                        ])->columns(2)->columnSpanFull(),
                ]),
                Forms\Components\Tabs\Tab::make('What We Manage')->schema([
                    Forms\Components\Toggle::make('management.is_visible')->label('Show section')->default(true),
                    Forms\Components\TextInput::make('management.heading')->required()->maxLength(100)->columnSpanFull(),
                ]),
                Forms\Components\Tabs\Tab::make('Owner Testimonials')->schema([
                    Forms\Components\Toggle::make('owner_testimonials.is_visible')->label('Show section')->default(true),
                    Forms\Components\TextInput::make('owner_testimonials.heading')->required()->maxLength(140)->columnSpanFull(),
                    Forms\Components\Placeholder::make('testimonial_note')
                        ->label('Testimonials')
                        ->content('Approved owner testimonials continue to come from the Testimonials collection.')
                        ->columnSpanFull(),
                ]),
                Forms\Components\Tabs\Tab::make('Final CTA')->schema([
                    Forms\Components\Toggle::make('final_cta.is_visible')->label('Show section')->default(true),
                    Forms\Components\TextInput::make('final_cta.title')->required()->maxLength(120)->columnSpanFull(),
                    Forms\Components\Textarea::make('final_cta.description')->required()->rows(2)->maxLength(260)->columnSpanFull(),
                    Forms\Components\TextInput::make('final_cta.button_label')->required()->maxLength(40),
                ]),
            ])->persistTabInQueryString(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $this->faqTable($table);
    }

    protected function faqPageKey(): string
    {
        return 'services';
    }

    protected function faqPageLabel(): string
    {
        return 'Services';
    }

    protected function getFormActions(): array
    {
        return [\Filament\Actions\Action::make('save')->label('Save Services Page')->icon('heroicon-o-check-circle')->action('save')];
    }

    public function save(): void
    {
        foreach ($this->form->getState() as $section => $content) {
            PageSection::updateOrCreate(
                ['page' => 'services', 'section' => $section],
                ['content' => $content, 'is_active' => true]
            );
        }
        Cache::forget('cms.page.services');
        Notification::make()->title('Services page saved')->body('Editorial content is now live.')->success()->send();
    }

    private function defaultPartnershipPoints(): array
    {
        return [
            ['title' => 'Hands-on local management', 'description' => 'A Bali-based team stays close to the property, its people, and everyday operations.'],
            ['title' => 'Revenue-led decisions', 'description' => 'Pricing, distribution, and reporting are guided by performance, not guesswork.'],
            ['title' => 'Design-conscious positioning', 'description' => 'Every home is presented with a clear point of view that respects its architecture and audience.'],
            ['title' => 'Guest experience that builds value', 'description' => 'Thoughtful stays earn stronger reviews, repeat demand, and long-term property value.'],
        ];
    }
}
