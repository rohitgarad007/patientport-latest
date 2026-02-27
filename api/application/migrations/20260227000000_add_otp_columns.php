<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_otp_columns extends CI_Migration {

    public function up() {
        $fields = array(
            'current_otp' => array(
                'type' => 'VARCHAR',
                'constraint' => '6',
                'null' => TRUE,
                'default' => NULL
            ),
            'otp_generated_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE,
                'default' => NULL
            ),
            'otp_expires_at' => array(
                'type' => 'DATETIME',
                'null' => TRUE,
                'default' => NULL
            ),
            'two_factor_auth' => array(
                'type' => 'TINYINT',
                'constraint' => '1',
                'default' => 0,
                'comment' => '0: Off, 1: On'
            ),
        );

        // Add to ms_doctors
        if ($this->db->table_exists('ms_doctors')) {
            foreach ($fields as $key => $field) {
                if (!$this->db->field_exists($key, 'ms_doctors')) {
                    $this->dbforge->add_column('ms_doctors', array($key => $field));
                }
            }
        }

        // Add to ms_staff
        if ($this->db->table_exists('ms_staff')) {
            foreach ($fields as $key => $field) {
                if (!$this->db->field_exists($key, 'ms_staff')) {
                    $this->dbforge->add_column('ms_staff', array($key => $field));
                }
            }
        }
    }

    public function down() {
        $columns = array('current_otp', 'otp_generated_at', 'otp_expires_at', 'two_factor_auth');
        
        // Remove from ms_doctors
        if ($this->db->table_exists('ms_doctors')) {
            foreach ($columns as $col) {
                if ($this->db->field_exists($col, 'ms_doctors')) {
                    $this->dbforge->drop_column('ms_doctors', $col);
                }
            }
        }

        // Remove from ms_staff
        if ($this->db->table_exists('ms_staff')) {
            foreach ($columns as $col) {
                if ($this->db->field_exists($col, 'ms_staff')) {
                    $this->dbforge->drop_column('ms_staff', $col);
                }
            }
        }
    }
}
