<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityBoundaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_read_internal_health_dashboard(): void
    {
        $this->get('/admin/lodgify-health')->assertRedirect('/admin/login');
    }

    public function test_customer_cannot_access_internal_health_dashboard(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->get('/admin/lodgify-health')->assertForbidden();
    }

    public function test_wishlist_requires_authentication(): void
    {
        $this->getJson('/api/v1/wishlist')->assertUnauthorized();
        $this->postJson('/api/v1/wishlist', ['lodgify_property_id' => '1'])->assertUnauthorized();
    }

    public function test_customer_cannot_read_or_delete_another_customers_wishlist(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        Wishlist::create(['user_id' => $owner->id, 'lodgify_property_id' => '1']);
        Sanctum::actingAs($other);

        $this->getJson('/api/v1/wishlist')->assertOk()->assertJsonPath('ids', []);
        $this->deleteJson('/api/v1/wishlist/1')->assertOk();
        $this->assertDatabaseHas('wishlists', ['user_id' => $owner->id, 'lodgify_property_id' => '1']);
    }

    public function test_profile_update_cannot_escalate_role(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/profile', ['name' => 'Updated', 'role' => 'admin'])
            ->assertOk()->assertJsonPath('user.role', 'user');
        $this->assertSame('user', $user->fresh()->role);
    }
}
