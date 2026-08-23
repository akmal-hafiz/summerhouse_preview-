<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::table('service_cards', function (Blueprint $table) { $table->string('slug')->nullable()->after('category'); $table->string('image')->nullable()->after('text'); $table->string('alt_text')->nullable()->after('image'); $table->boolean('featured_on_about')->default(false)->after('alt_text'); }); }
    public function down(): void { Schema::table('service_cards', fn (Blueprint $table) => $table->dropColumn(['slug','image','alt_text','featured_on_about'])); }
};
