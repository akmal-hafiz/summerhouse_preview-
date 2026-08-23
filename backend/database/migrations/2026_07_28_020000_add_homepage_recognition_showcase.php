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

        $legacyAwards = is_array($content['awards'] ?? null) ? $content['awards'] : [];
        $recognitions = is_array($content['recognitions'] ?? null) ? $content['recognitions'] : [];

        if ($recognitions === [] && $legacyAwards !== []) {
            $recognitions = array_values(array_map(
                fn (array $award): array => [
                    'type' => 'award',
                    'name' => $award['name'] ?? null,
                    'issuer' => $award['issuer'] ?? null,
                    'title' => null,
                    'year' => $award['year'] ?? null,
                    'url' => $award['url'] ?? null,
                    'logo' => $award['logo'] ?? null,
                    'logo_alt' => !empty($award['name']) ? "{$award['name']} logo" : null,
                    'is_visible' => true,
                ],
                $legacyAwards
            ));
        }

        if ($recognitions === []) {
            $recognitions = [[
                'type' => 'award',
                'name' => 'Honeycombers',
                'issuer' => 'Gold Winner',
                'title' => 'Best Villa in Bali 2024',
                'year' => '2024',
                'villa_name' => 'Ubud Zen River House',
                'is_visible' => true,
            ]];
        }

        $content = array_merge($content, [
            'eyebrow' => 'Why Summerhouse',
            'title' => 'A considered way to stay in Bali.',
            'introduction' => 'Carefully chosen homes, local care you can count on, and clear guidance for a stay that feels right.',
            'recognitions' => $recognitions,
            'is_visible' => (bool) ($content['is_visible'] ?? true),
        ]);

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

        unset($content['eyebrow'], $content['recognitions']);
        $content['title'] = 'Why stay with Summerhouse';
        $content['introduction'] = 'A smaller collection, local care, and homes chosen for how naturally they fit the Bali experience.';

        DB::table('page_sections')
            ->where('id', $row->id)
            ->update([
                'content' => json_encode($content, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
