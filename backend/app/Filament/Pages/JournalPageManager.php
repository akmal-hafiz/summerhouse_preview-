<?php

namespace App\Filament\Pages;

use App\Filament\Pages\Concerns\IsEmptyPagePlaceholder;
use Filament\Pages\Page;

class JournalPageManager extends Page
{
    use IsEmptyPagePlaceholder;

    protected static ?string $navigationIcon = 'heroicon-o-newspaper';
    protected static ?string $navigationLabel = 'Journal';
    protected static ?string $title = 'Journal Page';
    protected static ?string $slug = 'pages/journal';
    protected static ?int $navigationSort = 70;
}
