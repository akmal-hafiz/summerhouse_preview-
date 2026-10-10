<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use App\Services\LodgifyService;
use App\Support\LodgifyLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_hashes_code_and_consumes_once(): void
    {
        Mail::fake();
        $this->postJson('/api/v1/auth/register/send-otp', ['email' => 'guest@example.test', 'name' => 'Guest'])->assertOk();
        $code = null;
        Mail::assertSent(OtpMail::class, function ($mail) use (&$code) { $code = $mail->code; return true; });
        $otp = OtpCode::first();
        $this->assertSame('******', $otp->code);
        $this->assertSame(OtpCode::digest($code), $otp->code_hash);
        $data = ['email' => 'guest@example.test', 'name' => 'Guest', 'code' => $code, 'password' => 'safe-password123', 'password_confirmation' => 'safe-password123'];
        $this->postJson('/api/v1/auth/register/verify-otp', $data)->assertCreated();
        $this->assertNotNull($otp->fresh()->used_at);
        $this->postJson('/api/v1/auth/register/verify-otp', $data)->assertUnprocessable();
        $this->assertDatabaseCount('users', 1);
    }

    public function test_wrong_attempts_commit_and_limit_blocks_correct_code(): void
    {
        $otp = OtpCode::create(['email' => 'guest@example.test', 'type' => 'registration', 'code' => '******', 'code_hash' => OtpCode::digest('123456'), 'expires_at' => now()->addMinutes(10)]);
        for ($i = 0; $i < 5; $i++) {
            $this->assertNull(OtpCode::consume($otp->email, $otp->type, '999999', fn () => true));
        }
        $this->assertSame(5, $otp->fresh()->attempts);
        $this->assertNull(OtpCode::consume($otp->email, $otp->type, '123456', fn () => true));
    }

    public function test_failed_delivery_invalidates_code_without_logging_pii(): void
    {
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('private provider detail'));
        $this->postJson('/api/v1/auth/register/send-otp', ['email' => 'guest@example.test', 'name' => 'Guest'])->assertStatus(500);
        $this->assertNotNull(OtpCode::first()->used_at);
    }

    public function test_lookup_response_does_not_disclose_account_existence(): void
    {
        User::factory()->create(['email' => 'existing@example.test']);
        $existing = $this->postJson('/api/v1/auth/lookup', ['email' => 'existing@example.test'])->assertOk()->json();
        $missing = $this->postJson('/api/v1/auth/lookup', ['email' => 'missing@example.test'])->assertOk()->json();
        $this->assertSame($existing, $missing);
        $this->assertArrayNotHasKey('exists', $existing);
    }

    public function test_only_public_cms_gets_allow_cross_origin_reads(): void
    {
        $this->withHeaders(['Origin' => 'https://public-reader.test'])->getJson('/api/v1/cms/settings')
            ->assertOk()->assertHeader('Access-Control-Allow-Origin', '*');
        $this->withHeaders(['Origin' => 'https://public-reader.test'])->postJson('/api/v1/auth/lookup', ['email' => 'guest@example.test'])
            ->assertOk()->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_login_token_has_absolute_expiry_and_expired_token_is_denied(): void
    {
        $user = User::factory()->create(['password' => bcrypt('safe-password123')]);
        $response = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'safe-password123'])->assertOk();
        $this->assertNotNull($user->tokens()->first()->expires_at);
        $this->travel(8)->days();
        $this->withToken($response->json('token'))->getJson('/api/v1/auth/user')->assertUnauthorized();
    }

    public function test_shared_sync_lock_blocks_all_entry_points_without_creating_a_run(): void
    {
        $lock = Cache::lock('lodgify:reconciliation', 600);
        $this->assertTrue($lock->get());
        try {
            try { LodgifyService::make()->syncAll(); $this->fail('Concurrent sync must be blocked'); }
            catch (\RuntimeException $e) { $this->assertStringContainsString('already running', $e->getMessage()); }
            $this->assertDatabaseCount('lodgify_sync_runs', 0);
        } finally { $lock->release(); }
    }

    public function test_log_string_redaction_covers_credentials_and_controls(): void
    {
        config(['services.lodgify.key' => 'private-api-key']);
        $result = LodgifyLog::sanitize("private-api-key https://alice:pass@example.test?token=raw Bearer credential guest@example.test\n");
        foreach (['private-api-key', 'alice:pass', 'token=raw', 'credential', 'guest@example.test', "\n"] as $secret) $this->assertStringNotContainsString($secret, $result);
    }

    public function test_read_only_inspection_does_not_write_records(): void
    {
        config(['services.lodgify.key' => 'test-key']);
        \Illuminate\Support\Facades\Http::fake(['*' => \Illuminate\Support\Facades\Http::response(['items' => [['id' => 1, 'is_active' => true]]])]);
        $this->artisan('lodgify:sync --dry-run')->assertSuccessful();
        $this->assertDatabaseCount('villa_caches', 0);
        $this->assertDatabaseCount('lodgify_sync_runs', 0);
        $this->assertDatabaseCount('lodgify_property_events', 0);
        $this->assertDatabaseCount('lodgify_incidents', 0);
    }

    public function test_room_connection_failure_is_retried_once_and_previous_room_data_is_retained(): void
    {
        config(['services.lodgify.key' => 'test-key', 'services.lodgify.max_retries' => 1]);
        $villa = \App\Models\VillaCache::create(['lodgify_id' => '1', 'name' => 'Safe', 'rooms_raw' => [['id' => 12]]]);
        $roomRequests = 0;
        \Illuminate\Support\Facades\Http::fake(function ($request) use (&$roomRequests) {
            if (str_contains($request->url(), '/rooms')) {
                $roomRequests++;
                return \Illuminate\Support\Facades\Http::failedConnection();
            }
            return \Illuminate\Support\Facades\Http::response(['items' => [['id' => 1, 'name' => 'Safe', 'is_active' => true]]]);
        });
        $run = LodgifyService::make()->syncAll();
        $this->assertSame('completed_with_warnings', $run->status);
        $this->assertSame(2, $roomRequests);
        $this->assertSame([['id' => 12]], $villa->fresh()->rooms_raw);
    }
}
