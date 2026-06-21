<?php

namespace App\Filament\Resources\ServiceCardResource\Pages;

use App\Filament\Resources\ServiceCardResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListServiceCards extends ListRecords
{
    protected static string $resource = ServiceCardResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
