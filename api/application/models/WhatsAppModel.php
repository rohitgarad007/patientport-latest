<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class WhatsAppModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->_initialize_tables();
    }

    // Auto-initialize tables to ensure they exist
    private function _initialize_tables() {
        // 1. Table: ms_whatsapp_messages
        if (!$this->db->table_exists('ms_whatsapp_messages')) {
            $sql = "CREATE TABLE IF NOT EXISTS `ms_whatsapp_messages` (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            $this->db->query($sql);
        }

        // 2. Table: ms_whatsapp_config
        if (!$this->db->table_exists('ms_whatsapp_config')) {
            $sql = "CREATE TABLE IF NOT EXISTS `ms_whatsapp_config` (
                `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                `config_key` varchar(100) NOT NULL,
                `config_value` text DEFAULT NULL,
                `updated_at` datetime DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `config_key` (`config_key`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            $this->db->query($sql);
        }

        // 3. Ensure Config Data Exists
        $this->db->where('config_key', 'app_id');
        if ($this->db->count_all_results('ms_whatsapp_config') == 0) {
            $data = array(
                array('config_key' => 'verify_token', 'config_value' => 'patientport_verify_123', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'access_token', 'config_value' => 'YOUR_ACCESS_TOKEN_HERE', 'updated_at' => date('Y-m-d H:i:s')), // User must update this manually in DB
                array('config_key' => 'phone_number_id', 'config_value' => 'YOUR_PHONE_NUMBER_ID_HERE', 'updated_at' => date('Y-m-d H:i:s')), // User must update this manually in DB
                array('config_key' => 'app_id', 'config_value' => '1308838484596357', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'business_id', 'config_value' => '1645960139724883', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'whatsapp_number', 'config_value' => '9503493993', 'updated_at' => date('Y-m-d H:i:s')),
            );
            $this->db->insert_batch('ms_whatsapp_config', $data);
        }
    }

    // Log inbound or outbound message
    public function log_message($data) {
        $this->db->insert('ms_whatsapp_messages', $data);
        return $this->db->insert_id();
    }

    // Update message status (e.g., delivered, read)
    public function update_status($message_sid, $status) {
        $this->db->where('message_sid', $message_sid);
        $this->db->update('ms_whatsapp_messages', array('status' => $status, 'updated_at' => date('Y-m-d H:i:s')));
    }

    // Get messages for a specific phone number or all
    public function get_messages($phone_number = null, $limit = 50) {
        if ($phone_number) {
            $this->db->where('phone_number', $phone_number);
        }
        $this->db->order_by('created_at', 'DESC');
        $this->db->limit($limit);
        $query = $this->db->get('ms_whatsapp_messages');
        return $query->result_array();
    }
    
    // Check if message exists (deduplication)
    public function message_exists($message_sid) {
        $this->db->where('message_sid', $message_sid);
        $query = $this->db->get('ms_whatsapp_messages');
        return $query->num_rows() > 0;
    }

    // Get config value
    public function get_config($key) {
        $this->db->where('config_key', $key);
        $query = $this->db->get('ms_whatsapp_config');
        $result = $query->row_array();
        return $result ? $result['config_value'] : null;
    }
}
