CREATE TABLE `lb_laboratory_staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_uid` varchar(50) NOT NULL,
  `lab_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(50) NOT NULL COMMENT 'admin, pathologist, lab-technician, receptionist, phlebotomist',
  `status` enum('active','inactive') DEFAULT 'active',
  `isdelete` tinyint(1) DEFAULT 0,
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_uid` (`staff_uid`),
  KEY `lab_id` (`lab_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
