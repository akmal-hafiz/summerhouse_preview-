<?php

namespace App\Filament\Widgets;

use App\Models\Testimonial;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ReviewStatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $pending = Testimonial::where('status', Testimonial::STATUS_PENDING)->count();
        $approved = Testimonial::where('status', Testimonial::STATUS_APPROVED)->count();
        $total = Testimonial::count();
        $thisMonth = Testimonial::where('created_at', '>=', now()->startOfMonth())->count();

        $ratedQuery = Testimonial::where('status', Testimonial::STATUS_APPROVED)->where('stars', '>', 0);
        $ratedCount = $ratedQuery->count();
        $avgRating = $ratedCount > 0 ? round((clone $ratedQuery)->avg('stars'), 1) : null;

        return [
            Stat::make('Pending reviews', $pending)
                ->description($pending > 0 ? 'Waiting for moderation' : 'Queue is clear')
                ->descriptionIcon($pending > 0 ? 'heroicon-m-bell-alert' : 'heroicon-m-check-circle')
                ->color($pending > 0 ? 'warning' : 'success')
                ->url('/admin/testimonials?tableFilters[status][value]=pending'),
            Stat::make('Approved reviews', $approved)
                ->description("{$total} total submissions")
                ->descriptionIcon('heroicon-m-chat-bubble-left-ellipsis')
                ->color('success'),
            Stat::make('Average rating', $avgRating !== null ? "{$avgRating} / 5" : '—')
                ->description($ratedCount > 0 ? "{$ratedCount} rated reviews" : 'No rated reviews yet')
                ->descriptionIcon('heroicon-m-star')
                ->color('primary'),
            Stat::make('Reviews this month', $thisMonth)
                ->description(now()->format('F Y'))
                ->descriptionIcon('heroicon-m-calendar')
                ->color('gray'),
        ];
    }
}
