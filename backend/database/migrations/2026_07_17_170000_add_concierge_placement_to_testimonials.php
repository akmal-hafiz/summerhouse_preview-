<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->boolean('show_on_concierge')->default(false)->after('show_on_services');
            $table->index(['status', 'show_on_concierge'], 'testimonials_concierge_idx');
        });
        DB::table('testimonials')->where('show_on_about', true)->update(['show_on_concierge' => true]);
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropIndex('testimonials_concierge_idx');
            $table->dropColumn('show_on_concierge');
        });
    }
};
