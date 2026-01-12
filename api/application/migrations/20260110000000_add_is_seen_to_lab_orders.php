<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_is_seen_to_lab_orders extends CI_Migration {

    public function up()
    {
        $fields = array(
            'is_seen' => array(
                'type' => 'TINYINT',
                'constraint' => 1,
                'default' => 0,
                'null' => FALSE,
                'after' => 'status' // Place it after status column
            ),
        );
        
        // Check if column exists before adding
        if (!$this->db->field_exists('is_seen', 'lb_lab_orders')) {
            $this->dbforge->add_column('lb_lab_orders', $fields);
        }
    }

    public function down()
    {
        if ($this->db->field_exists('is_seen', 'lb_lab_orders')) {
            $this->dbforge->drop_column('lb_lab_orders', 'is_seen');
        }
    }
}
