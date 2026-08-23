<?php

use App\Models\PageSection;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $recognitionSection = PageSection::query()
            ->where('page', 'home')
            ->where('section', 'why_stay')
            ->first();

        if ($recognitionSection) {
            $content = $recognitionSection->content ?? [];
            $legacy = collect($content['recognitions'] ?? []);
            $recognition = $content['recognition'] ?? $legacy->first(function (array $item): bool {
                return str_contains(
                    strtolower(implode(' ', array_filter([
                        $item['name'] ?? null,
                        $item['issuer'] ?? null,
                        $item['title'] ?? null,
                    ]))),
                    'honeycombers'
                );
            }) ?? $legacy->first();

            if (!is_array($recognition)) {
                $recognition = [
                    'type' => 'award',
                    'name' => 'Honeycombers',
                    'issuer' => 'Gold Winner',
                    'title' => 'Best Villa in Bali 2024',
                    'year' => '2024',
                    'villa_name' => 'Ubud Zen River House',
                    'is_visible' => true,
                ];
            }

            unset($recognition['logo'], $recognition['logo_alt']);
            $content['recognition'] = array_merge($recognition, [
                'type' => 'award',
                'is_visible' => (bool) ($recognition['is_visible'] ?? true),
            ]);

            $recognitionSection->update(['content' => $content]);
        }

        $reviewSection = PageSection::query()
            ->where('page', 'home')
            ->where('section', 'testimonials')
            ->first();

        if ($reviewSection) {
            $content = $reviewSection->content ?? [];
            $content['title'] = 'Guest Reviews';
            $content['supporting_copy'] = $content['supporting_copy'] ?? null;
            $reviewSection->update(['content' => $content]);
        }
    }

    public function down(): void
    {
        $recognitionSection = PageSection::query()
            ->where('page', 'home')
            ->where('section', 'why_stay')
            ->first();

        if ($recognitionSection) {
            $content = $recognitionSection->content ?? [];
            unset($content['recognition']);
            $recognitionSection->update(['content' => $content]);
        }

        $reviewSection = PageSection::query()
            ->where('page', 'home')
            ->where('section', 'testimonials')
            ->first();

        if ($reviewSection) {
            $content = $reviewSection->content ?? [];
            unset($content['supporting_copy']);
            $reviewSection->update(['content' => $content]);
        }
    }
};
