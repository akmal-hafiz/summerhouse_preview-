<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LodgifyLog
{
    private const SENSITIVE_PATTERN = '/key|token|secret|password|authorization|cookie|email|^code$/i';

    public static function write(string $severity, string $event, string $message, array $context = []): void
    {
        $severity = in_array($severity, ['debug', 'info', 'notice', 'warning', 'error', 'critical'], true)
            ? $severity
            : 'info';

        Log::log($severity, self::sanitize($message), array_merge([
            'service' => 'laravel',
            'environment' => app()->environment(),
            'event' => $event,
            'severity' => $severity,
            'correlation_id' => $context['correlation_id'] ?? (string) Str::uuid(),
        ], self::sanitize($context)));
    }

    public static function sanitize(mixed $value): mixed
    {
        if (! is_array($value)) {
            if (!is_string($value)) return $value;
            foreach (['app.key', 'services.lodgify.key', 'mail.mailers.smtp.password', 'services.resend.key'] as $path) {
                $secret = config($path);
                if (is_string($secret) && strlen($secret) >= 6) $value = str_replace($secret, '[REDACTED]', $value);
            }
            $value = preg_replace('/[\x00-\x1F\x7F]/', ' ', $value);
            $value = preg_replace('~(https?://)[^\s/@]+:[^\s/@]+@~i', '$1[REDACTED]@', $value);
            $value = preg_replace('/([?&](?:api[_-]?key|token|secret|password|code)=)[^&\s]*/i', '$1[REDACTED]', $value);
            $value = preg_replace('/Bearer\s+[^\s,;]+/i', 'Bearer [REDACTED]', $value);
            $value = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[EMAIL]', $value);
            return Str::limit($value, 2000, '');
        }

        $clean = [];
        foreach ($value as $key => $item) {
            if (is_string($key) && preg_match(self::SENSITIVE_PATTERN, $key)) {
                continue;
            }
            $clean[$key] = self::sanitize($item);
        }

        return $clean;
    }
}
