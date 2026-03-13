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

    public function get_hospital_id_by_hosuid($hosuid) {
        $this->db->select('id');
        $this->db->from('ms_hospitals');
        $this->db->where('hosuid', $hosuid);
        $row = $this->db->get()->row_array();
        return $row ? (int)$row['id'] : null;
    }

    public function get_website_about_by_hospital_id($hospital_id) {
        $this->db->from('ms_hospitals_website_about');
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('isdelete', 0);
        return $this->db->get()->row_array();
    }

    public function upsert_website_about($hospital_id, $data) {
        $table_fields = $this->db->list_fields('ms_hospitals_website_about');
        $valid_data = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $table_fields)) {
                $valid_data[$key] = $value;
            }
        }

        $valid_data['hospital_id'] = $hospital_id;

        $this->db->select('id');
        $this->db->from('ms_hospitals_website_about');
        $this->db->where('hospital_id', $hospital_id);
        $existing = $this->db->get()->row_array();

        if ($existing && isset($existing['id'])) {
            $this->db->where('id', $existing['id']);
            return $this->db->update('ms_hospitals_website_about', $valid_data);
        }

        return $this->db->insert('ms_hospitals_website_about', $valid_data);
    }

    public function get_website_banners_by_hospital_id($hospital_id) {
        $this->db->from('ms_hospitals_website_banners');
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('isdelete', 0);
        $this->db->order_by('sort_order', 'ASC');
        $this->db->order_by('id', 'ASC');
        return $this->db->get()->result_array();
    }

    public function replace_website_banners($hospital_id, $banners) {
        $this->db->where('hospital_id', $hospital_id);
        $this->db->update('ms_hospitals_website_banners', ['isdelete' => 1]);

        if (!is_array($banners) || empty($banners)) {
            return true;
        }

        $rows = [];
        $sort = 0;
        foreach ($banners as $banner) {
            $rows[] = [
                'hospital_id' => $hospital_id,
                'title' => isset($banner['title']) ? (string)$banner['title'] : '',
                'sub_title' => isset($banner['sub_title']) ? (string)$banner['sub_title'] : '',
                'banner_image' => isset($banner['banner_image']) ? (string)$banner['banner_image'] : '',
                'sort_order' => $sort,
                'status' => 1,
                'isdelete' => 0,
            ];
            $sort++;
        }

        return $this->db->insert_batch('ms_hospitals_website_banners', $rows) !== false;
    }

    public function save_website_settings($hospital_id, $aboutData, $banners) {
        $this->db->trans_begin();

        $okAbout = $this->upsert_website_about($hospital_id, $aboutData);
        $okBanners = $this->replace_website_banners($hospital_id, $banners);

        if ($this->db->trans_status() === false || !$okAbout || !$okBanners) {
            $this->db->trans_rollback();
            return false;
        }

        $this->db->trans_commit();
        return true;
    }

    public function get_next_website_banner_sort_order($hospital_id) {
        $this->db->select('MAX(sort_order) AS max_sort', false);
        $this->db->from('ms_hospitals_website_banners');
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('isdelete', 0);
        $row = $this->db->get()->row_array();
        $maxSort = isset($row['max_sort']) ? (int)$row['max_sort'] : -1;
        return $maxSort + 1;
    }

    public function add_website_banner($hospital_id, $data) {
        $table_fields = $this->db->list_fields('ms_hospitals_website_banners');
        $valid_data = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $table_fields)) {
                $valid_data[$key] = $value;
            }
        }

        $valid_data['hospital_id'] = $hospital_id;
        if (!isset($valid_data['sort_order'])) {
            $valid_data['sort_order'] = $this->get_next_website_banner_sort_order($hospital_id);
        }
        if (!isset($valid_data['status'])) {
            $valid_data['status'] = 1;
        }
        if (!isset($valid_data['isdelete'])) {
            $valid_data['isdelete'] = 0;
        }

        $ok = $this->db->insert('ms_hospitals_website_banners', $valid_data);
        if (!$ok) return null;
        return (int)$this->db->insert_id();
    }
}
