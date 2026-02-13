<?php
// Custom script to check database schema
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "umahospital_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$tables = ["ms_doctor_time_slots"];

foreach ($tables as $table) {
    echo "Columns in $table:\n";
    $sql = "SHOW COLUMNS FROM $table";
    $result = $conn->query($sql);
    if ($result && $result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
        echo $row["Field"] . "\n";
      }
    } else {
      echo "0 results or table not found\n";
    }
    echo "-------------------\n";
}

$conn->close();
?>