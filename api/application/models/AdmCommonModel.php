<?php

class AdmCommonModel extends CI_Model{


	// ✅ Get hospital count (exclude deleted)
    public function get_hospitalCount($search = '') {
        $this->db->from('ms_hospitals');
        $this->db->where('isdelete', 0); // only not deleted
        if (!empty($search)) {
            $this->db->like('name', $search);
        }
        return ['total' => $this->db->count_all_results()];
    }

    

    // ✅ Get hospital list (exclude deleted, with doctors & staff count)
    public function get_hospitalList($search = '', $limit = 10, $offset = 0)
    {
        // ✅ Select hospitals + doctor/staff counts
        $this->db->select('
            ms.id, 
            ms.hosuid, 
            ms.name, 
            ms.registration_number, 
            ms.email, 
            ms.phone, 
            ms.alternate_phone, 
            ms.address, 
            ms.website_url, 
            ms.status,
            ms.state,
            ms.city,
            ms.pincode,
            ms.doctorsCount,
            ms.staffCount,
            CAST((
                SELECT COUNT(d.id) 
                FROM ms_doctors d 
                WHERE d.hosuid = ms.hosuid 
                  AND d.isdelete = 0
            ) AS UNSIGNED) AS totalDoctors,
            CAST((
                SELECT COUNT(s.id) 
                FROM ms_staff s 
                WHERE s.hosuid = ms.hosuid 
                  AND s.isdelete = 0
            ) AS UNSIGNED) AS totalStaff
        ', false); // false prevents CodeIgniter from escaping SQL

        $this->db->from('ms_hospitals as ms');
        $this->db->where('ms.isdelete', 0); // only not deleted

        // ✅ Search (optional)
        if (!empty($search)) {
            $this->db->group_start()
                     ->like('ms.name', $search)
                     ->or_like('ms.email', $search)
                     ->or_like('ms.phone', $search)
                     ->group_end();
        }

        // ✅ Pagination
        $this->db->limit($limit, $offset);

        $query = $this->db->get();
        $result = $query->result_array();

        // ✅ Total count for pagination
        $this->db->from('ms_hospitals as ms');
        $this->db->where('ms.isdelete', 0);
        if (!empty($search)) {
            $this->db->group_start()
                     ->like('ms.name', $search)
                     ->or_like('ms.email', $search)
                     ->or_like('ms.phone', $search)
                     ->group_end();
        }
        $total = $this->db->count_all_results();

        return [
            'data'  => $result,
            'total' => $total,
            'page'  => ($offset / $limit) + 1,
            'limit' => $limit
        ];
    }




	public function insertHospital($data) {
	    $this->db->insert('ms_hospitals', $data);
	    return $this->db->insert_id(); // returns the new hospital ID
	}

	public function updateHospital($hosuid, $data) {
	    $this->db->where('hosuid', $hosuid);
	    return $this->db->update('ms_hospitals', $data);
	}
    

	public function updateHospitalStatus($hosuid, $status) {
	    $this->db->where('hosuid', $hosuid);
	    return $this->db->update('ms_hospitals', ['status' => $status]);
	}

	// Laboratories master helpers
	public function get_laboratoryCount($search = '') {
	    $this->db->from('lb_laboratorys');
	    $this->db->where('isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('name', $search);
	        $this->db->or_like('email', $search);
	        $this->db->or_like('phone', $search);
	        $this->db->or_like('registration_number', $search);
	        $this->db->group_end();
	    }
	    return ['total' => $this->db->count_all_results()];
	}
	
	public function get_laboratoryList($search = '', $limit = 10, $offset = 0) {
	    $this->db->select('id, labuid, name, registration_number, email, phone, website_url, gst_number, state, city, address, status, created_at, updated_at');
	    $this->db->from('lb_laboratorys');
	    $this->db->where('isdelete', 0);
	    if (!empty($search)) {
	        $this->db->group_start();
	        $this->db->like('name', $search);
	        $this->db->or_like('email', $search);
	        $this->db->or_like('phone', $search);
	        $this->db->or_like('registration_number', $search);
	        $this->db->group_end();
	    }
	    $this->db->order_by('created_at', 'DESC');
	    $this->db->limit($limit, $offset);
	    $query = $this->db->get();
	    $rows = $query->result_array();
	    return ['data' => $rows];
	}
	
	public function insertLaboratory($data) {
	    $this->db->insert('lb_laboratorys', $data);
	    return $this->db->insert_id();
	}
	
	public function updateLaboratory($labuid, $data) {
	    $this->db->where('labuid', $labuid);
	    return $this->db->update('lb_laboratorys', $data);
	}
	
	public function updateLaboratoryStatus($labuid, $status) {
	    $this->db->where('labuid', $labuid);
	    return $this->db->update('lb_laboratorys', ['status' => $status]);
	}

    // Laboratory Staff methods
    public function get_laboratoryStaffCount($search = '') {
        $this->db->from('lb_laboratory_staff as ls');
        $this->db->join('lb_laboratorys as l', 'l.labuid = ls.lab_id', 'left');
        $this->db->where('ls.isdelete', 0);
        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('ls.name', $search);
            $this->db->or_like('ls.email', $search);
            $this->db->or_like('ls.phone', $search);
            $this->db->or_like('l.name', $search);
            $this->db->group_end();
        }
        return ['total' => $this->db->count_all_results()];
    }

