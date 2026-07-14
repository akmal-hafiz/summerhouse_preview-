<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('gallery_items', 'category')) {
            return;
        }

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->string('category', 40)->nullable()->after('label');
        });
    }

    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
