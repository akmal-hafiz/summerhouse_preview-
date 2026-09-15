<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lodgify_incidents', function (Blueprint $table) {
            $table->id();
            $table->uuid('incident_uuid')->unique();
            $table->string('fingerprint', 64)->unique();
            $table->string('severity', 16)->index();
            $table->string('category', 64)->index();
            $table->string('status', 24)->default('open')->index();
            $table->string('title', 255);
            $table->text('message');
            $table->string('lodgify_id', 32)->nullable()->index();
            $table->string('reference_type', 64)->nullable();
            $table->string('reference_key', 255)->nullable();
            $table->timestamp('first_seen_at');
            $table->timestamp('last_seen_at');
            $table->unsignedInteger('occurrence_count')->default(1);
            $table->uuid('first_run_uuid')->nullable();
            $table->uuid('latest_run_uuid')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->unsignedBigInteger('acknowledged_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestamps();
            $table->index(['status', 'severity', 'last_seen_at'], 'lodgify_incidents_health_idx');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('lodgify_incidents');
    }
};
