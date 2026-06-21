<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('gallery_items')) {
            return;
        }

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['image', 'text', 'video']);
            $table->string('src', 500)->nullable();
            $table->text('alt')->nullable();
            $table->string('label')->nullable();
            $table->string('title')->nullable();
            $table->text('text')->nullable();
            $table->string('video_url', 500)->nullable();
            $table->string('video_poster', 500)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
    }
};
