<?php
echo "Starting migration...\n";
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "umahospital_db";

$conn = new mysqli($servername, $username, $password);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);
$conn->select_db($dbname);

$check = $conn->query("SHOW COLUMNS FROM lb_lab_orders LIKE 'is_queue_seen'");
if ($check->num_rows == 0) {
    $sql = "ALTER TABLE lb_lab_orders ADD COLUMN is_queue_seen INT(1) NOT NULL DEFAULT 0 AFTER is_seen";
    if ($conn->query($sql) === TRUE) {
        echo "Column is_queue_seen added successfully\n";
    } else {
        echo "Error adding column: " . $conn->error . "\n";
    }
} else {
    echo "Column is_queue_seen already exists\n";
}
$conn->close();
?>
