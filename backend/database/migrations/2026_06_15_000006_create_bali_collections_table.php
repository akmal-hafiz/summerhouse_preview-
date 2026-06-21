<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bali_collections', function (Blueprint $table) {
            $table->id();
            $table->string('collection_id', 80)->unique();
            $table->string('location');
            $table->string('category');
            $table->string('tag');
            $table->json('moods')->nullable();
            $table->text('description');
            $table->json('highlights')->nullable();
            $table->json('best_for')->nullable();
            $table->json('facts')->nullable();
            $table->string('villa_count');
            $table->string('price');
            $table->string('cta');
            $table->string('href');
            $table->string('image', 500);
            $table->string('image_alt', 500)->nullable();
            $table->json('gallery_images')->nullable();
            $table->json('lifestyle_pillars')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bali_collections');
    }
};
