<?php
// Script to add notification columns to lb_lab_orders table
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
    
    // Ensure is_processing_seen column
    $stmt = $pdo->prepare("SHOW COLUMNS FROM lb_lab_orders LIKE 'is_processing_seen'");
    $stmt->execute();
    $hasProcessingSeen = $stmt->fetch();
    if ($hasProcessingSeen) {
        echo "Column 'is_processing_seen' already exists.\n";
    } else {
        $pdo->exec("ALTER TABLE lb_lab_orders ADD COLUMN is_processing_seen INT(1) DEFAULT 0");
        echo "Column 'is_processing_seen' added successfully.\n";
    }

    // Ensure is_completed_seen column
    $stmt = $pdo->prepare("SHOW COLUMNS FROM lb_lab_orders LIKE 'is_completed_seen'");
    $stmt->execute();
    $hasCompletedSeen = $stmt->fetch();
    if ($hasCompletedSeen) {
        echo "Column 'is_completed_seen' already exists.\n";
    } else {
        $pdo->exec("ALTER TABLE lb_lab_orders ADD COLUMN is_completed_seen INT(1) DEFAULT 0");
        echo "Column 'is_completed_seen' added successfully.\n";
    }

    // Ensure is_viewlab_report column on ms_patient_treatment_lab_reports
    $stmt = $pdo->prepare("SHOW COLUMNS FROM ms_patient_treatment_lab_reports LIKE 'is_viewlab_report'");
    $stmt->execute();
    $hasViewLab = $stmt->fetch();
    if ($hasViewLab) {
        echo "Column 'is_viewlab_report' already exists.\n";
    } else {
        $pdo->exec("ALTER TABLE ms_patient_treatment_lab_reports ADD COLUMN is_viewlab_report INT(1) DEFAULT 1");
        echo "Column 'is_viewlab_report' added successfully.\n";
    }
    
} catch (\PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
?>
