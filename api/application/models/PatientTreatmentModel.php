<?php

class PatientTreatmentModel extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function saveTreatment($data) {
        $this->db->trans_start();

        // 1. Upsert Master Record
        $treatment_id = null;
        
        $this->db->where('appointment_id', $data['appointment_id']);
        $q = $this->db->get('ms_patient_treatment_info');
        
        if ($q->num_rows() > 0) {
            $row = $q->row();
            $treatment_id = $row->id;
            $this->db->where('id', $treatment_id);
            $this->db->update('ms_patient_treatment_info', [
                'treatment_status' => $data['treatment_status'],
                'doctor_id' => $data['doctor_id'], // Ensure doctor is updated if changed
                'patient_id' => $data['patient_id'],
                'sugg_lab' => $data['sugg_lab'] ?? null
            ]);
        } else {
            $this->db->insert('ms_patient_treatment_info', [
                'appointment_id' => $data['appointment_id'],
                'patient_id' => $data['patient_id'],
                'doctor_id' => $data['doctor_id'],
                'treatment_status' => $data['treatment_status'],
                'sugg_lab' => $data['sugg_lab'] ?? null
            ]);
            $treatment_id = $this->db->insert_id();
        }

        // 2. Clear existing details (simple strategy: delete all and re-insert)
        // This is easiest for maintaining sync with frontend state without complex diffing
        $this->db->delete('ms_patient_treatment_purpose', ['treatment_id' => $treatment_id]);
        $this->db->delete('ms_patient_treatment_diagnosis', ['treatment_id' => $treatment_id]);
        $this->db->delete('ms_patient_treatment_medications', ['treatment_id' => $treatment_id]);
        // Lab tests are handled via smart update to preserve IDs
        // $this->db->delete('ms_patient_treatment_lab_tests', ['treatment_id' => $treatment_id]);
        // Lab reports are managed independently via upload/delete endpoints to preserve files and IDs
        // $this->db->delete('ms_patient_treatment_lab_reports', ['treatment_id' => $treatment_id]);

        // 3. Insert Purpose
        if (!empty($data['purpose'])) {
            $purposeData = [];
            // Frontend sends array of IDs usually, but let's check format.
            // If it's just IDs, we might need to look up names or just store IDs.
            // The frontend code shows `purposeSelectedIds` as string[]. 
            // We'll store them as item_id. Name/Description might need lookup or be passed.
            // For now, let's assume we store what we get.
            foreach ($data['purpose'] as $item) {
                 // Check if item is object or string
                 if (is_array($item)) {
                     $purposeData[] = [
                         'treatment_id' => $treatment_id,
                         'item_id' => $item['id'] ?? null,
                         'name' => $item['name'] ?? null,
                         'description' => $item['description'] ?? null
                     ];
                 } else {
                     // If it's just a string ID
                     $purposeData[] = [
                         'treatment_id' => $treatment_id,
                         'item_id' => $item,
                         'name' => '', // Lookup needed if we want name, or frontend should send full obj
                         'description' => ''
                     ];
                 }
            }
            if (!empty($purposeData)) $this->db->insert_batch('ms_patient_treatment_purpose', $purposeData);
        }

        // 4. Insert Diagnosis
        if (!empty($data['diagnosis'])) {
            $diagData = [];
            foreach ($data['diagnosis'] as $d) {
                $diagData[] = [
                    'treatment_id' => $treatment_id,
                    'condition_name' => $d['condition'] ?? '',
                    'notes' => $d['notes'] ?? '',
                    'severity' => $d['severity'] ?? '',
                    'icd10' => $d['icd10'] ?? ''
                ];
            }
            if (!empty($diagData)) $this->db->insert_batch('ms_patient_treatment_diagnosis', $diagData);
        }

        // 5. Insert Medications
        if (!empty($data['medications'])) {
            $medData = [];
            foreach ($data['medications'] as $m) {
                $medData[] = [
                    'treatment_id' => $treatment_id,
                    'name' => $m['name'] ?? '',
                    'dosage' => $m['dosage'] ?? '',
                    'frequency' => $m['frequency'] ?? '',
                    'duration' => $m['duration'] ?? '',
                    'instructions' => $m['instructions'] ?? '',
                    'is_auto_suggested' => !empty($m['isAutoSuggested']) ? 1 : 0,
                    'timings' => !empty($m['timings']) ? (is_array($m['timings']) ? json_encode($m['timings']) : $m['timings']) : null
                ];
            }
            if (!empty($medData)) $this->db->insert_batch('ms_patient_treatment_medications', $medData);
        }

