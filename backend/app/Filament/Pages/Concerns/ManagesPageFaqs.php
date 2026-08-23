<?php

namespace App\Filament\Pages\Concerns;

use App\Models\Faq;
use Filament\Forms;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Validation\Rules\Unique;

trait ManagesPageFaqs
{
    abstract protected function faqPageKey(): string;

    abstract protected function faqPageLabel(): string;

    protected function faqTable(Table $table): Table
    {
        return $table
            ->query(
                Faq::query()->where('page', $this->faqPageKey())
            )
            ->heading('Frequently Asked Questions')
            ->description("Manage the questions shown on the public {$this->faqPageLabel()} page.")
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('#')
                    ->sortable()
                    ->width('5rem'),
                Tables\Columns\TextColumn::make('question')
                    ->searchable()
                    ->weight('bold')
                    ->wrap(),
                Tables\Columns\TextColumn::make('answer')
                    ->limit(100)
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Visible'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last updated')
                    ->since()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Add FAQ')
                    ->icon('heroicon-o-plus')
                    ->model(Faq::class)
                    ->form($this->faqFormSchema())
                    ->mutateFormDataUsing(fn (array $data): array => [
                        ...$data,
                        'page' => $this->faqPageKey(),
                    ])
                    ->createAnother(false),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->form($this->faqFormSchema())
                    ->mutateFormDataUsing(fn (array $data): array => [
                        ...$data,
                        'page' => $this->faqPageKey(),
                    ]),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->paginated(false)
            ->emptyStateHeading("No {$this->faqPageLabel()} FAQs yet")
            ->emptyStateDescription('Add the first question when the page content is ready.')
            ->emptyStateIcon('heroicon-o-question-mark-circle');
    }

    /**
     * @return array<Forms\Components\Component>
     */
    protected function faqFormSchema(): array
    {
        return [
            Forms\Components\Textarea::make('question')
                ->required()
                ->rows(2)
                ->maxLength(1000)
                ->unique(
                    table: Faq::class,
                    column: 'question',
                    ignoreRecord: true,
                    modifyRuleUsing: fn (Unique $rule): Unique => $rule->where(
                        'page',
                        $this->faqPageKey()
                    ),
                )
                ->helperText("Must be unique within the {$this->faqPageLabel()} page."),
            Forms\Components\Textarea::make('answer')
                ->required()
                ->rows(5)
                ->maxLength(10000),
            Forms\Components\TextInput::make('sort_order')
                ->label('Display order')
                ->required()
                ->numeric()
                ->integer()
                ->minValue(0)
                ->default(0),
            Forms\Components\Toggle::make('is_active')
                ->label('Visible on website')
                ->default(true),
        ];
    }
}
