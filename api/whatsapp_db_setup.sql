-- WhatsApp Integration Tables
-- Run this in your database (phpMyAdmin)

-- 1. Create ms_whatsapp_messages
CREATE TABLE IF NOT EXISTS `ms_whatsapp_messages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `direction` enum('inbound','outbound') NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `message_sid` varchar(100) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `media_url` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `payload` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 2. Create ms_whatsapp_config
CREATE TABLE IF NOT EXISTS `ms_whatsapp_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 3. Insert Default Configuration
-- NOTE: We use INSERT IGNORE to avoid errors if keys already exist.
INSERT IGNORE INTO `ms_whatsapp_config` (`config_key`, `config_value`, `updated_at`) VALUES
('verify_token', 'patientport_verify_123', NOW()),
('access_token', 'YOUR_ACCESS_TOKEN_HERE', NOW()),
('phone_number_id', 'YOUR_PHONE_NUMBER_ID_HERE', NOW()),
('app_id', '1308838484596357', NOW()),
('business_id', '1645960139724883', NOW()),
('whatsapp_number', '9503493993', NOW());