        // 6. Smart Update Lab Tests
        // We need to preserve IDs because lab reports might be linked to them.
        $currentLabTests = $this->db->get_where('ms_patient_treatment_lab_tests', ['treatment_id' => $treatment_id])->result_array();
        $existingMap = []; // name -> id
        foreach ($currentLabTests as $row) {
            $existingMap[strtolower(trim($row['test_name']))] = $row['id'];
        }

        $keepIds = [];
        if (!empty($data['lab_tests'])) {
            foreach ($data['lab_tests'] as $l) {
                $nameNorm = strtolower(trim($l['testName'] ?? ''));
                
                // --- Find correct lab_test_id from lb_lab_tests ---
                $labTestId = null;
                $suggLab = $data['sugg_lab'] ?? null;

                // 1. If we have a suggested lab, look there first
                if (!empty($suggLab)) {
                    $this->db->select('id');
                    $this->db->from('lb_lab_tests');
                    $this->db->where('lab_id', $suggLab);
                    $this->db->where('test_name', $l['testName'] ?? '');
                    $q = $this->db->get();
                    if ($q->num_rows() > 0) {
                        $labTestId = $q->row()->id;
                    }
                }

                // 2. If not found, try by name globally (or maybe limit to preferred labs if we had that info here, 
                // but for now global name match is a reasonable fallback if specific lab not found)
                if (empty($labTestId)) {
                    $this->db->select('id');
                    $this->db->from('lb_lab_tests');
                    $this->db->where('test_name', $l['testName'] ?? '');
                    // Maybe prioritize active tests?
                    $this->db->where('isdelete', 0); 
                    $this->db->limit(1);
                    $q2 = $this->db->get();
                    if ($q2->num_rows() > 0) {
                        $labTestId = $q2->row()->id;
                    }
                }
                // --------------------------------------------------

                $rowData = [
                    'treatment_id' => $treatment_id,
                    'test_name' => $l['testName'] ?? '',
                    'reason' => $l['reason'] ?? '',
                    'urgency' => $l['urgency'] ?? 'routine',
                    'status' => $l['status'] ?? 'ordered',
                    'is_auto_suggested' => !empty($l['isAutoSuggested']) ? 1 : 0,
                    'lab_test_id' => $labTestId // Storing the resolved ID
                ];

                if (isset($existingMap[$nameNorm])) {
                    // Update existing to preserve ID
                    $id = $existingMap[$nameNorm];
                    $this->db->where('id', $id);
                    $this->db->update('ms_patient_treatment_lab_tests', $rowData);
                    $keepIds[] = $id;
                } else {
                    // Insert new
                    $this->db->insert('ms_patient_treatment_lab_tests', $rowData);
                    $keepIds[] = $this->db->insert_id();
                }
            }
        }
        
        // Delete removed tests
        $this->db->where('treatment_id', $treatment_id);
        if (!empty($keepIds)) {
            $this->db->where_not_in('id', $keepIds);
        }
        $this->db->delete('ms_patient_treatment_lab_tests');

