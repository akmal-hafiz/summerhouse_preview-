<?php

namespace App\Filament\Pages;

use App\Models\SiteSetting;
use App\Models\VillaCache;
use App\Services\LodgifyService;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class SiteSettingsManager extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $title = 'Site Settings';

    protected static ?string $navigationLabel = 'Site Settings';

    protected static ?int $navigationSort = 90;

    protected static string $view = 'filament.pages.site-settings-manager';

    public ?array $data = [];

    /**
     * Map of form path → SiteSetting key. Single source of truth for
     * what fields are managed by this page.
     */
    private const KEY_MAP = [
        // Concierge tab
        'concierge.subtitle' => 'concierge.subtitle',
        'concierge.hours' => 'concierge.hours',
        'concierge.whatsapp_label' => 'concierge.whatsapp_label',
        'concierge.phone_label' => 'concierge.phone_label',
        'concierge.email_label' => 'concierge.email_label',

        // Global contact & communication tab
        'contact.general_email' => 'contact.general_email',
        'contact.reservation_email' => 'contact.reservation_email',
        'contact.phone' => 'contact.phone',
        'contact.whatsapp' => 'contact.whatsapp',
        'contact.address' => 'contact.address',
        'contact.response_time' => 'contact.response_time',

        // Global footer tab
        'footer.newsletter_title' => 'footer.newsletter_title',
        'footer.newsletter_description' => 'footer.newsletter_description',
        'footer.newsletter_consent' => 'footer.newsletter_consent',
        'footer.closing_statement' => 'footer.closing_statement',
        'footer.stay_heading' => 'footer.stay_heading',
        'footer.stay_locations' => 'footer.stay_locations',
        'footer.owners_heading' => 'footer.owners_heading',
        'footer.owner_links' => 'footer.owner_links',
        'footer.navigation_heading' => 'footer.navigation_heading',
        'footer.navigation_links' => 'footer.navigation_links',
        'footer.inquiries_heading' => 'footer.inquiries_heading',
        'footer.social_links' => 'footer.social_links',
        'footer.copyright_suffix' => 'footer.copyright_suffix',
    ];

    public function mount(): void
    {
        LodgifyService::make()->syncIfStale();

        $values = [];
        foreach (self::KEY_MAP as $path => $key) {
            data_set($values, $path, SiteSetting::getByKey($key));
        }
        $this->form->fill($values);
    }

    public function form(Form $form): Form
    {
        return $form->statePath('data')->schema([
            Forms\Components\Tabs::make('Settings')->tabs([

                Forms\Components\Tabs\Tab::make('Concierge')
                    ->icon('heroicon-o-chat-bubble-left-right')
                    ->schema([
                        Forms\Components\Section::make('Card content')
                            ->description('Teks yang muncul di dashboard member, di atas tombol kontak.')
                            ->schema([
                                Forms\Components\Textarea::make('concierge.subtitle')
                                    ->label('Subtitle')
                                    ->rows(2)
                                    ->maxLength(240)
                                    ->placeholder('Tim Bali kami siap bantu pilih villa, cek ketersediaan, atau atur jadwal kunjungan.')
                                    ->helperText('Maks 240 karakter. Tampil sebagai paragraf pendek di card concierge.'),

                                Forms\Components\TextInput::make('concierge.hours')
                                    ->label('Jam operasional')
                                    ->maxLength(80)
                                    ->placeholder('Aktif 07:00–23:00 WITA')
                                    ->helperText('Tampil sebagai meta line kecil. Kosongkan kalau tidak mau tampil.'),
                            ]),

                        Forms\Components\Section::make('WhatsApp')
                            ->schema([
                                Forms\Components\Placeholder::make('concierge_whatsapp_source')
                                    ->label('Nomor WhatsApp')
                                    ->content('Menggunakan nomor global dari tab Contact & Communication.'),

                                Forms\Components\TextInput::make('concierge.whatsapp_label')
                                    ->label('Label tombol WhatsApp')
                                    ->required()
                                    ->maxLength(40)
                                    ->placeholder('WhatsApp')
                                    ->default('WhatsApp'),
                            ])->columns(2),

                        Forms\Components\Section::make('Telepon')
                            ->schema([
                                Forms\Components\Placeholder::make('concierge_phone_source')
                                    ->label('Nomor telepon')
                                    ->content('Menggunakan nomor global dari tab Contact & Communication.'),

                                Forms\Components\TextInput::make('concierge.phone_label')
                                    ->label('Label tombol telepon')
                                    ->maxLength(40)
                                    ->placeholder('Telepon')
                                    ->default('Telepon'),
                            ])->columns(2),

                        Forms\Components\Section::make('Email')
                            ->schema([
                                Forms\Components\Placeholder::make('concierge_email_source')
                                    ->label('Alamat email')
                                    ->content('Menggunakan reservation email dari tab Contact & Communication.'),

                                Forms\Components\TextInput::make('concierge.email_label')
                                    ->label('Label tombol email')
                                    ->required()
                                    ->maxLength(40)
                                    ->placeholder('Email')
                                    ->default('Email'),
                            ])->columns(2),
                    ]),

                Forms\Components\Tabs\Tab::make('Contact & Communication')
                    ->icon('heroicon-o-envelope')
                    ->schema([
                        Forms\Components\Section::make('Global contact channels')
                            ->description('Satu sumber untuk Contact page, Footer, Concierge, dan bantuan booking villa.')
                            ->schema([
                                Forms\Components\TextInput::make('contact.general_email')
                                    ->label('General / business email')
                                    ->required()
                                    ->email()
                                    ->placeholder('info@summerhousebali.com')
                                    ->helperText('Untuk pertanyaan umum dan business enquiries. Belum digunakan untuk pengiriman otomatis.'),

                                Forms\Components\TextInput::make('contact.reservation_email')
                                    ->label('Reservation email')
                                    ->required()
                                    ->email()
                                    ->placeholder('reservation.summerhouse@gmail.com')
                                    ->helperText('Ditampilkan sebagai kontak reservasi. Inquiry website tetap disimpan di database.'),

                                Forms\Components\TextInput::make('contact.phone')
                                    ->label('Nomor telepon')
                                    ->placeholder('+6281932387121')
                                    ->regex('/^\+\d{9,15}$/')
                                    ->validationMessages([
                                        'regex' => 'Format harus internasional, contoh: +6281932387121.',
                                    ])
                                    ->helperText('Satu nomor telepon global. Format internasional dengan +, tanpa spasi.'),

                                Forms\Components\TextInput::make('contact.whatsapp')
                                    ->label('Nomor WhatsApp')
                                    ->placeholder('+6281932387121')
                                    ->regex('/^\+\d{9,15}$/')
                                    ->validationMessages([
                                        'regex' => 'Format harus internasional, contoh: +6281932387121.',
                                    ])
                                    ->helperText('Kosongkan untuk otomatis memakai nomor telepon global.'),

                                Forms\Components\Textarea::make('contact.address')
                                    ->label('Alamat')
                                    ->rows(3)
                                    ->maxLength(240)
                                    ->placeholder('Bali, Indonesia')
                                    ->helperText('Alamat atau area layanan yang tampil di blok info kiri.'),

                                Forms\Components\TextInput::make('contact.response_time')
                                    ->label('Response time')
                                    ->maxLength(80)
                                    ->placeholder('Within 2 hours')
                                    ->helperText('Tampil sebagai detail kecil di halaman Contact.'),
                            ])->columns(2),
                    ]),

                Forms\Components\Tabs\Tab::make('Footer')
                    ->icon('heroicon-o-bars-3-bottom-left')
                    ->schema([
                        Forms\Components\Section::make('Newsletter')
                            ->description('Copy shown beside the email subscription field.')
                            ->schema([
                                Forms\Components\TextInput::make('footer.newsletter_title')
                                    ->label('Heading')
                                    ->required()
                                    ->default('Join Our Newsletter')
                                    ->maxLength(100),
                                Forms\Components\Textarea::make('footer.newsletter_description')
                                    ->label('Supporting copy')
                                    ->required()
                                    ->default('Occasional notes on Bali, new stays, and places worth knowing.')
                                    ->rows(3)
                                    ->maxLength(240),
                                Forms\Components\TextInput::make('footer.newsletter_consent')
                                    ->label('Consent label')
                                    ->required()
                                    ->default('I agree to receive occasional Summerhouse updates.')
                                    ->maxLength(180),
                            ]),

                        Forms\Components\Section::make('Stay locations')
                            ->description('Locations come from active Lodgify villas. Links automatically open the exact Villas filter.')
                            ->schema([
                                Forms\Components\TextInput::make('footer.stay_heading')
                                    ->label('Column heading')
                                    ->required()
                                    ->default('Stay')
                                    ->maxLength(50),
                                Forms\Components\Repeater::make('footer.stay_locations')
                                    ->label('Locations')
                                    ->schema([
                                        Forms\Components\Select::make('location')
                                            ->label('Lodgify location')
                                            ->required()
                                            ->searchable()
                                            ->native(false)
                                            ->options(fn (): array => VillaCache::query()
                                                ->whereNotNull('location')
                                                ->orderBy('location')
                                                ->pluck('location', 'location')
                                                ->filter()
                                                ->all()),
                                        Forms\Components\TextInput::make('label')
                                            ->label('Display label, optional')
                                            ->maxLength(80)
                                            ->helperText('Leave blank to use the Lodgify location name.'),
                                    ])
                                    ->columns(2)
                                    ->maxItems(8)
                                    ->reorderable()
                                    ->collapsed()
                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? $state['location'] ?? 'New location'),
                            ]),

                        Forms\Components\Section::make('Footer columns')
                            ->schema([
                                Forms\Components\TextInput::make('footer.owners_heading')
                                    ->label('Villa owners heading')
                                    ->required()
                                    ->default('For Villa Owners'),
                                Forms\Components\Repeater::make('footer.owner_links')
                                    ->label('Villa owner links')
                                    ->schema([
                                        Forms\Components\TextInput::make('label')->required()->maxLength(80),
                                        Forms\Components\TextInput::make('href')
                                            ->label('URL or internal path')
                                            ->required()
                                            ->maxLength(2048),
                                    ])
                                    ->columns(2)
                                    ->maxItems(8)
                                    ->reorderable()
                                    ->collapsed()
                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New link'),
                                Forms\Components\TextInput::make('footer.navigation_heading')
                                    ->label('Navigation heading')
                                    ->required()
                                    ->default('Navigation'),
                                Forms\Components\Repeater::make('footer.navigation_links')
                                    ->label('Navigation links')
                                    ->schema([
                                        Forms\Components\TextInput::make('label')->required()->maxLength(80),
                                        Forms\Components\TextInput::make('href')
                                            ->label('URL or internal path')
                                            ->required()
                                            ->maxLength(2048),
                                    ])
                                    ->columns(2)
                                    ->maxItems(10)
                                    ->reorderable()
                                    ->collapsed()
                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New link'),
                                Forms\Components\TextInput::make('footer.inquiries_heading')
                                    ->label('Inquiries heading')
                                    ->required()
                                    ->default('Inquiries'),
                            ])->columns(2),

                        Forms\Components\Section::make('Social links')
                            ->schema([
                                Forms\Components\Repeater::make('footer.social_links')
                                    ->label('')
                                    ->schema([
                                        Forms\Components\TextInput::make('label')->required()->maxLength(80),
                                        Forms\Components\TextInput::make('href')
                                            ->label('Public URL')
                                            ->url()
                                            ->required()
                                            ->maxLength(2048),
                                    ])
                                    ->columns(2)
                                    ->maxItems(8)
                                    ->reorderable()
                                    ->collapsed()
                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New social link'),
                            ]),

                        Forms\Components\Section::make('Closing')
                            ->schema([
                                Forms\Components\TextInput::make('footer.closing_statement')
                                    ->label('Closing statement')
                                    ->required()
                                    ->default('Stay well. Know Bali better.')
                                    ->maxLength(140),
                                Forms\Components\TextInput::make('footer.copyright_suffix')
                                    ->label('Copyright text after the year')
                                    ->required()
                                    ->default('SUMMERHOUSE / ALL RIGHTS RESERVED')
                                    ->maxLength(140),
                            ])->columns(2),
                    ]),

                Forms\Components\Tabs\Tab::make('Social')
                    ->icon('heroicon-o-share')
                    ->schema([
                        Forms\Components\Placeholder::make('soon')
                            ->label('')
                            ->content('Social media links — coming soon.'),
                    ]),

                Forms\Components\Tabs\Tab::make('SEO')
                    ->icon('heroicon-o-magnifying-glass')
                    ->schema([
                        Forms\Components\Placeholder::make('soon')
                            ->label('')
                            ->content('Meta defaults & sitemap settings — coming soon.'),
                    ]),
            ]),
        ]);
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Simpan pengaturan')
                ->color('primary')
                ->icon('heroicon-o-check-circle')
                ->action('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach (self::KEY_MAP as $path => $key) {
            $value = data_get($data, $path);
            // Treat empty string as null so optional fields can be cleared.
            if ($value === '') {
                $value = null;
            }
            SiteSetting::setByKey($key, $value);
        }

        Notification::make()
            ->title('Pengaturan tersimpan')
            ->body('Perubahan langsung aktif di frontend (cache 5 menit jika ada).')
            ->success()
            ->send();
    }
}
