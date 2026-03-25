<?php
/**
 * MujMakler.cz – PHP mail handler
 * Přijímá POST z app.js a odesílá e-mail přes PHP mail().
 * Umístit do kořene webu na forpsi hosting.
 */

header('Content-Type: application/json; charset=utf-8');

// ── Bezpečnost: pouze POST ────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Referrer check (základní ochrana) ────────────────────────────────────────
$allowed = ['mujmakler.cz', 'www.mujmakler.cz', 'localhost'];
$ref_host = parse_url($_SERVER['HTTP_REFERER'] ?? '', PHP_URL_HOST);
if (!in_array($ref_host, $allowed, true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

// ── Honeypot: skrytá past na boty ─────────────────────────────────────────────
if (!empty($_POST['_hp'])) {
    // Bot to vyplnil – tiše ukončíme (neříkáme botovi, že selhal)
    echo json_encode(['success' => true]);
    exit;
}

// ── Rate limiting přes session ────────────────────────────────────────────────
session_start();
$now = time();
if (!isset($_SESSION['mm_last'])) {
    $_SESSION['mm_last'] = 0;
    $_SESSION['mm_count'] = 0;
}
if ($now - $_SESSION['mm_last'] < 600) {
    $_SESSION['mm_count']++;
    if ($_SESSION['mm_count'] > 5) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Příliš mnoho pokusů, zkuste to za chvíli.']);
        exit;
    }
} else {
    $_SESSION['mm_count'] = 1;
}
$_SESSION['mm_last'] = $now;

// ── Pomocné funkce ────────────────────────────────────────────────────────────
function clean(string $s): string {
    return strip_tags(trim($s));
}

function encodeSubject(string $s): string {
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

// ── Vstupní data ──────────────────────────────────────────────────────────────
$to      = 'petr.novak@mujmakler.cz';
$subject = clean($_POST['_subject'] ?? 'Nová zpráva z webu');
$source  = clean($_POST['_source'] ?? '');

// Pole, která nepatří do těla zprávy
$skip = ['_subject', '_source', '_hp', '_template', '_captcha'];

// ── Sestavení těla zprávy ─────────────────────────────────────────────────────
$lines = [];
if ($source) {
    $lines[] = 'Zdroj: ' . $source;
    $lines[] = '';
}

$reply_email = '';
foreach ($_POST as $key => $value) {
    if (in_array($key, $skip, true)) continue;
    $k = clean($key);
    $v = clean((string) $value);
    if ($v === '') continue;
    $lines[] = $k . ': ' . $v;

    // Hledáme e-mail odesílatele pro Reply-To
    if (!$reply_email && strtolower($k) === 'email') {
        $candidate = filter_var($v, FILTER_VALIDATE_EMAIL);
        if ($candidate) {
            $reply_email = $candidate;
        }
    }
}

$body = implode("\r\n", $lines);

// ── Hlavičky ──────────────────────────────────────────────────────────────────
$from_addr  = 'noreply@mujmakler.cz';
$from_name  = 'MujMakler.cz web';
$reply_to   = $reply_email ?: $from_addr;

$headers  = 'From: ' . $from_name . ' <' . $from_addr . '>' . "\r\n";
$headers .= 'Reply-To: ' . $reply_to . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

// ── Odeslání ──────────────────────────────────────────────────────────────────
$ok = mail($to, encodeSubject($subject), $body, $headers);

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Odeslání selhalo, zkuste to prosím znovu.']);
}
