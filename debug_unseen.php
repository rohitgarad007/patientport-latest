<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'patientport_live'; // Assuming this is the DB name based on typical XAMPP setups, or I'll check config

// Try to find database config
$configFile = 'c:/xampp/htdocs/patientport-liveApp/api/application/config/database.php';
if (file_exists($configFile)) {
    include($configFile);
    $db_host = $db['default']['hostname'];
    $db_user = $db['default']['username'];
    $db_pass = $db['default']['password'];
    $db_name = $db['default']['database'];
}

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h3>Database Check</h3>";

// 1. Check Column Existence
$result = $conn->query("SHOW COLUMNS FROM lb_lab_orders LIKE 'is_seen'");
if ($result->num_rows > 0) {
    echo "Column 'is_seen' exists in 'lb_lab_orders'.<br>";
} else {
    echo "<b>ERROR: Column 'is_seen' MISSING in 'lb_lab_orders'.</b><br>";
}

// 2. Check Unseen Orders Count
$sql = "SELECT lab_id, COUNT(*) as unseen_count FROM lb_lab_orders WHERE is_seen = 0 GROUP BY lab_id";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<h4>Unseen Orders by Lab ID:</h4><ul>";
    while($row = $result->fetch_assoc()) {
        echo "<li>Lab ID " . $row["lab_id"] . ": " . $row["unseen_count"] . " unseen orders</li>";
    }
    echo "</ul>";
} else {
    echo "No unseen orders found in database.<br>";
}

// 3. Check Log File
$logFile = 'c:/xampp/htdocs/patientport-liveApp/api/application/logs/lab_notifications.log';
echo "<h3>Log File Content</h3>";
if (file_exists($logFile)) {
    echo "<pre>" . htmlspecialchars(file_get_contents($logFile)) . "</pre>";
} else {
    echo "Log file not found yet (API might not have been hit).";
}

$conn->close();
?>