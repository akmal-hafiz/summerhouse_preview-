<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_avatar_upload_replacement_and_removal_stay_with_the_authenticated_account(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($owner);

        $first = $this->postJson('/api/v1/auth/avatar', ['avatar' => UploadedFile::fake()->image('first.jpg', 600, 400)])
            ->assertOk()->json('user.avatarUrl');
        $firstPath = $owner->fresh()->avatar_path;
        $this->assertStringContainsString('/storage/uploads/profiles/user-' . $owner->id . '/', $first);
        $this->assertSame('image/webp', getimagesizefromstring(Storage::disk('public')->get($firstPath))['mime']);
        $this->assertSame(320, getimagesizefromstring(Storage::disk('public')->get($firstPath))[0]);

        $this->postJson('/api/v1/auth/avatar', ['avatar' => UploadedFile::fake()->image('next.png', 420, 420)])->assertOk();
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($owner->fresh()->avatar_path);
        $this->assertNull($other->fresh()->avatar_path);

        $lastPath = $owner->fresh()->avatar_path;
        $this->deleteJson('/api/v1/auth/avatar')->assertOk()->assertJsonPath('user.avatarUrl', null);
        Storage::disk('public')->assertMissing($lastPath);
        $this->assertNull($owner->fresh()->avatar_path);
    }

    public function test_invalid_avatar_preserves_the_previous_photo_and_guests_cannot_upload(): void
    {
        $this->postJson('/api/v1/auth/avatar', ['avatar' => UploadedFile::fake()->image('guest.jpg')])->assertUnauthorized();

        $owner = User::factory()->create();
        Sanctum::actingAs($owner);
        $this->postJson('/api/v1/auth/avatar', ['avatar' => UploadedFile::fake()->image('valid.jpg')])->assertOk();
        $path = $owner->fresh()->avatar_path;

        $this->postJson('/api/v1/auth/avatar', ['avatar' => UploadedFile::fake()->create('script.svg', 2, 'image/svg+xml')])
            ->assertUnprocessable();
        $this->assertSame($path, $owner->fresh()->avatar_path);
        Storage::disk('public')->assertExists($path);
    }
}
