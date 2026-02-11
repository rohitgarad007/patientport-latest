<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

function openssl_EVP_BytesToKey($password, $salt, $key_len, $iv_len) {
    $m = [];
    $count = 0;
    while ($count < $key_len + $iv_len) {
        $data = $password . $salt;
        if (count($m) > 0) {
            $data = end($m) . $data;
        }
        $m[] = md5($data, true);
        $count += 16;
    }
    $keyAndIV = '';
    foreach ($m as $val) {
        $keyAndIV .= $val;
    }
    return [
        'key' => substr($keyAndIV, 0, $key_len),
        'iv' => substr($keyAndIV, $key_len, $iv_len)
    ];
}

function encrypt_aes_for_js($plainText, $passphrase) {
    $salt = openssl_random_pseudo_bytes(8);
    $salted = 'Salted__' . $salt;
    $keyAndIV = openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
    $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
    return base64_encode($salted . $encrypted);
}

// Simulate DB update
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'umahospital_db';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$hospital_id = 1; // Assuming hospital ID 1 exists
$data = [
    'screen_layout_id' => 1,
    'volume' => 75,
    'is_muted' => 0,
    'repeat_count' => 2,
    'is_announcing' => 0,
    'is_paused' => 0,
    'flash_on_call' => 1,
    'emergency_mode' => 0,
    'settings' => '{"foo":"bar"}'
];

echo "Attempting update...\n";
// Check if row exists
$check = $conn->query("SELECT * FROM ms_hospitals_screen_settings WHERE hospital_id=$hospital_id");
if ($check->num_rows > 0) {
    $sql = "UPDATE ms_hospitals_screen_settings SET 
            screen_layout_id='{$data['screen_layout_id']}',
            volume={$data['volume']},
            is_muted={$data['is_muted']},
            repeat_count={$data['repeat_count']},
            is_announcing={$data['is_announcing']},
            is_paused={$data['is_paused']},
            flash_on_call={$data['flash_on_call']},
            emergency_mode={$data['emergency_mode']},
            settings='{$data['settings']}'
            WHERE hospital_id=$hospital_id";
} else {
    $sql = "INSERT INTO ms_hospitals_screen_settings (hospital_id, screen_layout_id, volume, is_muted, repeat_count, is_announcing, is_paused, flash_on_call, emergency_mode, settings) VALUES (
            $hospital_id, '{$data['screen_layout_id']}', {$data['volume']}, {$data['is_muted']}, {$data['repeat_count']}, {$data['is_announcing']}, {$data['is_paused']}, {$data['flash_on_call']}, {$data['emergency_mode']}, '{$data['settings']}')";
}

if ($conn->query($sql) === TRUE) {
    echo "Update successful.\n";
} else {
    echo "Error updating: " . $conn->error . "\n";
}
$conn->close();
?>