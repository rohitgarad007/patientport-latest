ALTER TABLE `ms_doctors` 
ADD COLUMN `is_online` TINYINT(1) DEFAULT 1 COMMENT '1=Online, 0=Offline' AFTER `status`,
ADD COLUMN `away_message` TEXT DEFAULT NULL AFTER `is_online`,
ADD COLUMN `back_online_time` DATETIME DEFAULT NULL AFTER `away_message`;
