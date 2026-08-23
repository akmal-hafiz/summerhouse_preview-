<?php

namespace Tests\Feature;

use App\Models\BaliCollection;
use App\Models\VillaCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DestinationGuideTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_collection_cards_use_exact_villa_routes_and_hide_drafts(): void
    {
        $published = $this->destination([
            'collection_id' => 'pererenan',
            'location' => 'Pererenan',
        ]);
        $this->destination([
            'collection_id' => 'draft-guide',
            'location' => 'Draft Guide',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/v1/cms/bali-collections');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'collections')
            ->assertJsonPath('collections.0.id', 'pererenan')
            ->assertJsonPath('collections.0.href', '/villas?location=Pererenan&match=exact')
            ->assertJsonPath('collections.0.mediaType', 'image');

        $this->assertSame('/villas?location=Pererenan&match=exact', $published->fresh()->href);
    }

    public function test_destination_detail_derives_editorial_chapters_and_live_villa_count(): void
    {
        $this->destination([
            'collection_id' => 'ubud',
            'location' => 'Ubud',
            'lifestyle_pillars' => [
                ['title' => 'Rice field mornings', 'description' => 'A slower start among green terraces.'],
            ],
        ]);

        VillaCache::create([
            'lodgify_id' => 'villa-1',
            'name' => 'Ubud River House',
            'thumbnail_url' => '/homepage_villa/VillaZen.webp',
            'location' => 'Ubud',
            'raw' => [],
            'synced_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/cms/destinations/ubud');

        $response
            ->assertOk()
            ->assertJsonPath('destination.heroTitle', 'Ubud')
            ->assertJsonPath('destination.villaCount', '1 villa')
            ->assertJsonPath('destination.relatedVillasHeading', 'Stay in Ubud')
            ->assertJsonPath('destination.editorialChapters.0.title', 'Rice field mornings');
    }

    public function test_new_video_destination_fills_legacy_required_columns_automatically(): void
    {
        $destination = BaliCollection::create([
            'location' => 'Uluwatu',
            'category' => 'Cliff Coast',
            'description' => 'Clifftop sunsets, temple days, and a slower southern coast.',
            'media_type' => 'video',
            'video' => '/video/herosection_summerhouse.mp4',
            'video_poster' => '/Hero_Section.png',
            'status' => 'draft',
            'is_active' => true,
        ]);

        $this->assertSame('uluwatu', $destination->collection_id);
        $this->assertSame('/villas?location=Uluwatu&match=exact', $destination->href);
        $this->assertSame('/Hero_Section.png', $destination->image);
        $this->assertSame('0 villas', $destination->villa_count);
        $this->assertSame('Price confirmed at booking', $destination->price);
    }

    private function destination(array $overrides = []): BaliCollection
    {
        return BaliCollection::create(array_merge([
            'collection_id' => 'canggu',
            'location' => 'Canggu',
            'category' => 'Creative Coast',
            'tag' => 'Creative Coast',
            'status' => 'published',
            'moods' => ['Surf', 'Cafes'],
            'description' => 'Modern villa living close to surf, cafes, and sunset scenes.',
            'highlights' => ['Surf mornings'],
            'best_for' => ['Couples'],
            'facts' => [['label' => 'Pace', 'value' => 'Active']],
            'villa_count' => '0 villas',
            'price' => 'Price confirmed at booking',
            'cta' => 'View destination',
            'href' => '/destinations/canggu',
            'media_type' => 'image',
            'image' => '/homepage_villa/curated-1-main.webp',
            'image_alt' => 'Canggu destination guide',
            'gallery_images' => ['/homepage_villa/curated-1-main.webp'],
            'sort_order' => 0,
            'is_active' => true,
        ], $overrides));
    }
}
