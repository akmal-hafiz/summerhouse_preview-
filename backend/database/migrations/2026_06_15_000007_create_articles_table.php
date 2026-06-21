<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('category')->nullable();
            $table->date('date')->nullable();
            $table->string('read_time', 20)->nullable();
            $table->string('hero_image', 500)->nullable();
            $table->string('hero_alt', 500)->nullable();
            $table->json('tags')->nullable();
            $table->json('content')->nullable();
            $table->string('author_name')->default('Summerhouses Team');
            $table->string('author_role')->nullable();
            $table->text('author_bio')->nullable();
            $table->string('author_avatar', 500)->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
