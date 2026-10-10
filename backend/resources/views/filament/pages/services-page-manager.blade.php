<x-filament-panels::page>
    <link rel="stylesheet" href="{{ asset('css/services-section-hub.css') }}">

    @if ($this->activeSection)
        @php($definition = $this->getActiveSectionDefinition())

        <header class="services-editor-header">
            <div class="services-editor-header__copy">
                <a class="services-editor-back" href="{{ $this->getHubUrl() }}">
                    <x-filament::icon icon="heroicon-o-arrow-left" />
                    <span>Services sections</span>
                </a>
                <h2>{{ $definition['label'] }}</h2>
                <p>{{ $definition['description'] }}</p>
            </div>

            <a class="services-hub-button services-hub-button--secondary" href="{{ $this->getPublicServicesUrl() }}#{{ $definition['anchor'] }}" target="_blank" rel="noopener noreferrer">
                <span>View on website</span>
                <x-filament::icon icon="heroicon-o-arrow-up-right" />
            </a>
        </header>

        <form wire:submit="save" class="services-section-editor-form">
            {{ $this->form }}
            <div class="services-editor-actions">
                <a class="services-hub-button services-hub-button--secondary" href="{{ $this->getHubUrl() }}">Cancel</a>
                {{ $this->getFormActions()[0] }}
            </div>
        </form>

        @if ($this->getRelatedContentUrl())
            <section class="services-related-panel">
                <div>
                    <p class="services-related-panel__label">Related content</p>
                    <h3>Content records for this section</h3>
                    <p>These records stay separate so each item can be reviewed, ordered, and published independently.</p>
                </div>
                <a class="services-hub-button services-hub-button--secondary" href="{{ $this->getRelatedContentUrl() }}">
                    {{ $this->getRelatedContentLabel() }}
                    <x-filament::icon icon="heroicon-o-arrow-right" />
                </a>
            </section>
        @endif

        @if ($this->activeSection === 'faq_intro')
            <section class="services-related-panel" aria-labelledby="services-faq-records-title">
                <div>
                    <p class="services-related-panel__label">Related content</p>
                    <h3 id="services-faq-records-title">Services page questions</h3>
                    <p>Questions can be reordered and published independently from the section introduction.</p>
                </div>
            </section>
            {{ $this->table }}
        @endif
    @else
        @php($cards = $this->getSectionCards())
        @php($liveCount = collect($cards)->where('is_visible', true)->count())
        @php($reviewCount = collect($cards)->where('is_complete', false)->count())

        <header class="services-hub-header">
            <div class="services-hub-header__copy">
                <p class="services-hub-kicker">Website content</p>
                <h2>Services page sections</h2>
                <p>Edit one section at a time. Accordion points, owner testimonials, and FAQ questions remain controlled records with their own review status.</p>
            </div>
            <a class="services-hub-button services-hub-button--primary" href="{{ $this->getPublicServicesUrl() }}" target="_blank" rel="noopener noreferrer">
                <span>View Services page</span>
                <x-filament::icon icon="heroicon-o-arrow-up-right" />
            </a>
        </header>

        <div class="services-hub-summary" aria-label="Services page status summary">
            <div><strong>{{ count($cards) }}</strong><span>Managed sections</span></div>
            <div><strong>{{ $liveCount }}</strong><span>Visible on website</span></div>
            <div><strong>{{ $reviewCount }}</strong><span>{{ $reviewCount === 1 ? 'Needs review' : 'Need review' }}</span></div>
        </div>

        <div class="services-section-grid">
            @foreach ($cards as $index => $card)
                <article class="services-section-card">
                    <div class="services-section-card__topline">
                        <span class="services-section-card__number">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                        <span class="services-section-status {{ $card['is_visible'] ? 'is-live' : 'is-hidden' }}">{{ $card['is_visible'] ? 'Live' : 'Hidden' }}</span>
                    </div>
                    <div class="services-section-card__icon" aria-hidden="true"><x-filament::icon :icon="$card['icon']" /></div>
                    <div class="services-section-card__copy">
                        <h3>{{ $card['label'] }}</h3>
                        <p>{{ $card['description'] }}</p>
                    </div>
                    <div class="services-section-card__meta">
                        <span class="{{ $card['is_complete'] ? 'is-complete' : 'needs-review' }}">
                            <x-filament::icon :icon="$card['is_complete'] ? 'heroicon-o-check-circle' : 'heroicon-o-exclamation-circle'" />
                            {{ $card['is_complete'] ? 'Content ready' : 'Review content' }}
                        </span>
                        <time datetime="{{ $card['updated_at']?->toIso8601String() }}">{{ $card['updated_at'] ? 'Updated '.$card['updated_at']->diffForHumans() : 'Using website defaults' }}</time>
                    </div>
                    <div class="services-section-card__actions">
                        <a class="services-section-edit" href="{{ $card['edit_url'] }}"><span>Edit section</span><x-filament::icon icon="heroicon-o-arrow-right" /></a>
                        <a class="services-section-preview" href="{{ $card['preview_url'] }}" target="_blank" rel="noopener noreferrer" aria-label="View {{ $card['label'] }} on the website"><x-filament::icon icon="heroicon-o-arrow-up-right" /></a>
                    </div>
                </article>
            @endforeach
        </div>

        <aside class="services-hub-note">
            <x-filament::icon icon="heroicon-o-information-circle" />
            <div>
                <strong>Structured content stays protected</strong>
                <p>Service points, testimonials, and FAQs keep their existing approval and ordering workflow. This hub edits only the page presentation around them.</p>
            </div>
        </aside>
    @endif
</x-filament-panels::page>
