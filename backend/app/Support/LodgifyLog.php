<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LodgifyLog
{
    private const SENSITIVE_PATTERN = '/key|token|secret|password|authorization|cookie/i';

    public static function write(string $severity, string $event, string $message, array $context = []): void
    {
        $severity = in_array($severity, ['debug', 'info', 'notice', 'warning', 'error', 'critical'], true)
            ? $severity
            : 'info';

        Log::log($severity, $message, array_merge([
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
            return is_string($value) ? Str::limit($value, 2000, '') : $value;
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
