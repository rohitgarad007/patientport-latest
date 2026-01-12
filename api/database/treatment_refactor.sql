-- Master table
DROP TABLE IF EXISTS `ms_patient_treatment_info`;
CREATE TABLE `ms_patient_treatment_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `treatment_status` varchar(50) DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appointment_id` (`appointment_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Purpose table
DROP TABLE IF EXISTS `ms_patient_treatment_purpose`;
CREATE TABLE `ms_patient_treatment_purpose` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `treatment_id` int(11) NOT NULL,
  `item_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_treatment_id` (`treatment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Diagnosis table
DROP TABLE IF EXISTS `ms_patient_treatment_diagnosis`;
CREATE TABLE `ms_patient_treatment_diagnosis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `treatment_id` int(11) NOT NULL,
  `condition_name` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `icd10` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_treatment_id` (`treatment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medications table
DROP TABLE IF EXISTS `ms_patient_treatment_medications`;
CREATE TABLE `ms_patient_treatment_medications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `treatment_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `is_auto_suggested` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_treatment_id` (`treatment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lab Tests table
DROP TABLE IF EXISTS `ms_patient_treatment_lab_tests`;
CREATE TABLE `ms_patient_treatment_lab_tests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `treatment_id` int(11) NOT NULL,
  `test_name` varchar(255) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `urgency` varchar(50) DEFAULT 'routine',
  `status` varchar(50) DEFAULT 'ordered',
  `is_auto_suggested` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_treatment_id` (`treatment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lab Reports table
DROP TABLE IF EXISTS `ms_patient_treatment_lab_reports`;
CREATE TABLE `ms_patient_treatment_lab_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `treatment_id` int(11) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `is_combined` tinyint(1) DEFAULT 0,
  `covered_tests` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_treatment_id` (`treatment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
