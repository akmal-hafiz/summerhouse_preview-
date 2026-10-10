<x-filament-panels::page>
    <link rel="stylesheet" href="{{ asset('css/lodgify-health.css') }}">

    <div class="sh-health" wire:poll.60s>
        @php
            $statusCopy = match ($health['status']) {
                'green' => ['Villa data is current', 'The latest successful update is within the expected window.'],
                'yellow' => ['Villa data needs attention', 'Updates are running late or a warning needs review.'],
                default => ['Villa updates are delayed', 'The website continues using the last saved villa data while updates are checked.'],
            };
            $metrics = [
                ['key' => 'active', 'label' => 'Active', 'help' => 'Managed villas currently eligible for the website'],
                ['key' => 'inactive', 'label' => 'Temporarily inactive', 'help' => 'Managed villas not currently published'],
                ['key' => 'suspected_missing', 'label' => 'Needs checking', 'help' => 'Not found in the latest complete update'],
                ['key' => 'missing', 'label' => 'Missing', 'help' => 'Confirmed absent after repeated checks'],
                ['key' => 'removed', 'label' => 'Left our portfolio', 'help' => 'Excluded by a Summerhouses portfolio decision'],
            ];
        @endphp

        <section class="sh-health__status sh-health__status--{{ $health['status'] }}" aria-label="Villa data health">
            <div>
                <p class="sh-health__overline">Current status</p>
                <h2>{{ $statusCopy[0] }}</h2>
                <p>{{ $statusCopy[1] }}</p>
            </div>
            <div class="sh-health__status-aside">
                <span>Last successful update</span>
                <strong>{{ $health['last_successful_sync']?->finished_at?->diffForHumans() ?? 'Not yet recorded' }}</strong>
                @if ($health['status'] !== 'green')
                    <small>Use Sync now above, then check the result below. If updates remain delayed, contact site support.</small>
                @endif
            </div>
        </section>

        <section class="sh-health__metrics" aria-label="Villa status counts">
            @foreach ($metrics as $metric)
                <div class="sh-health__metric sh-health__metric--{{ $metric['key'] }}">
                    <strong>{{ $health['counts'][$metric['key']] }}</strong>
                    <span>{{ $metric['label'] }}</span>
                    <small>{{ $metric['help'] }}</small>
                </div>
            @endforeach
        </section>
        <p class="sh-health__count-note">Each villa is counted once. “Left our portfolio” is separate from availability and missing-data counts.</p>

        <div class="sh-health__columns">
            <section class="sh-health__panel" aria-labelledby="sh-health-incidents-title">
                <header class="sh-health__panel-heading">
                    <div><h2 id="sh-health-incidents-title">Needs attention</h2><p>Issues that are still open or acknowledged.</p></div>
                    <span class="sh-health__count">{{ $incidents->count() }}</span>
                </header>
                <div class="sh-health__list">
                    @forelse ($incidents as $incident)
                        @php
                            $incidentVillaName = $incident->lodgify_id
                                ? ($villaNamesById[$incident->lodgify_id] ?? null)
                                : null;
                        @endphp
                        <article class="sh-health__item">
                            <div class="sh-health__item-main">
                                <span class="sh-health__severity sh-health__severity--{{ $incident->severity }}">{{ ucfirst($incident->severity) }}</span>
                                <h3>{{ $incidentVillaName ?: $incident->title }}</h3>
                                @if ($incident->lodgify_id)
                                    <p class="sh-health__meta">Villa ID {{ $incident->lodgify_id }}</p>
                                    <p class="sh-health__item-kind">{{ $incident->title }}</p>
                                @endif
                                <p>{{ $incident->message }}</p>
                                <small>Last seen {{ $incident->last_seen_at?->diffForHumans() ?? 'recently' }} · {{ $incident->occurrence_count }} occurrence(s)</small>
                            </div>
                            @if ($incident->status === 'open')
                                <button type="button" wire:click="acknowledgeIncident({{ $incident->id }})" class="sh-health__button">Acknowledge</button>
                            @endif
                        </article>
                    @empty
                        <p class="sh-health__empty">No open issues need attention.</p>
                    @endforelse
                </div>
            </section>

            <section class="sh-health__panel" aria-labelledby="sh-health-homepage-title">
                <header class="sh-health__panel-heading">
                    <div><h2 id="sh-health-homepage-title">Homepage references</h2><p>Saved choices that currently need a safe replacement.</p></div>
                    <span class="sh-health__count">{{ $invalidReferences->count() }}</span>
                </header>
                <div class="sh-health__list">
                    @forelse ($invalidReferences as $reference)
                        @php
                            $referenceStatus = $reference->management_status === 'removed_from_portfolio'
                                ? 'Left our portfolio'
                                : ($reference->lodgify_status === 'suspected_missing' ? 'Needs checking' : 'Missing from latest update');
                        @endphp
                        <div class="sh-health__item sh-health__item--reference">
                            <div class="sh-health__item-main">
                                <h3>{{ $reference->name ?: 'Villa name unavailable' }}</h3>
                                <p class="sh-health__meta">{{ \Illuminate\Support\Str::headline($reference->slot) }} · Villa ID {{ $reference->lodgify_property_id }}</p>
                                <p class="sh-health__item-kind">{{ $referenceStatus }}</p>
                            </div>
                        </div>
                    @empty
                        <p class="sh-health__empty">All saved homepage choices currently have a valid villa.</p>
                    @endforelse
                </div>
            </section>
        </div>

        <section class="sh-health__panel" aria-labelledby="sh-health-changes-title">
            <header class="sh-health__panel-heading"><div><h2 id="sh-health-changes-title">Recent villa changes</h2><p>Names first, with IDs retained for support and audit.</p></div></header>
            <div class="sh-health__list sh-health__list--changes">
                @forelse ($events as $event)
                    @php
                        $eventVillaName = $event->villa?->name
                            ?: ($villaNamesById[$event->lodgify_id] ?? null)
                            ?: data_get($event->changes, 'name.to')
                            ?: data_get($event->changes, 'name.from');
                        $eventLabel = match ($event->event_type) {
                            'property_missing_confirmed' => 'Confirmed missing',
                            'property_suspected_missing' => 'Needs checking',
                            'property_new' => 'New villa found',
                            'public_fields_changed' => 'Public details changed',
                            'client_decision_recorded' => 'Portfolio decision recorded',
                            default => \Illuminate\Support\Str::headline($event->event_type),
                        };
                    @endphp
                    <div class="sh-health__change-row">
                        <div><strong>{{ $eventVillaName ?: 'Villa name unavailable' }}</strong><small>Villa ID {{ $event->lodgify_id }}</small></div>
                        <span>{{ $eventLabel }}</span>
                        <time datetime="{{ $event->occurred_at?->toIso8601String() }}">{{ $event->occurred_at?->diffForHumans() ?? 'Recently' }}</time>
                    </div>
                @empty
                    <p class="sh-health__empty">No villa changes recorded yet.</p>
                @endforelse
            </div>
        </section>

        <section class="sh-health__panel" aria-labelledby="sh-health-runs-title">
            <header class="sh-health__panel-heading"><div><h2 id="sh-health-runs-title">Recent sync runs</h2><p>A queued update appears here only after a worker starts it.</p></div></header>
            <div class="sh-health__table-scroll">
                <table class="sh-health__table">
                    <thead><tr><th scope="col">Started</th><th scope="col">Result</th><th scope="col">Villas checked</th><th scope="col">Changes</th><th scope="col">Warnings</th></tr></thead>
                    <tbody>
                        @forelse ($runs as $run)
                            <tr>
                                <td><time datetime="{{ $run->started_at?->toIso8601String() }}">{{ $run->started_at?->format('d M Y, H:i') ?? 'Unknown' }}</time></td>
                                <td>{{ \Illuminate\Support\Str::headline($run->status) }}</td>
                                <td>{{ $run->total_count ?? 0 }}</td>
                                <td>{{ $run->changed_count ?? 0 }}</td>
                                <td>{{ $run->warning_count ?? 0 }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="5" class="sh-health__empty">No sync runs recorded yet.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-filament-panels::page>
