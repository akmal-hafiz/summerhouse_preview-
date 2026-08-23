<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bali_collections', function (Blueprint $table) {
            $table->string('location_key')->nullable()->after('location');
            $table->string('status', 24)->default('published')->after('tag');

            $table->string('media_type', 12)->default('image')->after('description');
            $table->string('video', 500)->nullable()->after('image');
            $table->string('video_poster', 500)->nullable()->after('video');
            $table->string('mobile_poster', 500)->nullable()->after('video_poster');
            $table->string('media_accessibility_label', 500)->nullable()->after('image_alt');

            $table->string('eyebrow')->nullable()->after('lifestyle_pillars');
            $table->string('hero_title')->nullable()->after('eyebrow');
            $table->text('introduction')->nullable()->after('hero_title');
            $table->string('hero_media_type', 12)->default('image')->after('introduction');
            $table->string('hero_image', 500)->nullable()->after('hero_media_type');
            $table->string('hero_video', 500)->nullable()->after('hero_image');
            $table->string('hero_video_poster', 500)->nullable()->after('hero_video');
            $table->json('editorial_gallery')->nullable()->after('hero_video_poster');
            $table->json('editorial_chapters')->nullable()->after('editorial_gallery');
            $table->json('related_journal_tags')->nullable()->after('editorial_chapters');

            $table->string('lodgify_location')->nullable()->after('related_journal_tags');
            $table->boolean('show_related_villas')->default(true)->after('lodgify_location');
            $table->string('related_villas_heading')->nullable()->after('show_related_villas');
            $table->json('manual_villa_overrides')->nullable()->after('related_villas_heading');

            $table->string('seo_title')->nullable()->after('manual_villa_overrides');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('social_image', 500)->nullable()->after('seo_description');

            $table->index(['status', 'is_active', 'sort_order'], 'bali_collections_public_order_idx');
            $table->index('location_key', 'bali_collections_location_key_idx');
        });
    }

    public function down(): void
    {
        Schema::table('bali_collections', function (Blueprint $table) {
            $table->dropIndex('bali_collections_public_order_idx');
            $table->dropIndex('bali_collections_location_key_idx');
            $table->dropColumn([
                'location_key',
                'status',
                'media_type',
                'video',
                'video_poster',
                'mobile_poster',
                'media_accessibility_label',
                'eyebrow',
                'hero_title',
                'introduction',
                'hero_media_type',
                'hero_image',
                'hero_video',
                'hero_video_poster',
                'editorial_gallery',
                'editorial_chapters',
                'related_journal_tags',
                'lodgify_location',
                'show_related_villas',
                'related_villas_heading',
                'manual_villa_overrides',
                'seo_title',
                'seo_description',
                'social_image',
            ]);
        });
    }
};
