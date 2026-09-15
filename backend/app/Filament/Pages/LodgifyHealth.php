<?php

namespace App\Filament\Pages;

use App\Jobs\SyncLodgifyJob;
use App\Models\HomepageVillaSelection;
use App\Models\LodgifyIncident;
use App\Models\LodgifyPropertyEvent;
use App\Models\LodgifySyncRun;
use App\Services\LodgifyHealthService;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class LodgifyHealth extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-heart';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Lodgify Health';

    protected static ?string $title = 'Lodgify Health';

    protected static ?int $navigationSort = 5;

    protected static string $view = 'filament.pages.lodgify-health';

    protected function getHeaderActions(): array
    {
        return [
            Action::make('syncNow')
                ->label('Sync now')
                ->icon('heroicon-o-arrow-path')
                ->action(function (): void {
                    SyncLodgifyJob::dispatch()->onQueue('lodgify');
                    Notification::make()
                        ->title('Lodgify sync queued')
                        ->body('The background sync will update this page automatically.')
                        ->success()
                        ->send();
                }),
        ];
    }

    public function acknowledgeIncident(int $incidentId): void
    {
        $incident = LodgifyIncident::unresolved()->findOrFail($incidentId);
        $incident->acknowledge(Filament::auth()->id());
        Notification::make()->title('Incident acknowledged')->success()->send();
    }

    public function getViewData(): array
    {
        $health = app(LodgifyHealthService::class)->snapshot();
        $invalidReferences = HomepageVillaSelection::query()
            ->leftJoin('villa_caches', 'homepage_villa_selections.lodgify_property_id', '=', 'villa_caches.lodgify_id')
            ->where(function ($query) {
                $query->whereNull('villa_caches.id')
                    ->orWhere('villa_caches.management_status', 'removed_from_portfolio')
                    ->orWhereIn('villa_caches.lodgify_status', ['suspected_missing', 'missing']);
            })
            ->get([
                'homepage_villa_selections.slot',
                'homepage_villa_selections.lodgify_property_id',
                'villa_caches.name',
                'villa_caches.lodgify_status',
                'villa_caches.management_status',
            ]);

        return [
            'health' => $health,
            'incidents' => LodgifyIncident::unresolved()->orderByRaw("case severity when 'critical' then 1 when 'warning' then 2 else 3 end")->latest('last_seen_at')->limit(20)->get(),
            'events' => LodgifyPropertyEvent::latest('occurred_at')->limit(20)->get(),
            'runs' => LodgifySyncRun::latest('started_at')->limit(20)->get(),
            'invalidReferences' => $invalidReferences,
        ];
    }
}
