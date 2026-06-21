<?php

namespace App\Filament\Widgets;

use App\Models\ContactSubmission;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentContactsWidget extends BaseWidget
{
    protected static ?int $sort = 0;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Recent Contact Submissions';

    public function table(Table $table): Table
    {
        return $table
            ->query(ContactSubmission::query()->latest()->limit(5))
            ->columns([
                Tables\Columns\TextColumn::make('name')->weight('bold'),
                Tables\Columns\TextColumn::make('email')->copyable(),
                Tables\Columns\TextColumn::make('subject')->limit(40),
                Tables\Columns\IconColumn::make('is_read')->boolean()->label('Read'),
                Tables\Columns\TextColumn::make('created_at')->since()->label('Received'),
            ])
            ->paginated(false);
    }
}
