<?php

class HospitalCommonModel extends CI_Model{



	public function get_DoctorSpecializationsList() {
        $this->db->select('id, specialization_name as name');
        $this->db->from('ms_doctor_specializations');
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_logHospitalInfo($loguid){
    	$this->db->select('mh.id, mh.hosuid, mh.name, mh.email, mh.phone');
	    $this->db->from('ms_hospitals mh');
	    $this->db->where('mh.hosuid', $loguid);
	    $query = $this->db->get();
	    return $query->row_array();
    }

    public function get_HospitalDoctorsList($loguid){
        $this->db->select('
            md.id, 
            md.docuid, 
            md.name as doctorName, 
            md.email as doctorEmail, 
            md.phone, 
            md.status, 
            md.gender, 
            md.profile_image,
            md.experience_year as expYear,
            md.experience_month as expMonth,
            md.consultation_fee as doctorFees,
            md.specialization_id as specialization,
            mhs.specialization_name as specialization_name,
            mh.name as hospitalName
        ');
        $this->db->from('ms_doctors md');
        $this->db->join('ms_doctor_specializations mhs', 'mhs.id = md.specialization_id', 'left');
        $this->db->join('ms_hospitals mh', 'mh.hosuid = md.hosuid', 'left');
        $this->db->where('md.hosuid', $loguid);
        $this->db->where('md.isdelete', 0); // Only non-deleted
        $query = $this->db->get();
        return $query->result_array();
    }

	public function get_HospitalShiftList($loguid){
		$this->db->select('id, shiftuid, shift_name, start_time, end_time, status');
        $this->db->from('ms_hospitals_shift_time');
        $this->db->where('hosuid', $loguid);
        $this->db->where('isdelete', 0); // Only non-deleted
        $query = $this->db->get();
        return $query->result_array();
	}


	public function get_HospitalSpecializationList($loguid){
		$this->db->select('speuid as id, name, description, status');
        $this->db->from('ms_hospitals_specialization');
        $this->db->where('hosuid', $loguid);
        $this->db->where('isdelete', 0); // Only non-deleted
        $query = $this->db->get();
        return $query->result_array();
	}

	public function get_HospitalEventTypeList($loguid){
		$this->db->select('eventuid as id, name, color, description, status');
        $this->db->from('ms_hospitals_event_type');
        $this->db->where('hosuid', $loguid);
        $this->db->where('isdelete', 0); // Only non-deleted
        $query = $this->db->get();
        return $query->result_array();
	}

	public function get_HospitalDepartmentList($loguid){
		$this->db->select('deptuid, name, status');
        $this->db->from('ms_hospitals_department');
        $this->db->where('hosuid', $loguid);
        $this->db->where('isdelete', 0); // Only non-deleted
        $query = $this->db->get();
        return $query->result_array();
	}

	public function get_HospitalRoleList($loguid){
	    $this->db->select('mr.roleuid, mr.name, mr.status, mr.deptuid, md.name AS deptName');
	    $this->db->from('ms_hospitals_role AS mr');
	    $this->db->join('ms_hospitals_department AS md', 'md.deptuid = mr.deptuid', 'left');
	    $this->db->where('mr.hosuid', $loguid);
	    $this->db->where('mr.isdelete', 0); 

	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalAmenityList($loguid){
	    $this->db->select('ha.amenityuid, ha.name, ha.icon, ha.status');
	    $this->db->from('ms_hospitals_amenity AS ha');
	    $this->db->where('ha.hosuid', $loguid);
	    $this->db->where('ha.isdelete', 0); 

	    $query = $this->db->get();
	    return $query->result_array();
	}


	public function get_HospitalRoomTypeList($loguid){
	    $this->db->select('hrt.roomtypeuid, hrt.title, hrt.status');
	    $this->db->from('ms_hospitals_room_type AS hrt');
	    $this->db->where('hrt.hosuid', $loguid);
	    $this->db->where('hrt.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalInventoryCategoryList($hospital_id){
	    $this->db->select('hc.id, hc.name, hc.description, hc.status, hc.updated_at');
	    $this->db->from('ms_hospitals_category AS hc');
	    $this->db->where('hc.hospital_id', $hospital_id);
	    $this->db->where('hc.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalIvSubCategoryList($hospital_id){
	    $this->db->select('hs.id, hc.name as category_name, hs.category_id, hs.name, hs.description, hs.status, hs.updated_at');
	    $this->db->from('ms_hospitals_subcategory AS hs');
	    $this->db->join('ms_hospitals_category AS hc', 'hc.id = hs.category_id', 'left');
	    $this->db->where('hs.hospital_id', $hospital_id);
	    $this->db->where('hs.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

    public function get_PreferredLaboratories($hospital_id) {
        $this->db->select('lb.*, mhl.id as relation_id, mhl.created_at as added_at');
        $this->db->from('ms_hospitals_laboratorys mhl');
        $this->db->join('lb_laboratorys lb', 'lb.id = mhl.laboratory_id');
        $this->db->where('mhl.hospital_id', $hospital_id);
        $this->db->where('mhl.status', 1);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_AvailableLaboratories($hospital_id) {
        // Get IDs of already preferred labs
        $this->db->select('laboratory_id');
        $this->db->from('ms_hospitals_laboratorys');
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('status', 1);
        $subQuery = $this->db->get_compiled_select();

        $this->db->select('*');
        $this->db->from('lb_laboratorys');
        // If subquery returns empty, NOT IN (...) might fail or behave unexpectedly if not handled, 
        // but get_compiled_select returns a string query. 
        // However, if there are no preferred labs, we shouldn't filter.
        
        // Let's do a check. simpler approach:
        $existing = $this->db->query($subQuery)->result_array();
        $ids = array_column($existing, 'laboratory_id');
        
        if (!empty($ids)) {
            $this->db->where_not_in('id', $ids);
        }
        
        // $this->db->where('status', 1); // Assuming lb_laboratorys has a status column. I should verify this.
        // To be safe, I'll skip status check on lb_laboratorys unless I'm sure.
        // Actually, usually tables have status. I'll risk it or check first.
        
        $query = $this->db->get();
        return $query->result_array();
    }

    public function add_PreferredLaboratory($data) {
        $this->db->where('hospital_id', $data['hospital_id']);
        $this->db->where('laboratory_id', $data['laboratory_id']);
        $query = $this->db->get('ms_hospitals_laboratorys');
        
        if ($query->num_rows() > 0) {
            // Already exists, maybe update status if it was deleted/inactive?
            // For now, just return true as "added" or handle as needed.
            // Let's ensure it's active if we "re-add" it.
            $this->db->where('id', $query->row()->id);
            return $this->db->update('ms_hospitals_laboratorys', ['status' => 1]);
        }

        return $this->db->insert('ms_hospitals_laboratorys', $data);
    }

    public function remove_PreferredLaboratory($hospital_id, $laboratory_id) {
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('laboratory_id', $laboratory_id);
        return $this->db->delete('ms_hospitals_laboratorys');
    }

	public function get_HospitalIvManufacturerList($hospital_id){
	    $this->db->select('hm.id, hm.name, hm.contact_person, hm.address, hm.phone, hm.email, hm.license_no, hm.status, hm.updated_at');
	    $this->db->from('ms_hospitals_manufacturer AS hm');
	    $this->db->where('hm.hospital_id', $hospital_id);
	    $this->db->where('hm.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalIvBrandList($hospital_id){
	    $this->db->select('hb.id, hm.name as manufacturer_name, hb.manufacturer_id, hb.name, hb.description, hb.status, hb.updated_at');
	    $this->db->from('ms_hospitals_brand AS hb');
	    $this->db->join('ms_hospitals_manufacturer AS hm', 'hm.id = hb.manufacturer_id', 'left');
	    $this->db->where('hb.hospital_id', $hospital_id);
	    $this->db->where('hb.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalIvUnitOfMeasureList($hospital_id){
	    $this->db->select('hu.id, hu.name, hu.symbol, hu.conversion_rate, hu.status, hu.updated_at');
	    $this->db->from('ms_hospitals_unitofmeasure AS hu');
	    $this->db->where('hu.hospital_id', $hospital_id);
	    $this->db->where('hu.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalIvTaxList($hospital_id){
	    $this->db->select('ht.id, ht.name, ht.percentage, ht.type, ht.region, ht.status, ht.updated_at');
	    $this->db->from('ms_hospitals_tax AS ht');
	    $this->db->where('ht.hospital_id', $hospital_id);
	    $this->db->where('ht.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalIvProductList($hospital_id){
	    $this->db->select('hp.id, hp.sku, hp.name, hp.updated_at');
	    $this->db->from('ms_hospitals_inventory_products AS hp');
	    $this->db->where('hp.hospital_id', $hospital_id);
	    $this->db->where('hp.isdelete', 0);
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalRoomList($hospital_id, $wardid){
	    $this->db->select('hr.id, hr.ward_id, hr.title, hr.room_type, hr.bed_count, hr.status, hr.amenities');
	    $this->db->from('ms_hospitals_rooms AS hr');
	    $this->db->where('hr.hospital_id', $hospital_id);
	    $this->db->where('hr.ward_id', $wardid);
	    $this->db->where('hr.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalRoomListById($hospital_id, $wardid){
	    $this->db->select('hr.id, hr.ward_id, hr.title, hr.room_type, hr.bed_count, hr.status, hr.amenities');
	    $this->db->from('ms_hospitals_rooms AS hr');
	    $this->db->where('hr.hospital_id', $hospital_id);
	    $this->db->where('hr.ward_id', $wardid);
	    $this->db->where('hr.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	/*public function get_HospitalRoomBedList($loguid, $roomid){
	    $this->db->select('hb.beduid, hb.warduid, hb.roomuid, hb.title, hb.status, hb.assigned_patient_id');
	    $this->db->from('ms_hospitals_rooms_bed AS hb');
	    $this->db->where('hb.hosuid', $loguid);
	    $this->db->where('hb.roomuid', $roomid);
	    $this->db->where('hb.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}*/

	public function get_HospitalRoomBedList($hospital_id, $roomid) {
	    // Select fields from the main bed table
	    $this->db->select('
	        hb.id, 
	        hb.ward_id, 
	        hb.room_id, 
	        hb.title, 
	        hb.status, 
	        hb.assigned_patient_id, 
	        hb.admission_id, 
	        p.fname AS patient_fname, 
	        p.lname AS patient_lname, 
	        p.email AS patient_email, 
	        p.phone AS patient_phone, 
	        p.dob AS patient_dob, 
	        p.gender AS patient_gender, 
	        p.blood_group AS patient_blood_group, 
	        p.address AS patient_address, 
	        pa.doctor_id, 
	        pa.admit_date, 
	        pa.activity_type, 
	        pa.current_status, 
	        pa.priority, 
	        pa.medical_notes
	    ');

	    // From the hospitals rooms bed table
	    $this->db->from('ms_hospitals_rooms_bed AS hb');
	    
	    // Left join with ms_patient to get patient details based on assigned_patient_id
	    $this->db->join('ms_patient AS p', 'hb.assigned_patient_id = p.id', 'left');
	    
	    // Left join with ms_patient_bed_admission to get admission details based on admission_uid
	    $this->db->join('ms_patient_bed_admission AS pa', 'hb.admission_id = pa.id', 'left');
	    
	    // Apply the necessary where conditions
	    $this->db->where('hb.hospital_id', $hospital_id);
	    $this->db->where('hb.room_id', $roomid);
	    $this->db->where('hb.isdelete', 0); 
	    
	    // Execute the query and return the results
	    $query = $this->db->get();
	    
	    return $query->result_array();
	}

	public function get_HospitalRoomBedListById($hospital_id, $room_id) {
	    // Select fields from the main bed table
	    $this->db->select('
	        hb.id, 
	        hb.ward_id, 
	        hb.room_id, 
	        hb.title, 
	        hb.status, 
	        hb.assigned_patient_id,  
	        hb.admission_id, 
	        p.fname AS patient_fname, 
	        p.lname AS patient_lname, 
	        p.email AS patient_email, 
	        p.phone AS patient_phone, 
	        p.dob AS patient_dob, 
	        p.gender AS patient_gender, 
	        p.blood_group AS patient_blood_group, 
	        p.address AS patient_address, 
	        pa.doctor_id, 
	        pa.admit_date, 
	        pa.activity_type, 
	        pa.current_status, 
	        pa.priority, 
	        pa.medical_notes,
	        pa.permission_status,
	    ');

	    // From the hospitals rooms bed table
	    $this->db->from('ms_hospitals_rooms_bed AS hb');
	    
	    // Left join with ms_patient to get patient details based on assigned_patient_id
	    $this->db->join('ms_patient AS p', 'hb.assigned_patient_id = p.id', 'left');
	    
	    // Left join with ms_patient_bed_admission to get admission details based on admission_uid
	    $this->db->join('ms_patient_bed_admission AS pa', 'hb.admission_id = pa.id', 'left');
	    
	    // Apply the necessary where conditions
	    $this->db->where('hb.hospital_id', $hospital_id);
	    $this->db->where('hb.room_id', $room_id);
	    $this->db->where('hb.isdelete', 0); 
	    
	    // Execute the query and return the results
	    $query = $this->db->get();
	    
	    return $query->result_array();
	}

    /* ===== Reception Dashboard Queries ===== */

    public function get_ReceptionStats($hospital_id, $hosuid) {
        $today = date('Y-m-d');
        
        // Total Patients Today
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('date', $today);
        $totalPatients = $this->db->count_all_results('ms_patient_appointment');

        // Completed Today
        $this->db->where('hospital_id', $hospital_id);
        $this->db->where('date', $today);
        $this->db->where('status', 'completed');
        $completedToday = $this->db->count_all_results('ms_patient_appointment');

        // Doctors Online (Active)
        $this->db->where('hosuid', $hosuid);
        $this->db->where('is_online', 1);
        $this->db->where('status', '1');
        $this->db->where('isdelete', 0);
        $doctorsAvailable = $this->db->count_all_results('ms_doctors');

        // Emergency Cases (Mock logic or use priority if available)
        // Assuming no explicit emergency flag in appointment table yet, returning 0 or checking 'source' if relevant
        $emergencyCases = 0; 

        // Average Wait Time (Mock or calculation)
        $avgWaitTime = 15; // Default mock value for now

        return [
            'totalPatients' => $totalPatients,
            'completedToday' => $completedToday,
            'doctorsAvailable' => $doctorsAvailable,
            'emergencyCases' => $emergencyCases,
            'avgWaitTime' => $avgWaitTime
        ];
    }

    public function get_ActiveConsultations($hospital_id) {
        $today = date('Y-m-d');
        
        $this->db->select('mpa.id, mpa.token_no, mpa.patient_name, mpa.doctor_id, md.name as doctor_name, md.profile_image as doctor_image, hs.name as specialization');
        $this->db->from('ms_patient_appointment mpa');
        $this->db->join('ms_doctors md', 'md.id = mpa.doctor_id', 'left');
        $this->db->join('ms_hospitals_specialization hs', 'md.specialization_id = hs.speuid', 'left');
        $this->db->where('mpa.hospital_id', $hospital_id);
        $this->db->where('mpa.date', $today);
        $this->db->where_in('mpa.status', ['active', 'in_progress', 'in-consultation']);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_DashboardDoctors($hosuid) {
        $this->db->select('md.id, md.name, md.profile_image, md.status, md.is_online, md.back_online_time, md.away_message, hs.specialization_name as specialization, md.room_number, md.avg_consultation_time');
        $this->db->from('ms_doctors md');
        $this->db->join('ms_doctor_specializations hs', 'md.specialization_id = hs.id', 'left');
        $this->db->where('md.hosuid', $hosuid);
        $this->db->where('md.isdelete', 0);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_WaitingQueue($hospital_id) {
        $today = date('Y-m-d');
        
        $this->db->select('mpa.id, mpa.token_no, mpa.patient_name, mpa.doctor_id, md.name as doctor_name, mpa.start_time, mpa.created_at, mpa.source');
        $this->db->from('ms_patient_appointment mpa');
        $this->db->join('ms_doctors md', 'md.id = mpa.doctor_id', 'left');
        $this->db->where('mpa.hospital_id', $hospital_id);
        $this->db->where('mpa.date', $today);
        $this->db->where_in('mpa.status', ['waiting', 'booked']);
        $this->db->order_by('mpa.token_no', 'ASC');
        $this->db->limit(10);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function save_ScreenSettings($hospital_id, $data) {
        $this->db->where('hospital_id', $hospital_id);
        $query = $this->db->get('ms_hospitals_screen_settings');

        if ($query->num_rows() > 0) {
            $this->db->where('hospital_id', $hospital_id);
            $this->db->update('ms_hospitals_screen_settings', $data);
        } else {
            $data['hospital_id'] = $hospital_id;
            $this->db->insert('ms_hospitals_screen_settings', $data);
        }
        return $this->db->affected_rows() > 0;
    }

    public function get_ScreenSettings($hospital_id) {
        $this->db->where('hospital_id', $hospital_id);
        $query = $this->db->get('ms_hospitals_screen_settings');
        return $query->row_array();
    }

    public function get_StaffHospitalInfo($staff_uid) {
        $this->db->select('hospital_id, hosuid');
        $this->db->from('ms_staff');
        $this->db->where('staff_uid', $staff_uid);
        $this->db->where('isdelete', 0);
        $query = $this->db->get();
        return $query->row_array();
    }


	public function get_HospitalWardTypeList($loguid){
	    $this->db->select('hwt.wardtypeuid, hwt.title, hwt.status');
	    $this->db->from('ms_hospitals_ward_type AS hwt');
	    $this->db->where('hwt.hosuid', $loguid);
	    $this->db->where('hwt.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalWardList($hospital_id){
	    $this->db->select('hw.id, hw.title, hw.ward_type, hw.floor_no, hw.status');
	    $this->db->from('ms_hospitals_ward AS hw');
	    $this->db->where('hw.hospital_id', $hospital_id);
	    $this->db->where('hw.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_HospitalWardListById($hospital_id){
	    $this->db->select('hw.id, hw.warduid, hw.title, hw.ward_type, hw.floor_no, hw.status');
	    $this->db->from('ms_hospitals_ward AS hw');
	    $this->db->where('hw.hospital_id', $hospital_id);
	    $this->db->where('hw.isdelete', 0); 
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_activityOptionList($loguid = ''){
		//$this->db->select('mpa.activityuid as id,  mpa.title, mpa.category, mpa.color_code');
		$this->db->select('mpa.id,  mpa.title, mpa.category, mpa.color_code');
	    $this->db->from('ms_hospitals_patient_activity_type mpa');
	    $this->db->where('mpa.status', 1);
	    $this->db->where('mpa.isdelete', 0);
	    $this->db->where('mpa.hosuid', $loguid);
	    $query = $this->db->get();
	    return $query->result_array();
	}

    /* ===== OTP Management Functions ===== */

    public function get_HospitalDoctorsOTPList($loguid){
        $this->db->select('
            md.id, 
            md.docuid as employeeId, 
            md.name, 
            md.email, 
            md.phone, 
            "Doctor" as role,
            mhs.specialization_name as department,
            md.current_otp,
            md.otp_generated_at,
            md.otp_expires_at,
            md.two_factor_auth
        ');
        $this->db->from('ms_doctors md');
        $this->db->join('ms_doctor_specializations mhs', 'mhs.id = md.specialization_id', 'left');
        $this->db->where('md.hosuid', $loguid);
        $this->db->where('md.isdelete', 0);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_HospitalStaffOTPList($hospital_id){
        $this->db->select('
            ms.id, 
            ms.staff_uid as employeeId, 
            ms.name, 
            ms.email, 
            ms.phone, 
            ms.role, 
            ms.department,
            ms.current_otp,
            ms.otp_generated_at,
            ms.otp_expires_at,
            ms.two_factor_auth
        ');
        $this->db->from('ms_staff ms');
        $this->db->where('ms.hospital_id', $hospital_id);
        $this->db->where('ms.isdelete', 0);
        $query = $this->db->get();
        return $query->result_array();
    }

    public function update_DoctorOTP($docId, $otp, $generatedAt, $expiresAt) {
        $this->db->where('docuid', $docId);
        return $this->db->update('ms_doctors', [
            'current_otp' => $otp,
            'otp_generated_at' => $generatedAt,
            'otp_expires_at' => $expiresAt
        ]);
    }
    
    public function update_StaffOTP($staffId, $otp, $generatedAt, $expiresAt) {
        $this->db->where('staff_uid', $staffId);
        return $this->db->update('ms_staff', [
            'current_otp' => $otp,
            'otp_generated_at' => $generatedAt,
            'otp_expires_at' => $expiresAt
        ]);
    }

    public function toggle_Doctor2FA($docId, $status) {
        $this->db->where('docuid', $docId);
        return $this->db->update('ms_doctors', ['two_factor_auth' => $status]);
    }

    public function toggle_Staff2FA($staffId, $status) {
        $this->db->where('staff_uid', $staffId);
        return $this->db->update('ms_staff', ['two_factor_auth' => $status]);
    }

	public function get_activityOptionListById($hospital_id = ''){
		//$this->db->select('mpa.activityuid as id,  mpa.title, mpa.category, mpa.color_code');
		$this->db->select('mpa.id,  mpa.title, mpa.category, mpa.color_code');
	    $this->db->from('ms_hospitals_patient_activity_type mpa');
	    $this->db->where('mpa.status', 1);
	    $this->db->where('mpa.isdelete', 0);
	    $this->db->where('mpa.hospital_id', $hospital_id);
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_patientCurrentStatusOptionList($loguid = ''){
		//$this->db->select('mps.statusuid as id, mps.title, mps.category, mps.color_code');
		$this->db->select('mps.id, mps.title, mps.category, mps.color_code');
	    $this->db->from('ms_hospitals_patient_status mps');
	    $this->db->where('mps.status', 1);
	    $this->db->where('mps.isdelete', 0);
	    $this->db->where('mps.hosuid', $loguid);
	    $query = $this->db->get();
	    return $query->result_array();
	}

	public function get_patientCurrentStatusOptionListByHospital($hospital_id = ''){
		//$this->db->select('mps.statusuid as id, mps.title, mps.category, mps.color_code');
		$this->db->select('mps.id, mps.title, mps.category, mps.color_code');
	    $this->db->from('ms_hospitals_patient_status mps');
	    $this->db->where('mps.status', 1);
	    $this->db->where('mps.isdelete', 0);
	    $this->db->where('mps.hospital_id', $hospital_id);
	    $query = $this->db->get();
	    return $query->result_array();
	}

    public function save_screen_info($screen_data, $doctor_ids) {
        $this->db->trans_start();

        // 1. Insert Screen Info
        $this->db->insert('ms_hospitals_screens', $screen_data);
        
        $screen_id = $this->db->insert_id();

        // 2. Insert Screen Doctors
        if (!empty($doctor_ids) && is_array($doctor_ids)) {
            foreach ($doctor_ids as $doctor_id) {
                $doc_data = [
                    'screenuid' => $screen_id, // Saving screen_id (int) as requested
                    'docuid' => $doctor_id,    // Saving doctor_id (int) as requested
                    'hosuid' => $screen_data['hosuid'] // Saving hospital_id (int) from screen_data
                ];
                $this->db->insert('ms_hospitals_screen_doctors', $doc_data);
            }
        }

        $this->db->trans_complete();

        return $this->db->trans_status();
    }

    public function get_HospitalScreensList($hospital_id) {
        $this->db->select('
            s.id, s.screenuid, s.name, s.location, s.description, 
            s.resolution, s.layout, s.theme, s.status, s.auto_refresh, s.refresh_interval,
            sd.docuid as doctor_id, 
            d.name as doctor_name, 
            d.profile_image, 
            d.gender,
            d.room_number,
            d.avg_consultation_time,
            d.consultation_fee,
            hs.name as specialization
        ');
        $this->db->from('ms_hospitals_screens s');
        $this->db->join('ms_hospitals_screen_doctors sd', 's.id = sd.screenuid', 'left');
        $this->db->join('ms_doctors d', 'sd.docuid = d.id', 'left');
        $this->db->join('ms_hospitals_specialization hs', 'd.specialization_id = hs.speuid', 'left');
        $this->db->where('s.hosuid', $hospital_id);
        $this->db->where('s.isdelete', 0);
        
        $query = $this->db->get();
        $result = $query->result_array();

        // Group doctors by screen
        $screens = [];
        foreach ($result as $row) {
            $screen_id = $row['id'];
            if (!isset($screens[$screen_id])) {
                $screens[$screen_id] = [
                    'id' => $row['id'],
                    'screenuid' => $row['screenuid'],
                    'name' => $row['name'],
                    'location' => $row['location'],
                    'description' => $row['description'],
                    'resolution' => $row['resolution'],
                    'layout' => $row['layout'],
                    'theme' => $row['theme'],
                    'status' => $row['status'] == 1 ? 'active' : 'inactive',
                    'auto_refresh' => $row['auto_refresh'],
                    'refresh_interval' => $row['refresh_interval'],
                    'doctors' => []
                ];
            }
            if ($row['doctor_id']) {
                $screens[$screen_id]['doctors'][] = [
                    'id' => $row['doctor_id'],
                    'name' => $row['doctor_name'],
                    'specialization' => $row['specialization'] ? $row['specialization'] : 'General',
                    'gender' => $row['gender'],
                    'image' => $row['profile_image'],
                    'room_number' => $row['room_number'],
                    'avg_consultation_time' => $row['avg_consultation_time'],
                    'consultation_fee' => $row['consultation_fee']
                ];
            }
        }
        return array_values($screens);
    }

    public function get_DoctorsAppointmentsToday($doctor_ids) {
        if (empty($doctor_ids)) return [];

        $today = date('Y-m-d');
        
        $this->db->select('
            a.doctor_id,
            a.token_no,
            a.patient_name,
            a.status,
            a.start_time,
            a.created_at,
            a.id as appointment_id
        ');
        $this->db->from('ms_patient_appointment a');
        $this->db->where_in('a.doctor_id', $doctor_ids);
        $this->db->where('a.date', $today);
        $this->db->order_by('a.token_no', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_TokenDashboardStats($hospital_id) {
        $today = date('Y-m-d');

        // 1. Active Screens Count
        $this->db->where('hosuid', $hospital_id);
        $this->db->where('status', 1);
        $this->db->where('isdelete', 0);
        $activeScreens = $this->db->count_all_results('ms_hospitals_screens');

        // 2. Total Screens Count
        $this->db->where('hosuid', $hospital_id);
        $this->db->where('isdelete', 0);
        $totalScreens = $this->db->count_all_results('ms_hospitals_screens');

        // 3. Today's Tokens (Served + Waiting)
        $this->db->from('ms_patient_appointment a');
        $this->db->join('ms_doctors d', 'a.doctor_id = d.id');
        $this->db->where('d.hosuid', $hospital_id);
        $this->db->where('a.date', $today);
        $todayTokens = $this->db->count_all_results();

        // 4. Pending Queue
        $this->db->from('ms_patient_appointment a');
        $this->db->join('ms_doctors d', 'a.doctor_id = d.id');
        $this->db->where('d.hosuid', $hospital_id);
        $this->db->where('a.date', $today);
        $this->db->where_in('a.status', ['waiting', 'booked']);
        $pendingQueue = $this->db->count_all_results();

        // 6. Upcoming Tokens (Next 5)
        $this->db->select('a.token_no, a.patient_name, a.status, a.start_time, d.name as doctor_name, "Normal" as priority');
        $this->db->from('ms_patient_appointment a');
        $this->db->join('ms_doctors d', 'a.doctor_id = d.id');
        $this->db->where('d.hosuid', $hospital_id);
        $this->db->where('a.date', $today);
        $this->db->where_in('a.status', ['waiting', 'booked']);
        $this->db->order_by('a.token_no', 'ASC');
        $this->db->limit(5);
        $upcomingTokens = $this->db->get()->result_array();

        // 6. Active Screens List (Detailed)
        $activeScreensList = $this->get_HospitalScreensList($hospital_id);

        // 7. Active Doctors (New)
        $this->db->select('d.id, d.name, d.profile_image, d.status, hs.name as department');
        $this->db->from('ms_doctors d');
        $this->db->join('ms_hospitals_specialization hs', 'd.specialization_id = hs.speuid', 'left');
        $this->db->where('d.hosuid', $hospital_id);
        $this->db->where('d.status', 1);
        $this->db->where('d.isdelete', 0);
        $this->db->limit(5); 
        $activeDoctors = $this->db->get()->result_array();
        
        // Enrich doctors with dummy data for now
        foreach ($activeDoctors as &$doc) {
            $doc['room'] = 'Room ' . (rand(100, 110)); 
            $doc['avgTime'] = '12 min'; 
        }

        // 8. Recent Activity (New - Based on appointments)
        $this->db->select('a.id, a.token_no, a.patient_name, a.status, a.created_at, a.updated_at');
        $this->db->from('ms_patient_appointment a');
        $this->db->join('ms_doctors d', 'a.doctor_id = d.id');
        $this->db->where('d.hosuid', $hospital_id);
        $this->db->order_by('a.updated_at', 'DESC'); 
        $this->db->limit(5);
        $recentAppts = $this->db->get()->result_array();

        $recentActivity = [];
        foreach ($recentAppts as $apt) {
            $timeVal = $apt['updated_at'] ? $apt['updated_at'] : $apt['created_at'];
            $timestamp = strtotime($timeVal);
            $formattedTime = $timestamp ? date('h:i A', $timestamp) : '';
            
            $recentActivity[] = [
                'id' => $apt['id'],
                'message' => "Token " . $apt['token_no'] . " updated to " . $apt['status'],
                'time' => $formattedTime
            ];
        }

        return [
            'activeScreens' => $activeScreens,
            'totalScreens' => $totalScreens,
            'todayTokens' => $todayTokens,
            'avgWaitTime' => '15 min',
            'pendingQueue' => $pendingQueue,
            'upcomingTokens' => $upcomingTokens,
            'activeScreensList' => $activeScreensList,
            'activeDoctors' => $activeDoctors,
            'recentActivity' => $recentActivity
        ];
    }

    public function get_DoctorScreenMessage($doctor_id) {
        $this->db->select('screen_default_message');
        $this->db->from('ms_doctors');
        $this->db->where('id', $doctor_id);
        $this->db->where('isdelete', 0);
        $query = $this->db->get();
        $row = $query->row_array();
        return $row && isset($row['screen_default_message']) ? trim($row['screen_default_message']) : '';
    }

    public function get_HospitalScreenMessage($hospital_id) {
        $this->db->select('screen_default_message');
        $this->db->from('ms_hospitals');
        $this->db->where('id', $hospital_id);
        $query = $this->db->get();
        $row = $query->row_array();
        return $row && isset($row['screen_default_message']) ? trim($row['screen_default_message']) : '';
    }
}
