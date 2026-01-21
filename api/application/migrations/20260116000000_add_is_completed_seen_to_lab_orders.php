<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_is_completed_seen_to_lab_orders extends CI_Migration {

    public function up()
    {
        $fields = array(
            'is_completed_seen' => array(
                'type' => 'INT',
                'constraint' => 1,
                'default' => 0,
                'null' => FALSE,
            ),
        );

        if (!$this->db->field_exists('is_completed_seen', 'lb_lab_orders')) {
            $this->dbforge->add_column('lb_lab_orders', $fields);
        }
    }

    public function down()
    {
        if ($this->db->field_exists('is_completed_seen', 'lb_lab_orders')) {
            $this->dbforge->drop_column('lb_lab_orders', 'is_completed_seen');
        }
    }
}
