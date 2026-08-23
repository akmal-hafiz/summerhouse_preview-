<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $row = DB::table('page_sections')
            ->where('page', 'home')
            ->where('section', 'why_stay')
            ->first();

        if (!$row?->content) {
            return;
        }

        $content = json_decode((string) $row->content, true);
        if (!is_array($content)) {
            return;
        }

        foreach (['recognitions', 'awards'] as $collection) {
            if (!is_array($content[$collection] ?? null)) {
                continue;
            }

            $content[$collection] = array_values(array_map(
                function ($item) {
                    if (!is_array($item)) {
                        return $item;
                    }

                    unset($item['logo'], $item['logo_alt']);
                    return $item;
                },
                $content[$collection]
            ));
        }

        DB::table('page_sections')
            ->where('id', $row->id)
            ->update([
                'content' => json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Removed logo references are intentionally not recreated.
    }
};
