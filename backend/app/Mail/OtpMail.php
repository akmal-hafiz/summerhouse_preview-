<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $name,
        public string $purpose = 'registration'
    ) {
    }

    public function envelope(): Envelope
    {
        $subjects = [
            'registration' => 'Kode verifikasi Summerhouses Bali - ' . $this->code,
            'password_reset' => 'Reset password Summerhouses Bali - ' . $this->code,
        ];

        $fromAddress = config('services.resend.from_email', config('mail.from.address', 'noreply@summerhousebali.com'));
        $fromName = config('services.resend.from_name', config('mail.from.name', 'Summerhouses Bali'));

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            subject: $subjects[$this->purpose] ?? $subjects['registration'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->code,
                'name' => $this->name,
                'purpose' => $this->purpose,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
