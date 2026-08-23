<?php

return [
    'disk' => env('MEDIA_DISK', 'public'),
    'staging_disk' => env('MEDIA_STAGING_DISK', 'local'),
    'queue' => env('MEDIA_QUEUE', 'media'),
    'max_upload_kb' => (int) env('MEDIA_MAX_UPLOAD_KB', 15360),
    'max_dimension' => (int) env('MEDIA_MAX_DIMENSION', 8192),
    'max_pixels' => (int) env('MEDIA_MAX_PIXELS', 40000000),
    'output_max_dimension' => (int) env('MEDIA_OUTPUT_MAX_DIMENSION', 2560),
    'webp_quality' => (int) env('MEDIA_WEBP_QUALITY', 82),
    'processor_version' => (int) env('MEDIA_PROCESSOR_VERSION', 1),
    'allowed_mime_types' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
];
