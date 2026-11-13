<?php

declare(strict_types=1);

require getcwd().'/vendor/autoload.php';

if (!in_array(getenv('APP_ENV'), ['local', 'development'], true)) {
    fwrite(STDERR, "Environment preparation is restricted to local development.\n");
    exit(1);
}

$path = getcwd().'/.env';
$contents = str_replace("\r\n", "\n", file_get_contents($path));
$values = Dotenv\Dotenv::parse($contents);
$example = Dotenv\Dotenv::parse(file_get_contents(getcwd().'/.env.example'));
$fileKey = $values['APP_KEY'] ?? '';
$runtimeKey = getenv('APP_KEY') ?: '';

if ($fileKey !== '' && $runtimeKey !== '' && !hash_equals($fileKey, $runtimeKey)) {
    fwrite(STDERR, "APP_KEY differs between the environment and backend/.env. Resolve the conflict without rotating an existing key.\n");
    exit(1);
}

$key = $fileKey ?: ($runtimeKey ?: 'base64:'.base64_encode(random_bytes(32)));
$decodedKey = str_starts_with($key, 'base64:') ? base64_decode(substr($key, 7), true) : $key;
if (!is_string($decodedKey) || strlen($decodedKey) !== 32) {
    fwrite(STDERR, "APP_KEY is not valid for AES-256-CBC. Existing keys were left unchanged.\n");
    exit(1);
}

$updates = ['APP_KEY' => $key];
$jwt = $values['JWT_SECRET'] ?? '';
if ($jwt === '' || ($example['JWT_SECRET'] ?? '') !== '' && hash_equals($example['JWT_SECRET'], $jwt)) {
    $updates['JWT_SECRET'] = bin2hex(random_bytes(32));
}

$written = [];
$lines = [];
foreach (explode("\n", $contents) as $line) {
    $name = explode('=', $line, 2)[0];
    if (array_key_exists($name, $updates)) {
        if (isset($written[$name])) {
            continue;
        }
        $line = $name.'='.$updates[$name];
        $written[$name] = true;
    }
    $lines[] = $line;
}
foreach (array_diff_key($updates, $written) as $name => $value) {
    $lines[] = $name.'='.$value;
}
$contents = rtrim(implode("\n", $lines))."\n";

if (file_put_contents($path, $contents, LOCK_EX) === false) {
    fwrite(STDERR, "Unable to save backend/.env.\n");
    exit(1);
}

fwrite(STDOUT, "Development secrets are ready; existing application keys were preserved.\n");
