<?php
declare(strict_types=1);

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = time();
$windowSeconds = 60;
$maxInWindow = 3;

$rateKey = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $ip);
$rateFile = sys_get_temp_dir() . '/wkf_contact_rate_' . $rateKey;

$hits = [];
if (file_exists($rateFile)) {
  $decoded = json_decode((string)file_get_contents($rateFile), true);
  if (is_array($decoded)) {
    $hits = $decoded;
  }
}

$hits = array_values(array_filter($hits, fn($hit) => is_int($hit) && ($now - $hit) < $windowSeconds));
if (count($hits) >= $maxInWindow) {
  if (function_exists('logInfo')) {
    logInfo('contact_rate_limited', [
      'ip' => $ip,
      'windowSeconds' => $windowSeconds,
      'maxInWindow' => $maxInWindow,
      'hitsInWindow' => count($hits),
    ]);
  }
  respond(429, ['ok' => false, 'error' => 'Too many attempts. Please try again later.']);
}

$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits));

