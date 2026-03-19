<?php

class StaffCommonModel extends CI_Model{


	public function insertStaffInformation($data) {
        $this->db->insert('ms_staff', $data);
        return $this->db->insert_id();
    }

    public function get_logstaffInfo($loguid){
    	$this->db->select('ms.id, ms.staff_uid, ms.name, ms.email, ms.hosuid, ms.hospital_id');
	    $this->db->from('ms_staff ms');
	    $this->db->where('ms.staff_uid', $loguid);
	    $query = $this->db->get();
	    return $query->row_array();
    }

    public function get_logstaffInfoWithAccess($loguid){
    	$this->db->select('
	        ms.id, ms.staff_uid, ms.name, ms.email, ms.hosuid, ms.hospital_id,
	        sa.patient_list,
	        sa.view_patients,
	        sa.add_patients,
	        sa.edit_patients,
	        sa.view_medical_history,
	        sa.write_prescriptions,
	        sa.view_lab_results,
	        sa.request_lab_tests,
	        sa.manage_vitals,
	        sa.appointment_list,
	        sa.book_appointment,
	        sa.reschedule_appointment,
	        sa.cancel_appointment,
	        sa.icu_access,
	        sa.assign_rooms,
	        sa.bad_request_approved,
	        sa.monitor_beds,
	        sa.emergency_access,
	        sa.view_inventory,
	        sa.dispense_medication,
	        sa.manage_controlled,
	        sa.reorder_stock,
	        sa.perform_lab_tests,
	        sa.manage_lab_equipment,
	        sa.lab_safety,
	        sa.view_billing,
	        sa.process_payments,
	        sa.apply_discounts,
	        sa.insurance_claims,
	        sa.financial_reports,
	        sa.manage_users,
	        sa.assign_roles,
	        sa.system_monitoring,
	        sa.emergency_override,
	        sa.view_staff_profiles,
	        sa.manage_shifts,
	        sa.performance_reviews
	    ');
	    $this->db->from('ms_staff ms');
	    $this->db->join('ms_staff_access sa', 'sa.staff_uid = ms.staff_uid', 'left');
	    $this->db->where('ms.staff_uid', $loguid);
	    $query = $this->db->get();
	    return $query->row_array();
    }


    public function insertStaffAccess($data) {
        $this->db->insert('ms_staff_access', $data);
        return $this->db->insert_id();
    }

    public function updateStaffInformation($staffUid, $data) {
	    $this->db->where('staff_uid', $staffUid);
	    return $this->db->update('ms_staff', $data);
	}

	public function updateStaffInformationByHospital($staffUid, $data, $loguid) {
	    $this->db->where('staff_uid', $staffUid);
	    $this->db->where('hosuid', $loguid);
	    return $this->db->update('ms_staff', $data);
	}

	public function updateStaffStatus($staffUid, $status) {
	    $this->db->where('staff_uid', $staffUid);
	    return $this->db->update('ms_staff', ['status' => $status]);
	}

	public function updateStaffStatusByHospital($staffUid, $status, $loguid) {
	    $this->db->where('staff_uid', $staffUid);
	    $this->db->where('hosuid', $loguid);
	    return $this->db->update('ms_staff', ['status' => $status]);
	}

    public function get_StaffCount($search = '', $role = '', $hospitalId = '') {
	    $this->db->from('ms_staff ms');
	    $this->db->where('ms.isdelete', 0);

	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('ms.name', $search);
	        $this->db->or_like('ms.email', $search);
	        $this->db->or_like('ms.phone', $search);
	        $this->db->group_end();
	    }

	    if (!empty($role)) {
	        $this->db->where('ms.role', $role);
	    }

	    if (!empty($hospitalId)) {
	        $this->db->where('ms.hosuid', $hospitalId);
	    }

	    return (int)$this->db->count_all_results();
	}

