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
        'request_timeout_seconds' => min(30, max(1, (int) env('LODGIFY_REQUEST_TIMEOUT_SECONDS', 12))),
        'sync_budget_seconds' => min(420, max(30, (int) env('LODGIFY_SYNC_BUDGET_SECONDS', 420))),
        'max_retries' => min(1, max(0, (int) env('LODGIFY_MAX_RETRIES', 1))),
        'rooms_concurrency' => min(10, max(1, (int) env('LODGIFY_ROOMS_CONCURRENCY', 5))),
        'page_size' => min(50, max(1, (int) env('LODGIFY_PAGE_SIZE', 50))),
        'max_pages' => min(50, max(1, (int) env('LODGIFY_MAX_PAGES', 20))),
        'sync_min_count_ratio' => min(1, max(0.1, (float) env('LODGIFY_SYNC_MIN_COUNT_RATIO', 0.5))),
        'health_healthy_age_minutes' => min(30, max(5, (int) env('LODGIFY_HEALTHY_AGE_MINUTES', 10))),
        'health_critical_age_minutes' => min(120, max(15, (int) env('LODGIFY_CRITICAL_AGE_MINUTES', 30))),
        'active_drop_ratio' => min(1, max(0.05, (float) env('LODGIFY_ACTIVE_DROP_RATIO', 0.2))),
        'room_warning_ratio' => min(1, max(0.05, (float) env('LODGIFY_ROOM_WARNING_RATIO', 0.2))),
        'sync_run_retention_days' => min(365, max(30, (int) env('LODGIFY_SYNC_RETENTION_DAYS', 90))),
        'incident_retention_days' => min(1825, max(365, (int) env('LODGIFY_INCIDENT_RETENTION_DAYS', 730))),
    ],

];
