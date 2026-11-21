#!/usr/bin/env bash

curl_config_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "$value"
}

write_ftps_curl_config() (
  umask 077
  printf 'user = "%s:%s"\n' "$(curl_config_escape "$FTPS_USER")" "$(curl_config_escape "$FTPS_PASSWORD")" >"$1"
)
