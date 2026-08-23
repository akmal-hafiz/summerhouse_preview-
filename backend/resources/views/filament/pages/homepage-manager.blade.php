<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Homepage sections</h2>
        <p>
            Edit hero, stay styles, signature villa, testimonials, and the Bali Destination Guide.
            Villa selections and destination counts pull live data from Lodgify. Changes go live within about five minutes.
        </p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}

        <div class="sh-form-actions-row">
            {{ $this->getFormActions()[0] }}
        </div>
    </form>
</x-filament-panels::page>
