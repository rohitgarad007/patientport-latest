<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSHospitalsBedPermissionController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->helper('verifyAuthToken');
        $this->load->model('HospitalCommonModel');
        $this->load->model('StaffCommonModel');
        $this->load->model('DoctorCommonModel');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    private function jsonError($message, $code = 400) {
        http_response_code($code);
        echo json_encode(["success" => false, "message" => $message]);
    }

    // AES helpers (compatible with JS decrypt)
    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    public function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $cipherText = base64_decode($cipherTextBase64);
        if (!$cipherText || strlen($cipherText) < 16) {
            return "Base64 decode failed or too short";
        }
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, "Salted__", 8) !== 0) {
            return "Invalid salt header";
        }
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $decrypted = openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        if ($decrypted === false) {
            return "Decryption failed";
        }
        return $decrypted;
    }

    public function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen, $ivLen) {
        $dtot = '';
        $d = '';
        while (strlen($dtot) < ($keyLen + $ivLen)) {
            $d = md5($d . $passphrase . $salt, true);
            $dtot .= $d;
        }
        return [
            'key' => substr($dtot, 0, $keyLen),
            'iv'  => substr($dtot, $keyLen, $ivLen)
        ];
    }

    private function getHospitalIdByHosuid($hosuid) {
        $row = $this->db->get_where('ms_hospitals', ['hosuid' => $hosuid])->row_array();
        return $row ? intval($row['id']) : null;
    }

    private function requireHospitalAdminToken() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || $hrole !== "hospital_admin") {
                $this->jsonError("Invalid user token or insufficient privileges", 401);
                return [false, null, null];
            }
            return [true, $loguid, $tokenData];
        } catch (Exception $e) {
            $this->jsonError("Authorization failed: " . $e->getMessage(), 401);
            return [false, null, null];
        }
    }

    // hs_bed_permission_requests_list
    public function BedPermissionRequestsList() {

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }



            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "hospital not found"
                ]);
                return;
            }

            $hospital_id = $HospitalInfo['id'];


            $AES_KEY = "RohitGaradHos@173414";

            /*$rawData = json_decode(file_get_contents("php://input"), true);
            $page = isset($rawData['page']) ? max(1, intval($rawData['page'])) : 1;
            $limit = isset($rawData['limit']) ? max(1, intval($rawData['limit'])) : 20;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';


            $offset = ($page - 1) * $limit;*/

            // Read JSON input
            $rawData = json_decode(file_get_contents("php://input"), true);

            // Decrypt each field safely
            $page = isset($rawData['page']) ? intval($this->decrypt_aes_from_js($rawData['page'], $AES_KEY)) : 1;
            $limit = isset($rawData['limit']) ? intval($this->decrypt_aes_from_js($rawData['limit'], $AES_KEY)) : 20;
            $search = isset($rawData['search']) ? trim($this->decrypt_aes_from_js($rawData['search'], $AES_KEY)) : '';

            // Ensure sane defaults
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 20;

            $offset = ($page - 1) * $limit;

            

            // Count total with optional search
            $this->db->from('ms_bed_allocation_history AS bah');
            $this->db->where('bah.hospital_id', $hospital_id);
            if (!empty($search)) {
                $this->db->join('ms_patient AS mp_s', 'mp_s.id = bah.patient_id', 'left');
                $this->db->join('ms_hospitals_rooms_bed AS hb_from_s', 'hb_from_s.id = bah.from_bed_id', 'left');
                $this->db->join('ms_hospitals_rooms_bed AS hb_to_s', 'hb_to_s.id = bah.to_bed_id', 'left');
                $this->db->group_start();
                $this->db->like('mp_s.fname', $search);
                $this->db->or_like('mp_s.lname', $search);
                $this->db->or_like('hb_from_s.title', $search);
                $this->db->or_like('hb_to_s.title', $search);
                $this->db->group_end();
            }
            $total = $this->db->count_all_results();

            $this->db->select("
                bah.id,
                bah.activity_type,
                bah.created_by,
                bah.created_at,
                bah.updated_by,
                bah.updated_at,
                bah.permission_status,
                bah.patient_id,
                mp.fname AS patient_fname,
                mp.lname AS patient_lname,
                COALESCE(st.name, doc.name, bah.created_by) AS requested_by,
                CASE 
                    WHEN st.staff_uid IS NOT NULL THEN 'staff' 
                    WHEN doc.docuid IS NOT NULL THEN 'doctor' 
                    ELSE 'system' 
                END AS requested_by_role,
                hb_from.title AS current_bed,
                hb_to.title AS target_bed,
                w_from.title AS current_ward,
                w_to.title AS target_ward,
                w_ac.title AS activity_type_name,
                pa.priority,
                pa.medical_notes
            ", false);

            $this->db->from('ms_bed_allocation_history AS bah');
            $this->db->join('ms_patient AS mp', 'mp.id = bah.patient_id', 'left');
            $this->db->join('ms_patient_bed_admission AS pa', 'pa.id = bah.admission_id', 'left');
            $this->db->join('ms_staff AS st', 'st.id = bah.created_by', 'left');
            $this->db->join('ms_doctors AS doc', 'doc.docuid = bah.created_by', 'left');
            $this->db->join('ms_hospitals_rooms_bed AS hb_from', 'hb_from.id = bah.from_bed_id', 'left');
            $this->db->join('ms_hospitals_rooms_bed AS hb_to', 'hb_to.id = bah.to_bed_id', 'left');
            $this->db->join('ms_hospitals_ward AS w_from', 'w_from.id = hb_from.ward_id', 'left');
            $this->db->join('ms_hospitals_ward AS w_to', 'w_to.id = hb_to.ward_id', 'left');
            $this->db->join('ms_hospitals_patient_activity_type AS w_ac', 'w_ac.id = bah.activity_type', 'left');
            $this->db->where('bah.hospital_id', $hospital_id);

            if (!empty($search)) {
                $this->db->group_start();
                $this->db->like('mp.fname', $search);
                $this->db->or_like('mp.lname', $search);
                $this->db->or_like('hb_from.title', $search);
                $this->db->or_like('hb_to.title', $search);
                $this->db->group_end();
            }
            $this->db->order_by('bah.created_at', 'DESC');
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            // Map to response shape
            $list = array_map(function($r){
                $status = 'pending';
                $ps = isset($r['permission_status']) ? intval($r['permission_status']) : 0;
                if ($ps === 1) $status = 'approved';
                else if ($ps === 2) $status = 'declined';
                else if ($ps === 3) $status = 'under-review';
                return [
                    'id' => $r['id'],
                    'activity_type' => $r['activity_type'],
                    'activity_type_name' => $r['activity_type_name'],
                    'requested_by' => $r['requested_by'],
                    'requested_by_role' => $r['requested_by_role'],
                    'request_date' => $r['created_at'],
                    'patient_id' => $r['patient_id'],
                    'patient_name' => trim(($r['patient_fname'] ?? '') . ' ' . ($r['patient_lname'] ?? '')),
                    'current_bed' => $r['current_bed'] ?? '',
                    'target_bed' => $r['target_bed'] ?? '',
                    'current_ward' => $r['current_ward'] ?? '',
                    'target_ward' => $r['target_ward'] ?? '',
                    'status' => $status,
                    'priority' => $r['priority'] ?? 'low',
                    'justification' => $r['medical_notes'] ?? '',
                    'attachments' => '',
                    'reviewed_by' => $r['updated_by'] ?? null,
                    'reviewed_date' => $r['updated_at'] ?? null,
                    'decline_reason' => null,
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                'data2' => $list,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }


        /*list($ok, $loguid, $tokenData) = $this->requireHospitalAdminToken();
        if (!$ok) return;

        

        $hospital_id = $this->getHospitalIdByHosuid($loguid);
        if (!$hospital_id) {
            $this->jsonError("Invalid hospital", 400);
            return;
        }

        echo $hospital_id;
        exit;*/


       /* 

       

        


        */
    }

    // hs_bed_permission_approval_steps_list
    /*public function BedPermissionApprovalStepsList() {

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }



            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "hospital not found"
                ]);
                return;
            }

            $hospital_id = $HospitalInfo['id'];


            $AES_KEY = "RohitGaradHos@173414";

            //echo $hospital_id;

            $rawData = json_decode(file_get_contents("php://input"), true);
            $requestIdEnc = isset($rawData['request_id']) ? $rawData['request_id'] : '';
            $requestId = 0;
            if (!empty($requestIdEnc)) {
                $dec = $this->decrypt_aes_from_js($requestIdEnc, $AES_KEY);
                $requestId = intval($dec);
            }


            $this->db->select('bah.*, COALESCE(st.name, doc.name, bah.created_by) AS requested_by, st.staff_uid AS s_uid, doc.docuid AS d_uid');
            $this->db->from('ms_bed_allocation_history AS bah');
            $this->db->join('ms_staff AS st', 'st.id = bah.created_by', 'left');
            $this->db->join('ms_doctors AS doc', 'doc.docuid = bah.created_by', 'left');
            $this->db->where('bah.hospital_id', $hospital_id);
            
            $this->db->where('bah.id', $requestId);
            
            $this->db->order_by('bah.created_at', 'DESC');
            $bah = $this->db->get()->row_array();

            if (!$bah) {
                // Return empty steps
                $encryptedData = $this->encrypt_aes_for_js(json_encode([]), $AES_KEY);
                echo json_encode([ 'success' => true, 'data' => $encryptedData ]);
                return;
            }

            $steps = [];
            $steps[] = [
                'id' => '1',
                'request_id' => strval($bah['id']),
                'step_name' => 'Request Submitted',
                'assigned_to' => $bah['requested_by'],
                'status' => 'approved',
                'timestamp' => $bah['created_at'],
                'notes' => 'Activity: ' . ($bah['activity_type'] ?? '')
            ];

            $ps = intval($bah['permission_status'] ?? 0);
            if ($ps === 3) {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Under Review',
                    'assigned_to' => $bah['updated_by'] ?? 'hospital_admin',
                    'status' => 'under-review',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Awaiting decision'
                ];
            } else if ($ps === 1) {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Approved',
                    'assigned_to' => $bah['updated_by'] ?? 'hospital_admin',
                    'status' => 'approved',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Permission granted'
                ];
            } else if ($ps === 2) {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Declined',
                    'assigned_to' => $bah['updated_by'] ?? 'hospital_admin',
                    'status' => 'declined',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Permission declined'
                ];
            } else {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Pending Review',
                    'assigned_to' => $bah['updated_by'] ?? 'hospital_admin',
                    'status' => 'pending',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Waiting for approver'
                ];
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($steps), $AES_KEY);
            echo json_encode([ 'success' => true, 'data' => $encryptedData, 'data2' => $steps ]);

            


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }*/

    public function BedPermissionApprovalStepsList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // ✅ Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // ✅ Get hospital info
            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital not found"
                ]);
                return;
            }

            $hospital_id = $HospitalInfo['id'];
            $AES_KEY = "RohitGaradHos@173414";

            // ✅ Get request ID
            $rawData = json_decode(file_get_contents("php://input"), true);
            $requestIdEnc = $rawData['request_id'] ?? '';
            $requestId = !empty($requestIdEnc) ? intval($this->decrypt_aes_from_js($requestIdEnc, $AES_KEY)) : 0;

            // ✅ Fetch bed allocation info
            $this->db->select('bah.*, COALESCE(st.name, doc.name, bah.created_by) AS requested_by, st.staff_uid AS s_uid, doc.docuid AS d_uid');
            $this->db->from('ms_bed_allocation_history AS bah');
            $this->db->join('ms_staff AS st', 'st.id = bah.created_by', 'left');
            $this->db->join('ms_doctors AS doc', 'doc.docuid = bah.created_by', 'left');
            $this->db->where('bah.hospital_id', $hospital_id);
            $this->db->where('bah.id', $requestId);
            $this->db->order_by('bah.created_at', 'DESC');
            $bah = $this->db->get()->row_array();

            if (!$bah) {
                $encryptedData = $this->encrypt_aes_for_js(json_encode([]), $AES_KEY);
                echo json_encode(['success' => true, 'data' => $encryptedData]);
                return;
            }

            // ✅ Determine assigned_to name (based on permission_change_by)
            $assigned_to = 'hospital_admin';
            if (!empty($bah['permission_change_by'])) {
                $this->db->select('name');
                $this->db->from('ms_staff');
                $this->db->where('id', $bah['permission_change_by']);
                $staff = $this->db->get()->row_array();
                if (!empty($staff['name'])) {
                    $assigned_to = $staff['name'];
                }
            }
            $bah['assigned_to'] = $assigned_to;

            // ✅ Step 1 — Request Submitted
            $steps = [];
            $steps[] = [
                'id' => '1',
                'request_id' => strval($bah['id']),
                'step_name' => 'Request Submitted',
                'assigned_to' => $bah['requested_by'],
                'status' => 'approved',
                'timestamp' => $bah['created_at'],
                'notes' => 'Activity: ' . ($bah['activity_type'] ?? '')
            ];

            // ✅ Determine current permission status
            $ps = intval($bah['permission_status'] ?? 0);

            // ✅ Step 2 — Based on permission_status
            if ($ps === 3) {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Under Review',
                    'assigned_to' => $bah['assigned_to'] ?? 'hospital_admin',
                    'status' => 'under-review',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Awaiting decision'
                ];
            } elseif ($ps === 1) {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Approved',
                    'assigned_to' => $bah['assigned_to'] ?? 'hospital_admin',
                    'status' => 'approved',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Permission granted'
                ];
            } elseif ($ps === 2) {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Declined',
                    'assigned_to' => $bah['assigned_to'] ?? 'hospital_admin',
                    'status' => 'declined',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Permission declined'
                ];
            } else {
                $steps[] = [
                    'id' => '2',
                    'request_id' => strval($bah['id']),
                    'step_name' => 'Pending Review',
                    'assigned_to' => $bah['assigned_to'] ?? 'hospital_admin',
                    'status' => 'pending',
                    'timestamp' => $bah['updated_at'] ?? null,
                    'notes' => 'Waiting for approver'
                ];
            }

            // ✅ Encrypt + Return data
            $encryptedData = $this->encrypt_aes_for_js(json_encode($steps), $AES_KEY);
            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                'data2' => $steps
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


    // hs_bed_permission_audit_logs_list
    public function BedPermissionAuditLogsList() {


        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }



            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "hospital not found"
                ]);
                return;
            }

            $hospital_id = $HospitalInfo['id'];


            $AES_KEY = "RohitGaradHos@173414";

            //echo $hospital_id;

            $rawData = json_decode(file_get_contents("php://input"), true);
            $page = isset($rawData['page']) ? max(1, intval($rawData['page'])) : 1;
            $limit = isset($rawData['limit']) ? max(1, intval($rawData['limit'])) : 50;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $offset = ($page - 1) * $limit;

            // Count
            $this->db->from('ms_activity_log AS al');
            $this->db->where('al.hosuid', $loguid);
            if (!empty($search)) {
                $this->db->group_start();
                $this->db->like('al.api_name', $search);
                $this->db->or_like('al.description', $search);
                $this->db->group_end();
            }
            $total = $this->db->count_all_results();

            //echo $total;

            // Data
            $this->db->select('al.id, al.created_at, al.loguid, al.role, al.action_type, al.api_name, al.description, al.request_payload');
            $this->db->from('ms_activity_log AS al');
            $this->db->where('al.hosuid', $loguid);
            if (!empty($search)) {
                $this->db->group_start();
                $this->db->like('al.api_name', $search);
                $this->db->or_like('al.description', $search);
                $this->db->group_end();
            }
            $this->db->order_by('al.created_at', 'DESC');
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $logs = array_map(function($r){
                $reqId = null;
                if (!empty($r['request_payload'])) {
                    $payload = json_decode($r['request_payload'], true);
                    if (is_array($payload) && isset($payload['request_id'])) {
                        $reqId = strval($payload['request_id']);
                    }
                }
                return [
                    'id' => $r['id'],
                    'timestamp' => $r['created_at'],
                    'user' => $r['loguid'],
                    'user_role' => $r['role'],
                    'action' => $r['action_type'],
                    'description' => $r['description'],
                    'request_id' => $reqId
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($logs), $AES_KEY);
            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                'data2' => $logs,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }





        /*list($ok, $loguid, $tokenData) = $this->requireHospitalAdminToken();
        if (!$ok) return;

        

        

        */
    }

    // hs_patient_stays_overview
    public function PatientStaysOverview() {

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }



            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "hospital not found"
                ]);
                return;
            }

            $hospital_id = $HospitalInfo['id'];


            $AES_KEY = "RohitGaradHos@173414";


            $this->db->select("
                pa.id AS stay_id,
                p.id AS patient_id,
                CONCAT(p.fname, ' ', p.lname) AS patient_name,
                p.gender,
                p.dob,
                pa.admit_date,
                pa.activity_type,
                pa.current_status,
                pa.priority,
                pa.medical_notes,
                hb.title AS bed_name,
                w.title AS ward_name,
                d.name AS doctor_name
            ", false);

            $this->db->from('ms_patient_bed_admission AS pa');
            $this->db->join('ms_patient AS p', 'p.id = pa.patient_id', 'left');
            $this->db->join('ms_doctors AS d', 'd.id = pa.doctor_id', 'left');
            $this->db->join('ms_hospitals_rooms_bed AS hb', 'hb.admission_id = pa.id', 'left');
            $this->db->join('ms_hospitals_ward AS w', 'w.id = hb.ward_id', 'left');
            $this->db->where('pa.hospital_id', $hospital_id);
            $this->db->order_by('pa.admit_date', 'DESC');
            $this->db->limit(200); // reasonable default
            $rows = $this->db->get()->result_array();


            $today = new DateTime();
            $stays = array_map(function($r) use ($today){
                $age = 0;
                if (!empty($r['dob'])) {
                    try {
                        $dob = new DateTime($r['dob']);
                        $age = $today->diff($dob)->y;
                    } catch (Exception $e) {}
                }
                return [
                    'id' => $r['stay_id'],
                    'patient_id' => $r['patient_id'],
                    'name' => $r['patient_name'],
                    'age' => $age,
                    'gender' => $r['gender'] ?? '',
                    'admission_date' => $r['admit_date'] ?? '',
                    'department' => $r['activity_type'] ?? 'General',
                    'current_bed' => $r['bed_name'] ?? '',
                    'current_ward' => $r['ward_name'] ?? '',
                    'attending_physician' => $r['doctor_name'] ?? '',
                    'status' => $r['current_status'] ?? 'admitted',
                    'diagnosis' => $r['medical_notes'] ?? '',
                    'condition' => 'stable',
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($stays), $AES_KEY);
            echo json_encode([
                'success' => true,
                'data' => $encryptedData
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }


        /*list($ok, $loguid, $tokenData) = $this->requireHospitalAdminToken();
        if (!$ok) return;

       */
    }

    // hs_bed_permission_request_approve
    public function BedPermissionRequestApprove() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Get hospital info
            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "hospital not found"
                ]);
                return;
            }
            $hospital_id = $HospitalInfo['id'];

            $AES_KEY = "RohitGaradHos@173414";

            // Parse encrypted payload
            $rawData = json_decode(file_get_contents("php://input"), true);
            $requestIdEnc = $rawData['request_id'] ?? '';
            $notesEnc = $rawData['notes'] ?? '';

            $requestId = !empty($requestIdEnc) ? intval($this->decrypt_aes_from_js($requestIdEnc, $AES_KEY)) : 0;
            $notes = !empty($notesEnc) ? $this->decrypt_aes_from_js($notesEnc, $AES_KEY) : '';

            if ($requestId <= 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid request ID'
                ]);
                return;
            }

            // Fetch request
            $bah = $this->db->select('*')
                            ->from('ms_bed_allocation_history')
                            ->where('id', $requestId)
                            ->where('hospital_id', $hospital_id)
                            ->get()
                            ->row_array();

            if (!$bah) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Request not found'
                ]);
                return;
            }

            $now = date('Y-m-d H:i:s');

            // Update history to approved
            $this->db->where('id', $requestId)
                     ->where('hospital_id', $hospital_id)
                     ->update('ms_bed_allocation_history', [
                        'permission_status' => 1,
                        'updated_at' => $now,
                        'updated_by' => $loguid
                     ]);

            // Mirror to admission if available
            $admission_id = intval($bah['admission_id'] ?? 0);
            if ($admission_id > 0) {
                $this->db->where('id', $admission_id)
                         ->where('hospital_id', $hospital_id)
                         ->update('ms_patient_bed_admission', [
                            'permission_status' => 1,
                            'permission_change_by' => 0,
                            'updated_at' => $now,
                            'updated_by' => $loguid
                         ]);
            }

            // Activity log
            $this->load->model('ActivityLogModel');
            $this->ActivityLogModel->logActivity([
                'loguid' => $loguid,
                'role' => 'hospital_admin',
                'hosuid' => $HospitalInfo['hosuid'],
                'action_type' => 'UPDATE',
                'api_name' => 'hs_bed_permission_request_approve',
                'description' => 'Approved bed permission request ID ' . $requestId,
                'request_payload' => $rawData
            ]);

            // Response data
            $resp = [
                'request_id' => strval($requestId),
                'status' => 'approved',
                'updated_at' => $now,
                'reviewed_by' => 'hospital_admin',
                'notes' => $notes
            ];
            $encryptedData = $this->encrypt_aes_for_js(json_encode($resp), $AES_KEY);

            echo json_encode([
                'success' => true,
                'message' => 'Bed permission approved',
                'data' => $encryptedData
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    // hs_bed_permission_request_decline
    public function BedPermissionRequestDecline() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $hrole !== "hospital_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Get hospital info
            $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "hospital not found"
                ]);
                return;
            }
            $hospital_id = $HospitalInfo['id'];

            $AES_KEY = "RohitGaradHos@173414";

            // Parse encrypted payload
            $rawData = json_decode(file_get_contents("php://input"), true);
            $requestIdEnc = $rawData['request_id'] ?? '';
            $reasonEnc = $rawData['reason'] ?? '';

            $requestId = !empty($requestIdEnc) ? intval($this->decrypt_aes_from_js($requestIdEnc, $AES_KEY)) : 0;
            $reason = !empty($reasonEnc) ? $this->decrypt_aes_from_js($reasonEnc, $AES_KEY) : '';

            if ($requestId <= 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid request ID'
                ]);
                return;
            }

            // Fetch request
            $bah = $this->db->select('*')
                            ->from('ms_bed_allocation_history')
                            ->where('id', $requestId)
                            ->where('hospital_id', $hospital_id)
                            ->get()
                            ->row_array();

            if (!$bah) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Request not found'
                ]);
                return;
            }

            $now = date('Y-m-d H:i:s');

            // Update history to declined
            $this->db->where('id', $requestId)
                     ->where('hospital_id', $hospital_id)
                     ->update('ms_bed_allocation_history', [
                        'permission_status' => 2,
                        'updated_at' => $now,
                        'updated_by' => $loguid
                     ]);

            // Mirror to admission if available
            $admission_id = intval($bah['admission_id'] ?? 0);
            if ($admission_id > 0) {
                $this->db->where('id', $admission_id)
                         ->where('hospital_id', $hospital_id)
                         ->update('ms_patient_bed_admission', [
                            'permission_status' => 2,
                            'permission_change_by' => 0,
                            'updated_at' => $now,
                            'updated_by' => $loguid
                         ]);
            }

            // Activity log
            $this->load->model('ActivityLogModel');
            $this->ActivityLogModel->logActivity([
                'loguid' => $loguid,
                'role' => 'hospital_admin',
                'hosuid' => $HospitalInfo['hosuid'],
                'action_type' => 'UPDATE',
                'api_name' => 'hs_bed_permission_request_decline',
                'description' => 'Declined bed permission request ID ' . $requestId . ($reason ? (' | Reason: ' . $reason) : ''),
                'request_payload' => $rawData
            ]);

            // Response data
            $resp = [
                'request_id' => strval($requestId),
                'status' => 'declined',
                'updated_at' => $now,
                'reviewed_by' => 'hospital_admin',
                'decline_reason' => $reason
            ];
            $encryptedData = $this->encrypt_aes_for_js(json_encode($resp), $AES_KEY);

            echo json_encode([
                'success' => true,
                'message' => 'Bed permission declined',
                'data' => $encryptedData
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }
}