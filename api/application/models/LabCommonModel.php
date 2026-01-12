<?php

class LabCommonModel extends CI_Model{


	public function get_labTestCount($search = '', $department = 'all', $status = 'all', $labid = '') {
        $this->db->from('lb_lab_tests');
        $this->db->where('isdelete', 0);
        $this->db->where('lab_id', $labid);

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

    public function get_labTestList($search = '', $limit = 10, $offset = 0, $department = 'all', $status = 'all', $labid = '') {
        $this->db->select('*');
        $this->db->from('lb_lab_tests');
        $this->db->where('isdelete', 0);
        $this->db->where('lab_id', $labid);

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


    public function getLabTestInfoById($id) {
        // Basic Info
        $this->db->where('id', $id);
        $test = $this->db->get('lb_lab_tests')->row_array();
        if (!$test) return null;

        // Advanced Info
        $this->db->where('lab_test_id', $id);
        $advanced = $this->db->get('lb_lab_test_advanced')->row_array();
        
        // Parameters
        $this->db->where('lab_test_id', $id);
        $this->db->where('isdelete', 0);
        $this->db->order_by('display_order', 'ASC');
        $parameters = $this->db->get('lb_lab_test_parameters')->result_array();

        foreach ($parameters as &$param) {
            // Critical Values
            $this->db->where('lab_parameter_id', $param['id']);
            $critical = $this->db->get('lb_lab_test_critical_values')->row_array();
            $param['critical_values'] = $critical;

            // Reference Ranges
            $this->db->where('lab_parameter_id', $param['id']);
            $ranges = $this->db->get('lb_lab_test_reference_ranges')->result_array();
            $param['reference_ranges'] = $ranges;
        }

        return [
            'test' => $test,
            'advanced' => $advanced,
            'parameters' => $parameters
        ];
    }

    public function getLabTestsInfoByIds($ids) {
        $results = [];
        foreach ($ids as $tid) {
            $info = $this->getLabTestInfoById($tid);
            if ($info !== null) {
                $results[] = $info;
            }
        }
        return $results;
    }


    public function insertLabTestFull($data, $labid) {
        $this->db->trans_start();

        // 1. Insert Test
        $testData = $data['test'];
        
        $testData['lab_id'] = $labid;
        

        $this->db->insert('lb_lab_tests', $testData);
        $testId = $this->db->insert_id();

        // 2. Insert Advanced
        if (isset($data['advanced'])) {
            $advancedData = $data['advanced'];
            $advancedData['lab_test_id'] = $testId;
            $this->db->insert('lb_lab_test_advanced', $advancedData);
        }

        // 3. Insert Parameters
        if (isset($data['parameters']) && is_array($data['parameters'])) {
            foreach ($data['parameters'] as $param) {
                $paramData = $param['basic'];
                $paramData['lab_test_id'] = $testId;
                $this->db->insert('lb_lab_test_parameters', $paramData);
                $paramId = $this->db->insert_id();

                // Critical Values
                if (isset($param['critical'])) {
                    $criticalData = $param['critical'];
                    $criticalData['lab_parameter_id'] = $paramId;
                    $this->db->insert('lb_lab_test_critical_values', $criticalData);
                }

                // Reference Ranges
                if (isset($param['ranges']) && is_array($param['ranges'])) {
                    foreach ($param['ranges'] as $range) {
                        $range['lab_parameter_id'] = $paramId;
                        $this->db->insert('lb_lab_test_reference_ranges', $range);
                    }
                }
            }
        }

        $this->db->trans_complete();
        return $this->db->trans_status() ? $testId : false;
    }

    public function updateLabTestFull($id, $data, $labid) {
        $this->db->trans_start();

        // 1. Update Test
        if (isset($data['test'])) {
            
            $data['test']['lab_id'] = $labid;

            $this->db->where('id', $id);
            $this->db->update('lb_lab_tests', $data['test']);
        }

        // 2. Update Advanced
        if (isset($data['advanced'])) {
            // Check if exists
            $this->db->where('lab_test_id', $id);
            $exists = $this->db->count_all_results('lb_lab_test_advanced');
            
            if ($exists) {
                $this->db->where('lab_test_id', $id);
                $this->db->update('lb_lab_test_advanced', $data['advanced']);
            } else {
                $data['advanced']['lab_test_id'] = $id;
                $this->db->insert('lb_lab_test_advanced', $data['advanced']);
            }
        }

        if (isset($data['parameters']) && is_array($data['parameters'])) {
            // Get existing active parameters
            $this->db->select('id');
            $this->db->where('lab_test_id', $id);
            $this->db->where('isdelete', 0);
            $existingParams = $this->db->get('lb_lab_test_parameters')->result_array();
            $existingIds = array_column($existingParams, 'id');
            $updatedIds = [];

            foreach ($data['parameters'] as $param) {
                $paramId = isset($param['basic']['id']) ? $param['basic']['id'] : null;
                
                if ($paramId && in_array($paramId, $existingIds)) {
                    // Update Parameter
                    $this->db->where('id', $paramId);
                    $this->db->update('lb_lab_test_parameters', $param['basic']);
                    $updatedIds[] = $paramId;

                    // Update Critical Values (Delete old, insert new for simplicity, or update)
                    $this->db->delete('lb_lab_test_critical_values', ['lab_parameter_id' => $paramId]);
                    if (isset($param['critical'])) {
                        $criticalData = $param['critical'];
                        $criticalData['lab_parameter_id'] = $paramId;
                        $this->db->insert('lb_lab_test_critical_values', $criticalData);
                    }

                    // Update Reference Ranges (Delete old, insert new)
                    $this->db->delete('lb_lab_test_reference_ranges', ['lab_parameter_id' => $paramId]);
                    if (isset($param['ranges']) && is_array($param['ranges'])) {
                        foreach ($param['ranges'] as $range) {
                            $range['lab_parameter_id'] = $paramId;
                            $this->db->insert('lb_lab_test_reference_ranges', $range);
                        }
                    }

                } else {
                    // Insert New Parameter
                    $paramData = $param['basic'];
                    $paramData['lab_test_id'] = $id;
                    $this->db->insert('lb_lab_test_parameters', $paramData);
                    $newParamId = $this->db->insert_id();

                    // Critical Values
                    if (isset($param['critical'])) {
                        $criticalData = $param['critical'];
                        $criticalData['lab_parameter_id'] = $newParamId;
                        $this->db->insert('lb_lab_test_critical_values', $criticalData);
                    }

                    // Reference Ranges
                    if (isset($param['ranges']) && is_array($param['ranges'])) {
                        foreach ($param['ranges'] as $range) {
                            $range['lab_parameter_id'] = $newParamId;
                            $this->db->insert('lb_lab_test_reference_ranges', $range);
                        }
                    }
                }
            }

            // Soft delete removed parameters
            $toDelete = array_diff($existingIds, $updatedIds);
            if (!empty($toDelete)) {
                $this->db->where_in('id', $toDelete);
                $this->db->update('lb_lab_test_parameters', ['isdelete' => 1]);
            }
        }

        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function deleteLabTestInfo($id, $labid) {
        $this->db->where('id', $id);
        $this->db->where('lab_id', $labid);
        return $this->db->update('lb_lab_tests', ['isdelete' => 1]);
    }

    public function get_master_catalog_list($search = '', $department = 'all', $labid = null) {
        $this->db->select('t.*, (SELECT COUNT(*) FROM lb_master_lab_test_parameters p WHERE p.test_id = t.id AND p.isdelete = 0) as parameter_count');
        $this->db->from('lb_master_lab_tests t');
        
        if ($labid) {
            // Filter out tests already cloned by this lab
            $this->db->join('lb_lab_tests l', 'l.test_id = t.id AND l.lab_id = ' . $this->db->escape($labid) . ' AND l.isdelete = 0', 'left');
            $this->db->where('l.id IS NULL');
        }

        $this->db->where('t.isdelete', 0);
        $this->db->where('t.status', 1);

        if ($department !== 'all' && !empty($department)) {
            $this->db->where('t.department', $department);
        }

        if (!empty($search)) {
            $this->db->group_start();
            $this->db->like('t.test_name', $search);
            $this->db->or_like('t.test_code', $search);
            $this->db->or_like('t.department', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('t.test_name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    public function clone_master_tests($master_test_ids, $labid) {
        $this->db->trans_start();
        $cloned_count = 0;

        foreach ($master_test_ids as $master_id) {
            // 1. Get Master Test Info
            $this->db->where('id', $master_id);
            $masterTest = $this->db->get('lb_master_lab_tests')->row_array();

            if (!$masterTest) continue;

            // 2. Prepare Lab Test Data
            // We select only columns that exist in target table to avoid errors, 
            // but for now we assume schema compatibility for common fields.
            // Explicitly mapping known common fields is safer.
            $labTestData = [
                'lab_id' => $labid,
                'test_id' => $master_id,
                'test_name' => $masterTest['test_name'],
                'test_code' => $masterTest['test_code'],
                'department' => $masterTest['department'],
                'sample_type' => $masterTest['sample_type'] ?? '',
                'method' => $masterTest['method'] ?? '',
                //'processing_days' => $masterTest['processing_days'] ?? 0,
                'price' => $masterTest['amount'] ?? 0,
                'status' => 1, // Active by default
                //'description' => $masterTest['description'] ?? '',
                'created_at' => date('Y-m-d H:i:s')
            ];

            $this->db->insert('lb_lab_tests', $labTestData);
            $newTestId = $this->db->insert_id();

            // 3. Clone Advanced Info
            $this->db->where('test_id', $master_id);
            $masterAdvanced = $this->db->get('lb_master_lab_test_advanced')->row_array();

            if ($masterAdvanced) {
                unset($masterAdvanced['id']);
                unset($masterAdvanced['test_id']);
                
                $labAdvancedData = $masterAdvanced;
                $labAdvancedData['lab_test_id'] = $newTestId;
                
                $this->db->insert('lb_lab_test_advanced', $labAdvancedData);
            }

            // 4. Clone Parameters
            $this->db->where('test_id', $master_id);
            $this->db->where('isdelete', 0);
            $masterParams = $this->db->get('lb_master_lab_test_parameters')->result_array();

            foreach ($masterParams as $mParam) {
                $mParamId = $mParam['id'];
                unset($mParam['id']);
                unset($mParam['test_id']);

                $labParamData = $mParam;
                $labParamData['lab_test_id'] = $newTestId;
                
                $this->db->insert('lb_lab_test_parameters', $labParamData);
                $newParamId = $this->db->insert_id();

                // 5. Clone Critical Values
                $this->db->where('parameter_id', $mParamId);
                $masterCritical = $this->db->get('lb_master_lab_test_critical_values')->row_array();

                if ($masterCritical) {
                    unset($masterCritical['id']);
                    unset($masterCritical['parameter_id']);
                    
                    $labCriticalData = $masterCritical;
                    $labCriticalData['lab_parameter_id'] = $newParamId;
                    
                    $this->db->insert('lb_lab_test_critical_values', $labCriticalData);
                }

                // 6. Clone Reference Ranges
                $this->db->where('parameter_id', $mParamId);
                $masterRanges = $this->db->get('lb_master_lab_test_reference_ranges')->result_array();

                foreach ($masterRanges as $mRange) {
                    unset($mRange['id']);
                    unset($mRange['parameter_id']);
                    
                    $labRangeData = $mRange;
                    $labRangeData['lab_parameter_id'] = $newParamId;
                    
                    $this->db->insert('lb_lab_test_reference_ranges', $labRangeData);
                }
            }
            $cloned_count++;
        }

        $this->db->trans_complete();
        return $this->db->trans_status() ? $cloned_count : false;
    }

    public function get_recent_orders_by_lab($labid, $limit = 5) {
        // Query from lb_lab_orders as the master table
        $this->db->select('lo.id as order_id, lo.treatment_id, lo.appointment_id, lo.status as order_status, lo.created_at, lo.order_number, mp.fname, mp.lname, mp.gender, mp.dob, mp.email, mp.phone');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        $this->db->order_by('lo.id', 'DESC');
        
        if ($limit > 0) {
            $this->db->limit($limit);
        }
        $query = $this->db->get();
        $orders = $query->result_array();

        if (!empty($orders)) {
            foreach ($orders as &$order) {
                // Fetch tests linked to this specific lab order
                // Updated: lpt.treatment_test_id is now lb_lab_tests.id
                $this->db->select('lt.id, lt.test_name as testName, lpt.status, mtlt.urgency, lt.sample_type, lt.method, lt.tat, lt.id as lab_test_id, lt.test_code');
                $this->db->from('lb_patient_test_tracking lpt');
                $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id', 'left');
                // Join original doctor request to get urgency (matching by treatment_id and name)
                $this->db->join('ms_patient_treatment_lab_tests mtlt', 'mtlt.treatment_id = lpt.treatment_id AND mtlt.test_name = lt.test_name', 'left');
                $this->db->where('lpt.lab_order_id', $order['order_id']);
                $order['tests'] = $this->db->get()->result_array();
                
                // Fallback: If no tests linked via lab_order_id (legacy data), try linking via treatment_id
                if (empty($order['tests'])) {
                     $this->db->select('t.id, t.test_name as testName, COALESCE(lpt.status, t.status) as status, t.urgency, lt.sample_type, lt.method, lt.tat, lt.id as lab_test_id');
                     $this->db->from('ms_patient_treatment_lab_tests t');
                     $this->db->join('lb_patient_test_tracking lpt', 'lpt.treatment_test_id = t.id', 'left');
                     $this->db->join('lb_lab_tests lt', 'lt.test_name = t.test_name AND lt.lab_id = ' . $this->db->escape($labid) . ' AND lt.isdelete = 0', 'left');
                     $this->db->where('t.treatment_id', $order['treatment_id']);
                     $order['tests'] = $this->db->get()->result_array();
                }
            }
        }
        
        return $orders;
    }

    public function get_orders_by_status($labid, $statuses) {
        $this->db->select('lo.id as order_id, lo.treatment_id, lo.appointment_id, lo.status as order_status, lo.created_at, lo.order_number, mp.fname, mp.lname, mp.gender, mp.dob, mp.email, mp.phone, lo.order_comment');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        
        if (is_array($statuses) && !empty($statuses)) {
             $this->db->where_in('lo.status', $statuses);
        } else if (!empty($statuses)) {
             $this->db->where('lo.status', $statuses);
        }

        $this->db->order_by('lo.updated_at', 'DESC');
        
        $query = $this->db->get();
        $orders = $query->result_array();

        if (!empty($orders)) {
            foreach ($orders as &$order) {
                // Fetch tests linked to this specific lab order
                $this->db->select('lt.id, lt.test_name as testName, lpt.status, mtlt.urgency, lt.sample_type, lt.method, lt.tat, lt.id as lab_test_id, lt.test_code');
                $this->db->from('lb_patient_test_tracking lpt');
                $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id', 'left');
                $this->db->join('ms_patient_treatment_lab_tests mtlt', 'mtlt.treatment_id = lpt.treatment_id AND mtlt.test_name = lt.test_name', 'left');
                $this->db->where('lpt.lab_order_id', $order['order_id']);
                $order['tests'] = $this->db->get()->result_array();

                // Fallback
                if (empty($order['tests'])) {
                     $this->db->select('t.id, t.test_name as testName, COALESCE(lpt.status, t.status) as status, t.urgency, lt.sample_type, lt.method, lt.tat, lt.id as lab_test_id');
                     $this->db->from('ms_patient_treatment_lab_tests t');
                     $this->db->join('lb_patient_test_tracking lpt', 'lpt.treatment_test_id = t.id', 'left');
                     $this->db->join('lb_lab_tests lt', 'lt.test_name = t.test_name AND lt.lab_id = ' . $this->db->escape($labid) . ' AND lt.isdelete = 0', 'left');
                     $this->db->where('t.treatment_id', $order['treatment_id']);
                     $order['tests'] = $this->db->get()->result_array();
                }
            }
        }
        
        return $orders;
    }

    public function get_dashboard_stats($labid) {
        // Today's Orders
        $today = date('Y-m-d');
        $this->db->where('lab_id', $labid);
        $this->db->like('created_at', $today);
        $todayOrders = $this->db->count_all_results('lb_lab_orders');

        // Yesterday's Orders (for trend)
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $this->db->where('lab_id', $labid);
        $this->db->like('created_at', $yesterday);
        $yesterdayOrders = $this->db->count_all_results('lb_lab_orders');

        // Pending Samples 
        // Statuses that imply pending action before processing
        $this->db->where('lab_id', $labid);
        $this->db->where_in('status', ['Registered', 'Sample Collected']);
        $pendingSamples = $this->db->count_all_results('lb_lab_orders');

        // Processing Tests
        $this->db->where('lab_id', $labid);
        $this->db->where_in('status', ['Sample Received', 'Processing', 'Analyzed', 'Validation Pending']);
        $processingTests = $this->db->count_all_results('lb_lab_orders');

        // Completed/Dispatched
        $this->db->where('lab_id', $labid);
        $this->db->where_in('status', ['Result Entered', 'Results Entered', 'Validated', 'Report Generated', 'Dispatched']);
        $completedOrders = $this->db->count_all_results('lb_lab_orders');

        // Critical Alerts (Placeholder logic - requires actual critical value tracking)
        // For now, returning 0 or a dummy count based on a flag if it existed
        $criticalAlerts = 0; 

        return [
            'todayOrders' => $todayOrders,
            'yesterdayOrders' => $yesterdayOrders,
            'pendingSamples' => $pendingSamples,
            'processingTests' => $processingTests,
            'completedOrders' => $completedOrders,
            'criticalAlerts' => $criticalAlerts
        ];
    }

    public function get_unseen_queue_notifications($labid) {
        $this->db->select('lo.id, lo.order_number, lo.created_at, lo.status, mp.fname, mp.lname');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        $this->db->where('lo.is_queue_seen', 0);
        $this->db->where_in('lo.status', ['Registered', 'Collected', 'Sample Collected']);
        $this->db->order_by('lo.created_at', 'DESC');
        return $this->db->get()->result_array();
    }

    public function mark_queue_seen($ids) {
        if (empty($ids)) return false;
        $this->db->where_in('id', $ids);
        return $this->db->update('lb_lab_orders', ['is_queue_seen' => 1]);
    }

    public function get_processing_queue($labid) {
        // Query from lb_lab_orders where status is 'Collected' or other processing statuses
        $this->db->select('lo.id as order_id, lo.treatment_id, lo.appointment_id, lo.status as order_status, lo.created_at, lo.order_number, mp.fname, mp.lname, mp.gender, mp.dob, mp.email, mp.phone');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        // Include all statuses that should appear in the processing queue
        $this->db->where_in('lo.status', ['Collected', 'Sample Collected', 'Received in Lab', 'Sample Received', 'Processing', 'Analyzed']);
        $this->db->order_by('lo.updated_at', 'ASC'); 
        
        $query = $this->db->get();
        $orders = $query->result_array();

        $this->db->select('id, test_name, sample_type, method, tat, test_code');
        $this->db->from('lb_lab_tests');
        $this->db->where('lab_id', $labid);
        $this->db->where('isdelete', 0);
        $labTests = $this->db->get()->result_array();
        $labTestIndex = array();
        foreach ($labTests as $lt) {
            $name = strtolower($lt['test_name']);
            $name = preg_replace('/\\(.*?\\)/', '', $name);
            $name = preg_replace('/[^a-z0-9\\s]/', '', $name);
            $name = preg_replace('/\\s+/', ' ', $name);
            $name = trim($name);
            if ($name !== '') {
                $labTestIndex[$name] = $lt;
            }
        }

        if (!empty($orders)) {
            foreach ($orders as &$order) {
                // Fetch tests linked to this specific lab order
                $this->db->select('lt.id, lt.test_name as testName, lpt.status, mtlt.urgency, lt.id as lab_test_id, lt.sample_type, lt.method, lt.tat, lt.test_code');
                $this->db->from('lb_patient_test_tracking lpt');
                $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id', 'left');
                $this->db->join('ms_patient_treatment_lab_tests mtlt', 'mtlt.treatment_id = lpt.treatment_id AND mtlt.test_name = lt.test_name', 'left');
                $this->db->where('lpt.lab_order_id', $order['order_id']);
                $order['tests'] = $this->db->get()->result_array();
                if (!empty($order['tests'])) {
                    foreach ($order['tests'] as &$t) {
                        if (empty($t['lab_test_id'])) {
                            $nm = strtolower($t['testName']);
                            $nm = preg_replace('/\\(.*?\\)/', '', $nm);
                            $nm = preg_replace('/[^a-z0-9\\s]/', '', $nm);
                            $nm = preg_replace('/\\s+/', ' ', $nm);
                            $nm = trim($nm);
                            if ($nm !== '' && isset($labTestIndex[$nm])) {
                                $mt = $labTestIndex[$nm];
                                $t['lab_test_id'] = $mt['id'];
                                if (empty($t['sample_type'])) { $t['sample_type'] = $mt['sample_type']; }
                                if (empty($t['method'])) { $t['method'] = $mt['method']; }
                                if (empty($t['tat'])) { $t['tat'] = $mt['tat']; }
                                if (empty($t['test_code'])) { $t['test_code'] = $mt['test_code']; }
                            }
                        }
                    }
                }
                
                // Fallback (same as get_recent_orders_by_lab)
                if (empty($order['tests'])) {
                     $this->db->select('t.id, t.test_name as testName, COALESCE(lpt.status, t.status) as status, t.urgency, lt.id as lab_test_id, lt.sample_type, lt.method, lt.tat, lt.test_code');
                     $this->db->from('ms_patient_treatment_lab_tests t');
                     $this->db->join('lb_patient_test_tracking lpt', 'lpt.treatment_test_id = t.id', 'left');
                     $this->db->join('lb_lab_tests lt', 'LOWER(lt.test_name) = LOWER(t.test_name) AND lt.lab_id = ' . $this->db->escape($labid) . ' AND lt.isdelete = 0', 'left');
                     $this->db->where('t.treatment_id', $order['treatment_id']);
                     $order['tests'] = $this->db->get()->result_array();
                     if (!empty($order['tests'])) {
                         foreach ($order['tests'] as &$t) {
                             if (empty($t['lab_test_id'])) {
                                 $nm = strtolower($t['testName']);
                                 $nm = preg_replace('/\\(.*?\\)/', '', $nm);
                                 $nm = preg_replace('/[^a-z0-9\\s]/', '', $nm);
                                 $nm = preg_replace('/\\s+/', ' ', $nm);
                                 $nm = trim($nm);
                                 if ($nm !== '' && isset($labTestIndex[$nm])) {
                                     $mt = $labTestIndex[$nm];
                                     $t['lab_test_id'] = $mt['id'];
                                     if (empty($t['sample_type'])) { $t['sample_type'] = $mt['sample_type']; }
                                     if (empty($t['method'])) { $t['method'] = $mt['method']; }
                                     if (empty($t['tat'])) { $t['tat'] = $mt['tat']; }
                                     if (empty($t['test_code'])) { $t['test_code'] = $mt['test_code']; }
                                 }
                             }
                         }
                     }
                }
            }
        }
        
        return $orders;
    }

    public function get_validation_queue($labid) {
        $this->db->select('lo.id as order_id, lo.treatment_id, lo.appointment_id, lo.status as order_status, lo.created_at, lo.order_number, mp.fname, mp.lname, mp.gender, mp.dob, mp.email, mp.phone');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        $this->db->where('lo.status', 'Validation Pending');
        $this->db->order_by('lo.updated_at', 'ASC');
        $query = $this->db->get();
        $orders = $query->result_array();

        $this->db->select('id, test_name, sample_type, method, tat, test_code');
        $this->db->from('lb_lab_tests');
        $this->db->where('lab_id', $labid);
        $this->db->where('isdelete', 0);
        $labTests = $this->db->get()->result_array();
        $labTestIndex = array();
        foreach ($labTests as $lt) {
            $name = strtolower($lt['test_name']);
            $name = preg_replace('/\\(.*?\\)/', '', $name);
            $name = preg_replace('/[^a-z0-9\\s]/', '', $name);
            $name = preg_replace('/\\s+/', ' ', $name);
            $name = trim($name);
            if ($name !== '') {
                $labTestIndex[$name] = $lt;
            }
        }

        if (!empty($orders)) {
            foreach ($orders as &$order) {
                $this->db->select('lt.id, lt.test_name as testName, lpt.status, mtlt.urgency, lt.id as lab_test_id, lt.sample_type, lt.method, lt.tat, lt.test_code');
                $this->db->from('lb_patient_test_tracking lpt');
                $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id', 'left');
                $this->db->join('ms_patient_treatment_lab_tests mtlt', 'mtlt.treatment_id = lpt.treatment_id AND mtlt.test_name = lt.test_name', 'left');
                $this->db->where('lpt.lab_order_id', $order['order_id']);
                $order['tests'] = $this->db->get()->result_array();
                if (!empty($order['tests'])) {
                    foreach ($order['tests'] as &$t) {
                        if (empty($t['lab_test_id'])) {
                            $nm = strtolower($t['testName']);
                            $nm = preg_replace('/\\(.*?\\)/', '', $nm);
                            $nm = preg_replace('/[^a-z0-9\\s]/', '', $nm);
                            $nm = preg_replace('/\\s+/', ' ', $nm);
                            $nm = trim($nm);
                            if ($nm !== '' && isset($labTestIndex[$nm])) {
                                $mt = $labTestIndex[$nm];
                                $t['lab_test_id'] = $mt['id'];
                                if (empty($t['sample_type'])) { $t['sample_type'] = $mt['sample_type']; }
                                if (empty($t['method'])) { $t['method'] = $mt['method']; }
                                if (empty($t['tat'])) { $t['tat'] = $mt['tat']; }
                                if (empty($t['test_code'])) { $t['test_code'] = $mt['test_code']; }
                            }
                        }
                    }
                }
            }
        }
        return $orders;
    }

    public function get_completed_reports($labid) {
        $this->db->select('lo.id as order_id, lo.treatment_id, lo.appointment_id, lo.status as order_status, lo.created_at, lo.order_number, mp.fname, mp.lname, mp.gender, mp.dob, mp.email, mp.phone, doc.name as doc_name');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->join('ms_doctors doc', 'doc.id = mt.doctor_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        $this->db->where('lo.status', 'Report Generated');
        $this->db->order_by('lo.updated_at', 'DESC');
        $query = $this->db->get();
        $orders = $query->result_array();

        $this->db->select('id, test_name, sample_type, method, tat, test_code');
        $this->db->from('lb_lab_tests');
        $this->db->where('lab_id', $labid);
        $this->db->where('isdelete', 0);
        $labTests = $this->db->get()->result_array();
        $labTestIndex = array();
        foreach ($labTests as $lt) {
            $name = strtolower($lt['test_name']);
            $name = preg_replace('/\\(.*?\\)/', '', $name);
            $name = preg_replace('/[^a-z0-9\\s]/', '', $name);
            $name = preg_replace('/\\s+/', ' ', $name);
            $name = trim($name);
            if ($name !== '') {
                $labTestIndex[$name] = $lt;
            }
        }

        if (!empty($orders)) {
            foreach ($orders as &$order) {
                $this->db->select('lt.id, lt.test_name as testName, lpt.status, mtlt.urgency, lt.id as lab_test_id, lt.sample_type, lt.method, lt.tat, lt.test_code');
                $this->db->from('lb_patient_test_tracking lpt');
                $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id', 'left');
                $this->db->join('ms_patient_treatment_lab_tests mtlt', 'mtlt.treatment_id = lpt.treatment_id AND mtlt.test_name = lt.test_name', 'left');
                $this->db->where('lpt.lab_order_id', $order['order_id']);
                $order['tests'] = $this->db->get()->result_array();
                if (!empty($order['tests'])) {
                    foreach ($order['tests'] as &$t) {
                        if (empty($t['lab_test_id'])) {
                            $nm = strtolower($t['testName']);
                            $nm = preg_replace('/\\(.*?\\)/', '', $nm);
                            $nm = preg_replace('/[^a-z0-9\\s]/', '', $nm);
                            $nm = preg_replace('/\\s+/', ' ', $nm);
                            $nm = trim($nm);
                            if ($nm !== '' && isset($labTestIndex[$nm])) {
                                $mt = $labTestIndex[$nm];
                                $t['lab_test_id'] = $mt['id'];
                                if (empty($t['sample_type'])) { $t['sample_type'] = $mt['sample_type']; }
                                if (empty($t['method'])) { $t['method'] = $mt['method']; }
                                if (empty($t['tat'])) { $t['tat'] = $mt['tat']; }
                                if (empty($t['test_code'])) { $t['test_code'] = $mt['test_code']; }
                            }
                        }
                    }
                }
            }
        }
        return $orders;
    }

    public function get_report_details($order_id, $labid) {
        // 1. Get Order Info
        $this->db->select('lo.id as order_id, lo.order_number, lo.status as order_status, lo.created_at, lo.updated_at, lo.treatment_id, 
                           mp.id as patient_id, mp.fname, mp.lname, mp.gender, mp.dob, mp.email, mp.phone, 
                           doc.name as doc_name');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->join('ms_doctors doc', 'doc.id = mt.doctor_id', 'left');
        $this->db->where('lo.id', $order_id);
        $this->db->where('lo.lab_id', $labid);
        $order = $this->db->get()->row_array();
    
        if (!$order) return null;
    
        // 2. Get Tests
        $this->db->select('lt.id, lt.test_name as testName, lpt.status, lt.id as lab_test_id');
        $this->db->from('lb_patient_test_tracking lpt');
        $this->db->join('lb_lab_tests lt', 'lt.id = lpt.treatment_test_id', 'left');
        $this->db->where('lpt.lab_order_id', $order_id);
        $tests = $this->db->get()->result_array();
    
        // 3. For each test, get parameters and results
        foreach ($tests as &$test) {
            if ($test['lab_test_id']) {
                // Get Parameters
                $this->db->select('p.id as parameter_id, p.parameter_name as parameterName, p.unit');
                $this->db->from('lb_lab_test_parameters p');
                $this->db->where('p.lab_test_id', $test['lab_test_id']);
                $this->db->where('p.isdelete', 0);
                $this->db->order_by('p.display_order', 'ASC');
                $parameters = $this->db->get()->result_array();
    
                // Get Results (from drafts)
                $this->db->select('parameter_id, result_value as value, flag, delta');
                $this->db->from('lb_lab_test_drafts');
                $this->db->where('order_id', $order_id);
                $this->db->where('test_id', $test['id']); // This is treatment_test_id
                $results = $this->db->get()->result_array();
                
                // Map results to parameters
                $resultsMap = [];
                foreach ($results as $res) {
                    $resultsMap[$res['parameter_id']] = $res;
                }
    
                $testResults = [];
                foreach ($parameters as $param) {
                    $res = isset($resultsMap[$param['parameter_id']]) ? $resultsMap[$param['parameter_id']] : null;
                    
                    // Get Reference Range (simple fetch for now)
                    $this->db->select('min_value, max_value');
                    $this->db->from('lb_lab_test_reference_ranges');
                    $this->db->where('lab_parameter_id', $param['parameter_id']);
                    $ranges = $this->db->get()->result_array();
                    $rangeStr = '';
                    if (!empty($ranges)) {
                         $rangeStr = $ranges[0]['min_value'] . ' - ' . $ranges[0]['max_value'];
                    }
    
                    if ($res) {
                        $testResults[] = [
                            'parameterName' => $param['parameterName'],
                            'value' => $res['value'],
                            'unit' => $param['unit'],
                            'referenceRange' => $rangeStr,
                            'flag' => $res['flag']
                        ];
                    }
                }
                $test['results'] = $testResults;
            }
        }
        $order['tests'] = $tests;
        return $order;
    }

    public function insertCollectedSample($data) {
        $this->db->insert('lb_collected_samples', $data);
        return $this->db->insert_id();
    }

    public function updatePatientTestStatus($orderId, $testId, $status) {
        $this->db->where('lab_order_id', $orderId);
        $this->db->where('treatment_test_id', $testId);
        return $this->db->update('lb_patient_test_tracking', ['status' => $status]);
    }

    public function get_collected_samples($orderId, $testId = '', $labid = '') {
        $this->db->from('lb_collected_samples');
        $this->db->where('order_id', $orderId);
        if (!empty($labid)) {
            $this->db->where('lab_id', $labid);
        }
        if (!empty($testId)) {
            $this->db->where('test_id', $testId);
        }
        $this->db->order_by('created_at', 'DESC');
        return $this->db->get()->result_array();
    }

    public function getCollectedSampleByOrderTest($orderId, $testId, $labid) {
        $this->db->from('lb_collected_samples');
        $this->db->where('order_id', $orderId);
        $this->db->where('test_id', $testId);
        $this->db->where('lab_id', $labid);
        $query = $this->db->get();
        return $query->row_array();
    }

    public function updateCollectedSample($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('lb_collected_samples', $data);
    }

    public function updateLabOrderStatus($orderId, $status, $labid, $additional_data = []) {
        $this->db->where('id', $orderId);
        $this->db->where('lab_id', $labid);
        $data = ['status' => $status, 'updated_at' => date('Y-m-d H:i:s')];
        if (!empty($additional_data)) {
            $data = array_merge($data, $additional_data);
        }
        return $this->db->update('lb_lab_orders', $data);
    }

    // --- Draft / Result Entry Methods ---

    public function save_draft_results($drafts) {
        $this->db->trans_start();
        foreach ($drafts as $draft) {
            // Check if exists
            $this->db->where('order_id', $draft['order_id']);
            $this->db->where('test_id', $draft['test_id']);
            $this->db->where('parameter_id', $draft['parameter_id']);
            $query = $this->db->get('lb_lab_test_drafts');

            if ($query->num_rows() > 0) {
                $existing = $query->row_array();
                $this->db->where('id', $existing['id']);
                $draft['updated_at'] = date('Y-m-d H:i:s');
                $this->db->update('lb_lab_test_drafts', $draft);
            } else {
                $draft['created_at'] = date('Y-m-d H:i:s');
                $this->db->insert('lb_lab_test_drafts', $draft);
            }
        }
        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function get_draft_results($orderId, $testId = null) {
        $this->db->select('*');
        $this->db->from('lb_lab_test_drafts');
        $this->db->where('order_id', $orderId);
        if (!empty($testId)) {
            $this->db->where('test_id', $testId);
        }
        $query = $this->db->get();
        return $query->result_array();
    }

    public function get_draft_results_multi($orderId, $testIds = []) {
        $this->db->select('*');
        $this->db->from('lb_lab_test_drafts');
        $this->db->where('order_id', $orderId);
        if (!empty($testIds)) {
            $this->db->where_in('test_id', $testIds);
        }
        $query = $this->db->get();
        return $query->result_array();
    }

    public function submit_for_validation($orderId, $testId) {
        $this->db->trans_start();
        
        // 1. Update status in drafts table
        $this->db->where('order_id', $orderId);
        $this->db->where('test_id', $testId);
        $this->db->update('lb_lab_test_drafts', ['draft_status' => 'submitted', 'updated_at' => date('Y-m-d H:i:s')]);

        // 2. Update tracking status
        // Align with UI: 'Results Entered' indicates ready for validation
        $this->updatePatientTestStatus($orderId, $testId, 'Results Entered');

        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function approve_and_generate_report($orderId, $testIds, $labid, $comments = '') {
        $this->db->trans_start();
        if (!empty($testIds)) {
            foreach ($testIds as $tid) {
                $this->db->where('order_id', $orderId);
                $this->db->where('test_id', $tid);
                $this->db->update('lb_lab_test_drafts', ['draft_status' => 'approved', 'updated_at' => date('Y-m-d H:i:s')]);
                $this->updatePatientTestStatus($orderId, $tid, 'Validated');
            }
        } else {
            $this->db->where('lab_order_id', $orderId);
            $tests = $this->db->get('lb_patient_test_tracking')->result_array();
            foreach ($tests as $t) {
                $this->db->where('order_id', $orderId);
                $this->db->where('test_id', $t['treatment_test_id']);
                $this->db->update('lb_lab_test_drafts', ['draft_status' => 'approved', 'updated_at' => date('Y-m-d H:i:s')]);
                $this->updatePatientTestStatus($orderId, $t['treatment_test_id'], 'Validated');
            }
        }

        if (!empty($comments)) {
            $this->db->where('id', $orderId);
            $this->db->where('lab_id', $labid);
            $this->db->update('lb_lab_orders', ['order_comment' => $comments, 'updated_at' => date('Y-m-d H:i:s')]);
        }

        $this->updateLabOrderStatus($orderId, 'Report Generated', $labid);
        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    public function save_generated_report($data) {
        $this->db->insert('ms_patient_treatment_lab_reports', $data);
        return $this->db->insert_id();
    }

    // --- Unseen Orders Notification Methods ---

    public function get_unseen_orders($labid) {
        $this->db->select('lo.id as order_id, lo.order_number, lo.created_at, mp.fname, mp.lname, mp.id as patient_id');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        $this->db->where('lo.is_seen', 0);
        $this->db->order_by('lo.created_at', 'DESC');
        
        $query = $this->db->get();
        // Log query for debugging
        $logFile = APPPATH . 'logs/lab_notifications.log';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - SQL: " . $this->db->last_query() . "\n", FILE_APPEND);
        
        return $query->result_array();
    }

    public function mark_orders_seen($labid, $orderIds) {
        if (empty($orderIds)) return false;
        $this->db->where('lab_id', $labid);
        $this->db->where_in('id', $orderIds);
        return $this->db->update('lb_lab_orders', ['is_seen' => 1]);
    }

    public function get_unseen_processing_notifications($labid) {
        $this->db->select('lo.id as order_id, lo.order_number, lo.created_at, lo.status, mp.fname, mp.lname, mp.id as patient_id');
        $this->db->from('lb_lab_orders lo');
        $this->db->join('ms_patient_treatment_info mt', 'mt.id = lo.treatment_id', 'left');
        $this->db->join('ms_patient mp', 'mp.id = mt.patient_id', 'left');
        $this->db->where('lo.lab_id', $labid);
        $this->db->where('lo.is_processing_seen', 0);
        $this->db->where('lo.status', 'Validation Pending');
        $this->db->order_by('lo.created_at', 'DESC');
        return $this->db->get()->result_array();
    }

    public function mark_processing_seen($labid, $orderIds) {
        if (empty($orderIds)) return false;
        $this->db->where('lab_id', $labid);
        $this->db->where_in('id', $orderIds);
        return $this->db->update('lb_lab_orders', ['is_processing_seen' => 1]);
    }
}
