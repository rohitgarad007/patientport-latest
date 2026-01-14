<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LabPackagesModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_packages($lab_id, $search = '', $limit = 10, $offset = 0) {
        $this->db->select('p.*');
        $this->db->select('(SELECT COUNT(*) FROM lb_lab_package_tests pt WHERE pt.package_id = p.id) as test_count');
        $this->db->select('(SELECT GROUP_CONCAT(pt.lab_test_id) FROM lb_lab_package_tests pt WHERE pt.package_id = p.id) as test_ids');
        $this->db->from('lb_lab_packages p');
        $this->db->where('p.lab_id', $lab_id);
        $this->db->where('p.isdelete', 0);
        
        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('p.package_name', $search);
            $this->db->or_like('p.description', $search);
            $this->db->group_end();
        }

        $this->db->limit($limit, $offset);
        $this->db->order_by('p.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_packages_count($lab_id, $search = '') {
        $this->db->from('lb_lab_packages p');
        $this->db->where('p.lab_id', $lab_id);
        $this->db->where('p.isdelete', 0);
        
        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('p.package_name', $search);
            $this->db->or_like('p.description', $search);
            $this->db->group_end();
        }

        return $this->db->count_all_results();
    }

    public function get_package_by_id($package_id, $lab_id) {
        $this->db->where('id', $package_id);
        $this->db->where('lab_id', $lab_id);
        $this->db->where('isdelete', 0);
        $package = $this->db->get('lb_lab_packages')->row_array();

        if ($package) {
            $this->db->select('t.id, t.test_name, t.test_code, t.price');
            $this->db->from('lb_lab_package_tests pt');
            $this->db->join('lb_lab_tests t', 't.id = pt.lab_test_id');
            $this->db->where('pt.package_id', $package_id);
            $package['tests'] = $this->db->get()->result_array();
        }

        return $package;
    }

    public function add_package($data, $test_ids) {
        $this->db->trans_start();
        
        $this->db->insert('lb_lab_packages', $data);
        $package_id = $this->db->insert_id();

        if (!empty($test_ids)) {
            $batch_data = [];
            foreach ($test_ids as $test_id) {
                $batch_data[] = [
                    'package_id' => $package_id,
                    'lab_test_id' => $test_id
                ];
            }
            $this->db->insert_batch('lb_lab_package_tests', $batch_data);
        }

        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function update_package($package_id, $data, $test_ids, $lab_id) {
        $this->db->trans_start();
        
        $this->db->where('id', $package_id);
        $this->db->where('lab_id', $lab_id);
        $this->db->update('lb_lab_packages', $data);

        // Update tests: delete old, insert new (simplest approach)
        $this->db->where('package_id', $package_id);
        $this->db->delete('lb_lab_package_tests');

        if (!empty($test_ids)) {
            $batch_data = [];
            foreach ($test_ids as $test_id) {
                $batch_data[] = [
                    'package_id' => $package_id,
                    'lab_test_id' => $test_id
                ];
            }
            $this->db->insert_batch('lb_lab_package_tests', $batch_data);
        }

        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function delete_package($package_id, $lab_id, $updated_by) {
        $this->db->where('id', $package_id);
        $this->db->where('lab_id', $lab_id);
        return $this->db->update('lb_lab_packages', ['isdelete' => 1, 'updated_by' => $updated_by, 'updated_at' => date('Y-m-d H:i:s')]);
    }
}
