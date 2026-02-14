<?php

class DoctorProfileModel extends CI_Model {

    public function get_doctor_profile($docuid) {
        $this->db->select('d.*, s.specialization_name');
        $this->db->from('ms_doctors d');
        $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
        $this->db->where('d.docuid', $docuid);
        $query = $this->db->get();
        
        $result = $query->row_array();
        
        if ($result) {
            unset($result['password']);
        }
        
        return $result;
    }

    public function update_doctor_profile($docuid, $data) {
        $this->db->where('docuid', $docuid);
        
        // Use list_fields to ensure we only update existing columns
        $table_fields = $this->db->list_fields('ms_doctors');
        
        $valid_data = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $table_fields)) {
                $valid_data[$key] = $value;
            }
        }
        
        if (empty($valid_data)) {
            return false;
        }

        return $this->db->update('ms_doctors', $valid_data);
    }
    
    public function verify_password($docuid, $plainPassword) {
        $this->db->select('password');
        $this->db->where('docuid', $docuid);
        $query = $this->db->get('ms_doctors');
        $row = $query->row_array();
        
        if (!$row) return false;
        
        return md5($plainPassword) === $row['password'];
    }
    
    public function update_password($docuid, $newPassword) {
        $this->db->where('docuid', $docuid);
        return $this->db->update('ms_doctors', ['password' => md5($newPassword)]);
    }
}
