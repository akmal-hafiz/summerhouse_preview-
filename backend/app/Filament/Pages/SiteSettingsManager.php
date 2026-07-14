<?php

namespace App\Filament\Pages;

use App\Models\SiteSetting;
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
        'concierge.whatsapp' => 'concierge.whatsapp',
        'concierge.whatsapp_label' => 'concierge.whatsapp_label',
        'concierge.phone' => 'concierge.phone',
        'concierge.phone_label' => 'concierge.phone_label',
        'concierge.email' => 'concierge.email',
        'concierge.email_label' => 'concierge.email_label',

        // Contact page tab
        'contact.email' => 'contact.email',
        'contact.phone' => 'contact.phone',
        'contact.whatsapp' => 'contact.whatsapp',
        'contact.address' => 'contact.address',
        'contact.response_time' => 'contact.response_time',
    ];

    public function mount(): void
    {
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
                                Forms\Components\TextInput::make('concierge.whatsapp')
                                    ->label('Nomor WhatsApp')
                                    ->required()
                                    ->placeholder('+6281234567890')
                                    ->regex('/^\+\d{9,15}$/')
                                    ->validationMessages([
                                        'regex' => 'Format harus internasional, contoh: +6281234567890 (tanpa spasi).',
                                    ])
                                    ->helperText('Format internasional dengan +62, tanpa spasi atau tanda hubung.'),

                                Forms\Components\TextInput::make('concierge.whatsapp_label')
                                    ->label('Label tombol WhatsApp')
                                    ->required()
                                    ->maxLength(40)
                                    ->placeholder('WhatsApp')
                                    ->default('WhatsApp'),
                            ])->columns(2),

                        Forms\Components\Section::make('Telepon')
                            ->schema([
                                Forms\Components\TextInput::make('concierge.phone')
                                    ->label('Nomor telepon')
                                    ->placeholder('+62361123456')
                                    ->regex('/^\+\d{9,15}$/')
                                    ->validationMessages([
                                        'regex' => 'Format harus internasional, contoh: +62361123456.',
                                    ])
                                    ->helperText('Kosongkan kalau tidak mau tampilkan tombol telepon.'),

                                Forms\Components\TextInput::make('concierge.phone_label')
                                    ->label('Label tombol telepon')
                                    ->maxLength(40)
                                    ->placeholder('Telepon')
                                    ->default('Telepon'),
                            ])->columns(2),

                        Forms\Components\Section::make('Email')
                            ->schema([
                                Forms\Components\TextInput::make('concierge.email')
                                    ->label('Alamat email')
                                    ->required()
                                    ->email()
                                    ->placeholder('concierge@summerhousebali.com')
                                    ->helperText('Alamat tujuan untuk inquiry villa.'),

                                Forms\Components\TextInput::make('concierge.email_label')
                                    ->label('Label tombol email')
                                    ->required()
                                    ->maxLength(40)
                                    ->placeholder('Email')
                                    ->default('Email'),
                            ])->columns(2),
                    ]),

                Forms\Components\Tabs\Tab::make('Contact')
                    ->icon('heroicon-o-envelope')
                    ->schema([
                        Forms\Components\Section::make('Contact page details')
                            ->description('Detail utama yang tampil di halaman Contact.')
                            ->schema([
                                Forms\Components\TextInput::make('contact.email')
                                    ->label('Email contact')
                                    ->required()
                                    ->email()
                                    ->placeholder('info@summerhousebali.com')
                                    ->helperText('Email utama yang tampil di halaman Contact dan dipakai untuk mailto link.'),

                                Forms\Components\TextInput::make('contact.phone')
                                    ->label('Nomor telepon')
                                    ->placeholder('+6281932387121')
                                    ->regex('/^\+\d{9,15}$/')
                                    ->validationMessages([
                                        'regex' => 'Format harus internasional, contoh: +6281932387121.',
                                    ])
                                    ->helperText('Format internasional dengan +, tanpa spasi atau tanda hubung.'),

                                Forms\Components\TextInput::make('contact.whatsapp')
                                    ->label('Nomor WhatsApp')
                                    ->placeholder('+6281932387121')
                                    ->regex('/^\+\d{9,15}$/')
                                    ->validationMessages([
                                        'regex' => 'Format harus internasional, contoh: +6281932387121.',
                                    ])
                                    ->helperText('Kosongkan kalau ingin memakai nomor telepon.'),

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
