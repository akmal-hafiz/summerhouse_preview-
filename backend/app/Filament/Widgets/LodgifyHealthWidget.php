<?php

namespace App\Filament\Widgets;

use App\Filament\Pages\LodgifyHealth;
use App\Models\VillaCache;
use App\Services\LodgifyHealthService;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class LodgifyHealthWidget extends BaseWidget
{
    protected static ?int $sort = -4;

    protected function getStats(): array
    {
        $health = app(LodgifyHealthService::class)->snapshot();
        $color = match ($health['status']) {
            'green' => 'success',
            'yellow' => 'warning',
            default => 'danger',
        };
        $lastSync = $health['last_successful_sync']?->finished_at?->diffForHumans() ?? 'Never';

        return [
            Stat::make('Lodgify Health', ucfirst($health['status']))
                ->description("Last successful sync: {$lastSync}")
                ->icon('heroicon-o-heart')
                ->color($color)
                ->url(LodgifyHealth::getUrl()),
            Stat::make('Public villas', VillaCache::publiclyEligible()->count())
                ->description("{$health['counts']['inactive']} inactive, {$health['counts']['missing']} missing")
                ->icon('heroicon-o-home-modern')
                ->color($color)
                ->url(LodgifyHealth::getUrl()),
            Stat::make('Open incidents', $health['open_incidents'])
                ->description("{$health['critical_incidents']} critical")
                ->icon('heroicon-o-bell-alert')
                ->color($health['critical_incidents'] > 0 ? 'danger' : ($health['open_incidents'] > 0 ? 'warning' : 'success'))
                ->url(LodgifyHealth::getUrl()),
        ];
    }
}
