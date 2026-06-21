<?php

namespace App\Filament\Resources\ServiceCardResource\Pages;

use App\Filament\Resources\ServiceCardResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditServiceCard extends EditRecord
{
    protected static string $resource = ServiceCardResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
