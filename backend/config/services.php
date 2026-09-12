<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
        'from_email' => env('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        'from_name' => env('RESEND_FROM_NAME', 'Summerhouses'),
    ],

    'lodgify' => [
        'key' => env('LODGIFY_API_KEY'),
        'base_url' => env('LODGIFY_API_BASE_URL', 'https://api.lodgify.com/v2'),
        'sync_ttl_minutes' => (int) env('LODGIFY_SYNC_TTL_MINUTES', 15),
        'request_timeout_seconds' => (int) env('LODGIFY_REQUEST_TIMEOUT_SECONDS', 12),
        'max_retries' => min(1, max(0, (int) env('LODGIFY_MAX_RETRIES', 1))),
        'rooms_concurrency' => min(10, max(1, (int) env('LODGIFY_ROOMS_CONCURRENCY', 5))),
        'page_size' => min(50, max(1, (int) env('LODGIFY_PAGE_SIZE', 50))),
        'max_pages' => min(50, max(1, (int) env('LODGIFY_MAX_PAGES', 20))),
        'sync_min_count_ratio' => min(1, max(0.1, (float) env('LODGIFY_SYNC_MIN_COUNT_RATIO', 0.5))),
    ],

];
