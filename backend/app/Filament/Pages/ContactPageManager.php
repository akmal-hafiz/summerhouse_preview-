<?php

namespace App\Filament\Pages;

use App\Filament\Pages\Concerns\ManagesPageFaqs;
use Filament\Pages\Page;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;

class ContactPageManager extends Page implements HasTable
{
    use InteractsWithTable;
    use ManagesPageFaqs;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationLabel = 'Contact';

    protected static ?string $title = 'Contact Page';

    protected static ?string $slug = 'pages/contact';

    protected static ?int $navigationSort = 40;

    protected static string $view = 'filament.pages.contact-page-manager';

    public function table(Table $table): Table
    {
        return $this->faqTable($table);
    }

    protected function faqPageKey(): string
    {
        return 'contact';
    }

    protected function faqPageLabel(): string
    {
        return 'Contact';
    }
}
