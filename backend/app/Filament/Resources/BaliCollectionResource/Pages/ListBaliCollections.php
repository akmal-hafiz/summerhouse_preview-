<?php

namespace App\Filament\Resources\BaliCollectionResource\Pages;

use App\Filament\Resources\BaliCollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBaliCollections extends ListRecords
{
    protected static string $resource = BaliCollectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
