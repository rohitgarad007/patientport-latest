<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_shared_receipts_table extends CI_Migration {

    public function up()
    {
        if (!$this->db->table_exists('patient_shared_receipts')) {
            $this->dbforge->add_field(array(
                'id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                    'auto_increment' => TRUE
                ),
                'patient_id' => array(
                    'type' => 'INT',
                    'constraint' => 11
                ),
                'appointment_id' => array(
                    'type' => 'INT',
                    'constraint' => 11
                ),
                'file_path' => array(
                    'type' => 'VARCHAR',
                    'constraint' => 255
                ),
                'access_token' => array(
                    'type' => 'VARCHAR',
                    'constraint' => 64
                ),
                'password' => array(
                    'type' => 'VARCHAR',
                    'constraint' => 255
                ),
                'created_at' => array(
                    'type' => 'DATETIME',
                    'null' => TRUE
                ),
                'expires_at' => array(
                    'type' => 'DATETIME',
                    'null' => TRUE
                )
            ));
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->create_table('patient_shared_receipts');
            
            // Add index on access_token
            $this->db->query('ALTER TABLE patient_shared_receipts ADD UNIQUE KEY access_token (access_token)');
        }
    }

    public function down()
    {
        $this->dbforge->drop_table('patient_shared_receipts');
    }
}
