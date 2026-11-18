#!/usr/bin/env bash

set -euo pipefail

ubuntu_sources_path="${1:-/etc/apt/sources.list.d/ubuntu.sources}"

if [[ ! -f "$ubuntu_sources_path" ]]; then
  exit 0
fi

sed --in-place --regexp-extended \
  's#^(URIs:[[:space:]]+)(mirror\+file:/etc/apt/apt-mirrors\.txt|https?://[[:alnum:].-]+\.archive\.ubuntu\.com/ubuntu/?)([[:space:]]*)$#\1https://archive.ubuntu.com/ubuntu/\3#' \
  "$ubuntu_sources_path"
