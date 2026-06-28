<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ContentStatsWidget;
use App\Filament\Widgets\WelcomeWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $title = 'Dashboard';

    public function getWidgets(): array
    {
        return [
            WelcomeWidget::class,
            ContentStatsWidget::class,
            \App\Filament\Widgets\RecentContactsWidget::class,
        ];
    }

    public function getColumns(): int|string|array
    {
        return 2;
    }
}
