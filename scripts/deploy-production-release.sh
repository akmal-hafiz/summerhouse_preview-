#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 7 ]]; then
  echo "Usage: deploy-production-release.sh <archive> <checksum> <app-root> <release-id> <php-bin> <health-url> <restart-relative-path>" >&2
  exit 64
fi

archive="$1"
checksum="$2"
app_root="$3"
release_id="$4"
php_bin="$5"
health_url="$6"
restart_relative="$7"

if [[ ! "$release_id" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Invalid release identifier." >&2
  exit 65
fi
if [[ ! "$health_url" =~ ^https:// ]]; then
  echo "Production health URL must use HTTPS." >&2
  exit 65
fi
if [[ "$restart_relative" = /* || "$restart_relative" == *".."* ]]; then
  echo "Restart path must be a safe path relative to the active release." >&2
  exit 65
fi
if [[ ! -x "$php_bin" ]]; then
  echo "Configured PHP binary is not executable." >&2
  exit 69
fi

mkdir -p "$app_root"
home_root="$(realpath "$HOME")"
app_root="$(realpath "$app_root")"
case "$app_root/" in
  "$home_root/"*) ;;
  *) echo "Application root must remain inside the deployment user's home." >&2; exit 65 ;;
esac
if [[ "$app_root" == "$home_root" || "$app_root" == "/" ]]; then
  echo "Application root is too broad." >&2
  exit 65
fi

archive="$(realpath "$archive")"
checksum="$(realpath "$checksum")"
case "$archive" in "$app_root"/incoming/*) ;; *) echo "Archive is outside the incoming directory." >&2; exit 65 ;; esac
case "$checksum" in "$app_root"/incoming/*) ;; *) echo "Checksum is outside the incoming directory." >&2; exit 65 ;; esac

(cd "$(dirname "$checksum")" && sha256sum --check "$(basename "$checksum")")

releases_dir="$app_root/releases"
shared_dir="$app_root/shared"
current_link="$app_root/current"
temporary_release="$releases_dir/.extract-$release_id"
final_release="$releases_dir/$release_id"

mkdir -p "$releases_dir" "$shared_dir/backend-storage/app/public" "$shared_dir/backend-storage/framework/cache/data" "$shared_dir/backend-storage/framework/sessions" "$shared_dir/backend-storage/framework/views" "$shared_dir/backend-storage/logs"

for env_file in "$shared_dir/backend.env" "$shared_dir/frontend.env"; do
  if [[ ! -f "$env_file" ]]; then
    echo "Missing provisioned environment file: $env_file" >&2
    exit 78
  fi
done

if [[ -e "$final_release" ]]; then
  echo "Release already exists; refusing to overwrite it." >&2
  exit 73
fi

rm -rf "$temporary_release"
mkdir -p "$temporary_release"
cleanup() {
  if [[ -d "$temporary_release" ]]; then rm -rf "$temporary_release"; fi
}
trap cleanup EXIT

tar -xzf "$archive" -C "$temporary_release"
for required in frontend/server.js frontend/scripts/production-preflight.mjs backend/artisan backend/vendor/autoload.php deployment/deploy-production-release.sh release-manifest.json; do
  if [[ ! -e "$temporary_release/$required" ]]; then
    echo "Release is missing $required" >&2
    exit 66
  fi
done

ln -s "$shared_dir/frontend.env" "$temporary_release/frontend/.env.production"
ln -s "$shared_dir/backend.env" "$temporary_release/backend/.env"
ln -s "$shared_dir/backend-storage" "$temporary_release/backend/storage"

NODE_ENV=production node --env-file="$shared_dir/frontend.env" "$temporary_release/frontend/scripts/production-preflight.mjs"
(cd "$temporary_release/backend" && "$php_bin" artisan production:preflight)
(cd "$temporary_release/backend" && "$php_bin" artisan migrate --force)
(cd "$temporary_release/backend" && "$php_bin" artisan optimize:clear)
(cd "$temporary_release/backend" && "$php_bin" artisan config:cache)
(cd "$temporary_release/backend" && "$php_bin" artisan storage:link)

mv "$temporary_release" "$final_release"
trap - EXIT

previous_release=""
if [[ -L "$current_link" ]]; then previous_release="$(readlink -f "$current_link")"; fi
next_link="$app_root/.current-$release_id"
ln -s "$final_release" "$next_link"
mv -Tf "$next_link" "$current_link"

(cd "$current_link/backend" && "$php_bin" artisan queue:restart)
restart_file="$current_link/$restart_relative"
mkdir -p "$(dirname "$restart_file")"
touch "$restart_file"

healthy=false
for _ in {1..12}; do
  if curl --fail --silent --show-error --max-time 10 "$health_url" >/dev/null; then
    healthy=true
    break
  fi
  sleep 5
done

if [[ "$healthy" != true ]]; then
  if [[ -n "$previous_release" && -d "$previous_release" ]]; then
    rollback_link="$app_root/.rollback-$release_id"
    ln -s "$previous_release" "$rollback_link"
    mv -Tf "$rollback_link" "$current_link"
    rollback_restart="$current_link/$restart_relative"
    mkdir -p "$(dirname "$rollback_restart")"
    touch "$rollback_restart"
  fi
  echo "Health check failed. The previous release was restored when available." >&2
  exit 70
fi

echo "Release $release_id is healthy."
