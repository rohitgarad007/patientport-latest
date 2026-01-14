<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_lab_packages_tables extends CI_Migration {

    public function up()
    {
        // lb_lab_packages
        if (!$this->db->table_exists('lb_lab_packages')) {
            $this->dbforge->add_field(array(
                'id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                    'auto_increment' => TRUE
                ),
                'lab_id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                ),
                'package_name' => array(
                    'type' => 'VARCHAR',
                    'constraint' => '150',
                ),
                'description' => array(
                    'type' => 'TEXT',
                    'null' => TRUE,
                ),
                'price' => array(
                    'type' => 'DECIMAL',
                    'constraint' => '10,2',
                    'default' => 0.00
                ),
                 'discount' => array(
                    'type' => 'DECIMAL',
                    'constraint' => '5,2',
                    'default' => 0.00
                ),
                'status' => array(
                    'type' => 'TINYINT',
                    'constraint' => '1',
                    'default' => 1,
                ),
                'isdelete' => array(
                    'type' => 'TINYINT',
                    'constraint' => '1',
                    'default' => 0,
                ),
                'created_by' => array(
                    'type' => 'VARCHAR',
                    'constraint' => '64',
                    'null' => TRUE,
                ),
                'updated_by' => array(
                    'type' => 'VARCHAR',
                    'constraint' => '64',
                    'null' => TRUE,
                ),
                'created_at' => array(
                    'type' => 'DATETIME',
                    'null' => TRUE,
                ),
                'updated_at' => array(
                    'type' => 'DATETIME',
                    'null' => TRUE,
                ),
            ));
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->add_key('lab_id');
            $this->dbforge->create_table('lb_lab_packages', TRUE);
        }

        // lb_lab_package_tests
        if (!$this->db->table_exists('lb_lab_package_tests')) {
            $this->dbforge->add_field(array(
                'id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                    'auto_increment' => TRUE
                ),
                'package_id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                ),
                'lab_test_id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                ),
            ));
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->add_key('package_id');
            $this->dbforge->add_key('lab_test_id');
            $this->dbforge->create_table('lb_lab_package_tests', TRUE);
        }
    }

    public function down()
    {
        $this->dbforge->drop_table('lb_lab_package_tests', TRUE);
        $this->dbforge->drop_table('lb_lab_packages', TRUE);
    }
}
