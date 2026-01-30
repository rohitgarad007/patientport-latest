<?php

class DoctorCommonModel extends CI_Model{


	public function insertDoctorInformation($data) {
        $this->db->insert('ms_doctors', $data);
        return $this->db->insert_id();
    }
    public function insertDoctorAccess($data) {
        $this->db->insert('ms_doctors_access', $data);
        return $this->db->insert_id();
    }

    public function updateDoctorInformation($docuid, $data) {
	    $this->db->where('docuid', $docuid);
	    return $this->db->update('ms_doctors', $data);
	}

	public function updateDoctorStatus($docuid, $status) {
	    $this->db->where('docuid', $docuid);
	    return $this->db->update('ms_doctors', ['status' => $status]);
	}

	public function updateDoctorStatusByHos($docuid, $loguid, $status) {
	    $this->db->where('docuid', $docuid);
	    $this->db->where('hosuid', $loguid);
	    return $this->db->update('ms_doctors', ['status' => $status]);
	}

    public function existsHospital($hospitalId) {
        return $this->db->where('hosuid', $hospitalId)->count_all_results('ms_hospitals') > 0;
    }

    public function existsSpecialization($specializationId) {
        return $this->db->where('id', $specializationId)->count_all_results('ms_doctor_specializations') > 0;
    }

	public function get_DoctorsCount($search = '', $specialization = '') {
	    $this->db->from('ms_doctors d');
	    $this->db->where('d.isdelete', 0);

	    
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('d.name', $search);
	        $this->db->or_like('d.email', $search);
	        $this->db->or_like('d.phone', $search);
	        $this->db->group_end();
	    }

	    if (!empty($specialization)) {
	        $this->db->where('d.specialization_id', $specialization);
	    }

