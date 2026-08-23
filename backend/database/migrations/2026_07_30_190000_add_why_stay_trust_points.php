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

        $content = [];
        if ($row?->content) {
            $decoded = json_decode((string) $row->content, true);
            $content = is_array($decoded) ? $decoded : [];
        }

        $legacyItems = is_array($content['items'] ?? null)
            ? array_slice($content['items'], 0, 3)
            : [];

        $trustPoints = is_array($content['trust_points'] ?? null)
            ? array_slice($content['trust_points'], 0, 3)
            : [];

        if ($trustPoints === [] && $legacyItems !== []) {
            $trustPoints = array_values(array_map(
                fn (array $item): array => [
                    'title' => $item['title'] ?? null,
                    'description' => $item['description'] ?? null,
                    'is_visible' => true,
                ],
                $legacyItems
            ));
        }

        if ($trustPoints === []) {
            $trustPoints = [
                [
                    'title' => 'Curated homes',
                    'description' => 'A smaller collection chosen for design, setting, and guest comfort.',
                    'is_visible' => true,
                ],
                [
                    'title' => 'Local care',
                    'description' => 'Practical support from people who know Bali and its neighbourhoods.',
                    'is_visible' => true,
                ],
                [
                    'title' => 'Clear guidance',
                    'description' => 'Useful details and straightforward booking guidance from the start.',
                    'is_visible' => true,
                ],
            ];
        }

        unset($content['items'], $content['awards_heading']);
        $content['trust_points'] = $trustPoints;

        DB::table('page_sections')->updateOrInsert(
            ['page' => 'home', 'section' => 'why_stay'],
            [
                'content' => json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'sort_order' => $row?->sort_order ?? 0,
                'is_active' => $row?->is_active ?? true,
                'created_at' => $row?->created_at ?? now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
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

        unset($content['trust_points']);

        DB::table('page_sections')
            ->where('id', $row->id)
            ->update([
                'content' => json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