	public function get_StaffList($search = '', $role = '', $hospitalId = '', $limit = 10, $offset = 0) {
	    $this->db->select('ms.staff_uid, ms.name, ms.email, ms.phone, ms.role, ms.department, ms.hosuid, ms.shift, ms.experience_years as experienceYears, ms.experience_months as experienceMonths, ms.status, hs.name as hospitalName, ms.hosuid as hospitalId');
	    $this->db->from('ms_staff ms');
	    $this->db->join('ms_hospitals hs', 'hs.hosuid = ms.hosuid', 'left');
	    $this->db->where('ms.isdelete', 0);

	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('ms.name', $search);
	        $this->db->or_like('ms.email', $search);
	        $this->db->or_like('ms.phone', $search);
	        $this->db->group_end();
	    }

	    if (!empty($role)) {
	        $this->db->where('ms.role', $role);
	    }

	    if (!empty($hospitalId)) {
	        $this->db->where('ms.hosuid', $hospitalId);
	    }

	    $this->db->limit($limit, $offset);

	    $query = $this->db->get();
	    return $query->result_array();
	}


	public function get_StaffCountByHospital($search = '', $role = '', $loguid = '') {
	    $this->db->from('ms_staff ms');
	    $this->db->where('ms.isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('ms.name', $search);
	        $this->db->or_like('ms.email', $search);
	        $this->db->or_like('ms.phone', $search);
	        $this->db->group_end();
	    }
	    $this->db->where('ms.hosuid', $loguid);
	    if (!empty($role)) {
	        $this->db->where('ms.role', $role);
	    }
	    return (int)$this->db->count_all_results();
	}

	public function get_StaffListByHospital($search = '', $role = '', $loguid = '', $limit = 10, $offset = 0) {
	    $this->db->select('ms.staff_uid, ms.name, ms.email, ms.phone, ms.role, ms.department, ms.hosuid, ms.shift, ms.experience_years as experienceYears, ms.experience_months as experienceMonths, ms.status, hs.name as hospitalName, ms.hosuid as hospitalId');
	    $this->db->from('ms_staff ms');
	    $this->db->join('ms_hospitals hs', 'hs.hosuid = ms.hosuid', 'left');
	    $this->db->where('ms.isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('ms.name', $search);
	        $this->db->or_like('ms.email', $search);
	        $this->db->or_like('ms.phone', $search);
	        $this->db->group_end();
	    }
	    $this->db->where('ms.hosuid', $loguid);
	    if (!empty($role)) {
	        $this->db->where('ms.role', $role);
	    }
	    $this->db->limit($limit, $offset);
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_StaffOptionListByHospital($loguid = '') {
	    $this->db->select('ms.staff_uid, ms.name, ms.phone');
	    $this->db->from('ms_staff ms');
	    $this->db->where('ms.isdelete', 0);
	    $this->db->where('ms.hosuid', $loguid);
	    $query = $this->db->get();
	    return $query->result_array();
	}

    public function get_today_appointments($hospital_id, $date = null) {
        $selDate = !empty($date) ? $date : date('Y-m-d');
        $this->db->select('
            pa.id,
            pa.appointment_uid,
            pa.date,
            pa.start_time,
            pa.end_time,
            pa.status,
            pa.created_at,
            d.name as doctor_name,
            d.profile_image as doctor_image,
            CONCAT(p.fname, " ", p.lname) as patient_name,
            p.gender as patient_gender,
            p.dob as patient_dob
        ', FALSE);
        $this->db->from('ms_patient_appointment pa');
        $this->db->join('ms_doctors d', 'd.id = pa.doctor_id', 'left');
        $this->db->join('ms_patient p', 'p.id = pa.patient_id', 'left');
        $this->db->where('pa.hospital_id', $hospital_id);
        $this->db->where('pa.date', $selDate);
        $this->db->order_by('pa.start_time', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_dashboard_doctors($hosuid) {
        $this->db->select('
            d.id,
            d.docuid,
            d.name,
            d.profile_image,
            d.status,
            s.specialization_name as specialty,
            (SELECT COUNT(*) FROM ms_patient_appointment pa WHERE pa.doctor_id = d.id AND pa.date = CURDATE() AND pa.status != "Cancelled") as patients_today,
            (SELECT MIN(pa.start_time) FROM ms_patient_appointment pa WHERE pa.doctor_id = d.id AND pa.date = CURDATE() AND pa.start_time > CURTIME() AND pa.status != "Cancelled") as next_appointment
        ', FALSE);
        $this->db->from('ms_doctors d');
        $this->db->join('ms_doctor_specializations s', 's.id = d.specialization_id', 'left');
        $this->db->where('d.hosuid', $hosuid);
        $this->db->where('d.isdelete', 0);
        $query = $this->db->get();
        return $query->result_array();
    }

	public function get_StaffsAccessByHospital($loguid = '', $staffUid) {
	    $this->db->select('
	        ms.staff_uid,
	        ms.name,
	        ms.phone,
	        sa.patient_list,
	        sa.view_patients,
	        sa.add_patients,
	        sa.edit_patients,
	        sa.view_medical_history,
	        sa.write_prescriptions,
	        sa.view_lab_results,
	        sa.request_lab_tests,
	        sa.manage_vitals,
	        sa.appointment_list,
	        sa.book_appointment,
	        sa.reschedule_appointment,
	        sa.cancel_appointment,
	        sa.icu_access,
	        sa.assign_rooms,
	        sa.bad_request_approved,
	        sa.monitor_beds,
	        sa.emergency_access,
	        sa.view_inventory,
	        sa.dispense_medication,
	        sa.manage_controlled,
	        sa.reorder_stock,
	        sa.perform_lab_tests,
	        sa.manage_lab_equipment,
	        sa.lab_safety,
	        sa.view_billing,
	        sa.process_payments,
	        sa.apply_discounts,
	        sa.insurance_claims,
	        sa.financial_reports,
	        sa.manage_users,
	        sa.assign_roles,
	        sa.system_monitoring,
	        sa.emergency_override,
	        sa.view_staff_profiles,
	        sa.manage_shifts,
	        sa.performance_reviews
	    ');
	    $this->db->from('ms_staff ms');
	    $this->db->join('ms_staff_access sa', 'sa.staff_uid = ms.staff_uid', 'left');
	    $this->db->where('ms.isdelete', 0);
	    $this->db->where('ms.hosuid', $loguid);
	    $this->db->where('ms.staff_uid', $staffUid);

	    $query = $this->db->get();
	    return $query->row_array();
	}

	public function get_StaffAccessById($loguid = ''){
		$this->db->select('
	        ms.staff_uid,
	        ms.name,
	        ms.phone,
	        sa.patient_list,
	        sa.view_patients,
	        sa.add_patients,
	        sa.edit_patients,
	        sa.view_medical_history,
	        sa.write_prescriptions,
	        sa.view_lab_results,
	        sa.request_lab_tests,
	        sa.manage_vitals,
	        sa.appointment_list,
	        sa.book_appointment,
	        sa.master_scheduler,
	        sa.doctor_calendar,
	        sa.reschedule_appointment,
	        sa.cancel_appointment,
	        sa.icu_access,
	        sa.assign_rooms,
	        sa.monitor_beds,
	        sa.emergency_access,
	        sa.view_inventory,
	        sa.dispense_medication,
	        sa.manage_controlled,
	        sa.reorder_stock,
	        sa.perform_lab_tests,
	        sa.manage_lab_equipment,
	        sa.lab_safety,
	        sa.view_billing,
	        sa.process_payments,
	        sa.apply_discounts,
	        sa.insurance_claims,
	        sa.financial_reports,
	        sa.manage_users,
	        sa.assign_roles,
	        sa.system_monitoring,
	        sa.emergency_override,
	        sa.view_staff_profiles,
	        sa.manage_shifts,
	        sa.performance_reviews
	    ');
	    $this->db->from('ms_staff ms');
	    $this->db->join('ms_staff_access sa', 'sa.staff_uid = ms.staff_uid', 'left');
	    $this->db->where('ms.isdelete', 0);
	    $this->db->where('ms.staff_uid', $loguid);
	    $query = $this->db->get();
	    return $query->row_array();
	}


}
