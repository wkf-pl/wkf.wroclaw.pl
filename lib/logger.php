<?php
declare(strict_types=1);

function logger(string $level, string $message, array $context = []): void {
  $logDir = __DIR__ . '/../logs';

  if (!is_dir($logDir) && !@mkdir($logDir, 0750, true) && !is_dir($logDir)) {
    return;
  }

  $normalizedLevel = strtoupper($level);
  $filePrefix = $normalizedLevel === 'ERROR' ? 'error' : 'app';
  $filePath = sprintf('%s/%s-%s.log', $logDir, $filePrefix, date('Y-m-d'));

  $encodedContext = '';
  if ($context !== []) {
    $json = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json !== false) {
      $encodedContext = ' ' . $json;
    }
  }

  $line = sprintf(
    "[%s] [%s] %s%s\n",
    date('Y-m-d H:i:s'),
    $normalizedLevel,
    $message,
    $encodedContext
  );

  @error_log($line, 3, $filePath);
}

function logInfo(string $message, array $context = []): void {
  logger('INFO', $message, $context);
}

function logErr(string $message, array $context = []): void {
  logger('ERROR', $message, $context);
}

