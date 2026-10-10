<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->string('code_hash', 64)->nullable();
        });

        // Retain history, invalidate legacy codes and remove recoverable plaintext.
        DB::table('otp_codes')->update(['code' => '******', 'used_at' => now()]);
        // Legacy customer tokens must not survive the browser-session migration.
        DB::table('personal_access_tokens')->where('name', 'auth')->whereNull('expires_at')->delete();
    }

    public function down(): void
    {
        // Codes cannot safely be restored to plaintext during rollback.
        Schema::table('otp_codes', fn (Blueprint $table) => $table->dropColumn('code_hash'));
    }
};
