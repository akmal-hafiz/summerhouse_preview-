<x-filament-panels::page>
    <div class="sh-page-intro">
        <h2>{{ $this->getPlaceholderPageName() }} page controls</h2>
        <p>
            This page is organized and ready for future controls. No editable fields have been added yet.
        </p>
    </div>

    <x-filament::section>
        <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <x-heroicon-o-lock-closed class="h-5 w-5" />
            </div>
            <div>
                <h3 class="text-base font-semibold text-gray-950">Intentionally empty</h3>
                <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Fields and section controls will be introduced only after the page content and final section structure are approved.
                </p>
            </div>
        </div>
    </x-filament::section>
</x-filament-panels::page>
