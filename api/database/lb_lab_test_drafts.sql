CREATE TABLE `lb_lab_test_drafts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `test_id` int(11) NOT NULL,
  `parameter_id` int(11) NOT NULL,
  `result_value` varchar(255) DEFAULT NULL,
  `flag` varchar(50) DEFAULT NULL,
  `delta` varchar(50) DEFAULT NULL,
  `delta_direction` varchar(20) DEFAULT NULL,
  `draft_status` enum('draft','submitted','validated') NOT NULL DEFAULT 'draft',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `test_id` (`test_id`),
  KEY `parameter_id` (`parameter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
