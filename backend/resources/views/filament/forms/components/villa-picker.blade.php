@php
    $statePath = $getStatePath();
    $current = $getState();
    $villas = $getVillas();
    $buckets = $getBedroomBuckets();
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore.self
        x-data="villaPicker({
            statePath: @js($statePath),
            initial: @js($current),
            villas: @js($villas),
        })"
        x-init="init()"
        class="villa-picker"
    >
        <button
            type="button"
            @click="open = true"
            class="villa-picker-preview"
            :class="{ 'is-empty': !selected }"
        >
            <template x-if="selected">
                <div class="villa-picker-preview-inner">
                    <template x-if="selected.thumbnail">
                        <img :src="selected.thumbnail" :alt="selected.name" class="villa-picker-preview-img" />
                    </template>
                    <template x-if="!selected.thumbnail">
                        <div class="villa-picker-preview-img villa-picker-thumb-fallback" x-text="selected.name?.slice(0, 2)"></div>
                    </template>
                    <div class="villa-picker-preview-body">
                        <span class="villa-picker-preview-name" x-text="selected.name"></span>
                        <span class="villa-picker-preview-meta">
                            <span x-text="'#' + selected.id"></span>
                            <template x-if="selected.bedrooms">
                                <span>&middot; <span x-text="selected.bedrooms"></span> BR</span>
                            </template>
                            <template x-if="selected.max_guests">
                                <span>&middot; <span x-text="selected.max_guests"></span> guests</span>
                            </template>
                            <template x-if="selected.location">
                                <span>&middot; <span x-text="selected.location"></span></span>
                            </template>
                        </span>
                    </div>
                    <span class="villa-picker-preview-cta">Change</span>
                </div>
            </template>
            <template x-if="!selected">
                <div class="villa-picker-preview-empty">
                    <span class="villa-picker-preview-empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="22" height="22">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12 12 2.25 21.75 12M4.5 9.75v10.125a1.125 1.125 0 0 0 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125a1.125 1.125 0 0 0 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </span>
                    <span class="villa-picker-preview-empty-text">
                        <strong>Pick a villa</strong>
                        <small>Browse all Lodgify properties</small>
                    </span>
                    <span class="villa-picker-preview-cta">Browse</span>
                </div>
            </template>
        </button>

        <template x-teleport="body">
            <div
                x-show="open"
                x-cloak
                class="villa-picker-modal-root"
                @keydown.escape.window="open = false"
            >
                <div class="villa-picker-modal-backdrop" @click="open = false" x-transition.opacity></div>
                <div
                    class="villa-picker-modal"
                    x-transition:enter="vp-enter"
                    x-transition:enter-start="vp-enter-from"
                    x-transition:enter-end="vp-enter-to"
                >
                    <div class="villa-picker-modal-header">
                        <div class="villa-picker-modal-title">
                            <h2>Choose a villa</h2>
                            <p><span x-text="filtered.length"></span> of <span x-text="villas.length"></span> villas</p>
                        </div>
                        <button type="button" @click="open = false" class="villa-picker-close" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div class="villa-picker-toolbar">
                        <div class="villa-picker-search">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="m20 20-3.5-3.5"/></svg>
                            <input type="search" x-model="search" placeholder="Search by name, location, or ID..." autocomplete="off" />
                        </div>
                        <div class="villa-picker-filters">
                            <button type="button" :class="{ active: bedroomFilter === null }" @click="bedroomFilter = null">All</button>
                            @foreach ($buckets as $n)
                                <button type="button" :class="{ active: bedroomFilter === {{ $n }} }" @click="bedroomFilter = {{ $n }}">{{ $n }} BR{{ $n >= 5 ? '+' : '' }}</button>
                            @endforeach
                        </div>
                    </div>

                    <div class="villa-picker-grid">
                        <template x-for="villa in filtered" :key="villa.id">
                            <button type="button" class="villa-card" :class="{ 'is-selected': selected && selected.id === villa.id }" @click="pick(villa)">
                                <div class="villa-card-thumb">
                                    <template x-if="villa.thumbnail">
                                        <img :src="villa.thumbnail" :alt="villa.name" loading="lazy" />
                                    </template>
                                    <template x-if="!villa.thumbnail">
                                        <div class="villa-card-thumb-fallback" x-text="villa.name?.slice(0, 2)"></div>
                                    </template>
                                    <span class="villa-card-id" x-text="'#' + villa.id"></span>
                                </div>
                                <div class="villa-card-body">
                                    <span class="villa-card-name" x-text="villa.name"></span>
                                    <span class="villa-card-meta">
                                        <template x-if="villa.bedrooms">
                                            <span class="villa-card-chip" x-text="villa.bedrooms + ' BR'"></span>
                                        </template>
                                        <template x-if="villa.max_guests">
                                            <span class="villa-card-chip" x-text="villa.max_guests + ' guests'"></span>
                                        </template>
                                    </span>
                                    <template x-if="villa.location">
                                        <span class="villa-card-location" x-text="villa.location"></span>
                                    </template>
                                </div>
                                <span class="villa-card-check">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                                </span>
                            </button>
                        </template>
                        <template x-if="filtered.length === 0">
                            <div class="villa-picker-empty">No villas match.</div>
                        </template>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <script>
        if (!window.villaPicker) {
            window.villaPicker = function ({ statePath, initial, villas }) {
                return {
                    statePath, villas, selected: null, open: false, search: '', bedroomFilter: null,
                    init() {
                        if (initial) this.selected = this.villas.find(v => String(v.id) === String(initial)) ?? null;
                        this.$watch('open', (v) => { document.body.style.overflow = v ? 'hidden' : ''; });
                    },
                    get filtered() {
                        const q = this.search.trim().toLowerCase();
                        const br = this.bedroomFilter;
                        return this.villas.filter(v => {
                            if (br !== null) {
                                if (br >= 5 ? !(v.bedrooms >= 5) : v.bedrooms !== br) return false;
                            }
                            if (!q) return true;
                            return [v.name, v.location, String(v.id)].filter(Boolean).some(s => s.toLowerCase().includes(q));
                        });
                    },
                    pick(villa) {
                        this.selected = villa;
                        this.$wire.set(this.statePath, villa.id);
                        this.open = false;
                    },
                };
            };
        }
    </script>
</x-dynamic-component>
