<?php
declare(strict_types=1);

function buildContactHtmlEmail(array $data): string {
  $name = (string)($data['name'] ?? '');
  $topicLabel = (string)($data['topicLabel'] ?? '');
  $email = (string)($data['email'] ?? '');
  $phone = (string)($data['phone'] ?? '');
  $ip = (string)($data['ip'] ?? '');
  $sentAt = (string)($data['sentAt'] ?? '');
  $message = (string)($data['message'] ?? '');

  $h = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $messageHtml = $message !== '' ? nl2br($h($message)) : '<em>Brak</em>';
  $emailHtml = filter_var($email, FILTER_VALIDATE_EMAIL)
    ? '<a href="mailto:' . $h($email) . '">' . $h($email) . '</a>'
    : $h($email);
  $phoneHref = preg_replace('/(?!^)\+|[^\d+]/', '', $phone) ?? '';
  $phoneHtml = preg_match('/\d{3,}/', $phoneHref) === 1
    ? '<a href="tel:' . $h($phoneHref) . '">' . $h($phone) . '</a>'
    : $h($phone);

  return
    '<!doctype html><html lang="pl"><body style="margin:0;padding:16px;background:#f5f1ff;color:#15131d;font:14px/1.5 Arial,sans-serif;">' .
    '<div style="max-width:680px;margin:0 auto;background:#fff8ef;border:1px solid #ded2bd;border-radius:8px;padding:20px;">' .
    '<h2 style="margin:0 0 12px;font-size:20px;">Nowa wiadomość z formularza WKF</h2>' .
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px;">' .
    '<tr><td style="padding:6px 8px;border:1px solid #ded2bd;background:#edf6f2;"><strong>Imię lub pseudonim</strong></td><td style="padding:6px 8px;border:1px solid #ded2bd;">' . $h($name) . '</td></tr>' .
    '<tr><td style="padding:6px 8px;border:1px solid #ded2bd;background:#edf6f2;"><strong>Temat</strong></td><td style="padding:6px 8px;border:1px solid #ded2bd;">' . $h($topicLabel) . '</td></tr>' .
    '<tr><td style="padding:6px 8px;border:1px solid #ded2bd;background:#edf6f2;"><strong>E-mail</strong></td><td style="padding:6px 8px;border:1px solid #ded2bd;">' . $emailHtml . '</td></tr>' .
    '<tr><td style="padding:6px 8px;border:1px solid #ded2bd;background:#edf6f2;"><strong>Telefon lub komunikator</strong></td><td style="padding:6px 8px;border:1px solid #ded2bd;">' . $phoneHtml . '</td></tr>' .
    '<tr><td style="padding:6px 8px;border:1px solid #ded2bd;background:#edf6f2;"><strong>IP</strong></td><td style="padding:6px 8px;border:1px solid #ded2bd;">' . $h($ip) . '</td></tr>' .
    '<tr><td style="padding:6px 8px;border:1px solid #ded2bd;background:#edf6f2;"><strong>Data</strong></td><td style="padding:6px 8px;border:1px solid #ded2bd;">' . $h($sentAt) . '</td></tr>' .
    '</table>' .
    '<h3 style="margin:0 0 8px;font-size:16px;">Wiadomość</h3>' .
    '<div style="padding:12px;border:1px solid #ded2bd;border-radius:8px;background:#ffffff;white-space:normal;">' . $messageHtml . '</div>' .
    '</div></body></html>';
}

