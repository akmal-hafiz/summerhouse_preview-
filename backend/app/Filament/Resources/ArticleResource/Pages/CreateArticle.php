<?php

namespace App\Filament\Resources\ArticleResource\Pages;

use App\Filament\Pages\AboutPageManager;
use App\Filament\Resources\ArticleResource;
use Filament\Resources\Pages\CreateRecord;

class CreateArticle extends CreateRecord
{
    protected static string $resource = ArticleResource::class;

    protected function getRedirectUrl(): string
    {
        return AboutPageManager::getUrl(['section' => 'journal_preview']);
    }
}
