<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            if (!Schema::hasColumn('testimonials', 'type')) {
                $table->string('type', 30)->default('guest_review')->after('page')->index();
            }
            if (!Schema::hasColumn('testimonials', 'show_on_services')) {
                $table->boolean('show_on_services')->default(false)->after('show_on_home');
            }
            if (!Schema::hasColumn('testimonials', 'owner_role')) {
                $table->string('owner_role', 120)->nullable()->after('location');
            }
            if (!Schema::hasColumn('testimonials', 'metrics')) {
                $table->json('metrics')->nullable()->after('text');
            }
        });

        DB::table('testimonials')->whereNull('type')->orWhere('type', '')->update(['type' => 'guest_review']);

        Schema::table('testimonials', function (Blueprint $table) {
            $table->index(['status', 'show_on_services'], 'testimonials_services_idx');
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropIndex('testimonials_services_idx');
            $table->dropColumn(['type', 'show_on_services', 'owner_role', 'metrics']);
        });
    }
};
