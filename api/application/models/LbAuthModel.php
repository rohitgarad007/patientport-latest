<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LbAuthModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function check_labLogin($email, $plainPassword) {
        $this->db->select("id, staff_uid, lab_id, name, email, password, role, status, isdelete");
        $this->db->from('lb_laboratory_staff');
        $this->db->where('email', $email);
        $this->db->where('isdelete', 0);
        $query = $this->db->get();

        if ($query->num_rows() !== 1) {
            return ['not_found' => true];
        }

        $user = $query->row_array();

        // Check if account is active
        if ($user['status'] !== 'active') {
            return ['blocked' => true, 'user' => $user];
        }

        // Verify password
        // Note: Using MD5 as per existing implementation in AdmAdminAuthCtr
        if (md5($plainPassword) === $user['password']) {
            return ['success' => true, 'user' => $user];
        } else {
            return ['not_found' => true]; // Password mismatch
        }
    }
}
