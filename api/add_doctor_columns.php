<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "umahospital_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

// Add room_number and avg_consultation_time to ms_doctors
$sql = "ALTER TABLE ms_doctors 
        ADD COLUMN IF NOT EXISTS room_number VARCHAR(50) DEFAULT '101', 
        ADD COLUMN IF NOT EXISTS avg_consultation_time VARCHAR(50) DEFAULT '10 min'";

if ($conn->query($sql) === TRUE) {
  echo "Columns added successfully\n";
} else {
  echo "Error adding columns: " . $conn->error . "\n";
}

// Verify columns
$result = $conn->query("SHOW COLUMNS FROM ms_doctors");
if ($result) {
    while($row = $result->fetch_assoc()) {
        if(in_array($row['Field'], ['room_number', 'avg_consultation_time'])) {
            echo "Verified: " . $row['Field'] . "\n";
        }
    }
}

$conn->close();
?>