#!/usr/bin/env bash

set -euo pipefail

ubuntu_sources_path="${1:-/etc/apt/sources.list.d/ubuntu.sources}"
apt_mirror_list_path="${2:-/etc/apt/apt-mirrors.txt}"

grep --fixed-strings --quiet \
  'mirror+file:/etc/apt/apt-mirrors.txt' \
  "$ubuntu_sources_path"

sed --in-place \
  --expression='\|^http://azure\.archive\.ubuntu\.com/ubuntu/|s|priority:1|priority:2|' \
  --expression='\|^https://archive\.ubuntu\.com/ubuntu/|s|priority:2|priority:1|' \
  "$apt_mirror_list_path"

grep --extended-regexp --quiet \
  '^https://archive\.ubuntu\.com/ubuntu/[[:space:]]+priority:1$' \
  "$apt_mirror_list_path"
grep --extended-regexp --quiet \
  '^http://azure\.archive\.ubuntu\.com/ubuntu/[[:space:]]+priority:2$' \
  "$apt_mirror_list_path"
