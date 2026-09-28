#!/usr/bin/env bash

# Packages a built standalone Next.js runtime for production-mode E2E test shards.

set -Eeuo pipefail

distribution_directory="${NEXT_DIST_DIR:-.next-host}"
standalone_directory="$distribution_directory/standalone"
static_directory="$distribution_directory/static"
archive_path="${1:-tmp/wkf-next-runtime.tar.gz}"

if [[ "$archive_path" != /* ]]; then
  archive_path="$PWD/$archive_path"
fi

if [[ ! -f "$standalone_directory/server.js" ]]; then
  echo "Missing standalone Next.js server: $standalone_directory/server.js" >&2
  exit 1
fi

if [[ ! -d "$static_directory" ]]; then
  echo "Missing static Next.js output: $static_directory" >&2
  exit 1
fi

if [[ ! -d public ]]; then
  echo "Missing public assets directory." >&2
  exit 1
fi

runtime_staging_directory="$(mktemp -d)"
runtime_distribution_directory="$runtime_staging_directory/${distribution_directory#./}"

cleanup() {
  rm -rf -- "$runtime_staging_directory"
}

trap cleanup EXIT

cp -a "$standalone_directory/." "$runtime_staging_directory/"
mkdir -p "$runtime_distribution_directory/static"
cp -a "$static_directory/." "$runtime_distribution_directory/static/"
mkdir -p "$runtime_staging_directory/public"
cp -a public/. "$runtime_staging_directory/public/"

mkdir -p "$(dirname "$archive_path")"
tar -C "$runtime_staging_directory" -czf "$archive_path" .

echo "Packaged the E2E production runtime at $archive_path"
