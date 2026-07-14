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
            if (!Schema::hasColumn('testimonials', 'villa_cache_id')) {
                $table->foreignId('villa_cache_id')
                    ->nullable()
                    ->after('page')
                    ->constrained('villa_caches')
                    ->nullOnDelete();
            }
            if (!Schema::hasColumn('testimonials', 'reviewer_email')) {
                $table->string('reviewer_email')->nullable()->after('location');
            }
            if (!Schema::hasColumn('testimonials', 'title')) {
                $table->string('title')->nullable()->after('reviewer_email');
            }
            if (!Schema::hasColumn('testimonials', 'source')) {
                $table->string('source', 32)->default('manual')->after('avatar');
            }
            if (!Schema::hasColumn('testimonials', 'source_label')) {
                $table->string('source_label')->nullable()->after('source');
            }
            if (!Schema::hasColumn('testimonials', 'external_review_id')) {
                $table->string('external_review_id')->nullable()->after('source_label');
            }
            if (!Schema::hasColumn('testimonials', 'external_url')) {
                $table->string('external_url', 512)->nullable()->after('external_review_id');
            }
            if (!Schema::hasColumn('testimonials', 'status')) {
                $table->string('status', 20)->default('approved')->after('external_url');
            }
            if (!Schema::hasColumn('testimonials', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('status');
            }
            if (!Schema::hasColumn('testimonials', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('is_verified');
            }
            if (!Schema::hasColumn('testimonials', 'stay_date')) {
                $table->date('stay_date')->nullable()->after('is_featured');
            }
            if (!Schema::hasColumn('testimonials', 'review_date')) {
                $table->date('review_date')->nullable()->after('stay_date');
            }
            if (!Schema::hasColumn('testimonials', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('review_date');
            }
            if (!Schema::hasColumn('testimonials', 'display_order')) {
                $table->integer('display_order')->nullable()->after('published_at');
            }
            if (!Schema::hasColumn('testimonials', 'created_by_id')) {
                $table->foreignId('created_by_id')->nullable()->after('display_order')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('testimonials', 'updated_by_id')) {
                $table->foreignId('updated_by_id')->nullable()->after('created_by_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('testimonials', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Backfill existing rows: mark as approved manual so About page keeps rendering.
        DB::table('testimonials')
            ->whereNull('published_at')
            ->update([
                'status' => 'approved',
                'source' => 'manual',
                'published_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
            ]);

        Schema::table('testimonials', function (Blueprint $table) {
            $table->index(['status', 'is_featured', 'published_at'], 'testimonials_public_idx');
            $table->index('villa_cache_id', 'testimonials_villa_idx');
            $table->index('source', 'testimonials_source_idx');
            $table->unique(['source', 'external_review_id'], 'testimonials_external_unique');
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropUnique('testimonials_external_unique');
            $table->dropIndex('testimonials_source_idx');
            $table->dropIndex('testimonials_villa_idx');
            $table->dropIndex('testimonials_public_idx');

            if (Schema::hasColumn('testimonials', 'updated_by_id')) {
                $table->dropConstrainedForeignId('updated_by_id');
            }
            if (Schema::hasColumn('testimonials', 'created_by_id')) {
                $table->dropConstrainedForeignId('created_by_id');
            }
            if (Schema::hasColumn('testimonials', 'villa_cache_id')) {
                $table->dropConstrainedForeignId('villa_cache_id');
            }
            $table->dropSoftDeletes();
            $table->dropColumn([
                'reviewer_email',
                'title',
                'source',
                'source_label',
                'external_review_id',
                'external_url',
                'status',
                'is_verified',
                'is_featured',
                'stay_date',
                'review_date',
                'published_at',
                'display_order',
            ]);
        });
    }
};
