<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('testimonials') && !Schema::hasColumn('testimonials', 'page')) {
            Schema::drop('testimonials');
        }

        if (Schema::hasTable('testimonials')) {
            return;
        }

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('page', 50)->index();
            $table->string('author');
            $table->string('location')->nullable();
            $table->unsignedTinyInteger('stars')->default(5);
            $table->text('text');
            $table->string('avatar', 500)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
