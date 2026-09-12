<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('villa_caches', function (Blueprint $table) {
            $table->string('lodgify_status', 32)->default('active')->index();
            $table->json('rooms_raw')->nullable();
            $table->timestamp('last_seen_at')->nullable()->index();
            $table->timestamp('last_full_sync_at')->nullable();
            $table->unsignedSmallInteger('consecutive_missing_count')->default(0);
            $table->uuid('snapshot_version')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('villa_caches', function (Blueprint $table) {
            $table->dropIndex(['lodgify_status']);
            $table->dropIndex(['last_seen_at']);
            $table->dropIndex(['snapshot_version']);
            $table->dropColumn(['lodgify_status', 'rooms_raw', 'last_seen_at', 'last_full_sync_at', 'consecutive_missing_count', 'snapshot_version']);
        });
    }
};
