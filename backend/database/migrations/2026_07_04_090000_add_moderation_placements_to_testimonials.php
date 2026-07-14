<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            if (!Schema::hasColumn('testimonials', 'show_on_villa')) {
                $table->boolean('show_on_villa')->default(false)->after('is_featured');
            }
            if (!Schema::hasColumn('testimonials', 'show_on_about')) {
                $table->boolean('show_on_about')->default(false)->after('show_on_villa');
            }
            if (!Schema::hasColumn('testimonials', 'show_on_home')) {
                $table->boolean('show_on_home')->default(false)->after('show_on_about');
            }
            if (!Schema::hasColumn('testimonials', 'is_pinned')) {
                $table->boolean('is_pinned')->default(false)->after('show_on_home');
            }
            if (!Schema::hasColumn('testimonials', 'moderated_by_id')) {
                $table->foreignId('moderated_by_id')->nullable()->after('updated_by_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('testimonials', 'moderated_at')) {
                $table->timestamp('moderated_at')->nullable()->after('moderated_by_id');
            }
            if (!Schema::hasColumn('testimonials', 'edited_at')) {
                $table->timestamp('edited_at')->nullable()->after('moderated_at');
            }
        });

        // Backfill placements from the legacy single `page` column so existing
        // testimonials keep appearing exactly where they do today.
        DB::table('testimonials')->where('page', 'about')->update(['show_on_about' => true]);
        DB::table('testimonials')->where('page', 'home')->update(['show_on_home' => true]);
        DB::table('testimonials')->whereNotNull('villa_cache_id')->update(['show_on_villa' => true]);

        Schema::table('testimonials', function (Blueprint $table) {
            $table->index(['status', 'show_on_about'], 'testimonials_about_idx');
            $table->index(['status', 'show_on_home'], 'testimonials_home_idx');
            $table->index(['status', 'show_on_villa', 'villa_cache_id'], 'testimonials_villa_show_idx');
        });

        if (!Schema::hasTable('testimonial_audits')) {
            Schema::create('testimonial_audits', function (Blueprint $table) {
                $table->id();
                $table->foreignId('testimonial_id')->constrained('testimonials')->cascadeOnDelete();
                $table->string('action', 40);
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('notes', 500)->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['testimonial_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonial_audits');

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropIndex('testimonials_about_idx');
            $table->dropIndex('testimonials_home_idx');
            $table->dropIndex('testimonials_villa_show_idx');

            if (Schema::hasColumn('testimonials', 'moderated_by_id')) {
                $table->dropConstrainedForeignId('moderated_by_id');
            }
            $table->dropColumn([
                'show_on_villa',
                'show_on_about',
                'show_on_home',
                'is_pinned',
                'moderated_at',
                'edited_at',
            ]);
        });
    }
};