        // 6.5 Initialize Lab Tracking
        // Ensure every active test has a tracking entry if a lab is selected
        if (!empty($keepIds) && !empty($data['sugg_lab'])) {
            
            // A. Create or Update Master Lab Order
            $this->db->where('treatment_id', $treatment_id);
            $order = $this->db->get('lb_lab_orders')->row();
            
            $lab_order_id = null;
            if ($order) {
                $lab_order_id = $order->id;
                // Update lab if changed
                if ($order->lab_id != $data['sugg_lab']) {
                     $this->db->where('id', $lab_order_id);
                     $this->db->update('lb_lab_orders', ['lab_id' => $data['sugg_lab']]);
                }
            } else {
                $this->db->insert('lb_lab_orders', [
                    'treatment_id' => $treatment_id,
                    'appointment_id' => $data['appointment_id'],
                    'lab_id' => $data['sugg_lab'],
                    'status' => 'Registered'
                ]);
                $lab_order_id = $this->db->insert_id();
            }

            // B. Update Test Tracking
            foreach ($keepIds as $localTestId) {
                // Get the local test name to find the real lab test ID
                $localTest = $this->db->get_where('ms_patient_treatment_lab_tests', ['id' => $localTestId])->row();
                if (!$localTest) continue;

                $testName = $localTest->test_name;
                $realLabTestId = !empty($localTest->lab_test_id) ? $localTest->lab_test_id : null;

                // 1. Try to find ID in lb_lab_tests for the suggested lab (if not already found)
                if (!$realLabTestId && !empty($data['sugg_lab'])) {
                    $this->db->select('id');
                    $this->db->from('lb_lab_tests');
                    $this->db->where('lab_id', $data['sugg_lab']);
                    $this->db->where('test_name', $testName);
                    $q = $this->db->get();
                    if ($q->num_rows() > 0) {
                        $realLabTestId = $q->row()->id;
                    }
                }

                // 2. If not found, find match by name in lb_lab_tests (any lab)
                if (!$realLabTestId) {
                    $this->db->select('id');
                    $this->db->from('lb_lab_tests');
                    $this->db->where('test_name', $testName);
                    $this->db->limit(1);
                    $q2 = $this->db->get();
                    if ($q2->num_rows() > 0) {
                        $realLabTestId = $q2->row()->id;
                    }
                }

                // If found now but wasn't in localTest, update localTest for future consistency
                if ($realLabTestId && empty($localTest->lab_test_id)) {
                    $this->db->where('id', $localTestId);
                    $this->db->update('ms_patient_treatment_lab_tests', ['lab_test_id' => $realLabTestId]);
                }

                // If still not found, we cannot link to a valid lab test ID, so we skip tracking for this item
                if (!$realLabTestId) continue;

                // Check if tracking exists with the CORRECT treatment_test_id (lb_lab_tests ID)
                $this->db->where('treatment_test_id', $realLabTestId);
                $this->db->where('treatment_id', $treatment_id);
                $exists = $this->db->get('lb_patient_test_tracking')->row();

                if (!$exists) {
                    $this->db->insert('lb_patient_test_tracking', [
                        'treatment_test_id' => $realLabTestId,
                        'treatment_id' => $treatment_id,
                        'appointment_id' => $data['appointment_id'],
                        'lab_order_id' => $lab_order_id,
                        'status' => 'Registered',
                        'lab_id' => $data['sugg_lab']
                    ]);
                } else {
                     // Update lab_id and order_id if changed or missing
                     $updateData = [];
                     if ($exists->lab_id != $data['sugg_lab']) {
                         $updateData['lab_id'] = $data['sugg_lab'];
                     }
                     if (empty($exists->lab_order_id) || $exists->lab_order_id != $lab_order_id) {
                         $updateData['lab_order_id'] = $lab_order_id;
                     }
                     // Ensure treatment/appt IDs are set
                     if (empty($exists->treatment_id)) $updateData['treatment_id'] = $treatment_id;
                     if (empty($exists->appointment_id)) $updateData['appointment_id'] = $data['appointment_id'];

                     if (!empty($updateData)) {
                         $this->db->where('id', $exists->id);
                         $this->db->update('lb_patient_test_tracking', $updateData);
                     }
                }
            }
        }

