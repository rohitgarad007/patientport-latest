  -- Hospital Treatment Masters schema (new)
  -- Tables: diagnosis, medication_name, medication_unit, medication_frequency, medication_duration, lab_tests, procedure
  -- Hospital Treatment Masters schema (updated)

  CREATE TABLE IF NOT EXISTS `ms_hospitals_treatment_diagnosis` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  CREATE TABLE IF NOT EXISTS `ms_hospitals_medication_name` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  CREATE TABLE IF NOT EXISTS `ms_hospitals_medication_unit` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  CREATE TABLE IF NOT EXISTS `ms_hospitals_medication_frequency` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  CREATE TABLE IF NOT EXISTS `ms_hospitals_medication_duration` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  CREATE TABLE IF NOT EXISTS `ms_hospitals_lab_tests` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  CREATE TABLE IF NOT EXISTS `ms_hospitals_procedure` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `hospital_id` int(11) NOT NULL,
    `name` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_name` (`name`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- ================================
  -- Doctor Treatment Suggestion log
  -- ================================
  CREATE TABLE IF NOT EXISTS `ms_doctor_treatment_suggestion` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `suggestion_uid` varchar(64) NOT NULL,
    `hospital_id` int(11) NOT NULL,
    `doctor_id` int(11) NOT NULL,
    `diagnosis_json` text DEFAULT NULL,
    `lab_tests_json` text DEFAULT NULL,
    `history_item_ids_json` text DEFAULT NULL,
    `medications_json` text DEFAULT NULL,
    `instructions` text DEFAULT NULL,
    `status` int(2) NOT NULL DEFAULT 1,
    `isdelete` int(2) NOT NULL DEFAULT 0,
    `created_by` int(11) NOT NULL,
    `updated_by` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_suggestion_uid` (`suggestion_uid`),
    KEY `idx_hospital_id` (`hospital_id`),
    KEY `idx_doctor_id` (`doctor_id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
