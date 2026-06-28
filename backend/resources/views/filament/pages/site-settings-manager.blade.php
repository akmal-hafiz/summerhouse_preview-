<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>Pengaturan situs</h2>
        <p>
            Atur kontak concierge yang tampil di dashboard member. Perubahan langsung aktif di frontend
            (atau dalam ~5 menit kalau ada cache).
        </p>
    </div>

    <form wire:submit="save">
        {{ $this->form }}

        <div class="sh-form-actions-row">
            {{ $this->getFormActions()[0] }}
        </div>
    </form>
</x-filament-panels::page>
