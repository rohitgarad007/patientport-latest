<?php

class StaffProfileModel extends CI_Model {

    public function get_staff_profile($staff_uid) {
        $this->db->select('*');
        $this->db->from('ms_staff');
        $this->db->where('staff_uid', $staff_uid);
        $query = $this->db->get();
        
        $result = $query->row_array();
        
        if ($result) {
            unset($result['password']);
        }
        
        return $result;
    }

    public function update_staff_profile($staff_uid, $data) {
        $this->db->where('staff_uid', $staff_uid);
        
        // Use list_fields to ensure we only update existing columns
        $table_fields = $this->db->list_fields('ms_staff');
        
        $valid_data = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $table_fields)) {
                $valid_data[$key] = $value;
            }
        }
        
        if (empty($valid_data)) {
            return false;
        }

        return $this->db->update('ms_staff', $valid_data);
    }
    
    public function verify_password($staff_uid, $plainPassword) {
        $this->db->select('password');
        $this->db->where('staff_uid', $staff_uid);
        $query = $this->db->get('ms_staff');
        $row = $query->row_array();
        
        if (!$row) return false;
        
        return md5($plainPassword) === $row['password'];
    }
    
    public function update_password($staff_uid, $newPassword) {
        $this->db->where('staff_uid', $staff_uid);
        return $this->db->update('ms_staff', ['password' => md5($newPassword)]);
    }
}
