<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_villa_selections', function (Blueprint $table) {
            $table->string('award_name')->nullable()->after('override_description');
            $table->string('award_issuer')->nullable()->after('award_name');
            $table->string('award_year', 12)->nullable()->after('award_issuer');
            $table->text('award_url')->nullable()->after('award_year');
            $table->string('award_logo')->nullable()->after('award_url');
            $table->boolean('show_award')->default(false)->after('award_logo');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_villa_selections', function (Blueprint $table) {
            $table->dropColumn([
                'award_name',
                'award_issuer',
                'award_year',
                'award_url',
                'award_logo',
                'show_award',
            ]);
        });
    }
};
