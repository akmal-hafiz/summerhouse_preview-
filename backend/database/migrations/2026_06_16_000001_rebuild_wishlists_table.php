<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('wishlists') && !Schema::hasColumn('wishlists', 'user_id')) {
            Schema::drop('wishlists');
        }

        if (!Schema::hasTable('wishlists')) {
            Schema::create('wishlists', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('lodgify_property_id', 20);
                $table->timestamps();

                $table->unique(['user_id', 'lodgify_property_id']);
                $table->index('lodgify_property_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
