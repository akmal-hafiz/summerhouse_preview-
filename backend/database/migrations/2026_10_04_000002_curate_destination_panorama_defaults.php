<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change only untouched starter images. Never replace an admin upload.
        $replacements = [
            ['canggu-berawa', '/homepage_villa/curated-3-corner.webp', '/homepage_villa/rumahmimosa.webp'],
            ['pererenan', '/homepage_villa/curated-6-exterior.webp', '/homepage_villa/CactusEstate.webp'],
            ['umalas', '/homepage_villa/VillaZen.webp', '/homepage_villa/villaarta.webp'],
            ['ubud', '/homepage_villa/curated-2-detail.webp', '/homepage_villa/VillaZen.webp'],
        ];

        foreach ($replacements as [$collectionId, $oldImage, $newImage]) {
            DB::table('bali_collections')
                ->where('collection_id', $collectionId)
                ->where('image', $oldImage)
                ->update(['image' => $newImage]);
        }

        Cache::forget('cms.bali-collections');
    }

    public function down(): void
    {
        // A later CMS edit may have selected a new image. Never undo it.
    }
};
