<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $legacyGeneral = DB::table('site_settings')->where('key', 'contact.email')->value('value');

        $settings = [
            'contact.general_email' => $legacyGeneral ?: json_encode('info@summerhousebali.com'),
            'contact.reservation_email' => json_encode('reservation.summerhouse@gmail.com'),
            'contact.phone' => json_encode('+6281932387121'),
            'contact.whatsapp' => json_encode('+6281932387121'),
            'contact.address' => json_encode('Bali, Indonesia'),
            'contact.response_time' => json_encode('Within 2 hours'),
        ];

        foreach ($settings as $key => $value) {
            DB::table('site_settings')->insertOrIgnore([
                'key' => $key,
                'value' => $value,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'contact.general_email',
            'contact.reservation_email',
        ])->delete();
    }
};
