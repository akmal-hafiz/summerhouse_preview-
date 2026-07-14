<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('gallery_items', 'lodgify_property_id')) {
            return;
        }

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->string('lodgify_property_id', 20)->nullable()->after('video_poster');
        });
    }

    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropColumn('lodgify_property_id');
        });
    }
};
