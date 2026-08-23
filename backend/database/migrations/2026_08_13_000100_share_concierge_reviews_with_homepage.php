<?php

use App\Models\Testimonial;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;

return new class extends Migration
{
    public function up(): void
    {
        if (Testimonial::query()->where('show_on_home', true)->exists()) {
            return;
        }

        Testimonial::query()
            ->where('show_on_concierge', true)
            ->where('type', Testimonial::TYPE_GUEST_REVIEW)
            ->update(['show_on_home' => true]);

        Cache::forget('cms.testimonials.home');
    }

    public function down(): void
    {
        // Review placement is editorial content, so rollback never removes a
        // placement that an administrator may have intentionally kept.
    }
};
