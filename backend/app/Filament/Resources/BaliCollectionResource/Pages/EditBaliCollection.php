<?php

namespace App\Filament\Resources\BaliCollectionResource\Pages;

use App\Filament\Resources\BaliCollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditBaliCollection extends EditRecord
{
    protected static string $resource = BaliCollectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
