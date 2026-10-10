<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            if (! Schema::hasColumn('gallery_items', 'layout_variant')) {
                $table->string('layout_variant', 20)->default('landscape')->after('category');
            }

            if (! Schema::hasColumn('gallery_items', 'focal_point')) {
                $table->string('focal_point', 20)->default('center')->after('layout_variant');
            }
        });

        $variants = ['landscape', 'portrait', 'square', 'tall', 'landscape', 'portrait'];

        DB::table('gallery_items')
            ->whereIn('type', ['image', 'video'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'type'])
            ->values()
            ->each(function (object $item, int $index) use ($variants): void {
                DB::table('gallery_items')
                    ->where('id', $item->id)
                    ->update([
                        'layout_variant' => $item->type === 'video'
                            ? 'landscape'
                            : $variants[$index % count($variants)],
                        'focal_point' => 'center',
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $columns = array_values(array_filter(
                ['layout_variant', 'focal_point'],
                fn (string $column): bool => Schema::hasColumn('gallery_items', $column),
            ));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
