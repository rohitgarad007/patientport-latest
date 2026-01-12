<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ReceiptContentModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function getReceiptContent($doctor_id) {
        $this->db->where('doctor_id', $doctor_id);
        $query = $this->db->get('ms_hospitals_receipts_content');

        if ($query->num_rows() > 0) {
            return $query->row_array();
        } else {
            // Get hospital_id for the doctor to insert
            $this->db->select('hosuid');
            $this->db->where('id', $doctor_id);
            $docQuery = $this->db->get('ms_doctors');
            $hospital_id = 0;
            if ($docQuery->num_rows() > 0) {
                $docRow = $docQuery->row_array();
                $hospital_id = $docRow['hosuid'];
            }

            // Create default entry
            $data = [
                'hospital_id' => $hospital_id,
                'doctor_id' => $doctor_id,
                'header_status' => 1,
                'doctor_info_status' => 1,
                'patient_info_status' => 1,
                'medical_history_status' => 1,
                'presenting_symptoms_status' => 1,
                'diagnosis_status' => 1,
                'lab_tests_status' => 1,
                'medications_status' => 1,
                'footer_status' => 1,
                'created_by' => $doctor_id,
                'created_at' => date('Y-m-d H:i:s')
            ];

            $this->db->insert('ms_hospitals_receipts_content', $data);
            
            // Return the newly created row
            $this->db->where('doctor_id', $doctor_id);
            return $this->db->get('ms_hospitals_receipts_content')->row_array();
        }
    }

    public function updateReceiptContent($doctor_id, $data) {
        $updateData = [
            'header_status' => isset($data['header_status']) ? $data['header_status'] : 1,
            'doctor_info_status' => isset($data['doctor_info_status']) ? $data['doctor_info_status'] : 1,
            'patient_info_status' => isset($data['patient_info_status']) ? $data['patient_info_status'] : 1,
            'medical_history_status' => isset($data['medical_history_status']) ? $data['medical_history_status'] : 1,
            'presenting_symptoms_status' => isset($data['presenting_symptoms_status']) ? $data['presenting_symptoms_status'] : 1,
            'diagnosis_status' => isset($data['diagnosis_status']) ? $data['diagnosis_status'] : 1,
            'lab_tests_status' => isset($data['lab_tests_status']) ? $data['lab_tests_status'] : 1,
            'medications_status' => isset($data['medications_status']) ? $data['medications_status'] : 1,
            'footer_status' => isset($data['footer_status']) ? $data['footer_status'] : 1,
            'updated_by' => $doctor_id,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $this->db->where('doctor_id', $doctor_id);
        return $this->db->update('ms_hospitals_receipts_content', $updateData);
    }
}
