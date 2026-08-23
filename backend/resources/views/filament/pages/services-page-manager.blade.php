<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Services page sections</h2>
        <p>Edit the partnership strengths, management heading, owner story introduction, and villa-owner CTA.</p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}
        <div class="sh-form-actions-row">{{ $this->getFormActions()[0] }}</div>
    </form>

    <div class="sh-page-intro">
        <h2>Services page FAQs</h2>
        <p>Add, edit, reorder, and publish the questions shown in the public Services page FAQ section.</p>
    </div>

    {{ $this->table }}
</x-filament-panels::page>