    public function get_laboratoryStaffList($search = '', $limit = 10, $offset = 0) {
        $this->db->select('ls.id, ls.staff_uid, ls.lab_id, ls.name, ls.email, ls.phone, ls.role, ls.status, ls.created_at, l.name as lab_name');
        $this->db->from('lb_laboratory_staff as ls');
        $this->db->join('lb_laboratorys as l', 'l.labuid = ls.lab_id', 'left');
        $this->db->where('ls.isdelete', 0);
        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('ls.name', $search);
            $this->db->or_like('ls.email', $search);
            $this->db->or_like('ls.phone', $search);
            $this->db->or_like('l.name', $search);
            $this->db->group_end();
        }
        $this->db->order_by('ls.created_at', 'DESC');
        $this->db->limit($limit, $offset);
        $query = $this->db->get();
        return ['data' => $query->result_array()];
    }

    public function insertLaboratoryStaff($data) {
        $this->db->insert('lb_laboratory_staff', $data);
        return $this->db->insert_id();
    }

    public function updateLaboratoryStaff($staffuid, $data) {
        $this->db->where('staff_uid', $staffuid);
        return $this->db->update('lb_laboratory_staff', $data);
    }

    // ==========================================
    // Master Lab Tests Management
    // ==========================================

    public function get_masterLabTestCount($search = '', $department = 'all', $status = 'all') {
        $this->db->from('lb_master_lab_tests');
        $this->db->where('isdelete', 0);

        if ($department !== 'all' && !empty($department)) {
            $this->db->where('department', $department);
        }

        if ($status !== 'all' && !empty($status)) {
            $statusVal = ($status === 'active') ? 1 : 0;
            $this->db->where('status', $statusVal);
        }

        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('test_name', $search);
            $this->db->or_like('test_code', $search);
            $this->db->or_like('department', $search);
            $this->db->group_end();
        }
        return ['total' => $this->db->count_all_results()];
    }

    public function get_masterLabTestList($search = '', $limit = 10, $offset = 0, $department = 'all', $status = 'all') {
        $this->db->select('*');
        $this->db->from('lb_master_lab_tests');
        $this->db->where('isdelete', 0);

        if ($department !== 'all' && !empty($department)) {
            $this->db->where('department', $department);
        }

        if ($status !== 'all' && !empty($status)) {
            $statusVal = ($status === 'active') ? 1 : 0;
            $this->db->where('status', $statusVal);
        }

        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('test_name', $search);
            $this->db->or_like('test_code', $search);
            $this->db->or_like('department', $search);
            $this->db->group_end();
        }
        $this->db->order_by('created_at', 'DESC');
        $this->db->limit($limit, $offset);
        $query = $this->db->get();
        return ['data' => $query->result_array()];
    }

    public function getMasterLabTestById($id) {
        // Basic Info
        $this->db->where('id', $id);
        $test = $this->db->get('lb_master_lab_tests')->row_array();
        if (!$test) return null;

        // Advanced Info
        $this->db->where('test_id', $id);
        $advanced = $this->db->get('lb_master_lab_test_advanced')->row_array();
        
        // Parameters
        $this->db->where('test_id', $id);
        $this->db->where('isdelete', 0);
        $this->db->order_by('display_order', 'ASC');
        $parameters = $this->db->get('lb_master_lab_test_parameters')->result_array();

        foreach ($parameters as &$param) {
            // Critical Values
            $this->db->where('parameter_id', $param['id']);
            $critical = $this->db->get('lb_master_lab_test_critical_values')->row_array();
            $param['critical_values'] = $critical;

            // Reference Ranges
            $this->db->where('parameter_id', $param['id']);
            $ranges = $this->db->get('lb_master_lab_test_reference_ranges')->result_array();
            $param['reference_ranges'] = $ranges;
        }

        return [
            'test' => $test,
            'advanced' => $advanced,
            'parameters' => $parameters
        ];
    }

    private function _get_or_create_master_lab_id() {
        // Try to find existing Master Laboratory
        $this->db->where('name', 'Master Laboratory');
        $this->db->where('isdelete', 0);
        $lab = $this->db->get('lb_laboratorys')->row_array();

        if ($lab) {
            return $lab['id'];
        }

        // Create Master Laboratory
        $labData = [
            'labuid'              => uniqid('LAB_MASTER_'),
            'name'                => 'Master Laboratory',
            'registration_number' => 'SYSTEM-MASTER',
            'email'               => 'master-lab@system.com',
            'password'            => md5('master@123'),
            'phone'               => '0000000000',
            'website_url'         => 'http://system-master-lab.com',
            'gst_number'          => 'N/A',
            'address'             => 'System Master Laboratory',
            'city'                => 'System City',
            'state'               => 'System State',
            'status'              => 1,
            'isdelete'            => 0,
            'created_by'          => 'system',
            'created_at'          => date('Y-m-d H:i:s')
        ];
        
        $this->db->insert('lb_laboratorys', $labData);
        return $this->db->insert_id();
    }

    public function insertMasterLabTestFull($data) {
        $this->db->trans_start();

        // 1. Insert Test
        $testData = $data['test'];
        
        // Ensure valid lab_id for Master Tests
        if (empty($testData['lab_id'])) {
            $testData['lab_id'] = $this->_get_or_create_master_lab_id();
        }

        $this->db->insert('lb_master_lab_tests', $testData);
        $testId = $this->db->insert_id();

        // 2. Insert Advanced
        if (isset($data['advanced'])) {
            $advancedData = $data['advanced'];
            $advancedData['test_id'] = $testId;
            $this->db->insert('lb_master_lab_test_advanced', $advancedData);
        }

        // 3. Insert Parameters
        if (isset($data['parameters']) && is_array($data['parameters'])) {
            foreach ($data['parameters'] as $param) {
                $paramData = $param['basic'];
                $paramData['test_id'] = $testId;
                $this->db->insert('lb_master_lab_test_parameters', $paramData);
                $paramId = $this->db->insert_id();

                // Critical Values
                if (isset($param['critical'])) {
                    $criticalData = $param['critical'];
                    $criticalData['parameter_id'] = $paramId;
                    $this->db->insert('lb_master_lab_test_critical_values', $criticalData);
                }

                // Reference Ranges
                if (isset($param['ranges']) && is_array($param['ranges'])) {
                    foreach ($param['ranges'] as $range) {
                        $range['parameter_id'] = $paramId;
                        $this->db->insert('lb_master_lab_test_reference_ranges', $range);
                    }
                }
            }
        }

        $this->db->trans_complete();
        return $this->db->trans_status() ? $testId : false;
    }

    public function updateMasterLabTestFull($id, $data) {
        $this->db->trans_start();

        // 1. Update Test
        if (isset($data['test'])) {
            // Ensure valid lab_id for Master Tests
            if (array_key_exists('lab_id', $data['test']) && empty($data['test']['lab_id'])) {
                $data['test']['lab_id'] = $this->_get_or_create_master_lab_id();
            }

            $this->db->where('id', $id);
            $this->db->update('lb_master_lab_tests', $data['test']);
        }

        // 2. Update Advanced
        if (isset($data['advanced'])) {
            // Check if exists
            $this->db->where('test_id', $id);
            $exists = $this->db->count_all_results('lb_master_lab_test_advanced');
            
            if ($exists) {
                $this->db->where('test_id', $id);
                $this->db->update('lb_master_lab_test_advanced', $data['advanced']);
            } else {
                $data['advanced']['test_id'] = $id;
                $this->db->insert('lb_master_lab_test_advanced', $data['advanced']);
            }
        }

        // 3. Update Parameters (Strategy: Soft delete all existing parameters for this test and re-insert? 
        // Or update existing ones?
        // Re-inserting is cleaner for structure changes but ID continuity might be lost.
        // Given the complexity, let's try to match by ID if provided, else insert.
        
        // For simplicity in this iteration, and to handle removed parameters correctly:
        // Soft delete all parameters first (or hard delete if preferred, but schema has isdelete).
        // If we soft delete, we can't reuse them easily unless we track IDs carefully.
        // Let's go with: Mark all existing parameters as deleted, then update/insert.
        
        // However, to keep it simple and robust for a "Master" editor:
        // We will receive a list of parameters.
        // 1. Get existing parameter IDs.
        // 2. Loop through incoming parameters.
        //    - If has ID, update it and remove from "existing" list.
        //    - If no ID, insert new.
        // 3. Any remaining IDs in "existing" list -> mark as deleted.

        if (isset($data['parameters']) && is_array($data['parameters'])) {
            // Get existing active parameters
            $this->db->select('id');
            $this->db->where('test_id', $id);
            $this->db->where('isdelete', 0);
            $existingParams = $this->db->get('lb_master_lab_test_parameters')->result_array();
            $existingIds = array_column($existingParams, 'id');
            $updatedIds = [];

            foreach ($data['parameters'] as $param) {
                $paramId = isset($param['basic']['id']) ? $param['basic']['id'] : null;
                
                if ($paramId && in_array($paramId, $existingIds)) {
                    // Update Parameter
                    $this->db->where('id', $paramId);
                    $this->db->update('lb_master_lab_test_parameters', $param['basic']);
                    $updatedIds[] = $paramId;

                    // Update Critical Values (Delete old, insert new for simplicity, or update)
                    $this->db->delete('lb_master_lab_test_critical_values', ['parameter_id' => $paramId]);
                    if (isset($param['critical'])) {
                        $criticalData = $param['critical'];
                        $criticalData['parameter_id'] = $paramId;
                        $this->db->insert('lb_master_lab_test_critical_values', $criticalData);
                    }

                    // Update Reference Ranges (Delete old, insert new)
                    $this->db->delete('lb_master_lab_test_reference_ranges', ['parameter_id' => $paramId]);
                    if (isset($param['ranges']) && is_array($param['ranges'])) {
                        foreach ($param['ranges'] as $range) {
                            $range['parameter_id'] = $paramId;
                            $this->db->insert('lb_master_lab_test_reference_ranges', $range);
                        }
                    }

                } else {
                    // Insert New Parameter
                    $paramData = $param['basic'];
                    $paramData['test_id'] = $id;
                    $this->db->insert('lb_master_lab_test_parameters', $paramData);
                    $newParamId = $this->db->insert_id();

                    // Critical Values
                    if (isset($param['critical'])) {
                        $criticalData = $param['critical'];
                        $criticalData['parameter_id'] = $newParamId;
                        $this->db->insert('lb_master_lab_test_critical_values', $criticalData);
                    }

                    // Reference Ranges
                    if (isset($param['ranges']) && is_array($param['ranges'])) {
                        foreach ($param['ranges'] as $range) {
                            $range['parameter_id'] = $newParamId;
                            $this->db->insert('lb_master_lab_test_reference_ranges', $range);
                        }
                    }
                }
            }

            // Soft delete removed parameters
            $toDelete = array_diff($existingIds, $updatedIds);
            if (!empty($toDelete)) {
                $this->db->where_in('id', $toDelete);
                $this->db->update('lb_master_lab_test_parameters', ['isdelete' => 1]);
            }
        }

        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function deleteMasterLabTest($id) {
        $this->db->where('id', $id);
        return $this->db->update('lb_master_lab_tests', ['isdelete' => 1]);
    }


    public function updateLaboratoryStaffStatus($staffuid, $status) {
        $this->db->where('staff_uid', $staffuid);
        return $this->db->update('lb_laboratory_staff', ['status' => $status]);
    }

    public function getActiveLaboratories() {
        $this->db->select('labuid, name');
        $this->db->from('lb_laboratorys');
        $this->db->where('status', 1);
        $this->db->where('isdelete', 0);
        $this->db->order_by('name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
	
    public function get_doctor_specializationsList() {
        $this->db->select('mds.id, mds.specialization_name as name, mds.description');
        $this->db->from('ms_doctor_specializations as mds');
        $query = $this->db->get();
        return $query->result_array();
    }




}
