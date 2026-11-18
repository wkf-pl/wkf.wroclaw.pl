#!/usr/bin/env bash

set -euo pipefail

ubuntu_sources_path="${1:-/etc/apt/sources.list.d/ubuntu.sources}"
apt_mirror_list_path="${2:-/etc/apt/apt-mirrors.txt}"

if [[ ! -f "$ubuntu_sources_path" ]] ||
  ! grep --fixed-strings --quiet 'mirror+file:/etc/apt/apt-mirrors.txt' "$ubuntu_sources_path"; then
  echo 'Keeping existing Ubuntu package sources.'
  exit 0
fi

global_mirror='^https?://archive\.ubuntu\.com/ubuntu/?[[:space:]]+priority:'
azure_mirror='^https?://azure\.archive\.ubuntu\.com/ubuntu/?[[:space:]]+priority:'

if ! grep --extended-regexp --quiet "${global_mirror}[0-9]+[[:space:]]*$" "$apt_mirror_list_path" ||
  ! grep --extended-regexp --quiet "${azure_mirror}[0-9]+[[:space:]]*$" "$apt_mirror_list_path"; then
  echo 'Keeping existing Ubuntu mirror priorities.'
  exit 0
fi

sed --in-place --regexp-extended \
  --expression="s|(${global_mirror})[0-9]+([[:space:]]*)$|\\11\\2|" \
  --expression="s|(${azure_mirror})[0-9]+([[:space:]]*)$|\\12\\2|" \
  "$apt_mirror_list_path"
