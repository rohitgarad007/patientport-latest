<?php
define('BASEPATH', 'system/');
define('ENVIRONMENT', 'development');
require_once('api/application/config/database.php');

$conn = new mysqli($db['default']['hostname'], $db['default']['username'], $db['default']['password'], $db['default']['database']);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SHOW COLUMNS FROM ms_doctors";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Columns in ms_doctors table:\n";
    while($row = $result->fetch_assoc()) {
        echo $row["Field"] . "\n";
    }
} else {
    echo "0 results";
}
$conn->close();
?>