<?php

namespace App\Filament\Pages;

use App\Filament\Pages\Concerns\IsEmptyPagePlaceholder;
use Filament\Pages\Page;

class ConciergePageManager extends Page
{
    use IsEmptyPagePlaceholder;

    protected static ?string $navigationIcon = 'heroicon-o-sparkles';
    protected static ?string $navigationLabel = 'Concierge';
    protected static ?string $title = 'Concierge Page';
    protected static ?string $slug = 'pages/concierge';
    protected static ?int $navigationSort = 25;
}