	    return (int)$this->db->count_all_results();
	}

    public function get_DoctorsList($search = '', $specialization = '', $limit = 10, $offset = 0) {
	    $this->db->select('d.docuid, d.name as doctorName, d.email as doctorEmail, d.profile_image, d.gender, d.phone, d.experience_year as expYear, d.experience_month as expMonth, d.consultation_fee as doctorFees, d.status, s.specialization_name, hs.name as hospitalName, d.specialization_id as specialization, d.hosuid as hospitalId');
	    $this->db->from('ms_doctors d');
	    $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
	    $this->db->join('ms_hospitals hs', 'hs.hosuid = d.hosuid', 'left');
	    $this->db->where('d.isdelete', 0);

	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('d.name', $search);
	        $this->db->or_like('d.email', $search);
	        $this->db->or_like('d.phone', $search);
	        $this->db->group_end();
	    }

	    if (!empty($specialization)) {
	        $this->db->where('d.specialization_id', $specialization);
	    }

	    $this->db->limit($limit, $offset);

	    $query = $this->db->get();
	    return $query->result_array();
	}


	public function get_DoctorsCountByHospital($search = '', $specialization = '', $loguid = '') {
	    $this->db->from('ms_doctors d');
	    $this->db->where('d.isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('d.name', $search);
	        $this->db->or_like('d.email', $search);
	        $this->db->or_like('d.phone', $search);
	        $this->db->group_end();
	    }
	    $this->db->where('d.hosuid', $loguid);
	    if (!empty($specialization)) {
	        $this->db->where('d.specialization_id', $specialization);
	    }
	    return (int)$this->db->count_all_results();
	}

	public function get_DoctorsListByHospital($loguid = '', $search = '', $specialization = '', $limit = 10, $offset = 0) {
	    $this->db->select('d.docuid, d.name as doctorName, d.email as doctorEmail, d.profile_image, d.gender, d.phone, d.experience_year as expYear, d.experience_month as expMonth, d.consultation_fee as doctorFees, d.status, s.specialization_name, hs.name as hospitalName, d.specialization_id as specialization, d.hosuid as hospitalId');
	    $this->db->from('ms_doctors d');
	    $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
	    $this->db->join('ms_hospitals hs', 'hs.hosuid = d.hosuid', 'left');
	    $this->db->where('d.isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('d.name', $search);
	        $this->db->or_like('d.email', $search);
	        $this->db->or_like('d.phone', $search);
	        $this->db->group_end();
	    }
	    $this->db->where('d.hosuid', $loguid);
	    if (!empty($specialization)) {
	        $this->db->where('d.specialization_id', $specialization);
	    }
	    $this->db->limit($limit, $offset);
	    $query = $this->db->get();
	    return $query->result_array();
	}


	public function get_DoctorsOptionListByHospital($loguid = ''){
		$this->db->select('d.docuid, d.name as doctorName, d.phone');
	    $this->db->from('ms_doctors d');
	    $this->db->where('d.isdelete', 0);
	    $this->db->where('d.hosuid', $loguid);
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_ActiveDoctorsOptionListByHospital($hospital_id = ''){
		$this->db->select('d.id, d.docuid, d.name as doctorName, d.phone');
	    $this->db->from('ms_doctors d');
	    $this->db->where('d.status', 1);
	    $this->db->where('d.isdelete', 0);
	    $this->db->where('d.hospital_id', $hospital_id);
	    $query = $this->db->get();
	    return $query->result_array();
	}

    public function get_DoctorsAccessByHospital($loguid, $docuid) {
        $this->db->select('
            d.docuid,
            d.name as doctorName,
            d.phone,
            da.patient_list,
	        da.view_patients,
	        da.add_patients,
	        da.edit_patients,
	        da.view_medical_history,
	        da.write_prescriptions,
	        da.view_lab_results,
	        da.request_lab_tests,
	        da.manage_vitals,
	        da.appointment_list,
	        da.book_appointment,
	        da.reschedule_appointment,
	        da.cancel_appointment,
	        da.icu_access,
	        da.assign_rooms,
	        da.bad_request_approved,
	        da.monitor_beds,
	        da.emergency_access,
	        da.view_inventory,
	        da.dispense_medication,
	        da.manage_controlled,
	        da.reorder_stock,
	        da.perform_lab_tests,
	        da.manage_lab_equipment,
	        da.lab_safety,
	        da.view_billing,
	        da.process_payments,
	        da.apply_discounts,
	        da.insurance_claims,
	        da.financial_reports,
	        da.manage_users,
	        da.assign_roles,
	        da.system_monitoring,
	        da.emergency_override,
	        da.view_staff_profiles,
	        da.manage_shifts,
	        da.performance_reviews
	    ');
	    $this->db->from('ms_doctors d');
	    $this->db->join('ms_doctors_access da', 'da.docuid = d.docuid', 'left');
	    $this->db->where('d.isdelete', 0);
	    $this->db->where('d.hosuid', $loguid);
	    $this->db->where('d.docuid', $docuid);

	    $query = $this->db->get();
	    return $query->row_array();
	}


	public function get_DoctorListByHospitalUid($hosuid){
	    $this->db->select('md.id, md.docuid, md.name');
	    $this->db->from('ms_doctors AS md');
	    $this->db->where([
	        'md.hosuid' => $hosuid,
	        'md.status' => 1,
	        'md.isdelete' => 0
	    ]);

	    $query = $this->db->get();
	    return $query->result_array();
	}





    public function get_logdoctorInfo($loguid){
        $this->db->select('d.id, d.docuid, d.hosuid, d.name, d.email, d.phone, d.status, d.specialization_id, d.experience_year, d.experience_month, s.specialization_name as specialization, h.name as hospital_name, h.address as hospital_address, h.phone as hospital_phone, h.email as hospital_email, h.registration_number as hospital_reg_no');
        $this->db->from('ms_doctors d');
        $this->db->join('ms_hospitals h', 'h.hosuid = d.hosuid', 'left');
        $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
        $this->db->where('d.docuid', $loguid);
        $this->db->where('d.isdelete', 0);
        $query = $this->db->get();
        return $query->row_array();
    }
}
