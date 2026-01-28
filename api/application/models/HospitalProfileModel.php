<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HospitalProfileModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_hospital_profile($hosuid) {
        $this->db->select('id, hosuid, name, email, phone, address, state, city, appointment_day_limit, book_appointment_status'); // Added book_appointment_status
        $this->db->from('ms_hospitals');
        $this->db->where('hosuid', $hosuid);
        $query = $this->db->get();
        return $query->row_array();
    }

    public function update_hospital_profile($hosuid, $data) {
        $this->db->where('hosuid', $hosuid);
        return $this->db->update('ms_hospitals', $data);
    }

    public function verify_password($hosuid, $password) {
        $this->db->select('password');
        $this->db->from('ms_hospitals');
        $this->db->where('hosuid', $hosuid);
        $query = $this->db->get();
        $user = $query->row_array();

        if ($user && $user['password'] === md5($password)) {
            return true;
        }
        return false;
    }

    public function update_password($hosuid, $new_password) {
        $this->db->where('hosuid', $hosuid);
        return $this->db->update('ms_hospitals', ['password' => md5($new_password)]);
    }
}
