<?php
$mysqli = new mysqli("localhost", "root", "", "umahospital_db");
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    exit();
}

// Check if columns exist
$result = $mysqli->query("SHOW COLUMNS FROM ms_patient_treatment_lab_reports LIKE 'is_combined'");
if ($result->num_rows == 0) {
    $sql = "ALTER TABLE ms_patient_treatment_lab_reports ADD COLUMN is_combined TINYINT(1) DEFAULT 0";
    if ($mysqli->query($sql) === TRUE) {
        echo "Column is_combined added successfully\n";
    } else {
        echo "Error adding is_combined: " . $mysqli->error . "\n";
    }
} else {
    echo "Column is_combined already exists\n";
}

$result = $mysqli->query("SHOW COLUMNS FROM ms_patient_treatment_lab_reports LIKE 'covered_tests'");
if ($result->num_rows == 0) {
    $sql = "ALTER TABLE ms_patient_treatment_lab_reports ADD COLUMN covered_tests TEXT";
    if ($mysqli->query($sql) === TRUE) {
        echo "Column covered_tests added successfully\n";
    } else {
        echo "Error adding covered_tests: " . $mysqli->error . "\n";
    }
} else {
    echo "Column covered_tests already exists\n";
}

$mysqli->close();
?>
