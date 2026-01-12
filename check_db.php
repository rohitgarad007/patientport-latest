<?php
$mysqli = new mysqli("localhost", "root", "", "umahospital_db");
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    exit();
}

$result = $mysqli->query("DESCRIBE ms_patient_appointment");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
    $result->free();
} else {
    echo "Error: " . $mysqli->error;
}

$mysqli->close();
?>
