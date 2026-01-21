<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_is_viewlab_report_to_reports extends CI_Migration {

    public function up()
    {
        $fields = array(
            'is_viewlab_report' => array(
                'type' => 'INT',
                'constraint' => 1,
                'default' => 1,
                'null' => FALSE,
            ),
        );

        if (!$this->db->field_exists('is_viewlab_report', 'ms_patient_treatment_lab_reports')) {
            $this->dbforge->add_column('ms_patient_treatment_lab_reports', $fields);
        }
    }

    public function down()
    {
        if ($this->db->field_exists('is_viewlab_report', 'ms_patient_treatment_lab_reports')) {
            $this->dbforge->drop_column('ms_patient_treatment_lab_reports', 'is_viewlab_report');
        }
    }
}
