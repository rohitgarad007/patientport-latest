<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_whatsapp_tables extends CI_Migration {

    public function up() {
        // Table: ms_whatsapp_messages
        $this->dbforge->add_field(array(
            'id' => array(
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => TRUE,
                'auto_increment' => TRUE
            ),
            'direction' => array(
                'type' => 'ENUM',
                'constraint' => "'inbound', 'outbound'",
                'null' => FALSE
            ),
            'phone_number' => array(
                'type' => 'VARCHAR',
                'constraint' => '20',
                'null' => FALSE
            ),
            'message_sid' => array(
                'type' => 'VARCHAR',
                'constraint' => '100',
                'null' => TRUE
            ),
            'body' => array(
                'type' => 'TEXT',
                'null' => TRUE
            ),
            'media_url' => array(
                'type' => 'TEXT',
                'null' => TRUE
            ),
            'status' => array(
                'type' => 'VARCHAR',
                'constraint' => '50',
                'default' => 'pending'
            ),
            'payload' => array(
                'type' => 'LONGTEXT',
                'null' => TRUE
            ),
            'created_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE
            ),
            'updated_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE
            ),
        ));
        $this->dbforge->add_key('id', TRUE);
        $this->dbforge->create_table('ms_whatsapp_messages', TRUE);

        // Table: ms_whatsapp_config
        $this->dbforge->add_field(array(
            'id' => array(
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => TRUE,
                'auto_increment' => TRUE
            ),
            'config_key' => array(
                'type' => 'VARCHAR',
                'constraint' => '100',
                'unique' => TRUE
            ),
            'config_value' => array(
                'type' => 'TEXT',
                'null' => TRUE
            ),
            'updated_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE
            ),
        ));
        $this->dbforge->add_key('id', TRUE);
        $this->dbforge->create_table('ms_whatsapp_config', TRUE);

        // Insert default placeholders with provided info
        // Check if data exists first
        $exists = $this->db->get('ms_whatsapp_config')->num_rows() > 0;
        if (!$exists) {
            $data = array(
                array('config_key' => 'verify_token', 'config_value' => 'YOUR_VERIFY_TOKEN', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'access_token', 'config_value' => 'YOUR_ACCESS_TOKEN', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'phone_number_id', 'config_value' => 'YOUR_PHONE_NUMBER_ID', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'app_id', 'config_value' => '1308838484596357', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'business_id', 'config_value' => '1645960139724883', 'updated_at' => date('Y-m-d H:i:s')),
                array('config_key' => 'whatsapp_number', 'config_value' => '9503493993', 'updated_at' => date('Y-m-d H:i:s')),
            );
            $this->db->insert_batch('ms_whatsapp_config', $data);
        }
    }

    public function down() {
        $this->dbforge->drop_table('ms_whatsapp_config');
        $this->dbforge->drop_table('ms_whatsapp_messages');
    }
}
