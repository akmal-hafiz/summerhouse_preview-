<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Gallery page introduction</h2>
        <p>Keep the copy short so the gallery images remain the strongest part of the page.</p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}
        <div class="sh-form-actions-row">{{ $this->getFormActions()[0] }}</div>
    </form>
</x-filament-panels::page>