        // 7. Insert Lab Reports
        // Lab reports are managed independently via upload/delete endpoints
        /*
        if (!empty($data['lab_reports'])) {
            $repData = [];
            foreach ($data['lab_reports'] as $r) {
                $repData[] = [
                    'treatment_id' => $treatment_id,
                    'file_name' => $r['fileName'] ?? '',
                    'file_url' => $r['fileUrl'] ?? ($r['url'] ?? ''), // Handle both just in case
                    'file_type' => $r['fileType'] ?? '',
                    'is_combined' => !empty($r['isCombinedReport']) ? 1 : 0,
                    'covered_tests' => !empty($r['coveredTestIds']) ? (is_array($r['coveredTestIds']) ? json_encode($r['coveredTestIds']) : $r['coveredTestIds']) : null,
                    'lab_test_id' => !empty($r['labTestId']) ? $r['labTestId'] : null
                ];
            }
            if (!empty($repData)) $this->db->insert_batch('ms_patient_treatment_lab_reports', $repData);
        }
        */

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return false;
        }

        return $treatment_id;
    }

    public function getTreatmentByAppointmentId($appointment_id) {
        // Get Master
        $this->db->where('appointment_id', $appointment_id);
        $query = $this->db->get('ms_patient_treatment_info');
        $master = $query->row_array();

        if (!$master) return null;

        $treatment_id = $master['id'];

        // Get Sugg Lab Details
        if (!empty($master['sugg_lab'])) {
            $this->db->select('id, name, email, phone, address');
            $this->db->where('id', $master['sugg_lab']);
            $labQ = $this->db->get('lb_laboratorys');
            if ($labQ->num_rows() > 0) {
                $master['selected_lab_details'] = $labQ->row_array();
            }
        }

        // Get Details
        $master['purpose'] = $this->db->get_where('ms_patient_treatment_purpose', ['treatment_id' => $treatment_id])->result_array();
        
        // Map Diagnosis back to frontend structure
        $diagRows = $this->db->get_where('ms_patient_treatment_diagnosis', ['treatment_id' => $treatment_id])->result_array();
        $master['diagnosis'] = array_map(function($row) {
            return [
                'id' => $row['id'], // Use DB ID
                'condition' => $row['condition_name'],
                'notes' => $row['notes'],
                'severity' => $row['severity'],
                'icd10' => $row['icd10']
            ];
        }, $diagRows);

        // Map Medications
        $medRows = $this->db->get_where('ms_patient_treatment_medications', ['treatment_id' => $treatment_id])->result_array();
        $master['medications'] = array_map(function($row) {
            return [
                'id' => $row['id'],
                'name' => $row['name'],
                'dosage' => $row['dosage'],
                'frequency' => $row['frequency'],
                'duration' => $row['duration'],
                'instructions' => $row['instructions'],
                'isAutoSuggested' => $row['is_auto_suggested'] == 1,
                'timings' => !empty($row['timings']) ? json_decode($row['timings'], true) : []
            ];
        }, $medRows);

        // Map Lab Tests
        $labRows = $this->db->get_where('ms_patient_treatment_lab_tests', ['treatment_id' => $treatment_id])->result_array();
        $master['lab_tests'] = array_map(function($row) {
            return [
                'id' => $row['lab_test_id'],
                'testName' => $row['test_name'],
                'reason' => $row['reason'],
                'urgency' => $row['urgency'],
                'status' => $row['status'],
                'isAutoSuggested' => $row['is_auto_suggested'] == 1,
                'labTestId' => !empty($row['lab_test_id']) ? $row['lab_test_id'] : null
            ];
        }, $labRows);

        $repRows = $this->db->get_where('ms_patient_treatment_lab_reports', ['treatment_id' => $treatment_id])->result_array();
        $master['lab_reports'] = array_map(function($row) {
            $url = $row['file_url'];
            if (!preg_match('/^https?:\/\//', $url) && !empty($url)) {
                 $url = base_url() . $url;
            }
            return [
                'id' => $row['id'],
                'fileName' => $row['file_name'],
                'fileUrl' => $url,
                'fileType' => $row['file_type'],
                'isCombinedReport' => $row['is_combined'] == 1,
                'coveredTestIds' => !empty($row['covered_tests']) ? json_decode($row['covered_tests'], true) : [],
                'labTestId' => !empty($row['lab_test_id']) ? $row['lab_test_id'] : null
            ];
        }, $repRows);

        $is_viewlab_report = 0;
        if (!empty($repRows)) {
            foreach ($repRows as $row) {
                if (isset($row['is_viewlab_report']) && intval($row['is_viewlab_report']) === 1) {
                    $is_viewlab_report = 1;
                    break;
                }
            }
        }
        $master['is_viewlab_report'] = $is_viewlab_report;

        // Simplify purpose to just IDs if that's what frontend expects for 'purposeSelectedIds'
        // But frontend handles it. Let's send the full objects for now, or just IDs if logic requires.
        // Frontend expects `setPurposeSelectedIds(data.purpose)` where purpose is string[].
        // So we should map it to IDs here.
        $master['purpose_ids'] = array_map(function($p) { return $p['item_id']; }, $master['purpose']);

        return $master;
    }

    public function getPatientIdByTreatmentId($treatment_id) {
        $this->db->select('patient_id');
        $this->db->where('id', $treatment_id);
        $query = $this->db->get('ms_patient_treatment_info');
        if ($query->num_rows() > 0) {
            return $query->row()->patient_id;
        }
        return null;
    }

    public function addLabReport($data) {
        $this->db->insert('ms_patient_treatment_lab_reports', $data);
        return $this->db->insert_id();
    }

    public function updateAppointmentStatus($appointment_id, $status) {
        $this->db->where('id', $appointment_id);
        return $this->db->update('ms_patient_appointment', ['status' => $status]);
    }
}
