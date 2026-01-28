<?php
// Connect to DB using credentials from application/config/database.php
// But since I don't want to parse that file, I'll just try to load CI or use standard XAMPP defaults (root/empty)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "umahospital_db"; // Guessing DB name from project folder name, but I should check database.php

// Let's check database.php first to be sure
$db_config = file_get_contents('application/config/database.php');
if (preg_match("/'database'\s*=>\s*'([^']+)'/", $db_config, $matches)) {
    $dbname = $matches[1];
}
if (preg_match("/'username'\s*=>\s*'([^']+)'/", $db_config, $matches)) {
    $username = $matches[1];
}
if (preg_match("/'password'\s*=>\s*'([^']*)'/", $db_config, $matches)) {
    $password = $matches[1];
}

echo "Connecting to DB: $dbname with user: $username\n";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check ms_hospitals columns
$sql = "SHOW COLUMNS FROM ms_hospitals";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "Columns in ms_hospitals:\n";
    while($row = $result->fetch_assoc()) {
        echo $row["Field"] . "\n";
    }
} else {
    echo "Error getting columns: " . $conn->error . "\n";
}

// Check if any hospital exists
$sql = "SELECT hosuid, name FROM ms_hospitals LIMIT 1";
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo "\nFound hospital: " . $row['name'] . " (UID: " . $row['hosuid'] . ")\n";
} else {
    echo "\nNo hospitals found.\n";
}

$conn->close();
?>
