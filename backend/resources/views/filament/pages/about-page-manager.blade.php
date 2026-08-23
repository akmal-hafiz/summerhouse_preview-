<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>About page sections</h2>
        <p>
            Edit the public About page in reading order. Live villa totals and destination counts continue to come from Lodgify automatically.
        </p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}

        <div class="sh-form-actions-row">
            {{ $this->getFormActions()[0] }}
        </div>
    </form>

    <div class="sh-page-intro">
        <h2>About page FAQs</h2>
        <p>
            Add, edit, reorder, and publish the questions shown in the public About page FAQ section.
        </p>
    </div>

    {{ $this->table }}
</x-filament-panels::page>
