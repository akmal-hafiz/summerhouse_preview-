<?php

namespace App\Filament\Resources\TestimonialResource\Pages;

use App\Filament\Resources\TestimonialResource;
use App\Models\Testimonial;
use Filament\Resources\Components\Tab;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Builder;

class ListTestimonials extends ListRecords
{
    protected static string $resource = TestimonialResource::class;

    // No CreateAction — reviews only enter through the public website forms.
    protected function getHeaderActions(): array
    {
        return [];
    }

    protected function getHeaderWidgets(): array
    {
        return [];
    }

    public function getSubheading(): ?string
    {
        return 'Guest reviews arrive from villa pages · Owner testimonials arrive from the Services page. Moderate here — nothing is written manually.';
    }

    public function getTabs(): array
    {
        $counts = Testimonial::query()
            ->selectRaw('status, type, COUNT(*) as total')
            ->groupBy('status', 'type')
            ->get();

        $pending = (int) $counts->where('status', Testimonial::STATUS_PENDING)->sum('total');
        $approved = (int) $counts->where('status', Testimonial::STATUS_APPROVED)->sum('total');
        $guest = (int) $counts->where('type', Testimonial::TYPE_GUEST_REVIEW)->sum('total');
        $owner = (int) $counts->where('type', Testimonial::TYPE_OWNER_TESTIMONIAL)->sum('total');
        $spam = (int) $counts->where('status', Testimonial::STATUS_SPAM)->sum('total');
        $all = (int) $counts->sum('total');

        return [
            'all' => Tab::make('All')
                ->badge($all ?: null)
                ->badgeColor('gray')
                ->icon('heroicon-o-inbox-stack'),

            'pending' => Tab::make('Pending')
                ->badge($pending ?: null)
                ->badgeColor('warning')
                ->icon('heroicon-o-clock')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', Testimonial::STATUS_PENDING)),

            'approved' => Tab::make('Approved')
                ->badge($approved ?: null)
                ->badgeColor('success')
                ->icon('heroicon-o-check-circle')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', Testimonial::STATUS_APPROVED)),

            'guest_reviews' => Tab::make('Guest reviews')
                ->badge($guest ?: null)
                ->badgeColor('gray')
                ->icon('heroicon-o-user-group')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', Testimonial::TYPE_GUEST_REVIEW)),

            'owner_testimonials' => Tab::make('Owner testimonials')
                ->badge($owner ?: null)
                ->badgeColor('info')
                ->icon('heroicon-o-briefcase')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', Testimonial::TYPE_OWNER_TESTIMONIAL)),

            'spam' => Tab::make('Spam')
                ->badge($spam ?: null)
                ->badgeColor('danger')
                ->icon('heroicon-o-no-symbol')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', Testimonial::STATUS_SPAM)),
        ];
    }

    /**
     * Context-aware empty state — different copy per tab so the moderator
     * always knows whether "no rows" means "nothing waiting" (good) or
     * "no data at all" (unexpected).
     */
    protected function getTableEmptyStateHeading(): ?string
    {
        return match ($this->activeTab) {
            'pending' => 'Inbox zero',
            'approved' => 'Nothing published yet',
            'spam' => 'No spam flagged',
            'owner_testimonials' => 'No owner testimonials yet',
            'guest_reviews' => 'No guest reviews yet',
            default => 'No reviews yet',
        };
    }

    protected function getTableEmptyStateDescription(): ?string
    {
        return match ($this->activeTab) {
            'pending' => 'Every guest review has been actioned. New submissions from villa pages land here for approval.',
            'approved' => 'Approve a pending review to see it here and on the public site within five minutes.',
            'spam' => 'Nothing marked as spam. Spam-flagged reviews are hidden from moderators by default.',
            default => 'Reviews arrive from the public website — guest comments on villa pages and owner testimonials from Services. They cannot be written manually.',
        };
    }

    protected function getTableEmptyStateIcon(): ?string
    {
        return match ($this->activeTab) {
            'pending' => 'heroicon-o-check-badge',
            'spam' => 'heroicon-o-shield-check',
            default => 'heroicon-o-chat-bubble-left-ellipsis',
        };
    }
}
