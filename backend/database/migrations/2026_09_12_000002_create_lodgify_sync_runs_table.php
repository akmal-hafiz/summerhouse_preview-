<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lodgify_sync_runs', function (Blueprint $table) {
            $table->id();
            $table->uuid('run_uuid')->unique();
            $table->uuid('snapshot_version')->nullable()->index();
            $table->string('status', 40)->index();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->unsignedInteger('total_count')->default(0);
            $table->unsignedInteger('active_count')->default(0);
            $table->unsignedInteger('inactive_count')->default(0);
            $table->unsignedInteger('new_count')->default(0);
            $table->unsignedInteger('changed_count')->default(0);
            $table->unsignedInteger('suspected_missing_count')->default(0);
            $table->unsignedInteger('warning_count')->default(0);
            $table->unsignedInteger('error_count')->default(0);
            $table->string('error_category', 64)->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lodgify_sync_runs');
    }
};
