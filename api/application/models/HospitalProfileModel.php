<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HospitalProfileModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function get_hospital_profile($hosuid) {
        // Use SELECT * to automatically get all available columns
        // This avoids errors when trying to select columns that don't exist yet
        $this->db->from('ms_hospitals');
        $this->db->where('hosuid', $hosuid);
        $query = $this->db->get();
        
        $result = $query->row_array();
        
        if ($result) {
            // Remove sensitive information
            unset($result['password']);
        }
        
        return $result;
    }

    public function update_hospital_profile($hosuid, $data) {
        $this->db->where('hosuid', $hosuid);
        
        // Get list of actual columns in the table
        $table_fields = $this->db->list_fields('ms_hospitals');
        
        // Filter data to only include columns that actually exist in the table
        $valid_data = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $table_fields)) {
                $valid_data[$key] = $value;
            }
        }
        
        if (empty($valid_data)) {
            return false;
        }

        return $this->db->update('ms_hospitals', $valid_data);
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
