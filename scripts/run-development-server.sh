#!/usr/bin/env bash

set -Eeuo pipefail

if [[ "${WKF_ALLOW_NEXT_DEV:-}" != "1" ]]; then
  echo "Refusing to start next dev without the local-only WKF_ALLOW_NEXT_DEV=1 opt-in." >&2
  exit 2
fi

distribution_directory="${NEXT_DIST_DIR:-.next-host}"

exec ./node_modules/.bin/cross-env \
  NODE_ENV=development \
  NEXT_DIST_DIR="$distribution_directory" \
  NODE_OPTIONS=--no-deprecation \
  ./node_modules/.bin/next dev "$@"
