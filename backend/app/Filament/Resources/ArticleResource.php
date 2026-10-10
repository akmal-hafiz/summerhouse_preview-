<?php

namespace App\Filament\Resources;

use App\Filament\Forms\Components\ManagedImageUpload;
use App\Filament\Resources\ArticleResource\Pages;
use App\Models\Article;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ArticleResource extends Resource
{
    protected static ?string $model = Article::class;

    protected static ?string $navigationIcon = 'heroicon-o-newspaper';

    protected static ?string $navigationGroup = 'Content Library';

    protected static ?int $navigationSort = 70;

    protected static ?string $recordTitleAttribute = 'title';

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'subtitle', 'category'];
    }

    protected static ?string $navigationLabel = 'Journal Articles';

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Article Identity')->columns(2)->schema([
                Forms\Components\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (?string $state, Forms\Set $set, Forms\Get $get) => $get('slug') ? null : $set('slug', Str::slug($state ?? ''))
                    ),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255)
                    ->helperText('URL: /journal/{slug}'),
                Forms\Components\Textarea::make('subtitle')->rows(2)->columnSpanFull(),
                Forms\Components\Textarea::make('excerpt')->rows(3)->columnSpanFull()->helperText('Short summary for cards and meta description'),
            ]),

            Forms\Components\Section::make('Meta')->columns(3)->schema([
                Forms\Components\Select::make('category')
                    ->required()
                    ->options([
                        'Lifestyle' => 'Lifestyle',
                        'Architecture' => 'Architecture',
                        'Travel' => 'Travel',
                        'Design' => 'Design',
                        'Slow Living' => 'Slow Living',
                        'Concierge' => 'Concierge',
                        'Culture' => 'Culture',
                    ])
                    ->searchable()
                    ->getSearchResultsUsing(fn (string $search) => [$search => $search])
                    ->helperText('Pick a preset or type a new one.'),
                Forms\Components\TextInput::make('read_time')
                    ->placeholder('Auto: "8 min read"')
                    ->helperText('Leave blank to auto-calculate from content.'),
                Forms\Components\TagsInput::make('tags')->placeholder('Architecture, Slow Living')->columnSpanFull(),
            ]),

            Forms\Components\Section::make('Hero Image')->columns(2)->schema([
                ManagedImageUpload::make('hero_image')
                    ->label('Hero Image')
                    ->image()
                    ->imageEditor()
                    ->disk('public')
                    ->directory('uploads/articles/hero')
                    ->visibility('public')
                    ->maxSize(8192)
                    ->required(),
                Forms\Components\TextInput::make('hero_alt')->placeholder('Image alt text'),
            ]),

            Forms\Components\Section::make('Author')->columns(2)->schema([
                Forms\Components\TextInput::make('author_name')->default('Summerhouses Team')->required(),
                Forms\Components\TextInput::make('author_role')->placeholder('Editorial Studio'),
                Forms\Components\Textarea::make('author_bio')->rows(2)->columnSpanFull(),
                ManagedImageUpload::make('author_avatar')
                    ->label('Author Avatar')
                    ->image()
                    ->imageEditor()
                    ->avatar()
                    ->disk('public')
                    ->directory('uploads/articles/authors')
                    ->visibility('public')
                    ->maxSize(2048)
                    ->columnSpanFull(),
            ])->collapsed(),

            Forms\Components\Section::make('Content Blocks')->schema([
                Forms\Components\Repeater::make('content')
                    ->label('')
                    ->schema([
                        Forms\Components\Select::make('type')
                            ->options([
                                'paragraph' => 'Paragraph',
                                'heading' => 'Heading (H2)',
                                'subheading' => 'Subheading (H3)',
                                'quote' => 'Pull Quote',
                                'image' => 'Image',
                            ])
                            ->required()
                            ->live()
                            ->default('paragraph')
                            ->columnSpan(1),
                        Forms\Components\Textarea::make('text')
                            ->required()
                            ->rows(fn (Forms\Get $get) => match ($get('type')) {
                                'paragraph' => 5,
                                'quote' => 3,
                                default => 2,
                            })
                            ->visible(fn (Forms\Get $get) => in_array($get('type'), ['paragraph', 'heading', 'subheading', 'quote']))
                            ->columnSpan(3),
                        ManagedImageUpload::make('src')
                            ->label('Image')
                            ->image()
                            ->imageEditor()
                            ->disk('public')
                            ->directory('uploads/articles/inline')
                            ->visibility('public')
                            ->maxSize(8192)
                            ->visible(fn (Forms\Get $get) => $get('type') === 'image')
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('alt')
                            ->label('Alt text')
                            ->placeholder('Describe the image for accessibility')
                            ->visible(fn (Forms\Get $get) => $get('type') === 'image')
                            ->columnSpan(2),
                        Forms\Components\TextInput::make('caption')
                            ->label('Caption (optional)')
                            ->visible(fn (Forms\Get $get) => $get('type') === 'image')
                            ->columnSpan(2),
                    ])
                    ->columns(4)
                    ->collapsed()
                    ->itemLabel(function (array $state): ?string {
                        $type = strtoupper($state['type'] ?? '');
                        $value = $state['text'] ?? $state['alt'] ?? $state['caption'] ?? $state['src'] ?? '';
                        if (is_array($value)) {
                            $value = collect($value)->flatten()->first(fn (mixed $item) => is_string($item)) ?? '';
                        }
                        $preview = Str::limit((string) $value, 60);

                        return "[$type] $preview";
                    })
                    ->reorderable()
                    ->cloneable()
                    ->defaultItems(1),
            ]),

            Forms\Components\Section::make('Publish')->columns(2)->schema([
                Forms\Components\Toggle::make('is_published')
                    ->label('Published')
                    ->default(false)
                    ->helperText('The publication date is assigned automatically when this article first goes live.'),
                Forms\Components\Placeholder::make('publication_date_preview')
                    ->label('Date shown to readers')
                    ->content(fn (?Article $record): string => $record?->date?->format('d M Y') ?? 'Assigned on first publication.'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('date')->label('Publication date')->date()->sortable()->placeholder('Draft'),
                Tables\Columns\TextColumn::make('title')->searchable()->weight('bold')->limit(50),
                Tables\Columns\TextColumn::make('category')->badge(),
                Tables\Columns\TextColumn::make('read_time')->label('Read'),
                Tables\Columns\IconColumn::make('is_published')->boolean()->label('Published'),
            ])
            ->defaultSort('date', 'desc')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_published'),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListArticles::route('/'),
            'create' => Pages\CreateArticle::route('/create'),
            'edit' => Pages\EditArticle::route('/{record}/edit'),
        ];
    }
}
