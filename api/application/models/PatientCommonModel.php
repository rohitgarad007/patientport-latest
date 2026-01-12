<?php

class PatientCommonModel extends CI_Model{

	public function insertPatientInformation($data) {
        $this->db->insert('ms_patient', $data);
        return $this->db->insert_id();
    }

    public function UpdatePatientInformationByHospital($patientUid, $data, $loguid) {
	    $this->db->where('patient_uid', $patientUid);
	    $this->db->where('hosuid', $loguid);
	    return $this->db->update('ms_patient', $data);
	}

	public function updateStaffStatusByHospital($patientUid, $loguid, $status) {
	    $this->db->where('patient_uid', $patientUid);
	    $this->db->where('hosuid', $loguid);
	    return $this->db->update('ms_patient', ['status' => $status]);
	}

    public function get_PatientCountByHospital($search = '', $loguid = '') {
	    $this->db->from('ms_patient mp');
	    $this->db->where('mp.isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('mp.fname', $search);
	        $this->db->like('mp.lname', $search);
	        $this->db->or_like('mp.email', $search);
	        $this->db->or_like('mp.phone', $search);
	        $this->db->group_end();
	    }
	    $this->db->where('mp.hosuid', $loguid);
	    
	    return (int)$this->db->count_all_results();
	}

	public function get_PatientListByHospital($search = '',  $loguid = '', $limit = 10, $offset = 0) {
	   $this->db->select("mp.id, mp.patient_uid, mp.fname as firstName, mp.lname as lastName, CONCAT(mp.fname, ' ', mp.lname) AS fullname, mp.email, mp.phone, mp.dob, mp.gender, mp.blood_group as bloodGroup, mp.emergency_contact as emergencyContact, mp.address, mp.status, hs.name AS hospitalName");
	    $this->db->from('ms_patient mp');
	    $this->db->join('ms_hospitals hs', 'hs.hosuid = mp.hosuid', 'left');
	    $this->db->where('mp.isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('mp.fname', $search);
	        $this->db->like('mp.lname', $search);
	        $this->db->or_like('mp.email', $search);
	        $this->db->or_like('mp.phone', $search);
	        $this->db->group_end();
	    }
	    $this->db->where('mp.hosuid', $loguid);
	    
	    $this->db->limit($limit, $offset);
	    $query = $this->db->get();
	    return $query->result_array();
	}

    public function getPatientDetailsByHospital($patientUid, $loguid)
	{
		$this->db->select("mp.id, mp.patient_uid, mp.fname as firstName, mp.lname as lastName, CONCAT(mp.fname, ' ', mp.lname) AS fullname, mp.email, mp.phone, mp.dob, mp.gender, mp.blood_group as bloodGroup, mp.emergency_contact as emergencyContact, mp.address, mp.status, hs.name AS hospitalName");
		$this->db->from('ms_patient mp');
		$this->db->join('ms_hospitals hs', 'hs.hosuid = mp.hosuid', 'left');
		$this->db->group_start();
		$this->db->where('mp.id', $patientUid);
		$this->db->or_where('mp.patient_uid', $patientUid);
		$this->db->group_end();
		$this->db->where('mp.hosuid', $loguid);
		$this->db->where('mp.isdelete', 0);
		$query = $this->db->get();
		return $query->row_array();
	}

    public function get_PatientVisitHistoryByHospital($patientId, $hospital_id) {
        $this->db->select('a.id, a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.start_time, a.end_time, a.status, d.name as doctor_name');
        $this->db->from('ms_patient_appointment a');
        $this->db->join('ms_doctors d', 'd.id = a.doctor_id', 'left');
        $this->db->where('a.patient_id', $patientId);
        $this->db->where('a.hospital_id', $hospital_id);
        $this->db->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false);
        $this->db->order_by('a.date', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }


}