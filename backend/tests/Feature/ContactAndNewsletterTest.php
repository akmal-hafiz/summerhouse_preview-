<?php

namespace Tests\Feature;

use App\Models\ContactSubmission;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactAndNewsletterTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_inquiry_is_saved_without_sending_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/contact', [
            'name' => 'Akmal Hafiz',
            'email' => 'akmal@example.com',
            'phone' => '+6281932387121',
            'subject' => 'Villa inquiry',
            'message' => 'I would like help choosing a villa.',
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseHas(ContactSubmission::class, [
            'email' => 'akmal@example.com',
            'subject' => 'Villa inquiry',
        ]);
        Mail::assertNothingSent();
    }

    public function test_newsletter_subscription_stores_consent_without_sending_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/newsletter/subscribe', [
            'email' => 'guest@example.com',
            'consent' => true,
            'source' => 'footer',
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $subscriber = NewsletterSubscriber::where('email', 'guest@example.com')->firstOrFail();
        $this->assertTrue($subscriber->is_active);
        $this->assertNotNull($subscriber->consent_at);
        Mail::assertNothingSent();
    }

    public function test_newsletter_subscription_requires_consent(): void
    {
        $this->postJson('/api/v1/newsletter/subscribe', [
            'email' => 'guest@example.com',
            'consent' => false,
        ])->assertUnprocessable();

        $this->assertDatabaseMissing(NewsletterSubscriber::class, [
            'email' => 'guest@example.com',
        ]);
    }
}
