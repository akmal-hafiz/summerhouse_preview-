<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_villa_selections', function (Blueprint $table) {
            $table->id();
            $table->string('slot', 50)->index();
            $table->string('lodgify_property_id', 20);
            $table->integer('sort_order')->default(0);
            $table->string('override_title', 255)->nullable();
            $table->text('override_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_villa_selections');
    }
};
