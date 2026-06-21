<?php

namespace App\Filament\Widgets;

use Filament\Facades\Filament;
use Filament\Widgets\Widget;

class WelcomeWidget extends Widget
{
    protected static string $view = 'filament.widgets.welcome-widget';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = -10;

    public function getViewData(): array
    {
        $user = Filament::auth()->user();
        $hour = (int) now()->setTimezone('Asia/Makassar')->format('H');

        $greeting = match (true) {
            $hour < 5 => 'Good night',
            $hour < 12 => 'Good morning',
            $hour < 17 => 'Good afternoon',
            $hour < 21 => 'Good evening',
            default => 'Good night',
        };

        return [
            'greeting' => $greeting,
            'name' => $user?->name ?? 'Admin',
            'date' => now()->setTimezone('Asia/Makassar')->format('l, F j, Y'),
        ];
    }
}
