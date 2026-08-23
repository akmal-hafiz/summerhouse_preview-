<?php

namespace App\Filament\Pages\Concerns;

trait IsEmptyPagePlaceholder
{
    public function getView(): string
    {
        return 'filament.pages.content-placeholder';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Website Pages';
    }

    public function getPlaceholderPageName(): string
    {
        return static::getNavigationLabel();
    }
}
