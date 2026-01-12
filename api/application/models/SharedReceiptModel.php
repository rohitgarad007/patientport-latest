<?php
class SharedReceiptModel extends CI_Model {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function create($data) {
        $this->db->insert('patient_shared_receipts', $data);
        return $this->db->insert_id();
    }

    public function get_by_token($token) {
        $this->db->where('access_token', $token);
        $query = $this->db->get('patient_shared_receipts');
        return $query->row_array();
    }
}
