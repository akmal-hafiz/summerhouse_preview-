# Managed media deployment

The CMS image pipeline stores an original upload in private staging, queues processing, scales it to a maximum 2560 pixel edge, converts it to WebP, verifies the result, then publishes it. Existing content remains visible as a fallback until every image in the same upload batch is ready.

## Required environment

```dotenv
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
MEDIA_DISK=public
MEDIA_STAGING_DISK=local
MEDIA_QUEUE=media
MEDIA_MAX_UPLOAD_KB=15360
MEDIA_MAX_DIMENSION=8192
MEDIA_MAX_PIXELS=40000000
MEDIA_OUTPUT_MAX_DIMENSION=2560
MEDIA_WEBP_QUALITY=82
MEDIA_PROCESSOR_VERSION=1
```

The production server must provide PHP GD with WebP support. If the server filesystem is ephemeral, replace both media disks with persistent object storage before launch.

## Deployment sequence

```shell
php artisan migrate --force
php artisan storage:link
php artisan media:check
php artisan queue:restart
```

Run a persistent worker through the host process manager:

```shell
php artisan queue:work --queue=media,default --tries=3 --timeout=120
```

The scheduler must run every minute so abandoned staging files and stale failed jobs are pruned:

```shell
php artisan schedule:run
```

## Release checks

- Treat the remaining Laravel framework security advisories reported by `composer audit` as a release blocker. Resolving them requires a planned framework and Filament compatibility upgrade, not a silent patch inside this feature.
- Upload one JPEG, PNG, and WebP in the CMS.
- Upload a 4K image and confirm the published result has a maximum edge of 2560 pixels.
- Upload the same image twice and confirm only one processed file is retained.
- Replace a published image and confirm the old image stays visible while processing.
- Stop the queue worker, upload several images, then restart the worker and confirm the batch appears only after every image is ready.
- Confirm the public CMS media hostname is present in `CMS_MEDIA_URL` or `CMS_API_URL` before building Next.js.
