<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductionPreflight extends Command
{
    protected $signature = 'production:preflight';
    protected $description = 'Read-only production configuration gate with no secrets in output';

    public function handle(): int
    {
        $checks = [
            'Supported PHP 8.4+ runtime' => PHP_VERSION_ID >= 80400,
            'Production environment' => app()->environment('production'),
            'Debug disabled' => !config('app.debug'),
            'Encryption key provisioned' => strlen((string) config('app.key')) >= 32,
            'HTTPS application URL' => str_starts_with((string) config('app.url'), 'https://'),
            'Explicit trusted hosts' => trim((string) config('security.allowed_hosts')) !== '',
            'Secure admin session cookies' => config('session.secure') === true,
            'Seven-day maximum customer tokens' => (int) config('sanctum.expiration') === 10080,
            'Real mail transport configured' => in_array(config('mail.default'), ['smtp', 'resend', 'ses', 'postmark', 'mailgun'], true),
            'SMTP timeout bounded' => (int) config('mail.mailers.smtp.timeout') >= 1 && (int) config('mail.mailers.smtp.timeout') <= 30,
            'Persistent shared reconciliation locks' => in_array(config('cache.default'), ['database', 'redis', 'file'], true),
            'Queue retry exceeds sync lock and job timeout' => (int) config('queue.connections.database.retry_after') > 600 && (int) config('queue.connections.redis.retry_after') > 600,
            'No retired queued mail payloads' => $this->hasNoRetiredQueuedMailPayloads(),
            'Lodgify credentials provisioned' => strlen((string) config('services.lodgify.key')) > 0,
            'No wildcard CORS' => !in_array('*', config('cors.allowed_origins', []), true),
        ];
        foreach (['curl', 'mbstring', 'openssl', 'pdo', 'fileinfo', 'gd', 'intl', 'zip'] as $extension) $checks['PHP extension '.$extension] = extension_loaded($extension);
        foreach ($checks as $label => $pass) $this->line(($pass ? 'PASS ' : 'FAIL ').$label);
        $this->warn('Configuration only. Verify TLS, proxy header overwrite, private admin ingress/MFA, DB audit grants, worker supervision, backup restore and inbox delivery separately.');
        return in_array(false, $checks, true) ? self::FAILURE : self::SUCCESS;
    }

    private function hasNoRetiredQueuedMailPayloads(): bool
    {
        if (! Schema::hasTable('jobs')) {
            return config('queue.default') !== 'database';
        }

        $retiredClasses = [
            'OrderInvoiceMail',
            'AdminOrderNotificationMail',
            'OrderStatusChangedMail',
        ];

        return ! DB::table('jobs')
            ->where(function ($query) use ($retiredClasses): void {
                foreach ($retiredClasses as $class) {
                    $query->orWhere('payload', 'like', "%{$class}%");
                }
            })
            ->exists();
    }
}
