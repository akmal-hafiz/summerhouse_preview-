<x-filament-panels::page>
    <link rel="stylesheet" href="{{ asset('css/about-section-hub.css') }}">

    @if ($this->activeSection)
        @php($definition = $this->getActiveSectionDefinition())

        <header class="about-editor-header">
            <div class="about-editor-header__copy">
                <a class="about-editor-back" href="{{ $this->getHubUrl() }}">
                    <x-filament::icon icon="heroicon-o-arrow-left" />
                    <span>About sections</span>
                </a>
                <h2>{{ $definition['label'] }}</h2>
                <p>{{ $definition['description'] }}</p>
            </div>

            <a
                class="about-hub-button about-hub-button--secondary"
                href="{{ $this->getPublicAboutUrl() }}#{{ $definition['anchor'] }}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span>View on website</span>
                <x-filament::icon icon="heroicon-o-arrow-up-right" />
            </a>
        </header>

        <form wire:submit="save" class="about-section-editor-form">
            {{ $this->form }}

            <div class="about-editor-actions">
                <a class="about-hub-button about-hub-button--secondary" href="{{ $this->getHubUrl() }}">Cancel</a>
                {{ $this->getFormActions()[0] }}
            </div>
        </form>

        @if ($this->activeSection === 'faq_intro')
            <section class="about-related-panel" aria-labelledby="about-faq-records-title">
                <div>
                    <p class="about-related-panel__label">Related content</p>
                    <h3 id="about-faq-records-title">About page questions</h3>
                    <p>Questions remain separate records, so they can be reordered and published independently.</p>
                </div>
            </section>

            {{ $this->table }}
        @elseif ($this->activeSection === 'journal_preview')
            <section class="about-related-panel about-related-panel--journal" aria-labelledby="about-journal-records-title">
                <div>
                    <p class="about-related-panel__label">Publishing workspace</p>
                    <h3 id="about-journal-records-title">Stories shown in The Journal</h3>
                    <p>Published articles appear immediately. The four newest publication dates are selected automatically for the About page.</p>
                </div>
                <a class="about-hub-button about-hub-button--primary" href="{{ $this->getCreateArticleUrl() }}">
                    <x-filament::icon icon="heroicon-o-plus" />
                    <span>Add article</span>
                </a>
            </section>

            <div class="about-journal-table">
                {{ $this->table }}
            </div>
        @endif
    @else
        @php($cards = $this->getSectionCards())
        @php($liveCount = collect($cards)->where('is_visible', true)->count())
        @php($reviewCount = collect($cards)->where('is_complete', false)->count())

        <header class="about-hub-header">
            <div class="about-hub-header__copy">
                <p class="about-hub-kicker">Website content</p>
                <h2>About page sections</h2>
                <p>Edit one section at a time. Villa totals and destination information continue to update automatically.</p>
            </div>

            <a
                class="about-hub-button about-hub-button--primary"
                href="{{ $this->getPublicAboutUrl() }}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span>View About page</span>
                <x-filament::icon icon="heroicon-o-arrow-up-right" />
            </a>
        </header>

        <div class="about-hub-summary" aria-label="About page status summary">
            <div>
                <strong>{{ count($cards) }}</strong>
                <span>Managed sections</span>
            </div>
            <div>
                <strong>{{ $liveCount }}</strong>
                <span>Visible on website</span>
            </div>
            <div>
                <strong>{{ $reviewCount }}</strong>
                <span>{{ $reviewCount === 1 ? 'Needs review' : 'Need review' }}</span>
            </div>
        </div>

        <div class="about-section-grid">
            @foreach ($cards as $index => $card)
                <article class="about-section-card">
                    <div class="about-section-card__topline">
                        <span class="about-section-card__number">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                        <span class="about-section-status {{ $card['is_visible'] ? 'is-live' : 'is-hidden' }}">
                            {{ $card['is_visible'] ? 'Live' : 'Hidden' }}
                        </span>
                    </div>

                    <div class="about-section-card__icon" aria-hidden="true">
                        <x-filament::icon :icon="$card['icon']" />
                    </div>

                    <div class="about-section-card__copy">
                        <h3>{{ $card['label'] }}</h3>
                        <p>{{ $card['description'] }}</p>
                    </div>

                    <div class="about-section-card__meta">
                        <span class="{{ $card['is_complete'] ? 'is-complete' : 'needs-review' }}">
                            <x-filament::icon :icon="$card['is_complete'] ? 'heroicon-o-check-circle' : 'heroicon-o-exclamation-circle'" />
                            {{ $card['is_complete'] ? 'Content ready' : 'Review content' }}
                        </span>
                        <time datetime="{{ $card['updated_at']?->toIso8601String() }}">
                            {{ $card['updated_at'] ? 'Updated '.$card['updated_at']->diffForHumans() : 'Not saved yet' }}
                        </time>
                    </div>

                    <div class="about-section-card__actions">
                        <a class="about-section-edit" href="{{ $card['edit_url'] }}">
                            <span>Edit section</span>
                            <x-filament::icon icon="heroicon-o-arrow-right" />
                        </a>
                        <a
                            class="about-section-preview"
                            href="{{ $card['preview_url'] }}"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View {{ $card['label'] }} on the website"
                        >
                            <x-filament::icon icon="heroicon-o-arrow-up-right" />
                        </a>
                    </div>
                </article>
            @endforeach
        </div>

        <aside class="about-hub-note">
            <x-filament::icon icon="heroicon-o-information-circle" />
            <div>
                <strong>Automatic website data stays automatic</strong>
                <p>Destination Footprint uses active villa locations and counts. The Journal shows the latest published stories by date.</p>
            </div>
        </aside>
    @endif
</x-filament-panels::page>
