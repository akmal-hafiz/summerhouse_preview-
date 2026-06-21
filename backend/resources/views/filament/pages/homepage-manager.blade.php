<x-filament-panels::page>
    <div class="rounded-2xl border border-white/30 bg-white/60 p-6 backdrop-blur-xl dark:bg-gray-900/40">
        <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Homepage Sections</h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Edit hero, stay styles, signature villa, featured collection, and explore Bali sections.
                Villa selections pull data from Lodgify by ID.
            </p>
        </div>

        <form wire:submit="save">
            {{ $this->form }}

            <div class="mt-6 flex justify-end gap-3">
                {{ $this->getFormActions()[0] }}
            </div>
        </form>
    </div>
</x-filament-panels::page>
