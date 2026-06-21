<?php

namespace App\Filament\Widgets;

use App\Models\Article;
use App\Models\ContactSubmission;
use App\Models\GalleryItem;
use App\Models\HomepageVillaSelection;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ContentStatsWidget extends BaseWidget
{
    protected static ?int $sort = -5;

    protected function getStats(): array
    {
        return [
            Stat::make('Homepage Villas', HomepageVillaSelection::count())
                ->description('Villa slots filled across all sections')
                ->icon('heroicon-o-home-modern')
                ->color('primary'),
            Stat::make('Published Articles', Article::where('is_published', true)->count())
                ->description(Article::count() . ' total')
                ->icon('heroicon-o-document-text')
                ->color('success'),
            Stat::make('Gallery Items', GalleryItem::where('is_active', true)->count())
                ->description('Active items shown publicly')
                ->icon('heroicon-o-photo')
                ->color('info'),
            Stat::make('Unread Contacts', ContactSubmission::where('is_read', false)->count())
                ->description('Pending replies')
                ->icon('heroicon-o-envelope')
                ->color('warning'),
        ];
    }
}
