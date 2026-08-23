<?php

namespace Tests\Feature;

use App\Models\HomepageVillaSelection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomepageVillaSelectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_signature_award_metadata_is_exposed_to_the_homepage(): void
    {
        HomepageVillaSelection::create([
            'slot' => 'signature',
            'lodgify_property_id' => '475365',
            'sort_order' => 0,
            'award_name' => 'Best Private Villa',
            'award_issuer' => 'Bali Hospitality Awards',
            'award_year' => '2026',
            'award_url' => 'https://example.com/award',
            'award_logo' => '/storage/awards/best-private-villa.svg',
            'show_award' => true,
        ]);

        $signature = HomepageVillaSelection::getAllSlots()['signature'][0];

        $this->assertSame('Best Private Villa', $signature['award_name']);
        $this->assertSame('Bali Hospitality Awards', $signature['award_issuer']);
        $this->assertSame('2026', $signature['award_year']);
        $this->assertSame('https://example.com/award', $signature['award_url']);
        $this->assertSame('/storage/awards/best-private-villa.svg', $signature['award_logo']);
        $this->assertTrue($signature['show_award']);
    }

    public function test_award_is_hidden_by_default(): void
    {
        $selection = HomepageVillaSelection::create([
            'slot' => 'signature',
            'lodgify_property_id' => '475366',
            'sort_order' => 0,
        ]);

        $this->assertFalse($selection->show_award);
    }
}
