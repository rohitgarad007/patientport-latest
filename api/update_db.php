<?php
// Script to add is_processing_seen column to lb_lab_orders table
// Place this file in api/ directory and run it via browser or command line

define('BASEPATH', 'dummy'); // Prevent direct script access check from blocking
define('ENVIRONMENT', 'development');

// Load database configuration manually since we are outside CI
require_once 'application/config/database.php';

$db = $db['default'];

$dsn = 'mysql:host='.$db['hostname'].';dbname='.$db['database'].';charset='.$db['char_set'];
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $db['username'], $db['password'], $options);
    
    // Check if column exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM lb_lab_orders LIKE 'is_processing_seen'");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result) {
        echo "Column 'is_processing_seen' already exists.\n";
    } else {
        // Add column
        $sql = "ALTER TABLE lb_lab_orders ADD COLUMN is_processing_seen INT(1) DEFAULT 0 AFTER is_queue_seen";
        // If is_queue_seen doesn't exist, just add it at the end. 
        // Safer to just add it.
        // Let's check is_queue_seen first just to be nice with ordering, but not strictly necessary.
        
        $pdo->exec("ALTER TABLE lb_lab_orders ADD COLUMN is_processing_seen INT(1) DEFAULT 0");
        echo "Column 'is_processing_seen' added successfully.\n";
    }
    
} catch (\PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
?>
