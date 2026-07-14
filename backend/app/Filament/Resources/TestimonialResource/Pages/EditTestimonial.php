<?php

namespace App\Filament\Resources\TestimonialResource\Pages;

use App\Filament\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Services\Reviews\ReviewService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditTestimonial extends EditRecord
{
    protected static string $resource = TestimonialResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var Testimonial $record */
        try {
            return app(ReviewService::class)->update($record, $data, auth()->user());
        } catch (\Throwable $e) {
            Notification::make()->title('Could not save review')->body($e->getMessage())->danger()->send();
            $this->halt();
        }
    }
}
