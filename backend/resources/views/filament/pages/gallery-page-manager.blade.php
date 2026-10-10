<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Gallery Page</h2>
        <p>Manage the public introduction and every gallery image from one place. Changes publish immediately.</p>
        <a href="{{ $this->getPublicGalleryUrl() }}" target="_blank" rel="noopener noreferrer">
            Preview public Gallery
        </a>
    </div>

    <form wire:submit="save">
        {{ $this->form }}
        <div class="sh-form-actions-row">
            @foreach ($this->getFormActions() as $action)
                {{ $action }}
            @endforeach
        </div>
    </form>

    <div>
        {{ $this->table }}
    </div>
</x-filament-panels::page>
