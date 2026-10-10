<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bali_collections', function (Blueprint $table): void {
            $table->string('book_cover_image', 500)->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('bali_collections', function (Blueprint $table): void {
            $table->dropColumn('book_cover_image');
        });
    }
};
