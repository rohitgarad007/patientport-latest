CREATE TABLE IF NOT EXISTS `ms_patient_treatment_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `purpose` longtext DEFAULT NULL,
  `diagnosis` longtext DEFAULT NULL,
  `lab_tests` longtext DEFAULT NULL,
  `lab_reports` longtext DEFAULT NULL,
  `medications` longtext DEFAULT NULL,
  `treatment_status` varchar(50) DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appointment_id` (`appointment_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
