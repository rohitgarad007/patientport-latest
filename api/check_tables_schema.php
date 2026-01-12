<?php
define('BASEPATH', 'system/');
define('ENVIRONMENT', 'development');
require_once('api/application/config/database.php');

$conn = new mysqli($db['default']['hostname'], $db['default']['username'], $db['default']['password'], $db['default']['database']);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$tables = ['lb_lab_test_drafts', 'ms_lab_test_parameters', 'ms_lab_tests'];

foreach ($tables as $table) {
    echo "Columns in $table table:\n";
    $sql = "SHOW COLUMNS FROM $table";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo $row["Field"] . "\n";
        }
    } else {
        echo "Table $table not found or 0 results\n";
    }
    echo "\n";
}
$conn->close();
?>