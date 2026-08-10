<?php
declare(strict_types=1);

function respond(int $status, array $payload): void {
  $accept = strtolower((string)($_SERVER['HTTP_ACCEPT'] ?? ''));
  $xrw = strtolower((string)($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''));
  $wantsJson = str_contains($accept, 'application/json') || $xrw === 'xmlhttprequest';

  if ($wantsJson) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
  }

  $contactStatus = !empty($payload['ok']) ? 'success' : 'error';
  header('Location: index.html?contactStatus=' . rawurlencode($contactStatus) . '#kontakt', true, 303);
  exit;
}

