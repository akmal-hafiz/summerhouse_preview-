<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustHosts as Middleware;

class TrustHosts extends Middleware
{
    /**
     * Get the host patterns that should be trusted.
     *
     * @return array<int, string|null>
     */
    public function hosts(): array
    {
        $hosts = array_filter(array_map('trim', explode(',', (string) config('security.allowed_hosts'))));
        if (!$hosts) $hosts = [parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'localhost'];
        return array_map(fn ($host) => '^'.preg_quote($host, '/').'$', $hosts);
    }
}
