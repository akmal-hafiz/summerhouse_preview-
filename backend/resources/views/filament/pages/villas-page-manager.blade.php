<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Villas page introduction</h2>
        <p>Edit the short introduction above the live Lodgify search. Availability, pricing, and villa data remain automatic.</p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}
        <div class="sh-form-actions-row">{{ $this->getFormActions()[0] }}</div>
    </form>
</x-filament-panels::page>
