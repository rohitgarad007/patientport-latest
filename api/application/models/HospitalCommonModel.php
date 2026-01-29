<?php

class HospitalCommonModel extends CI_Model{



	public function get_logHospitalInfo($loguid){
    	$this->db->select('mh.id, mh.hosuid, mh.name, mh.email, mh.phone');
	    $this->db->from('ms_hospitals mh');
	    $this->db->where('mh.hosuid', $loguid);
	    $query = $this->db->get();
	    return $query->row_array();
    }

    public function get_HospitalDoctorsList($loguid){
        $this->db->select('docuid as id, name, email, phone, status, gender');
        $this->db->from('ms_doctors');
        $this->db->where('hosuid', $loguid);
        $this->db->where('isdelete', 0); // Only non-deleted
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

}