<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting DB check...\n";

$db_hostname = 'localhost';
$db_username = 'root';
$db_password = '';
$db_database = 'umahospital_db';

$conn = new mysqli($db_hostname, $db_username, $db_password, $db_database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully.\n";

$result = $conn->query("SHOW COLUMNS FROM ms_staff");

if ($result) {
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo $row["Field"] . "\n";
        }
    } else {
        echo "0 results\n";
    }
} else {
    echo "Query failed: " . $conn->error . "\n";
}

$conn->close();
?>
