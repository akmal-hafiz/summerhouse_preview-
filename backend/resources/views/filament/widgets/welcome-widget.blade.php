<x-filament-widgets::widget>
    <div class="sh-dash">
        {{-- Greeting --}}
        <div class="sh-greeting">
            <span class="sh-greeting-pill">Welcome back, {{ $name }} 👋</span>
            <p class="sh-greeting-sub">What would you like to publish today?</p>
        </div>

        {{-- Context row --}}
        <div class="sh-grid-2">
            {{-- Sticky note: quick CMS shortcuts --}}
            <div class="sh-note">
                <div class="sh-note-head">
                    <span class="sh-eyebrow">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        Quick shortcuts
                    </span>
                </div>
                <div class="sh-note-list">
                    <a href="/admin/homepage-managers" class="sh-note-link">
                        <span class="sh-glyph sh-glyph--amber">H</span>
                        <span class="sh-note-link-body">
                            <span class="sh-note-link-title">Homepage Manager</span>
                            <span class="sh-note-link-sub">Villa selections, collections &amp; copy</span>
                        </span>
                    </a>
                    <a href="/admin/articles" class="sh-note-link">
                        <span class="sh-glyph sh-glyph--pink">J</span>
                        <span class="sh-note-link-body">
                            <span class="sh-note-link-title">Summerhouses Journal</span>
                            <span class="sh-note-link-sub">Write articles &amp; island notes</span>
                        </span>
                    </a>
                    <a href="/admin/gallery-items" class="sh-note-link">
                        <span class="sh-glyph sh-glyph--green">G</span>
                        <span class="sh-note-link-body">
                            <span class="sh-note-link-title">Gallery Manager</span>
                            <span class="sh-note-link-sub">Curate high-res villa photos &amp; video</span>
                        </span>
                    </a>
                </div>
            </div>

            {{-- Latest guest inquiry --}}
            <div class="sh-card sh-card-split">
                <div>
                    <span class="sh-eyebrow">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        Latest guest inquiry
                    </span>
                    <div class="sh-inquiry">
                        <span class="sh-avatar">G</span>
                        <div>
                            <p class="sh-inquiry-title">Private airport transfer &amp; in-villa chef request</p>
                            <p class="sh-inquiry-sub">Awaiting reply from the concierge team</p>
                        </div>
                    </div>
                </div>
                <div class="sh-card-foot">
                    <span class="sh-status">
                        <span class="sh-dot"></span>
                        Status: <strong>Unread submission</strong>
                    </span>
                    <a href="/admin/contact-submissions" class="sh-link">
                        Open inbox
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </a>
                </div>
            </div>
        </div>

        {{-- Suggested actions --}}
        <div class="sh-grid-2">
            <a href="/admin/homepage-managers" class="sh-suggest">
                <span class="sh-suggest-main">
                    <span class="sh-suggest-icon sh-suggest-icon--sky">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5"></path>
                        </svg>
                    </span>
                    <span>
                        <p class="sh-suggest-eyebrow">Suggested action</p>
                        <p class="sh-suggest-title">Refresh featured villa lineup</p>
                    </span>
                </span>
                <span class="sh-suggest-arrow">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
            </a>

            <a href="/admin/articles/create" class="sh-suggest">
                <span class="sh-suggest-main">
                    <span class="sh-suggest-icon sh-suggest-icon--sage">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </span>
                    <span>
                        <p class="sh-suggest-eyebrow">Suggested action</p>
                        <p class="sh-suggest-title">Draft a new journal post</p>
                    </span>
                </span>
                <span class="sh-suggest-arrow">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
            </a>
        </div>

        {{-- Prompt bar --}}
        <div class="sh-prompt">
            <span class="sh-prompt-spark">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
            </span>
            <input type="text" placeholder="Search villas, articles, collections or guest inquiries…" />
            <button type="button" class="sh-prompt-send" aria-label="Search">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
            </button>
        </div>
    </div>
</x-filament-widgets::widget>
