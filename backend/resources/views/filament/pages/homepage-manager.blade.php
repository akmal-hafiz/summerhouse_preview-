<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Homepage sections</h2>
        <p>
            Edit hero, stay styles, signature villa, featured collection, and the Explore Bali section.
            Villa selections pull live data from Lodgify by ID — changes go live within ~5 minutes.
        </p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}

        <div class="sh-form-actions-row">
            {{ $this->getFormActions()[0] }}
        </div>
    </form>
</x-filament-panels::page>
