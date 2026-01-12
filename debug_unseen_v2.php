<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'umahospital_db'; // Corrected DB name

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}

echo "Database Connected Successfully.\n";

// 1. Check Column Existence
$result = $conn->query("SHOW COLUMNS FROM lb_lab_orders LIKE 'is_seen'");
if ($result && $result->num_rows > 0) {
    echo "SUCCESS: Column 'is_seen' exists in 'lb_lab_orders'.\n";
} else {
    echo "ERROR: Column 'is_seen' MISSING in 'lb_lab_orders'.\n";
}

// 2. Check Unseen Orders Count
$sql = "SELECT lab_id, COUNT(*) as unseen_count FROM lb_lab_orders WHERE is_seen = 0 GROUP BY lab_id";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "Unseen Orders by Lab ID:\n";
    while($row = $result->fetch_assoc()) {
        echo " - Lab ID " . $row["lab_id"] . ": " . $row["unseen_count"] . " unseen orders\n";
    }
} else {
    echo "No unseen orders found in database (count is 0).\n";
}

// 3. Check Log File
$logFile = 'c:/xampp/htdocs/patientport-liveApp/api/application/logs/lab_notifications.log';
echo "\n--- Log File Content ---\n";
if (file_exists($logFile)) {
    echo file_get_contents($logFile);
} else {
    echo "Log file not found at $logFile.\n";
}

$conn->close();
?>