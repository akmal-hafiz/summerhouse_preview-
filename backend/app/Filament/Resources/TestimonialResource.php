<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TestimonialResource\Pages;
use App\Models\Testimonial;
use App\Models\VillaCache;
use App\Services\Reviews\ReviewService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-ellipsis';

    protected static ?string $navigationGroup = 'Static Pages';

    protected static ?string $navigationLabel = 'Reviews & Testimonials';

    protected static ?string $modelLabel = 'Review';

    protected static ?string $pluralModelLabel = 'Reviews & Testimonials';

    protected static ?int $navigationSort = 30;

    public static function getNavigationBadge(): ?string
    {
        $pending = Testimonial::where('status', Testimonial::STATUS_PENDING)->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Reviews waiting for approval';
    }

    /**
     * Eager-load the villa relationship so table rows never trigger a per-row
     * N+1 that made the row appear stuck-loading during Livewire hydration.
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with('villa:id,lodgify_id,name,location');
    }

    public static function form(Form $form): Form
    {
        $isOwner = fn (?Testimonial $record): bool => $record?->type === Testimonial::TYPE_OWNER_TESTIMONIAL;

        return $form->schema([
            Forms\Components\Section::make('Reviewer')
                ->description('Submitted through the public website. Edit only to fix typos or remove inappropriate content — every edit is audit-logged.')
                ->icon('heroicon-o-user-circle')
                ->columns(12)
                ->schema([
                    Forms\Components\Placeholder::make('type_badge')
                        ->label('Review type')
                        ->content(fn (?Testimonial $record): string => match ($record?->type) {
                            Testimonial::TYPE_OWNER_TESTIMONIAL => 'Owner testimonial · Services page',
                            default => 'Guest review · Villa page',
                        })
                        ->columnSpan(12),

                    Forms\Components\TextInput::make('author')
                        ->label('Full name')
                        ->required()
                        ->maxLength(120)
                        ->columnSpan(6),

                    Forms\Components\TextInput::make('location')
                        ->label('Where from')
                        ->placeholder('Stockholm, Sweden')
                        ->columnSpan(6),

                    Forms\Components\TextInput::make('reviewer_email')
                        ->label('Email · private')
                        ->email()
                        ->maxLength(180)
                        ->helperText('Never shown publicly. Used only if we need to reach the guest.')
                        ->columnSpan(6),

                    Forms\Components\FileUpload::make('avatar')
                        ->label('Avatar')
                        ->image()
                        ->imageEditor()
                        ->avatar()
                        ->disk('public')
                        ->directory('uploads/testimonials')
                        ->visibility('public')
                        ->maxSize(2048)
                        ->columnSpan(6),
                ]),

            Forms\Components\Section::make('The review')
                ->description('The words guests will see. Keep edits minimal.')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->columns(12)
                ->schema([
                    Forms\Components\Select::make('stars')
                        ->label('Rating')
                        ->options([5 => '★★★★★  Excellent', 4 => '★★★★  Great', 3 => '★★★  Fair', 2 => '★★  Poor', 1 => '★  Bad'])
                        ->default(5)
                        ->required()
                        ->native(false)
                        ->columnSpan(4),

                    Forms\Components\Select::make('villa_cache_id')
                        ->label('Villa')
                        ->relationship('villa', 'name')
                        ->getOptionLabelFromRecordUsing(fn (VillaCache $r) => "{$r->name} · {$r->lodgify_id}")
                        ->searchable(['name', 'lodgify_id', 'location'])
                        ->preload()
                        ->nullable()
                        ->helperText('Leave empty for site-wide testimonials.')
                        ->columnSpan(8),

                    Forms\Components\TextInput::make('title')
                        ->label('Headline')
                        ->maxLength(180)
                        ->placeholder('A quiet Bali retreat')
                        ->columnSpan(12),

                    Forms\Components\Textarea::make('text')
                        ->label('Review body')
                        ->required()
                        ->minLength(20)
                        ->maxLength(4000)
                        ->rows(6)
                        ->columnSpan(12),
                ]),

            Forms\Components\Section::make('Source & verification')
                ->description('Where the review came from. Verified stays lift trust on the public page.')
                ->icon('heroicon-o-shield-check')
                ->collapsible()
                ->columns(12)
                ->schema([
                    Forms\Components\Select::make('source')
                        ->options([
                            Testimonial::SOURCE_MANUAL => 'Manual CMS entry',
                            Testimonial::SOURCE_GUEST_SUBMISSION => 'Guest submission',
                            Testimonial::SOURCE_AIRBNB => 'Airbnb',
                            Testimonial::SOURCE_BOOKING_COM => 'Booking.com',
                            Testimonial::SOURCE_VRBO => 'Vrbo',
                            Testimonial::SOURCE_GOOGLE => 'Google',
                            Testimonial::SOURCE_OTHER => 'Other',
                        ])
                        ->default(Testimonial::SOURCE_MANUAL)
                        ->required()
                        ->native(false)
                        ->columnSpan(6),

                    Forms\Components\TextInput::make('source_label')
                        ->label('Custom badge')
                        ->helperText('Shown next to the review, e.g. "Verified Airbnb guest".')
                        ->columnSpan(6),

                    Forms\Components\Toggle::make('is_verified')
                        ->label('Verified stay')
                        ->helperText('Only enable when the guest can be confirmed to have stayed.')
                        ->columnSpan(4),

                    Forms\Components\DatePicker::make('stay_date')
                        ->label('Stay date')
                        ->columnSpan(4),

                    Forms\Components\DatePicker::make('review_date')
                        ->label('Written on')
                        ->columnSpan(4),

                    Forms\Components\TextInput::make('external_review_id')
                        ->label('External ID')
                        ->helperText('Used to deduplicate imported reviews.')
                        ->columnSpan(6),

                    Forms\Components\TextInput::make('external_url')
                        ->label('External URL')
                        ->url()
                        ->columnSpan(6),
                ]),

            Forms\Components\Section::make('Owner testimonial')
                ->description('Extra fields shown only for owner testimonials on the Services page.')
                ->icon('heroicon-o-briefcase')
                ->collapsible()
                ->visible(fn (?Testimonial $record) => $isOwner($record))
                ->columns(12)
                ->schema([
                    Forms\Components\TextInput::make('owner_role')
                        ->label('Owner role')
                        ->placeholder('Villa Owner · Property Investor')
                        ->maxLength(120)
                        ->columnSpan(12),

                    Forms\Components\Repeater::make('metrics')
                        ->label('Result metrics')
                        ->helperText('Curated by the team. Max four highlight numbers.')
                        ->schema([
                            Forms\Components\TextInput::make('label')
                                ->required()
                                ->placeholder('Occupancy Growth'),
                            Forms\Components\TextInput::make('value')
                                ->required()
                                ->placeholder('+38%'),
                        ])
                        ->columns(2)
                        ->defaultItems(0)
                        ->maxItems(4)
                        ->columnSpan(12),
                ]),

            Forms\Components\Section::make('Placement')
                ->description('Where this review appears once approved. One review can live in several places without duplication.')
                ->icon('heroicon-o-map')
                ->columns(4)
                ->schema([
                    Forms\Components\Toggle::make('show_on_villa')
                        ->label('Villa detail')
                        ->helperText('Needs a linked villa.')
                        ->visible(fn (?Testimonial $record) => !$isOwner($record)),
                    Forms\Components\Toggle::make('show_on_about')
                        ->label('About page')
                        ->visible(fn (?Testimonial $record) => !$isOwner($record)),
                    Forms\Components\Toggle::make('show_on_home')
                        ->label('Homepage')
                        ->visible(fn (?Testimonial $record) => !$isOwner($record)),
                    Forms\Components\Toggle::make('show_on_services')
                        ->label('Services page')
                        ->visible(fn (?Testimonial $record) => $isOwner($record)),
                ]),

            Forms\Components\Section::make('Moderation')
                ->description('Publication state, ordering, and lifecycle.')
                ->icon('heroicon-o-adjustments-horizontal')
                ->columns(12)
                ->schema([
                    Forms\Components\Select::make('status')
                        ->options([
                            Testimonial::STATUS_DRAFT => 'Draft',
                            Testimonial::STATUS_PENDING => 'Pending review',
                            Testimonial::STATUS_APPROVED => 'Approved · public',
                            Testimonial::STATUS_REJECTED => 'Rejected',
                            Testimonial::STATUS_HIDDEN => 'Hidden',
                            Testimonial::STATUS_ARCHIVED => 'Archived',
                            Testimonial::STATUS_SPAM => 'Spam',
                        ])
                        ->default(Testimonial::STATUS_DRAFT)
                        ->required()
                        ->native(false)
                        ->columnSpan(6),

                    Forms\Components\DateTimePicker::make('published_at')
                        ->label('Published at')
                        ->helperText('Set automatically when approved.')
                        ->columnSpan(6),

                    Forms\Components\Toggle::make('is_featured')
                        ->helperText('Featured reviews lead their section. Only approved reviews can be featured.')
                        ->columnSpan(4),

                    Forms\Components\Toggle::make('is_pinned')
                        ->label('Pin to top')
                        ->helperText('Pinned first, everywhere.')
                        ->columnSpan(4),

                    Forms\Components\Toggle::make('is_active')
                        ->default(true)
                        ->helperText('Kill switch. Off = never public.')
                        ->columnSpan(4),

                    Forms\Components\TextInput::make('display_order')
                        ->numeric()
                        ->helperText('Lower values appear first.')
                        ->columnSpan(6),

                    Forms\Components\Select::make('page')
                        ->label('Primary page context')
                        ->options([
                            'about' => 'About',
                            'services' => 'Services',
                            'home' => 'Homepage',
                            'villa' => 'Villa detail',
                        ])
                        ->default('villa')
                        ->required()
                        ->native(false)
                        ->columnSpan(6),
                ]),

            Forms\Components\Section::make('Audit trail')
                ->description('Every moderation action leaves a footprint here.')
                ->icon('heroicon-o-clock')
                ->collapsed()
                ->schema([
                    Forms\Components\Placeholder::make('audit_timeline')
                        ->label('')
                        ->content(function (?Testimonial $record) {
                            if (!$record || !$record->exists) {
                                return 'History appears after the review is saved.';
                            }

                            $entries = $record->audits()->with('actor:id,name')->limit(20)->get();
                            if ($entries->isEmpty()) {
                                return 'No moderation history yet.';
                            }

                            $lines = $entries->map(function ($a) {
                                $who = $a->actor?->name ?? 'Guest / system';
                                $when = $a->created_at?->format('d M Y H:i') ?? '';
                                $label = str_replace('_', ' ', ucfirst($a->action));

                                return "<li style=\"margin-bottom:0.4rem;padding-left:0.75rem;border-left:2px solid #E5E7EB\"><strong>{$label}</strong> — {$who} <span style=\"opacity:0.55\">· {$when}</span></li>";
                            })->implode('');

                            return new \Illuminate\Support\HtmlString("<ul style=\"list-style:none;padding:0;margin:0\">{$lines}</ul>");
                        }),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\Layout\Split::make([
                    Tables\Columns\ImageColumn::make('avatar')
                        ->circular()
                        ->defaultImageUrl(fn (Testimonial $r) => 'https://ui-avatars.com/api/?name=' . urlencode($r->author) . '&background=DCE5DD&color=355538&size=64')
                        ->grow(false),

                    Tables\Columns\Layout\Stack::make([
                        Tables\Columns\TextColumn::make('author')
                            ->searchable()
                            ->weight('semibold')
                            ->size('sm'),
                        Tables\Columns\TextColumn::make('villa.name')
                            ->placeholder('Site-wide')
                            ->color('gray')
                            ->size('xs'),
                    ])->space(1),
                ])->from('md'),

                Tables\Columns\TextColumn::make('stars')
                    ->label('Rating')
                    ->formatStateUsing(fn ($state) => $state ? str_repeat('★', (int) $state) : '—')
                    ->color(fn ($state) => (int) $state >= 4 ? 'warning' : 'gray')
                    ->sortable(),

                Tables\Columns\TextColumn::make('text')
                    ->label('Excerpt')
                    ->limit(80)
                    ->wrap()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->label('Kind')
                    ->formatStateUsing(fn (?string $state): string => $state === Testimonial::TYPE_OWNER_TESTIMONIAL ? 'Owner' : 'Guest')
                    ->color(fn (?string $state): string => $state === Testimonial::TYPE_OWNER_TESTIMONIAL ? 'info' : 'gray'),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => ucfirst(str_replace('_', ' ', (string) $state)))
                    ->color(fn (?string $state): string => match ($state) {
                        Testimonial::STATUS_APPROVED => 'success',
                        Testimonial::STATUS_PENDING => 'warning',
                        Testimonial::STATUS_REJECTED, Testimonial::STATUS_SPAM => 'danger',
                        Testimonial::STATUS_HIDDEN, Testimonial::STATUS_ARCHIVED => 'gray',
                        Testimonial::STATUS_DRAFT => 'info',
                        default => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('source')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => str_replace('_', ' ', ucfirst((string) $state)))
                    ->color(fn (?string $state): string => match ($state) {
                        Testimonial::SOURCE_MANUAL => 'gray',
                        Testimonial::SOURCE_GUEST_SUBMISSION => 'warning',
                        default => 'info',
                    })
                    ->toggleable(),

                Tables\Columns\TextColumn::make('placements')
                    ->label('Placement')
                    ->state(function (Testimonial $r): string {
                        $spots = array_filter([
                            $r->show_on_villa ? 'Villa' : null,
                            $r->show_on_about ? 'About' : null,
                            $r->show_on_home ? 'Home' : null,
                            $r->show_on_services ? 'Services' : null,
                        ]);

                        return $spots ? implode(' · ', $spots) : '—';
                    })
                    ->color('gray')
                    ->toggleable(),

                Tables\Columns\IconColumn::make('is_featured')->boolean()->label('★')->toggleable(),
                Tables\Columns\IconColumn::make('is_pinned')->boolean()->label('📌')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\IconColumn::make('is_verified')->boolean()->label('✓')->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Received')
                    ->since()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('published_at')
                    ->label('Published')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([10, 25, 50, 100])
            ->filters([
                Tables\Filters\SelectFilter::make('villa_cache_id')
                    ->label('Villa')
                    ->relationship('villa', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(Testimonial::STATUSES)->mapWithKeys(fn ($s) => [$s => ucfirst($s)])),
                Tables\Filters\SelectFilter::make('source')
                    ->options(collect(Testimonial::SOURCES)->mapWithKeys(fn ($s) => [$s => str_replace('_', ' ', ucfirst($s))])),
                Tables\Filters\SelectFilter::make('stars')
                    ->options([5 => '5 stars', 4 => '4 stars', 3 => '3 stars', 2 => '2 stars', 1 => '1 star']),
                Tables\Filters\TernaryFilter::make('is_featured')->label('Featured'),
                Tables\Filters\TernaryFilter::make('is_verified')->label('Verified'),
                Tables\Filters\Filter::make('review_date')
                    ->form([
                        Forms\Components\DatePicker::make('from'),
                        Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn ($q, $d) => $q->whereDate('review_date', '>=', $d))
                            ->when($data['until'] ?? null, fn ($q, $d) => $q->whereDate('review_date', '<=', $d));
                    }),
            ])
            ->filtersFormColumns(2)
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('approve')
                        ->label('Approve')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->visible(fn (Testimonial $r) => in_array($r->status, [Testimonial::STATUS_PENDING, Testimonial::STATUS_HIDDEN], true))
                        ->requiresConfirmation()
                        ->modalHeading('Publish this review')
                        ->modalDescription('It becomes visible on the public site immediately.')
                        ->modalSubmitActionLabel('Yes, publish')
                        ->action(fn (Testimonial $r) => self::runTransition($r, 'approve')),
                    Tables\Actions\Action::make('reject')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->visible(fn (Testimonial $r) => $r->status === Testimonial::STATUS_PENDING)
                        ->requiresConfirmation()
                        ->modalHeading('Reject this review')
                        ->modalDescription('It will be removed from the queue. You can restore it later.')
                        ->action(fn (Testimonial $r) => self::runTransition($r, 'reject')),
                    Tables\Actions\Action::make('hide')
                        ->icon('heroicon-o-eye-slash')
                        ->color('gray')
                        ->visible(fn (Testimonial $r) => $r->status === Testimonial::STATUS_APPROVED)
                        ->requiresConfirmation()
                        ->modalHeading('Hide from the public site')
                        ->action(fn (Testimonial $r) => self::runTransition($r, 'hide')),
                    Tables\Actions\Action::make('feature')
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->visible(fn (Testimonial $r) => $r->status === Testimonial::STATUS_APPROVED && !$r->is_featured)
                        ->action(fn (Testimonial $r) => self::runFeature($r, true)),
                    Tables\Actions\Action::make('unfeature')
                        ->icon('heroicon-s-star')
                        ->color('gray')
                        ->visible(fn (Testimonial $r) => $r->is_featured)
                        ->action(fn (Testimonial $r) => self::runFeature($r, false)),
                    Tables\Actions\Action::make('pin')
                        ->label('Pin to top')
                        ->icon('heroicon-o-arrow-up-circle')
                        ->color('warning')
                        ->visible(fn (Testimonial $r) => $r->status === Testimonial::STATUS_APPROVED && !$r->is_pinned)
                        ->action(fn (Testimonial $r) => self::runPin($r, true)),
                    Tables\Actions\Action::make('unpin')
                        ->label('Unpin')
                        ->icon('heroicon-s-arrow-up-circle')
                        ->color('gray')
                        ->visible(fn (Testimonial $r) => $r->is_pinned)
                        ->action(fn (Testimonial $r) => self::runPin($r, false)),
                    Tables\Actions\Action::make('spam')
                        ->label('Mark as spam')
                        ->icon('heroicon-o-no-symbol')
                        ->color('danger')
                        ->visible(fn (Testimonial $r) => in_array($r->status, [Testimonial::STATUS_PENDING, Testimonial::STATUS_REJECTED], true))
                        ->requiresConfirmation()
                        ->modalDescription('Spam reviews are removed from the moderation queue. Restorable later.')
                        ->action(fn (Testimonial $r) => self::runTransition($r, 'markSpam')),
                    Tables\Actions\Action::make('restore_review')
                        ->label('Restore to queue')
                        ->icon('heroicon-o-arrow-uturn-left')
                        ->color('info')
                        ->visible(fn (Testimonial $r) => in_array($r->status, [Testimonial::STATUS_SPAM, Testimonial::STATUS_REJECTED], true))
                        ->requiresConfirmation()
                        ->action(fn (Testimonial $r) => self::runTransition($r, 'restore')),
                    Tables\Actions\Action::make('archive')
                        ->icon('heroicon-o-archive-box')
                        ->color('gray')
                        ->visible(fn (Testimonial $r) => $r->status !== Testimonial::STATUS_ARCHIVED && $r->status !== Testimonial::STATUS_SPAM)
                        ->requiresConfirmation()
                        ->action(fn (Testimonial $r) => self::runTransition($r, 'archive')),
                    Tables\Actions\DeleteAction::make(),
                ])
                    ->label('Actions')
                    ->icon('heroicon-m-ellipsis-vertical')
                    ->size('sm'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('approveAll')
                        ->label('Approve selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->modalHeading('Publish selected reviews')
                        ->modalDescription('Each review will appear on its configured pages within five minutes.')
                        ->action(function ($records) {
                            $svc = app(ReviewService::class);
                            $ok = 0;
                            $fail = 0;
                            foreach ($records as $r) {
                                try {
                                    $svc->approve($r, auth()->user());
                                    $ok++;
                                } catch (\Throwable $e) {
                                    $fail++;
                                }
                            }
                            Notification::make()
                                ->title("Approved {$ok} review" . ($ok === 1 ? '' : 's'))
                                ->body($fail ? "{$fail} skipped due to invalid state." : null)
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\BulkAction::make('rejectAll')
                        ->label('Reject selected')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            $svc = app(ReviewService::class);
                            foreach ($records as $r) {
                                try {
                                    $svc->reject($r, auth()->user());
                                } catch (\Throwable $e) {
                                }
                            }
                            Notification::make()->title('Selected reviews rejected')->success()->send();
                        }),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    protected static function runTransition(Testimonial $review, string $method): void
    {
        try {
            app(ReviewService::class)->{$method}($review, auth()->user());
            Notification::make()->title(ucfirst($method) . ' complete')->success()->send();
        } catch (\Throwable $e) {
            Notification::make()->title('Action failed')->body($e->getMessage())->danger()->send();
        }
    }

    protected static function runFeature(Testimonial $review, bool $featured): void
    {
        try {
            app(ReviewService::class)->setFeatured($review, $featured, auth()->user());
            Notification::make()
                ->title($featured ? 'Marked as featured' : 'Removed from featured')
                ->success()
                ->send();
        } catch (\Throwable $e) {
            Notification::make()->title('Action failed')->body($e->getMessage())->danger()->send();
        }
    }

    protected static function runPin(Testimonial $review, bool $pinned): void
    {
        try {
            app(ReviewService::class)->setPinned($review, $pinned, auth()->user());
            Notification::make()
                ->title($pinned ? 'Pinned to top' : 'Unpinned')
                ->success()
                ->send();
        } catch (\Throwable $e) {
            Notification::make()->title('Action failed')->body($e->getMessage())->danger()->send();
        }
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTestimonials::route('/'),
            'edit' => Pages\EditTestimonial::route('/{record}/edit'),
        ];
    }
}
