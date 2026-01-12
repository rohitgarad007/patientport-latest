<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load CodeIgniter
// require_once 'index.php';

// This is a hack to get CI instance outside of normal flow, but easier to just query DB directly if we can't bootstrap easily.
// Let's just use raw PHP for this check to be fast.
$host = 'localhost';
$db   = 'umahospital_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    echo "Connecting...\n";
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected. Querying...\n";
    $stmt = $pdo->query("SELECT * FROM patient_shared_receipts ORDER BY created_at DESC LIMIT 5");
    $rows = $stmt->fetchAll();
    echo "Rows fetched: " . count($rows) . "\n";
    echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (\PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage();
}
