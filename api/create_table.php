<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'umahospital_db';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL to create table
$sql = "CREATE TABLE IF NOT EXISTS `lb_collected_samples` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(150) NOT NULL,
  `test_id` varchar(150) DEFAULT NULL,
  `sample_name` varchar(255) DEFAULT NULL,
  `sample_type` varchar(150) DEFAULT NULL,
  `volume` varchar(50) DEFAULT NULL,
  `tubes` varchar(50) DEFAULT NULL,
  `anticoagulant` varchar(150) DEFAULT NULL,
  `storage` varchar(150) DEFAULT NULL,
  `method` varchar(150) DEFAULT NULL,
  `tat` varchar(150) DEFAULT NULL,
  `collected_by` int(11) NOT NULL,
  `lab_id` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'Collected',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql) === TRUE) {
    echo "Table lb_collected_samples created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
