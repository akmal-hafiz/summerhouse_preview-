<x-filament-widgets::widget>
    <div
        class="relative overflow-hidden rounded-2xl border border-white/40 p-8"
        style="
            background: linear-gradient(135deg, rgba(46, 92, 69, 0.85) 0%, rgba(76, 132, 100, 0.75) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px rgba(46, 92, 69, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        "
    >
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div class="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl"></div>

        <div class="relative z-10">
            <p class="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                {{ $date }}
            </p>
            <h1 class="mt-3 text-4xl font-light tracking-tight text-white md:text-5xl">
                {{ $greeting }},
                <span class="font-semibold">{{ $name }}</span>
            </h1>
            <p class="mt-4 max-w-2xl text-base text-white/80">
                Welcome to the Summerhouses CMS. Manage homepage villa selections, page content,
                journal articles, and guest enquiries from one place.
            </p>
        </div>
    </div>
</x-filament-widgets::widget>
