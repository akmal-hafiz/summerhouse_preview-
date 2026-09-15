<x-filament-panels::page>
    <div wire:poll.60s class="space-y-6">
        @php
            $statusClasses = match ($health['status']) {
                'green' => 'border-success-200 bg-success-50 text-success-800',
                'yellow' => 'border-warning-200 bg-warning-50 text-warning-800',
                default => 'border-danger-200 bg-danger-50 text-danger-800',
            };
        @endphp

        <section class="rounded-xl border p-5 {{ $statusClasses }}" aria-label="Lodgify health status">
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider">Current health</p>
                    <h2 class="mt-1 text-2xl font-semibold">{{ ucfirst($health['status']) }}</h2>
                    <p class="mt-2 text-sm">
                        Last successful sync:
                        {{ $health['last_successful_sync']?->finished_at?->diffForHumans() ?? 'No successful sync yet' }}
                    </p>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center text-sm sm:grid-cols-6">
                    @foreach ($health['counts'] as $label => $count)
                        <div>
                            <div class="text-xl font-semibold">{{ $count }}</div>
                            <div class="text-xs capitalize opacity-80">{{ str_replace('_', ' ', $label) }}</div>
                        </div>
                    @endforeach
                </div>
            </div>
            @foreach ($health['reasons'] as $reason)
                <p class="mt-2 text-sm font-medium">{{ $reason }}</p>
            @endforeach
        </section>

        <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900">
            <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-gray-950 dark:text-white">Open incidents</h2>
                    <p class="text-sm text-gray-500">Repeated failures are grouped into one incident.</p>
                </div>
                <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{{ $incidents->count() }}</span>
            </div>
            <div class="space-y-3">
                @forelse ($incidents as $incident)
                    <article class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold {{ $incident->severity === 'critical' ? 'bg-danger-100 text-danger-700' : ($incident->severity === 'warning' ? 'bg-warning-100 text-warning-700' : 'bg-info-100 text-info-700') }}">{{ ucfirst($incident->severity) }}</span>
                                    <span class="text-xs text-gray-500">{{ str_replace('_', ' ', $incident->category) }}</span>
                                </div>
                                <h3 class="mt-2 font-semibold text-gray-950 dark:text-white">{{ $incident->title }}</h3>
                                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ $incident->message }}</p>
                                <p class="mt-2 text-xs text-gray-500">Seen {{ $incident->occurrence_count }} times, last {{ $incident->last_seen_at->diffForHumans() }}</p>
                            </div>
                            @if ($incident->status === 'open')
                                <button type="button" wire:click="acknowledgeIncident({{ $incident->id }})" class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">Acknowledge</button>
                            @endif
                        </div>
                    </article>
                @empty
                    <p class="rounded-lg bg-success-50 p-4 text-sm text-success-700">No unresolved Lodgify incidents.</p>
                @endforelse
            </div>
        </section>

        <section class="grid gap-6 xl:grid-cols-2">
            <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900">
                <h2 class="text-lg font-semibold text-gray-950 dark:text-white">Homepage references</h2>
                <p class="mb-4 text-sm text-gray-500">Invalid selections remain stored while the website uses a safe active fallback.</p>
                <div class="space-y-2">
                    @forelse ($invalidReferences as $reference)
                        <div class="flex items-center justify-between gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm">
                            <div>
                                <div class="font-medium text-gray-950">{{ $reference->name ?: 'Unknown villa' }}</div>
                                <div class="text-gray-600">{{ $reference->slot }} · #{{ $reference->lodgify_property_id }}</div>
                            </div>
                            <span class="text-xs font-semibold text-warning-700">{{ str_replace('_', ' ', $reference->management_status === 'removed_from_portfolio' ? $reference->management_status : ($reference->lodgify_status ?: 'missing')) }}</span>
                        </div>
                    @empty
                        <p class="text-sm text-gray-500">All homepage selections are valid.</p>
                    @endforelse
                </div>
            </div>

            <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900">
                <h2 class="text-lg font-semibold text-gray-950 dark:text-white">Recent property changes</h2>
                <div class="mt-4 space-y-3">
                    @forelse ($events as $event)
                        <div class="border-b border-gray-100 pb-3 text-sm last:border-0 dark:border-gray-800">
                            <div class="font-medium text-gray-950 dark:text-white">{{ str_replace('_', ' ', ucfirst($event->event_type)) }}</div>
                            <div class="text-gray-500">#{{ $event->lodgify_id }} · {{ $event->occurred_at->diffForHumans() }}</div>
                        </div>
                    @empty
                        <p class="text-sm text-gray-500">No property changes recorded yet.</p>
                    @endforelse
                </div>
            </div>
        </section>

        <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-900">
            <div class="p-5">
                <h2 class="text-lg font-semibold text-gray-950 dark:text-white">Recent sync runs</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                    <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800">
                        <tr><th class="px-5 py-3">Started</th><th class="px-5 py-3">Status</th><th class="px-5 py-3">Properties</th><th class="px-5 py-3">Changes</th><th class="px-5 py-3">Warnings</th></tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse ($runs as $run)
                            <tr><td class="whitespace-nowrap px-5 py-3">{{ $run->started_at->format('Y-m-d H:i:s') }}</td><td class="px-5 py-3 font-medium">{{ str_replace('_', ' ', $run->status) }}</td><td class="px-5 py-3">{{ $run->total_count }}</td><td class="px-5 py-3">{{ $run->changed_count }}</td><td class="px-5 py-3">{{ $run->warning_count }}</td></tr>
                        @empty
                            <tr><td colspan="5" class="px-5 py-6 text-center text-gray-500">No sync runs recorded.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-filament-panels::page>
