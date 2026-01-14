<?php
// Database credentials
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

// 1. Add columns to lb_lab_orders if they don't exist
$columnsToAdd = [
    "total_amount" => "DECIMAL(10,2) DEFAULT 0.00 AFTER `status`",
    "paid_amount" => "DECIMAL(10,2) DEFAULT 0.00 AFTER `total_amount`",
    "payment_status" => "VARCHAR(20) DEFAULT 'Pending' AFTER `paid_amount`"
];

foreach ($columnsToAdd as $col => $def) {
    $checkSql = "SHOW COLUMNS FROM `lb_lab_orders` LIKE '$col'";
    $result = $conn->query($checkSql);
    if ($result->num_rows == 0) {
        $sql = "ALTER TABLE `lb_lab_orders` ADD COLUMN `$col` $def";
        if ($conn->query($sql) === TRUE) {
            echo "Column $col added successfully to lb_lab_orders.\n";
        } else {
            echo "Error adding column $col: " . $conn->error . "\n";
        }
    } else {
        echo "Column $col already exists in lb_lab_orders.\n";
    }
}

// 2. Create lb_lab_order_payments table
$createTableSql = "CREATE TABLE IF NOT EXISTS `lb_lab_order_payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `lab_id` INT(11) NOT NULL,
  `order_id` INT(11) UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `payment_method` VARCHAR(50) DEFAULT 'Cash',
  `transaction_ref` VARCHAR(100),
  `notes` TEXT,
  `created_by` INT(11),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_lab_id` (`lab_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($createTableSql) === TRUE) {
    echo "Table lb_lab_order_payments created successfully (or already exists).\n";
} else {
    echo "Error creating table lb_lab_order_payments: " . $conn->error . "\n";
}

$conn->close();
?>
