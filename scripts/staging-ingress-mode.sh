#!/usr/bin/env bash

staging_ingress_url() {
  local ingress_host
  ingress_host="$(az containerapp show --resource-group "$resource_group_name" --name "${application_name}-ingress" \
    --query properties.configuration.ingress.fqdn --output tsv)" || return 1
  [[ -n "$ingress_host" ]] || return 1
  printf 'https://%s\n' "$ingress_host"
}

wait_for_staging_ingress() {
  local expected_status="$1"
  local ingress_url="$2"
  local path="$3"
  local response_file
  local status
  local deadline=$((SECONDS + health_timeout_seconds))

  response_file="$(mktemp)" || return 1
  while ((SECONDS < deadline)); do
    status="$(curl --silent --max-time 15 --output "$response_file" --write-out '%{http_code}' "$ingress_url$path" || true)"
    if [[ "$status" == "$expected_status" ]] && {
      [[ "$expected_status" != 503 ]] ||
        { grep -Fq 'httpErrorCode">503<' "$response_file" && grep -Fq 'mailto:webmaster@wkf.wroclaw.pl' "$response_file"; }
    }; then
      rm -f -- "$response_file"
      echo "Verified staging ingress: $ingress_url$path returned HTTP $expected_status"
      return 0
    fi
    sleep 5
  done

  rm -f -- "$response_file"
  echo "Expected HTTP $expected_status from $ingress_url$path; last status: ${status:-unknown}" >&2
  return 1
}

set_staging_ingress_mode() {
  local enabled="$1"
  local ingress_url
  ingress_url="$(staging_ingress_url)" || return 1

  az containerapp update --resource-group "$resource_group_name" --name "${application_name}-ingress" \
    --set-env-vars "MAINTENANCE_ENABLED=$enabled" --output none || return 1

  if [[ "$enabled" == 1 ]]; then
    wait_for_staging_ingress 503 "$ingress_url" /
  else
    wait_for_staging_ingress 200 "$ingress_url" /api/health &&
      wait_for_staging_ingress 200 "$ingress_url" /
  fi
}

check_staging_listing_page() {
  local revision_url="$1"
  local page_html

  page_html="$(curl --fail --silent --show-error --connect-timeout 3 --max-time 15 \
    --header 'Cache-Control: no-cache' --write-out $'\n%{http_code}' "$revision_url/aktualnosci")" || return 1
  [[ "$page_html" == *$'\n200' &&
     "$page_html" == *'<article class="cmsDocument cmsPageDocument">'* &&
     "$page_html" == *'<div class="listingBlock">'* &&
     "$page_html" != *'data-next-error-message='* &&
     "$page_html" != *'id="__next_error__"'* ]]
}
