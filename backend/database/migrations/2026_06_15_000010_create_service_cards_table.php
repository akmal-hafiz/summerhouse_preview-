<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('service_cards')) {
            return;
        }

        Schema::create('service_cards', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['operational', 'marketing', 'project']);
            $table->string('title');
            $table->text('text');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_cards');
    }
};
