<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class SFDoctorController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit();
        }
        $this->load->database();
        $this->load->helper(['verifyauthtoken']);
        $this->load->model('DoctorCommonModel');
        $this->load->model('HospitalCommonModel');
    }

    public function getLoggedInDoctorProfile() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $loguid = $tokenData['loguid'] ?? null;
            $role = $tokenData['role'] ?? null;

            if (!$loguid || $role !== 'doctor') {
                throw new Exception("Invalid doctor user");
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Use the updated model method that fetches detailed info
            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);

            if (!$doctorInfo) {
                 throw new Exception("Doctor info not found");
            }
            
            // Return raw doctor info (including hospital details)
            // The frontend will map it to the receipt format
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorInfo), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }

    public function get_receipt_content() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $loguid = $tokenData['loguid'] ?? null;
            $role = $tokenData['role'] ?? null;

            if (!$loguid || $role !== 'doctor') {
                throw new Exception("Invalid user token or insufficient privileges");
            }

            // Get doctor ID from loguid
            $this->load->model('DoctorCommonModel');
            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) throw new Exception("Doctor not found");
            $doctor_id = $doctorInfo['id'];

            $this->load->model('ReceiptContentModel');
            $data = $this->ReceiptContentModel->getReceiptContent($doctor_id);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                "rowData" => $data
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function update_receipt_content() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $loguid = $tokenData['loguid'] ?? null;
            $role = $tokenData['role'] ?? null;

            if (!$loguid || $role !== 'doctor') {
                throw new Exception("Invalid user token or insufficient privileges");
            }

            // Get doctor ID from loguid
            $this->load->model('DoctorCommonModel');
            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) throw new Exception("Doctor not found");
            $doctor_id = $doctorInfo['id'];

            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            $this->load->model('ReceiptContentModel');
            $this->ReceiptContentModel->updateReceiptContent($doctor_id, $data);

            echo json_encode([
                'success' => true,
                'message' => 'Receipt content updated successfully'
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    private function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen = 32, $ivLen = 16) {
        // OpenSSL-compatible EVP_BytesToKey using MD5 blocks
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

    private function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    private function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $cipherText = base64_decode($cipherTextBase64);
        if (!$cipherText || strlen($cipherText) < 16) {
            throw new Exception('Base64 decode failed or too short');
        }
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, 'Salted__', 8) !== 0) {
            throw new Exception('Invalid salt header');
        }
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $decrypted = openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        if ($decrypted === false) {
            throw new Exception('Decryption failed');
        }
        return $decrypted;
    }

    /**
     * Diagnosis auto-suggestions from hospital treatment masters
     * Table: ms_hospitals_treatment_diagnosis
     * Input (JSON): { search: string, page?: number, limit?: number }
     * Output: { success: boolean, data: <AES encrypted JSON array> }
     */
    public function getDiagnosisSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id by role
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                // Hospital id (numeric) from hospitals table
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                // staff
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $searchRaw = isset($raw['search']) ? $raw['search'] : '';
            if (is_array($searchRaw)) {
                // Accept legacy shapes like { search: { search: "...", max: 8 } } or ["..."]
                if (isset($searchRaw['search'])) {
                    $searchRaw = $searchRaw['search'];
                } else {
                    $first = reset($searchRaw);
                    $searchRaw = $first !== false ? $first : '';
                }
            }
            $search = trim((string)$searchRaw);
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 8);
            $offset = ($page - 1) * $limit;

            $this->db->select('id, name, description');
            $this->db->from('ms_hospitals_treatment_diagnosis');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    // UI maps ICD code to description field
                    'code' => (string)($r['description'] ?? ''),
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function getPatientDetails() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || !in_array($role, ['doctor', 'staff'], true)) {
                 echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                 return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id
            $hospital_id = null;
            $hosuid = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id || !$hosuid) throw new Exception('Hospital information not found');

            $rawData = json_decode(file_get_contents("php://input"), true);
            
            // Expect encrypted 'id' (patient_id)
            $patientIdRaw = $rawData['id'] ?? null;
            if (!$patientIdRaw) throw new Exception("Missing patient ID");

            $patientId = trim($this->decrypt_aes_from_js($patientIdRaw, $AES_KEY));
            if (!$patientId) throw new Exception("Invalid Patient ID");

            $this->load->model('PatientCommonModel');
            // Note: getPatientDetailsByHospital uses hosuid (string), not hospital_id (int)
            $patientDetails = $this->PatientCommonModel->getPatientDetailsByHospital($patientId, $hosuid);

            if ($patientDetails) {
                 // Calculate age
                 $age = null;
                 if (!empty($patientDetails['dob'])) {
                     try {
                         $dob = new DateTime($patientDetails['dob']);
                         $now = new DateTime();
                         $age = $now->diff($dob)->y;
                     } catch (Exception $e) {}
                 }

                 $mappedData = [
                     'id' => (int)$patientDetails['id'],
                     'name' => $patientDetails['fullname'],
                     'age' => $age,
                     'gender' => $patientDetails['gender'],
                     'phone' => $patientDetails['phone'],
                     'email' => $patientDetails['email'],
                     'blood_group' => $patientDetails['bloodGroup']
                 ];

                 $encryptedData = $this->encrypt_aes_for_js(json_encode($mappedData), $AES_KEY);
                 echo json_encode([
                    "success" => true,
                    "data" => $encryptedData
                ]);
            } else {
                 echo json_encode([
                    "success" => false,
                    "message" => "Patient not found"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function getPatientVisitHistory() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || !in_array($role, ['doctor', 'staff'], true)) {
                 echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                 return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $rawData = json_decode(file_get_contents("php://input"), true);
            
            // Expect encrypted 'id' (patient_id)
            $patientIdRaw = $rawData['id'] ?? null;
            if (!$patientIdRaw) throw new Exception("Missing patient ID");

            $patientId = trim($this->decrypt_aes_from_js($patientIdRaw, $AES_KEY));
            if (!$patientId) throw new Exception("Invalid Patient ID");

            $this->load->model('PatientCommonModel');
            
            // Resolve to numeric ID if UID is passed
            $patientInfo = $this->PatientCommonModel->getPatientDetailsByHospital($patientId, $hosuid);
            if (!$patientInfo) throw new Exception("Patient not found");
            $numericPatientId = $patientInfo['id'];

            // Note: get_PatientVisitHistoryByHospital uses hospital_id (int)
            $history = $this->PatientCommonModel->get_PatientVisitHistoryByHospital($numericPatientId, $hospital_id);
            
            $mappedHistory = array_map(function($visit) {
                return [
                    'id' => (string)$visit['id'],
                    'date' => $visit['date'],
                    'time' => $visit['start_time'],
                    'doctor' => $visit['doctor_name'],
                    'department' => 'General Medicine', // Default fallback
                    'status' => ucfirst($visit['status']),
                    'chiefComplaints' => [], // Fetched via getTreatment details
                    'diagnosis' => [],
                    'labTests' => [],
                    'medications' => []
                ];
            }, $history);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($mappedHistory), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    public function patient_treatment_upload_report() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $this->load->model('PatientTreatmentModel');

            $treatment_id = $this->input->post('treatment_id');
            if (!$treatment_id) throw new Exception('Treatment ID is required');

            $patient_id = $this->PatientTreatmentModel->getPatientIdByTreatmentId($treatment_id);
            if (!$patient_id) throw new Exception('Patient not found for this treatment');

            if (!isset($_FILES['file']['name'])) {
                throw new Exception('No file uploaded');
            }

            $uploadPath = FCPATH . 'api/upload/reports/' . $patient_id . '/';
            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            $config['upload_path'] = $uploadPath;
            $config['allowed_types'] = 'pdf|jpg|jpeg|png|doc|docx';
            $config['max_size'] = 10240; // 10MB
            $config['encrypt_name'] = TRUE;

            $this->load->library('upload', $config);

            if (!$this->upload->do_upload('file')) {
                throw new Exception($this->upload->display_errors('', ''));
            }

            $uploadData = $this->upload->data();
            $file_name = $uploadData['file_name'];
            $file_url = 'api/upload/reports/' . $patient_id . '/' . $file_name;
            $file_type = $uploadData['file_ext'];

            $is_combined = $this->input->post('is_combined');
            $covered_tests = $this->input->post('covered_tests');

            $reportData = [
                'treatment_id' => $treatment_id,
                'file_name' => $file_name,
                'file_url' => $file_url,
                'file_type' => $file_type,
                'is_combined' => $is_combined === '1' ? 1 : 0,
                'covered_tests' => $covered_tests
            ];

            $report_id = $this->PatientTreatmentModel->addLabReport($reportData);

            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $report_id,
                    'fileName' => $file_name,
                    'fileUrl' => base_url() . $file_url,
                    'fileType' => $file_type
                ]
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Medication timing suggestions
     * Table: ms_hospitals_medication_timing
     * Input (JSON): { search: string }
     * Output: { success: boolean, data: <AES encrypted JSON array> }
     */
    public function getMedicationTimings() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = isset($raw['search']) ? trim((string)$raw['search']) : '';
            
            $this->db->select('id, label_en');
            $this->db->from('ms_hospitals_medication_timing');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->like('label_en', $search);
            }
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'label_en' => (string)($r['label_en'] ?? '')
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * AI Diagnosis suggestions using ChatGPT API.
     * Input: { search: string }
     * Output: encrypted array of { name, code?, description, isAI: true }
     */
    public function getDiagnosisAISuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            if ($search === '') throw new Exception('Search query is required');

            // OpenAI API key resolution (try multiple env names, then fallback)
            
                // Fallback to provided key (replace with env in production)
                $apiKey = getenv('VITE_API_KEY');
            

            // Ask for compact JSON only to simplify parsing
            $payload = [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a medical assistant. Respond ONLY with a valid JSON array of objects with keys: name, code, description. No prose, no code fences, no extra text. Limit to 10 items.'
                    ],
                    [
                        'role' => 'user',
                        'content' => 'Query: "' . $search . '". Return up to 10 succinct diagnosis suggestions with ICD-10 codes if known. Each item must be {"name":"...","code":"...","description":"..."}.'
                    ]
                ],
                'temperature' => 0.2,
                'max_tokens' => 500
            ];

            // Call Chat Completions with simple retry on 429, then fallback to Responses API
            $resp = null;
            $status = 0;
            $attempts = 0;
            $maxAttempts = 2;
            while ($attempts < $maxAttempts) {
                $ch = curl_init('https://api.openai.com/v1/chat/completions');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $apiKey
                ]);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                $resp = curl_exec($ch);
                if ($resp === false) {
                    $err = curl_error($ch);
                    curl_close($ch);
                    throw new Exception('AI request failed: ' . $err);
                }
                $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($status === 429) {
                    // Rate limited: backoff and retry
                    usleep(600000); // 0.6s
                    $attempts++;
                    continue;
                }
                break;
            }

            // Fallback to Responses API if still rate-limited or not success
            if ($status < 200 || $status >= 300) {
                $responsesPayload = [
                    'model' => 'gpt-4o-mini',
                    'input' => 'Query: "' . $search . '". Return ONLY a JSON array (no text) of up to 10 items with keys name, code, description for likely diagnoses.',
                    'temperature' => 0.2,
                    'max_output_tokens' => 400
                ];
                $ch = curl_init('https://api.openai.com/v1/responses');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $apiKey
                ]);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($responsesPayload));
                $resp = curl_exec($ch);
                if ($resp === false) {
                    $err = curl_error($ch);
                    curl_close($ch);
                    throw new Exception('AI request (fallback) failed: ' . $err);
                }
                $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($status < 200 || $status >= 300) {
                    throw new Exception('AI request returned status ' . $status);
                }
            }

            $json = json_decode($resp, true);
            $text = $json['choices'][0]['message']['content'] ?? ($json['output_text'] ?? '');

            // Attempt to parse JSON from the response content
            $items = [];
            $parsed = null;
            if (is_string($text)) {
                // Direct decode first
                $parsed = json_decode($text, true);
                if (!is_array($parsed)) {
                    // Try extracting the first JSON array within the text
                    $start = strpos($text, '[');
                    $end = strrpos($text, ']');
                    if ($start !== false && $end !== false && $end > $start) {
                        $candidate = substr($text, $start, $end - $start + 1);
                        $parsed = json_decode($candidate, true);
                    }
                }
            }

            if (is_array($parsed)) {
                $items = $parsed;
            } else {
                // Fallback: parse lines like "Name - Code" or just names
                $lines = preg_split('/\r?\n/', trim((string)$text));
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line !== '') {
                        $parts = explode(' - ', $line);
                        $items[] = [
                            'name' => $parts[0] ?? $line,
                            'code' => isset($parts[1]) ? $parts[1] : '',
                            'description' => $line
                        ];
                    }
                }
            }

            // Limit to at most 10 results
            if (is_array($items)) {
                $items = array_slice($items, 0, 10);
            }

            $list = array_map(function($r){
                return [
                    'id' => '',
                    'name' => (string)($r['name'] ?? ''),
                    'code' => (string)($r['code'] ?? ''),
                    'description' => (string)($r['description'] ?? ''),
                    'isAI' => true
                ];
            }, $items);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Medication suggestions from hospital masters (non-AI)
     * Input: { search: string, page?: number, limit?: number }
     * Output: encrypted array of { id, name, code, description }
     */
    public function getMedicationSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id by role
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $searchRaw = isset($raw['search']) ? $raw['search'] : '';
            if (is_array($searchRaw)) {
                if (isset($searchRaw['search'])) { $searchRaw = $searchRaw['search']; }
                else { $first = reset($searchRaw); $searchRaw = $first !== false ? $first : ''; }
            }
            $search = trim((string)$searchRaw);
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 8);
            $offset = ($page - 1) * $limit;

            $this->db->select('id, name, description');
            $this->db->from('ms_hospitals_medication_name');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Lab Test suggestions from hospital masters (non-AI)
     */
    public function getLabTestSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $searchRaw = isset($raw['search']) ? $raw['search'] : '';
            if (is_array($searchRaw)) {
                if (isset($searchRaw['search'])) { $searchRaw = $searchRaw['search']; }
                else { $first = reset($searchRaw); $searchRaw = $first !== false ? $first : ''; }
            }
            $search = trim((string)$searchRaw);
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 8);
            $offset = ($page - 1) * $limit;

            

            $this->db->select('laboratory_id');
            $this->db->from('ms_hospitals_laboratorys');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('status', 1);
            $prefLabs = $this->db->get()->result_array();
            $preferredLabIds = array_column($prefLabs, 'laboratory_id');

            $rows = [];
            if (!empty($preferredLabIds)) {
                // Fetch from lb_lab_tests
                $this->db->select('id, test_name as name, department as description');
                $this->db->from('lb_lab_tests');
                $this->db->where_in('lab_id', $preferredLabIds);
                $this->db->where('isdelete', 0);
                $this->db->where('status', 1);
                if ($search !== '') {
                    $this->db->group_start();
                    $this->db->like('test_name', $search);
                    $this->db->or_like('test_code', $search);
                    $this->db->group_end();
                }
                $this->db->limit($limit, $offset);
                $rows = $this->db->get()->result_array();
            } else {
                // Fallback to ms_hospitals_lab_tests
                /*$this->db->select('id, name, description');
                $this->db->from('ms_hospitals_lab_tests');
                $this->db->where('hospital_id', $hospital_id);
                $this->db->where('isdelete', 0);
                if ($search !== '') {
                    $this->db->group_start();
                    $this->db->like('name', $search);
                    $this->db->or_like('description', $search);
                    $this->db->group_end();
                }
                $this->db->limit($limit, $offset);
                $rows = $this->db->get()->result_array();*/

                $this->db->select('id, test_name as name, department as description');
                $this->db->from('lb_lab_tests');
                $this->db->where('isdelete', 0);
                $this->db->where('status', 1);
                if ($search !== '') {
                    $this->db->group_start();
                    $this->db->like('test_name', $search);
                    $this->db->or_like('test_code', $search);
                    $this->db->group_end();
                }
                $this->db->limit($limit, $offset);
                $rows = $this->db->get()->result_array();

            }

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Procedure suggestions from hospital masters (non-AI)
     */
    public function getProcedureSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $searchRaw = isset($raw['search']) ? $raw['search'] : '';
            if (is_array($searchRaw)) {
                if (isset($searchRaw['search'])) { $searchRaw = $searchRaw['search']; }
                else { $first = reset($searchRaw); $searchRaw = $first !== false ? $first : ''; }
            }
            $search = trim((string)$searchRaw);
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 8);
            $offset = ($page - 1) * $limit;

            $this->db->select('id, name, description');
            $this->db->from('ms_hospitals_procedure');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Combined treatment suggestions by diagnosis (lab tests + medications) using DB suggestions
     * Route: dc_doctor_getTreatmentSuggestionsByDiagnosis
     * Input: { diagnosis: string }
     * Output: encrypted object { medications: Suggest[], labTests: Suggest[] }
     */
    public function getTreatmentSuggestionsByDiagnosis() { 
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role      = $tokenData['role'] ?? null;
            $loguid    = $tokenData['loguid'] ?? null;
            $doctor_id = $tokenData['id'] ?? null;

            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $raw = json_decode(file_get_contents("php://input"), true);
            $diagnosis = trim($raw['diagnosis'] ?? '');

            // Empty request fallback
            if ($diagnosis === '' || !$doctor_id) {
                $emptyPayload = ['medications' => [], 'labTests' => []];
                $encryptedData = $this->encrypt_aes_for_js(json_encode($emptyPayload), $AES_KEY);
                echo json_encode(["success" => true, "data" => $encryptedData]);
                return;
            }

            // Fetch latest suggestions of this doctor
            $this->db->from('ms_doctor_treatment_suggestion');
            $this->db->where('doctor_id', $doctor_id);
            $this->db->where('isdelete', 0);
            $this->db->order_by('id', 'DESC');
            $rows = $this->db->get()->result_array();

            $matchedLabTests = [];
            $matchedMedications = [];

            foreach ($rows as $row) {

                // Extract diagnosis name
                $diagJson = json_decode($row['diagnosis_json'], true);
                $diagName = trim($diagJson['name'] ?? '');

                // Compare diagnosis (case-insensitive)
                if (strcasecmp($diagName, $diagnosis) === 0) {

                    // RETURN RAW JSON EXACTLY AS STORED IN DATABASE
                    $matchedLabTests    = json_decode($row['lab_tests_json'], true) ?: [];
                    $matchedMedications = json_decode($row['medications_json'], true) ?: [];

                    break; // Only the latest match
                }
            }

            $finalPayload = [
                'medications' => $matchedMedications,
                'labTests'    => $matchedLabTests
            ];

            $encryptedData = $this->encrypt_aes_for_js(json_encode($finalPayload), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "rowData" => $finalPayload
            ]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }


    public function getDemoSuggestionsByDiagnosis() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $AES_KEY = "RohitGaradHos@173414";

            $raw = json_decode(file_get_contents("php://input"), true);
            $diagnosis = isset($raw['diagnosis']) ? trim($raw['diagnosis']) : '';
            
            if ($diagnosis === '') {
                $emptyPayload = ['medications' => [], 'labTests' => []];
                $encryptedData = $this->encrypt_aes_for_js(json_encode($emptyPayload), $AES_KEY);
                echo json_encode(["success" => true, "data" => $encryptedData]);
                return;
            }

            // AI Logic
            $apiKey = getenv('VITE_API_KEY');

            $systemPrompt = 'You are a medical assistant. Respond ONLY with a valid JSON object containing two arrays: "medications" and "labTests". Each item must have "name" and "description". No markdown, no prose.';
            $userPrompt = 'Diagnosis: "' . $diagnosis . '". Suggest 5 medications (include dosage in name) and 5 lab tests. Format: {"medications": [{"name": "Med Name 500mg", "description": "Reason/Instruction"}], "labTests": [{"name": "Test Name", "description": "Reason"}]}';

            $payload = [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt]
                ],
                'temperature' => 0.2,
                'max_tokens' => 800
            ];

            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            $resp = curl_exec($ch);
            
            if ($resp === false) {
                throw new Exception('AI request failed: ' . curl_error($ch));
            }
            curl_close($ch);

            $json = json_decode($resp, true);
            $content = $json['choices'][0]['message']['content'] ?? '';
            
            // Clean content (remove markdown code blocks if present)
            $content = preg_replace('/^```json\s*|\s*```$/', '', trim($content));
            
            $parsed = json_decode($content, true);
            if (!is_array($parsed)) {
                // Fallback empty
                $parsed = ['medications' => [], 'labTests' => []];
            }

            // Ensure structure
            $meds = isset($parsed['medications']) && is_array($parsed['medications']) ? $parsed['medications'] : [];
            $labs = isset($parsed['labTests']) && is_array($parsed['labTests']) ? $parsed['labTests'] : [];

            // Map to standard structure
            $medList = array_map(function($m) {
                return [
                    'id' => 'ai_' . uniqid(),
                    'name' => (string)($m['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($m['description'] ?? ''),
                ];
            }, $meds);

            $labList = array_map(function($l) {
                return [
                    'id' => 'ai_' . uniqid(),
                    'name' => (string)($l['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($l['description'] ?? ''),
                ];
            }, $labs);

            $finalPayload = [
                'medications' => $medList,
                'labTests' => $labList,
            ];

            $encryptedData = $this->encrypt_aes_for_js(json_encode($finalPayload), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData, "rowData" => $finalPayload]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Submit encrypted doctor treatment suggestion (template-like, no patient/appointment binding)
     * Route: dc_doctor_submitTreatmentSuggestion
     * Input fields (AES encrypted):
     * - diagnosis: JSON string of selected diagnosis
     * - labTests: JSON string array of selected lab test names
     * - historyItemIds: JSON string array of selected history item IDs
     * - medications: JSON string array of prescription items
     * - instructions?: string
     * - doctorId?: number (optional for staff; inferred from token for doctors)
     */
    public function submitTreatmentSuggestion() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital and doctor id by role
            $hospital_id = null;
            $doctor_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
                $doctor_id = $doctorInfo['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
                // doctor id may be provided in payload for staff
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            if (!is_array($raw)) { $raw = []; }

            $diagnosisEnc      = $raw['diagnosis'] ?? null;
            $labTestsEnc       = $raw['labTests'] ?? null;
            $historyIdsEnc     = $raw['historyItemIds'] ?? null;
            $medicationsEnc    = $raw['medications'] ?? null;
            $instructionsEnc   = $raw['instructions'] ?? null;
            $doctorIdEnc       = $raw['doctorId'] ?? null; // optional
            
            if (!$medicationsEnc) {
                echo json_encode(["success" => false, "message" => "Missing medications"]);
                return;
            }

            if ($doctor_id === null && $doctorIdEnc) {
                $doctor_id = intval($this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY));
            }

            $diagnosis_json  = $diagnosisEnc ? $this->decrypt_aes_from_js($diagnosisEnc, $AES_KEY) : '';
            $lab_tests_json  = $labTestsEnc ? $this->decrypt_aes_from_js($labTestsEnc, $AES_KEY) : '';
            $history_json    = $historyIdsEnc ? $this->decrypt_aes_from_js($historyIdsEnc, $AES_KEY) : '';
            $medications_json= $medicationsEnc ? $this->decrypt_aes_from_js($medicationsEnc, $AES_KEY) : '';
            $instructions    = $instructionsEnc ? $this->decrypt_aes_from_js($instructionsEnc, $AES_KEY) : '';

            // Basic validation: ensure medications JSON parses
            $medArr = json_decode($medications_json, true);
            if (!is_array($medArr) || count($medArr) === 0) {
                echo json_encode(["success" => false, "message" => "No medications provided"]);
                return;
            }

            // Staff must submit for a valid doctor in same hospital if doctor_id provided
            if ($role === 'staff') {
                if (!$doctor_id) {
                    echo json_encode(["success" => false, "message" => "Missing doctor id for staff submission"]);
                    return;
                }
                // Ensure doctor belongs to same hospital
                $drow = $this->db->select('id, hosuid').from('ms_doctors')->where('id', $doctor_id)->get()->row_array();
                if (!$drow) {
                    echo json_encode(["success" => false, "message" => "Doctor not found"]);
                    return;
                }
                $dhosuid = $drow['hosuid'] ?? null;
                $hosRow2 = $dhosuid ? $this->db->where('hosuid', $dhosuid)->get('ms_hospitals')->row_array() : null;
                $hospital_id2 = $hosRow2['id'] ?? null;
                if (!$hospital_id2 || $hospital_id2 !== $hospital_id) {
                    echo json_encode(["success" => false, "message" => "Doctor does not belong to your hospital"]);
                    return;
                }
            }

            // Prepare insert
            $suggestion_uid = uniqid('DSUG_');
            $now = date('Y-m-d H:i:s');
            $insert = [
                'suggestion_uid'        => $suggestion_uid,
                'hospital_id'           => intval($hospital_id),
                'doctor_id'             => intval($doctor_id ?? 0),
                'diagnosis_json'        => $diagnosis_json,
                'lab_tests_json'        => $lab_tests_json,
                'history_item_ids_json' => $history_json,
                'medications_json'      => $medications_json,
                'instructions'          => $instructions,
                'status'                => 1,
                'isdelete'              => 0,
                'created_by'            => $loguid,
                'updated_by'            => $loguid,
                'created_at'            => $now,
                'updated_at'            => $now,
            ];

            $ok = $this->db->insert('ms_doctor_treatment_suggestion', $insert);
            if ($ok) {
                $payload = json_encode(['suggestion_uid' => $suggestion_uid]);
                $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);
                echo json_encode(["success" => true, "message" => "Suggestion saved successfully", "data" => $encryptedData]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to save suggestion"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * List doctor treatment suggestions (by logged-in doctor or staff-provided doctor)
     * Route: dc_doctor_getTreatmentSuggestions
     * Input (JSON): { page?: number, limit?: number, doctorId?: <AES> }
     * Output: { success: boolean, data: <AES encrypted JSON array of ConsultationSummary> }
     */
    public function getTreatmentSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital and doctor id by role
            $hospital_id = null;
            $doctor_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
                $doctor_id = $doctorInfo['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            if (!is_array($raw)) { $raw = []; }
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : 12;
            $offset = ($page - 1) * $limit;
            $doctorIdEnc = $raw['doctorId'] ?? null; // optional for staff
            if ($role === 'staff' && $doctorIdEnc) {
                $doctor_id = intval($this->decrypt_aes_from_js($doctorIdEnc, $AES_KEY));
                // Ensure doctor belongs to same hospital
                $drow = $this->db->select('id, hosuid').from('ms_doctors')->where('id', $doctor_id)->get()->row_array();
                if (!$drow) { echo json_encode(["success" => false, "message" => "Doctor not found"]); return; }
                $dhosuid = $drow['hosuid'] ?? null;
                $hosRow2 = $dhosuid ? $this->db->where('hosuid', $dhosuid)->get('ms_hospitals')->row_array() : null;
                $hospital_id2 = $hosRow2['id'] ?? null;
                if (!$hospital_id2 || $hospital_id2 !== $hospital_id) {
                    echo json_encode(["success" => false, "message" => "Doctor does not belong to your hospital"]);
                    return;
                }
            }

            // Build query
            $this->db->from('ms_doctor_treatment_suggestion');
            $this->db->where('hospital_id', intval($hospital_id));
            $this->db->where('isdelete', 0);
            if ($doctor_id) { $this->db->where('doctor_id', intval($doctor_id)); }
            $this->db->order_by('created_at', 'DESC');
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $suggestions = [];
            foreach ($rows as $r) {
                $diag = [];
                if (!empty($r['diagnosis_json'])) {
                    $decoded = json_decode($r['diagnosis_json'], true);
                    if (is_array($decoded)) { $diag = $decoded; }
                }
                $labTests = [];
                if (!empty($r['lab_tests_json'])) {
                    $arr = json_decode($r['lab_tests_json'], true);
                    if (is_array($arr)) { $labTests = array_values(array_map('strval', $arr)); }
                }
                $historyIds = [];
                if (!empty($r['history_item_ids_json'])) {
                    $arr = json_decode($r['history_item_ids_json'], true);
                    if (is_array($arr)) { $historyIds = array_values(array_map('intval', $arr)); }
                }

                // Resolve history item names from hospital master, if available
                $historyNames = [];
                if (!empty($historyIds)) {
                    $this->db->select('id, name');
                    $this->db->from('ms_hospital_patient_history_master');
                    $this->db->where('hospital_id', intval($hospital_id));
                    $this->db->where_in('id', $historyIds);
                    $this->db->where('isdelete', 0);
                    $histRows = $this->db->get()->result_array();
                    foreach ($histRows as $hr) {
                        $historyNames[] = (string)($hr['name'] ?? ('ID:' . $hr['id']));
                    }
                }

                $medications = [];
                if (!empty($r['medications_json'])) {
                    $arr = json_decode($r['medications_json'], true);
                    if (is_array($arr)) {
                        foreach ($arr as $m) {
                            $medications[] = [
                                'name' => (string)($m['name'] ?? ''),
                                'dosage' => (string)($m['dosage'] ?? ''),
                                'frequency' => (string)($m['frequency'] ?? ''),
                                'duration' => (string)($m['duration'] ?? ''),
                            ];
                        }
                    }
                }

                $createdOn = (string)($r['created_at'] ?? '');

                $suggestions[] = [
                    'id' => (string)($r['suggestion_uid'] ?? ''),
                    'diagnosis' => (string)($diag['name'] ?? ($diag['diagnosis'] ?? '')),
                    'diagnosisCode' => (string)($diag['icd10'] ?? ($diag['code'] ?? '')),
                    'labTests' => $labTests,
                    'patientHistory' => $historyNames,
                    'prescription' => $medications,
                    'createdOn' => $createdOn,
                    'patientName' => '',
                ];
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($suggestions), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData, "page" => $page, "limit" => $limit]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Fetch detailed suggestion by suggestion_uid
     * Input: { suggestionUid: <AES> }
     * Output: { success, data: <AES JSON: { suggestionUid, diagnosis, labTests, historyItemIds, medications, instructions } > }
     */
    public function getTreatmentSuggestionDetail() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        $AES_KEY = "RohitGaradHos@173414";
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            // Resolve hospital and doctor
            $hospital_id = null; $doctor_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
                $doctor_id = $doctorInfo['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }
            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $sugEnc = $raw['suggestionUid'] ?? null;
            if (!$sugEnc) { echo json_encode(["success" => false, "message" => "Missing suggestionUid"]); return; }
            $suggestion_uid = $this->decrypt_aes_from_js($sugEnc, $AES_KEY);

            $this->db->from('ms_doctor_treatment_suggestion');
            $this->db->where('hospital_id', intval($hospital_id));
            $this->db->where('suggestion_uid', $suggestion_uid);
            $this->db->where('isdelete', 0);
            if ($doctor_id) { $this->db->where('doctor_id', intval($doctor_id)); }
            $row = $this->db->get()->row_array();
            if (!$row) { echo json_encode(["success" => false, "message" => "Suggestion not found"]); return; }

            $out = [
                'suggestionUid' => $row['suggestion_uid'] ?? '',
                'diagnosis' => (!empty($row['diagnosis_json']) ? json_decode($row['diagnosis_json'], true) : (object)[]),
                'labTests' => (!empty($row['lab_tests_json']) ? json_decode($row['lab_tests_json'], true) : []),
                'historyItemIds' => (!empty($row['history_item_ids_json']) ? json_decode($row['history_item_ids_json'], true) : []),
                'medications' => (!empty($row['medications_json']) ? json_decode($row['medications_json'], true) : []),
                'instructions' => (string)($row['instructions'] ?? ''),
                'doctorId' => intval($row['doctor_id'] ?? 0),
            ];
            $enc = $this->encrypt_aes_for_js(json_encode($out), $AES_KEY);
            echo json_encode(["success" => true, "data" => $enc]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Update existing suggestion
     * Input: { suggestionUid:<AES>, diagnosis:<AES JSON>, labTests:<AES JSON>, historyItemIds:<AES JSON>, medications:<AES JSON>, instructions:<AES> }
     * Output: { success, message }
     */
    public function updateTreatmentSuggestion() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        $AES_KEY = "RohitGaradHos@173414";
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            // Resolve hospital/doctor
            $hospital_id = null; $doctor_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
                $doctor_id = $doctorInfo['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }
            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            if (!is_array($raw)) { $raw = []; }
            $sugEnc = $raw['suggestionUid'] ?? null;
            if (!$sugEnc) { echo json_encode(["success" => false, "message" => "Missing suggestionUid"]); return; }
            $suggestion_uid = $this->decrypt_aes_from_js($sugEnc, $AES_KEY);

            $diagnosisJson = $raw['diagnosis'] ?? null;
            $labTestsJson = $raw['labTests'] ?? null;
            $historyItemIdsJson = $raw['historyItemIds'] ?? null;
            $medicationsJson = $raw['medications'] ?? null;
            $instructionsEnc = $raw['instructions'] ?? null;

            $diagnosisDec = $diagnosisJson ? json_decode($this->decrypt_aes_from_js($diagnosisJson, $AES_KEY), true) : [];
            $labTestsDec = $labTestsJson ? json_decode($this->decrypt_aes_from_js($labTestsJson, $AES_KEY), true) : [];
            $historyIdsDec = $historyItemIdsJson ? json_decode($this->decrypt_aes_from_js($historyItemIdsJson, $AES_KEY), true) : [];
            $medicationsDec = $medicationsJson ? json_decode($this->decrypt_aes_from_js($medicationsJson, $AES_KEY), true) : [];
            $instructionsDec = $instructionsEnc ? $this->decrypt_aes_from_js($instructionsEnc, $AES_KEY) : '';

            if (!is_array($medicationsDec) || count($medicationsDec) === 0) {
                echo json_encode(["success" => false, "message" => "At least one medication is required"]);
                return;
            }

            // Fetch and authorize existing row
            $this->db->from('ms_doctor_treatment_suggestion');
            $this->db->where('hospital_id', intval($hospital_id));
            $this->db->where('suggestion_uid', $suggestion_uid);
            $this->db->where('isdelete', 0);
            $row = $this->db->get()->row_array();
            if (!$row) { echo json_encode(["success" => false, "message" => "Suggestion not found"]); return; }
            if ($role === 'doctor' && intval($row['doctor_id'] ?? 0) !== intval($doctor_id)) {
                echo json_encode(["success" => false, "message" => "You cannot edit another doctor's suggestion"]);
                return;
            }

            $updateData = [
                'diagnosis_json' => json_encode($diagnosisDec ?? []),
                'lab_tests_json' => json_encode($labTestsDec ?? []),
                'history_item_ids_json' => json_encode($historyIdsDec ?? []),
                'medications_json' => json_encode($medicationsDec ?? []),
                'instructions' => $instructionsDec,
                'updated_at' => date('Y-m-d H:i:s'),
            ];
            $this->db->where('id', intval($row['id']));
            $ok = $this->db->update('ms_doctor_treatment_suggestion', $updateData);
            if (!$ok) { echo json_encode(["success" => false, "message" => "Failed to update suggestion"]); return; }

            echo json_encode(["success" => true, "message" => "Suggestion updated successfully"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Patient History Categories (grouped items)
     * Temporary dynamic source until hospital masters are introduced.
     * Output: { success: boolean, data: <AES encrypted JSON array> }
     * Each item: { id, name, icon, items: [{ id, name, description }] }
     */
    public function getPatientHistoryCategories() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id by role (kept for future DB-backed categories)
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            // Load patient history categories dynamically from hospital master
            $this->db->from('ms_hospital_patient_history_master');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            $rows = $this->db->get()->result_array();

            $grouped = [];
            foreach ($rows as $r) {
                $catName = isset($r['category']) ? (string)$r['category'] : (isset($r['category_name']) ? (string)$r['category_name'] : (isset($r['cat_name']) ? (string)$r['cat_name'] : 'General'));
                $catKey = strtolower(preg_replace('/\s+/', '_', $catName));
                if (!isset($grouped[$catKey])) {
                    $grouped[$catKey] = [
                        'id' => $catKey,
                        'name' => $catName,
                        'icon' => isset($r['icon']) ? (string)$r['icon'] : '🗒️',
                        'items' => [],
                    ];
                }
                $grouped[$catKey]['items'][] = [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ($r['item_name'] ?? '')),
                    'description' => (string)($r['description'] ?? ($r['details'] ?? '')),
                ];
            }

            // Fallback if master table has no data
            $categories = array_values($grouped);
            if (count($categories) === 0) {
                $categories = [
                    [ 'id' => 'vital_signs', 'name' => 'Vital Signs', 'icon' => '📊', 'items' => [] ],
                    [ 'id' => 'chronic_conditions', 'name' => 'Chronic Conditions', 'icon' => '🏥', 'items' => [] ],
                    [ 'id' => 'cardiac', 'name' => 'Cardiac', 'icon' => '❤️', 'items' => [] ],
                ];
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($categories), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Common Complaints (Purpose of Visit) grouped by category
     * Table: ms_hospital_common_complaints_master
     * Input (JSON): {}
     * Output: { success: boolean, data: <AES encrypted JSON array> }
     * Each group: { category, items: [{ id, name, description }] }
     */
    public function getCommonComplaintsGrouped() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id by role
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                // staff
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            // Fetch complaints, prefer current hospital; allow global rows where hospital_id=0
            $this->db->select('id, name, description, category');
            $this->db->from('ms_hospital_common_complaints_master');
            $this->db->group_start();
            $this->db->where('hospital_id', $hospital_id);
            $this->db->or_where('hospital_id', 0);
            $this->db->group_end();
            $this->db->where('isdelete', 0);
            $this->db->order_by('category', 'ASC');
            $this->db->order_by('name', 'ASC');
            $rows = $this->db->get()->result_array();

            $grouped = [];
            foreach ($rows as $r) {
                $catName = isset($r['category']) ? (string)$r['category'] : 'General';
                if (!isset($grouped[$catName])) {
                    $grouped[$catName] = [
                        'category' => $catName,
                        'items' => []
                    ];
                }
                $grouped[$catName]['items'][] = [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'description' => (string)($r['description'] ?? ''),
                ];
            }

            // Convert assoc to indexed array, filter empties
            $out = array_values(array_filter($grouped, function($g){
                return isset($g['items']) && is_array($g['items']) && count($g['items']) > 0;
            }));

            $encryptedData = $this->encrypt_aes_for_js(json_encode($out), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Medication Unit suggestions from hospital masters (non-AI)
     */
    public function getMedicationUnitSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Resolve hospital id by role
            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = trim((string)($raw['search'] ?? ''));
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 20);
            $offset = ($page - 1) * $limit;

            $this->db->select('id, name, description');
            $this->db->from('ms_hospitals_medication_unit');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Medication Frequency suggestions from hospital masters (non-AI)
     */
    public function getMedicationFrequencySuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = trim((string)($raw['search'] ?? ''));
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 20);
            $offset = ($page - 1) * $limit;

            $this->db->select('id, name, description');
            $this->db->from('ms_hospitals_medication_frequency');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * Medication Duration suggestions from hospital masters (non-AI)
     */
    public function getMedicationDurationSuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $hospital_id = null;
            if ($role === 'doctor') {
                $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
                if (!$doctorInfo) throw new Exception('Invalid doctor user');
                $hosuid = $doctorInfo['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            } else {
                $staffRow = $this->db->where('staff_uid', $loguid)->get('ms_staff')->row_array();
                $hosuid = $staffRow['hosuid'] ?? null;
                if (!$hosuid) throw new Exception('Hospital not linked');
                $hosRow = $this->db->where('hosuid', $hosuid)->get('ms_hospitals')->row_array();
                $hospital_id = $hosRow['id'] ?? null;
            }

            if (!$hospital_id) throw new Exception('Hospital information not found');

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = trim((string)($raw['search'] ?? ''));
            $page = isset($raw['page']) ? max(1, intval($raw['page'])) : 1;
            $limit = isset($raw['limit']) ? max(1, intval($raw['limit'])) : (isset($raw['max']) ? max(1, intval($raw['max'])) : 20);
            $offset = ($page - 1) * $limit;

            $this->db->select('id, name, description');
            $this->db->from('ms_hospitals_medication_duration');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('name', $search);
                $this->db->or_like('description', $search);
                $this->db->group_end();
            }
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                return [
                    'id' => (string)($r['id'] ?? ''),
                    'name' => (string)($r['name'] ?? ''),
                    'code' => '',
                    'description' => (string)($r['description'] ?? ''),
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * AI Medication suggestions using ChatGPT API.
     * Input: { search: string }
     * Output: encrypted array of { name, code?, description, isAI: true }
     */
    public function getMedicationAISuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $raw = json_decode(file_get_contents("php://input"), true);
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            if ($search === '') throw new Exception('Search query is required');

            // API key resolution
            $apiKey = getenv('CHATGPT_API_KEY');
            if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_OPENAI_API_KEY'); }
            if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_API_KEY'); }
            if (!$apiKey || strlen($apiKey) < 10) {
                // $apiKey = 'YOUR_OPENAI_API_KEY';
                throw new Exception('OpenAI API Key not configured');
            }

            $payload = [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [ 'role' => 'system', 'content' => 'Respond ONLY with valid JSON array of {name, code, description}. No extra text.' ],
                    [ 'role' => 'user', 'content' => 'Medication query: "' . $search . '". Suggest up to 10 medications with dosage (as code) and a brief instruction in description.' ]
                ],
                'temperature' => 0.2,
                'max_tokens' => 500
            ];

            // Retry and fallback
            $resp = null; $status = 0; $attempts = 0; $maxAttempts = 2;
            while ($attempts < $maxAttempts) {
                $ch = curl_init('https://api.openai.com/v1/chat/completions');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $apiKey ]);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
                $resp = curl_exec($ch);
                if ($resp === false) { $err = curl_error($ch); curl_close($ch); throw new Exception('AI request failed: ' . $err); }
                $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($status === 429) { usleep(600000); $attempts++; continue; }
                break;
            }
            if ($status < 200 || $status >= 300) {
                $responsesPayload = [ 'model' => 'gpt-4o-mini', 'input' => 'Return ONLY JSON array of up to 10 {name, code, description} medications for: "' . $search . '"', 'temperature' => 0.2, 'max_output_tokens' => 400 ];
                $ch = curl_init('https://api.openai.com/v1/responses');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $apiKey ]);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($responsesPayload));
                $resp = curl_exec($ch);
                if ($resp === false) { $err = curl_error($ch); curl_close($ch); throw new Exception('AI request (fallback) failed: ' . $err); }
                $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($status < 200 || $status >= 300) { throw new Exception('AI request returned status ' . $status); }
            }

            $json = json_decode($resp, true);
            $text = $json['choices'][0]['message']['content'] ?? ($json['output_text'] ?? '');

            $items = []; $parsed = null;
            if (is_string($text)) {
                $parsed = json_decode($text, true);
                if (!is_array($parsed)) {
                    $start = strpos($text, '['); $end = strrpos($text, ']');
                    if ($start !== false && $end !== false && $end > $start) { $candidate = substr($text, $start, $end - $start + 1); $parsed = json_decode($candidate, true); }
                }
            }
            if (is_array($parsed)) { $items = $parsed; }
            else {
                $lines = preg_split('/\r?\n/', trim((string)$text));
                foreach ($lines as $line) { $line = trim($line); if ($line !== '') { $parts = explode(' - ', $line); $items[] = ['name' => $parts[0] ?? $line, 'code' => $parts[1] ?? '', 'description' => $line]; } }
            }
            if (is_array($items)) { $items = array_slice($items, 0, 10); }

            $list = array_map(function($r){ return [ 'id' => '', 'name' => (string)($r['name'] ?? ''), 'code' => (string)($r['code'] ?? ''), 'description' => (string)($r['description'] ?? ''), 'isAI' => true ]; }, $items);
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    }

    /**
     * AI Lab Test suggestions using ChatGPT API.
     */
    public function getLabTestAISuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null; $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) { echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]); return; }
            $AES_KEY = "RohitGaradHos@173414";
            $raw = json_decode(file_get_contents("php://input"), true);
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            if ($search === '') throw new Exception('Search query is required');

            $apiKey = getenv('CHATGPT_API_KEY'); if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_OPENAI_API_KEY'); }
            if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_API_KEY'); }
            if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_API_KEY'); }

            $payload = [ 'model' => 'gpt-4o-mini', 'messages' => [ [ 'role' => 'system', 'content' => 'Respond ONLY with valid JSON array of {name, code, description}. No extra text.' ], [ 'role' => 'user', 'content' => 'Lab test query: "' . $search . '". Suggest up to 10 lab tests with codes (LOINC if known) and short indication in description.' ] ], 'temperature' => 0.2, 'max_tokens' => 500 ];

            $resp = null; $status = 0; $attempts = 0; $maxAttempts = 2;
            while ($attempts < $maxAttempts) { $ch = curl_init('https://api.openai.com/v1/chat/completions'); curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $apiKey ]); curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload)); $resp = curl_exec($ch); if ($resp === false) { $err = curl_error($ch); curl_close($ch); throw new Exception('AI request failed: ' . $err); } $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch); if ($status === 429) { usleep(600000); $attempts++; continue; } break; }
            if ($status < 200 || $status >= 300) { $responsesPayload = [ 'model' => 'gpt-4o-mini', 'input' => 'Return ONLY JSON array of up to 10 {name, code, description} lab tests for: "' . $search . '"', 'temperature' => 0.2, 'max_output_tokens' => 400 ]; $ch = curl_init('https://api.openai.com/v1/responses'); curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $apiKey ]); curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($responsesPayload)); $resp = curl_exec($ch); if ($resp === false) { $err = curl_error($ch); curl_close($ch); throw new Exception('AI request (fallback) failed: ' . $err); } $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch); if ($status < 200 || $status >= 300) { throw new Exception('AI request returned status ' . $status); } }

            $json = json_decode($resp, true); $text = $json['choices'][0]['message']['content'] ?? ($json['output_text'] ?? '');
            $items = []; $parsed = json_decode($text, true);
            if (!is_array($parsed)) { $start = strpos($text, '['); $end = strrpos($text, ']'); if ($start !== false && $end !== false && $end > $start) { $candidate = substr($text, $start, $end - $start + 1); $parsed = json_decode($candidate, true); } }
            if (is_array($parsed)) { $items = $parsed; } else { $lines = preg_split('/\r?\n/', trim((string)$text)); foreach ($lines as $line) { $line = trim($line); if ($line !== '') { $parts = explode(' - ', $line); $items[] = ['name' => $parts[0] ?? $line, 'code' => $parts[1] ?? '', 'description' => $line]; } } }
            if (is_array($items)) { $items = array_slice($items, 0, 10); }
            $list = array_map(function($r){ return [ 'id' => '', 'name' => (string)($r['name'] ?? ''), 'code' => (string)($r['code'] ?? ''), 'description' => (string)($r['description'] ?? ''), 'isAI' => true ]; }, $items);
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY); echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) { echo json_encode(["success" => false, "message" => $e->getMessage()]); }
    }

    /**
     * AI Procedure suggestions using ChatGPT API.
     */
    public function getProcedureAISuggestions() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null; $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid || !in_array($role, ['doctor','staff'], true)) { echo json_encode(["success" => false, "message" => "Invalid user token or insufficient privileges"]); return; }
            $AES_KEY = "RohitGaradHos@173414";
            $raw = json_decode(file_get_contents("php://input"), true);
            $search = isset($raw['search']) ? trim($raw['search']) : '';
            if ($search === '') throw new Exception('Search query is required');

            $apiKey = getenv('CHATGPT_API_KEY'); if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_OPENAI_API_KEY'); }
            if (!$apiKey || strlen($apiKey) < 10) { $apiKey = getenv('VITE_API_KEY'); }
            if (!$apiKey || strlen($apiKey) < 10) { 
                // $apiKey = 'YOUR_OPENAI_API_KEY';
                throw new Exception('OpenAI API Key not configured');
            }

            $payload = [ 'model' => 'gpt-4o-mini', 'messages' => [ [ 'role' => 'system', 'content' => 'Respond ONLY with valid JSON array of {name, code, description}. No extra text.' ], [ 'role' => 'user', 'content' => 'Procedure query: "' . $search . '". Suggest up to 10 common procedures with codes (CPT if known) and short description.' ] ], 'temperature' => 0.2, 'max_tokens' => 500 ];

            $resp = null; $status = 0; $attempts = 0; $maxAttempts = 2;
            while ($attempts < $maxAttempts) { $ch = curl_init('https://api.openai.com/v1/chat/completions'); curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $apiKey ]); curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload)); $resp = curl_exec($ch); if ($resp === false) { $err = curl_error($ch); curl_close($ch); throw new Exception('AI request failed: ' . $err); } $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch); if ($status === 429) { usleep(600000); $attempts++; continue; } break; }
            if ($status < 200 || $status >= 300) { $responsesPayload = [ 'model' => 'gpt-4o-mini', 'input' => 'Return ONLY JSON array of up to 10 {name, code, description} procedures for: "' . $search . '"', 'temperature' => 0.2, 'max_output_tokens' => 400 ]; $ch = curl_init('https://api.openai.com/v1/responses'); curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); curl_setopt($ch, CURLOPT_HTTPHEADER, [ 'Content-Type: application/json', 'Authorization: Bearer ' . $apiKey ]); curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($responsesPayload)); $resp = curl_exec($ch); if ($resp === false) { $err = curl_error($ch); curl_close($ch); throw new Exception('AI request (fallback) failed: ' . $err); } $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch); if ($status < 200 || $status >= 300) { throw new Exception('AI request returned status ' . $status); } }

            $json = json_decode($resp, true); $text = $json['choices'][0]['message']['content'] ?? ($json['output_text'] ?? '');
            $items = []; $parsed = json_decode($text, true);
            if (!is_array($parsed)) { $start = strpos($text, '['); $end = strrpos($text, ']'); if ($start !== false && $end !== false && $end > $start) { $candidate = substr($text, $start, $end - $start + 1); $parsed = json_decode($candidate, true); } }
            if (is_array($parsed)) { $items = $parsed; } else { $lines = preg_split('/\r?\n/', trim((string)$text)); foreach ($lines as $line) { $line = trim($line); if ($line !== '') { $parts = explode(' - ', $line); $items[] = ['name' => $parts[0] ?? $line, 'code' => $parts[1] ?? '', 'description' => $line]; } } }
            if (is_array($items)) { $items = array_slice($items, 0, 10); }
            $list = array_map(function($r){ return [ 'id' => '', 'name' => (string)($r['name'] ?? ''), 'code' => (string)($r['code'] ?? ''), 'description' => (string)($r['description'] ?? ''), 'isAI' => true ]; }, $items);
            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY); echo json_encode(["success" => true, "data" => $encryptedData]);
        } catch (Exception $e) { echo json_encode(["success" => false, "message" => $e->getMessage()]); }
    }

    public function getMyEventSchedule() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $role !== "doctor") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid doctor user"
                ]);
                return;
            }

            $hosuid = $doctorInfo['hosuid'];
            $doctorId = $doctorInfo['docuid'];

            $eventTypes = $this->db->where('hosuid', $hosuid)
                                   ->get('ms_hospitals_event_type')
                                   ->result_array();
            $eventTypeMap = [];
            foreach ($eventTypes as $et) {
                $eventTypeMap[$et['eventuid']] = [
                    'name' => $et['name'],
                    'color' => $et['color']
                ];
            }

            $masterSchedules = $this->db
                ->where('docuid', $doctorId)
                ->get('ms_doctor_schedules')
                ->result_array();

            $masterData = [];
            foreach ($masterSchedules as $sched) {
                $slots = $this->db
                    ->where('schedule_id', $sched['id'])
                    ->get('ms_doctor_time_slots')
                    ->result_array();

                $masterData[$sched['weekday']] = [
                    'weekday' => $sched['weekday'],
                    'is_available' => (int)$sched['is_available'],
                    'slots' => array_map(function ($s) use ($eventTypeMap) {
                        $etype = $eventTypeMap[$s['type']] ?? ['name' => '', 'color' => '#ccc'];
                        return [
                            'title' => $s['title'],
                            'type' => $s['type'],
                            'type_name' => $etype['name'],
                            'type_color' => $etype['color'],
                            'notes' => $s['notes'],
                            'start_time' => $s['start_time'],
                            'end_time' => $s['end_time'],
                            'max_appointments' => $s['max_appointments']
                        ];
                    }, $slots)
                ];
            }

            $startDate = date('Y-m-01');
            $endDate = date('Y-m-t', strtotime('+2 months'));

            $eventSchedules = $this->db
                ->where('docuid', $doctorId)
                ->where('date >=', $startDate)
                ->where('date <=', $endDate)
                ->get('ms_doctor_event_schedules')
                ->result_array();

            $eventData = [];
            foreach ($eventSchedules as $event) {
                $eventSlots = $this->db
                    ->where('event_id', $event['id'])
                    ->get('ms_doctor_event_slots')
                    ->result_array();

                $eventData[$event['date']] = [
                    'date' => $event['date'],
                    'is_available' => (int)$event['is_available'],
                    'slots' => array_map(function ($s) use ($eventTypeMap) {
                        $etype = $eventTypeMap[$s['type']] ?? ['name' => '', 'color' => '#ccc'];
                        return [
                            'title' => $s['title'],
                            'type' => $s['type'],
                            'type_name' => $etype['name'],
                            'type_color' => $etype['color'],
                            'notes' => $s['notes'],
                            'start_time' => $s['start_time'],
                            'end_time' => $s['end_time'],
                            'max_appointments' => $s['max_appointments']
                        ];
                    }, $eventSlots)
                ];
            }

            $finalData = [];
            $period = new DatePeriod(
                new DateTime($startDate),
                new DateInterval('P1D'),
                (new DateTime($endDate))->modify('+1 day')
            );

            foreach ($period as $dateObj) {
                $date = $dateObj->format('Y-m-d');
                $weekday = $dateObj->format('D');

                if (isset($eventData[$date])) {
                    $finalData[] = [
                        'date' => $date,
                        'weekday' => $weekday,
                        'is_available' => $eventData[$date]['is_available'],
                        'slots' => $eventData[$date]['slots'],
                        'source' => 'event'
                    ];
                } else {
                    $finalData[] = [
                        'date' => $date,
                        'weekday' => $weekday,
                        'is_available' => $masterData[$weekday]['is_available'] ?? 0,
                        'slots' => $masterData[$weekday]['slots'] ?? [],
                        'source' => 'master'
                    ];
                }
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($finalData), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData,
                "rowData" => $finalData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }

    public function getMyAppointmentsByDate(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $role !== "doctor") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            $dateEnc     = $body['date'] ?? null;
            if (!$dateEnc) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing date"
                ]);
                return;
            }

            $date     = $this->decrypt_aes_from_js($dateEnc, $AES_KEY);

            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid doctor user"
                ]);
                return;
            }

            $doctorId = $doctorInfo['id'];

            $this->db
                ->select('a.id, a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no, a.start_time, a.end_time, a.status, a.queue_position, a.arrival_time, a.consultation_start_time, a.completed_time, a.created_at, a.updated_at, a.patient_name, a.phone, p.fname, p.lname')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date', $date)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false);

            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                $statusRaw = isset($r['status']) ? strtolower(trim($r['status'])) : 'booked';
                if ($statusRaw === 'in-consultation') {
                    $status = 'active';
                } elseif (in_array($statusRaw, ['booked','arrived','waiting','active','completed', 'draft'])) {
                    $status = $statusRaw;
                } else {
                    $status = 'booked';
                }

                $patientName = trim(($r['fname'] ?? '') . ' ' . ($r['lname'] ?? ''));
                if ($patientName === '') {
                    $patientName = $r['patient_name'] ?? '';
                }

                return [
                    'id' => (string)$r['id'], // Use auto-increment ID for backend operations
                    'appointment_uid' => (string)$r['appointment_uid'], // Keep UID if needed for display
                    'tokenNumber' => (int)($r['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($r['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($r['phone'] ?? ''),
                        'age' => 0
                    ],
                    'doctor' => [ 'id' => (string)($r['doctor_id'] ?? '') ],
                    'date' => $r['date'],
                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $r['start_time'] ?? '',
                        'endTime' => $r['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0
                    ],
                    'status' => $status,
                    'queuePosition' => (int)($r['queue_position'] ?? 0),
                    'arrivalTime' => (string)($r['arrival_time'] ?? ''),
                    'consultationStartTime' => (string)($r['consultation_start_time'] ?? ''),
                    'completedTime' => (string)($r['completed_time'] ?? '')
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Authorization failed: ' . $e->getMessage()
            ]);
        }
    }




    /*public function getMyTodaysAppointmentsGrouped(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $role !== "doctor") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $json = file_get_contents("php://input");
            $body = json_decode($json, true);

            // Optional encrypted date; defaults to today if not provided
            $dateEnc = $body['date'] ?? null;
            $date = $dateEnc ? $this->decrypt_aes_from_js($dateEnc, $AES_KEY) : date('Y-m-d');

            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid doctor user"
                ]);
                return;
            }

            $doctorId = $doctorInfo['id'];

            $this->db
                ->select('a.id, a.appointment_uid, a.patient_id, a.doctor_id, a.date, a.token_no, a.start_time, a.end_time, a.status, a.queue_position, a.arrival_time, a.consultation_start_time, a.completed_time, a.patient_name, a.phone, p.fname, p.lname')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date', $date)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false);

            $rows = $this->db->get()->result_array();

            $mapRow = function($r) {
                $statusRaw = isset($r['status']) ? strtolower(trim($r['status'])) : 'booked';
                if ($statusRaw === 'in-consultation') {
                    $status = 'active';
                } elseif (in_array($statusRaw, ['booked','arrived','waiting','active','completed'])) {
                    $status = $statusRaw;
                } else {
                    $status = 'booked';
                }

                $patientName = trim(($r['fname'] ?? '') . ' ' . ($r['lname'] ?? ''));
                if ($patientName === '') {
                    $patientName = $r['patient_name'] ?? '';
                }

                // Compute a single statusTime field for UI based on current status
                $statusTime = '';
                switch ($status) {
                    case 'booked':
                        $statusTime = (string)($r['created_at'] ?? '');
                        break;
                    case 'arrived':
                        $statusTime = (string)($r['arrival_time'] ?? '');
                        break;
                    case 'waiting':
                        // Prefer last update time when moved to waiting; fallback to arrival_time
                        $statusTime = (string)($r['updated_at'] ?? ($r['arrival_time'] ?? ''));
                        break;
                    case 'active':
                        $statusTime = (string)($r['consultation_start_time'] ?? '');
                        break;
                    case 'completed':
                        $statusTime = (string)($r['completed_time'] ?? '');
                        break;

                    case 'draft':
                        $statusTime = (string)($r['updated_at'] ?? '');
                        break;
                }

                return [
                    'id' => (string)$r['appointment_uid'],
                    'tokenNumber' => (int)($r['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($r['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($r['phone'] ?? ''),
                        'age' => 0
                    ],
                    'doctor' => [ 'id' => (string)($r['doctor_id'] ?? '') ],
                    'date' => $r['date'],
                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $r['start_time'] ?? '',
                        'endTime' => $r['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0
                    ],
                    'status' => $status,
                    'queuePosition' => (int)($r['queue_position'] ?? 0),
                    'arrivalTime' => (string)($r['arrival_time'] ?? ''),
                    'consultationStartTime' => (string)($r['consultation_start_time'] ?? ''),
                    'completedTime' => (string)($r['completed_time'] ?? ''),
                    'statusTime' => $statusTime
                ];
            };

            $grouped = [
                'active' => [],
                'waiting' => [],
                'arrived' => [],
                'booked' => [],
                'completed' => []
            ];

            foreach ($rows as $r) {
                $item = $mapRow($r);
                $st = $item['status'];
                if (isset($grouped[$st])) {
                    $grouped[$st][] = $item;
                } else {
                    // Unknown -> bucket to booked
                    $grouped['booked'][] = $item;
                }
            }

            // Sort each group by token number ascending
            foreach (['active','waiting','arrived','booked','completed'] as $key) {
                usort($grouped[$key], function($a, $b){
                    return ($a['tokenNumber'] ?? 0) <=> ($b['tokenNumber'] ?? 0);
                });
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($grouped), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                'rowData' => $grouped
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Authorization failed: ' . $e->getMessage()
            ]);
        }
    }*/

    public function getMyTodaysAppointmentsGrouped() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $role !== "doctor") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // AES KEY
            $AES_KEY = "RohitGaradHos@173414";

            $body = json_decode(file_get_contents("php://input"), true);
            $dateEnc = $body['date'] ?? null;
            $date = $dateEnc ? $this->decrypt_aes_from_js($dateEnc, $AES_KEY) : date('Y-m-d');

            // Doctor info
            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid doctor user"
                ]);
                return;
            }

            $doctorId = $doctorInfo['id'];

            // ---------------------------------------------
            // FIXED: added created_at and updated_at fields!
            // ---------------------------------------------
            $this->db
                ->select('
                    a.id,
                    a.appointment_uid,
                    a.patient_id,
                    a.doctor_id,
                    a.date,
                    a.token_no,
                    a.start_time,
                    a.end_time,
                    a.status,
                    a.queue_position,
                    a.arrival_time,
                    a.consultation_start_time,
                    a.completed_time,
                    a.created_at,
                    a.updated_at,
                    a.patient_name,
                    a.phone,
                    p.fname,
                    p.lname
                ')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date', $date)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false);

            $rows = $this->db->get()->result_array();

            // Map each row
            $mapRow = function($r) {
                $statusRaw = isset($r['status']) ? strtolower(trim($r['status'])) : 'booked';

                if ($statusRaw === 'in-consultation') {
                    $status = 'active';
                } elseif (in_array($statusRaw,
                    ['booked','arrived','waiting','active','completed','draft'])) {
                    $status = $statusRaw;
                } else {
                    $status = 'booked';
                }

                // Patient name
                $patientName = trim(($r['fname'] ?? '') . ' ' . ($r['lname'] ?? ''));
                if ($patientName === '') {
                    $patientName = $r['patient_name'] ?? '';
                }

                // Compute statusTime (fixed!)
                $statusTime = '';
                switch ($status) {
                    case 'booked':
                        $statusTime = (string)($r['created_at'] ?? '');
                        break;

                    case 'arrived':
                        $statusTime = (string)($r['arrival_time'] ?? '');
                        break;

                    case 'waiting':
                        $statusTime = (string)($r['updated_at'] ?? ($r['arrival_time'] ?? ''));
                        break;

                    case 'active':
                        $statusTime = (string)($r['consultation_start_time'] ?? '');
                        break;

                    case 'completed':
                        $statusTime = (string)($r['completed_time'] ?? '');
                        break;
                }

                return [
                    'id' => (string)$r['appointment_uid'],
                    'tokenNumber' => (int)($r['token_no'] ?? 0),

                    'patient' => [
                        'id' => (string)($r['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($r['phone'] ?? ''),
                        'age' => 0
                    ],

                    'doctor' => [
                        'id' => (string)($r['doctor_id'] ?? '')
                    ],

                    'date' => $r['date'],

                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $r['start_time'] ?? '',
                        'endTime' => $r['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0
                    ],

                    'status' => $status,
                    'queuePosition' => (int)($r['queue_position'] ?? 0),
                    'arrivalTime' => (string)($r['arrival_time'] ?? ''),
                    'consultationStartTime' => (string)($r['consultation_start_time'] ?? ''),
                    'completedTime' => (string)($r['completed_time'] ?? ''),
                    'statusTime' => $statusTime
                ];
            };

            // Grouping
            $grouped = [
                'active' => [],
                'waiting' => [],
                'arrived' => [],
                'booked' => [],
                'completed' => []
            ];

            foreach ($rows as $r) {
                $item = $mapRow($r);
                $st = $item['status'];
                if (isset($grouped[$st])) {
                    $grouped[$st][] = $item;
                } else {
                    $grouped['booked'][] = $item;
                }
            }

            // Sorting
            foreach (['active','waiting','arrived','booked','completed'] as $key) {
                usort($grouped[$key], function($a, $b){
                    return ($a['tokenNumber'] ?? 0) <=> ($b['tokenNumber'] ?? 0);
                });
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($grouped), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                'rowData' => $grouped
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Authorization failed: ' . $e->getMessage()
            ]);
        }
    }

    public function getMyUpcomingAppointments() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $role = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || $role !== "doctor") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Doctor info
            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if (!$doctorInfo) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid doctor user"
                ]);
                return;
            }

            $doctorId = $doctorInfo['id'];
            $today = date('Y-m-d');

            // Optional limit days via encrypted payload
            $body = json_decode(file_get_contents("php://input"), true);
            $limitDaysEnc = $body['limitDays'] ?? null;
            $limitDays = 30; // default 30 days
            if ($limitDaysEnc) {
                try {
                    $dec = intval($this->decrypt_aes_from_js($limitDaysEnc, $AES_KEY));
                    if ($dec > 0 && $dec <= 180) { $limitDays = $dec; }
                } catch (Exception $e) { /* ignore, use default */ }
            }
            $endDate = date('Y-m-d', strtotime("+{$limitDays} days"));

            $this->db
                ->select('
                    a.id,
                    a.appointment_uid,
                    a.patient_id,
                    a.doctor_id,
                    a.date,
                    a.token_no,
                    a.start_time,
                    a.end_time,
                    a.status,
                    a.queue_position,
                    a.arrival_time,
                    a.consultation_start_time,
                    a.completed_time,
                    a.created_at,
                    a.updated_at,
                    a.patient_name,
                    a.phone,
                    p.fname,
                    p.lname
                ')
                ->from('ms_patient_appointment a')
                ->join('ms_patient p', 'p.id = a.patient_id', 'left')
                ->where('a.doctor_id', $doctorId)
                ->where('a.date >=', $today)
                ->where('a.date <=', $endDate)
                ->where('(a.status <> "cancelled" OR a.status IS NULL)', null, false)
                ->order_by('a.date', 'ASC')
                ->order_by('a.start_time', 'ASC');

            $rows = $this->db->get()->result_array();

            $list = array_map(function($r){
                $statusRaw = isset($r['status']) ? strtolower(trim($r['status'])) : 'booked';
                if ($statusRaw === 'in-consultation') {
                    $status = 'active';
                } elseif (in_array($statusRaw, ['booked','arrived','waiting','active','completed'])) {
                    $status = $statusRaw;
                } else {
                    $status = 'booked';
                }

                $patientName = trim(($r['fname'] ?? '') . ' ' . ($r['lname'] ?? ''));
                if ($patientName === '') { $patientName = $r['patient_name'] ?? ''; }

                // duration minutes
                $durationMinutes = 0;
                $st = $r['start_time'] ?? '';
                $et = $r['end_time'] ?? '';
                if ($st && $et) {
                    $t1 = strtotime("1970-01-01 " . $st);
                    $t2 = strtotime("1970-01-01 " . $et);
                    if ($t1 !== false && $t2 !== false && $t2 >= $t1) {
                        $durationMinutes = intval(($t2 - $t1) / 60);
                    }
                }

                return [
                    'id' => (string)$r['appointment_uid'],
                    'tokenNumber' => (int)($r['token_no'] ?? 0),
                    'patient' => [
                        'id' => (string)($r['patient_id'] ?? ''),
                        'name' => $patientName,
                        'phone' => (string)($r['phone'] ?? ''),
                        'age' => 0
                    ],
                    'doctor' => [ 'id' => (string)($r['doctor_id'] ?? '') ],
                    'date' => $r['date'],
                    'timeSlot' => [
                        'id' => '',
                        'startTime' => $r['start_time'] ?? '',
                        'endTime' => $r['end_time'] ?? '',
                        'totalTokens' => 0,
                        'bookedTokens' => 0
                    ],
                    'status' => $status,
                    'durationMinutes' => $durationMinutes
                ];
            }, $rows);

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData

            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Authorization failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get receipt templates from ms_hospitals_receipts
     * Output: { success: boolean, data: <AES encrypted JSON array> }
     */
    public function getReceiptTemplates() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            //$doctorId = $tokenData['loguid'] ?? null;
            $doctorId = $tokenData['id'] ?? null;

            $defaultReceiptId = null;
            if ($doctorId) {
                $doctor = $this->db->select('receipt')
                    ->from('ms_doctors')
                    ->where('id', $doctorId)
                    ->get()
                    ->row_array();
                $defaultReceiptId = $doctor ? $doctor['receipt'] : null;
            }
            
            $AES_KEY = "RohitGaradHos@173414";

            $rows = $this->db->select('*')
                ->from('ms_hospitals_receipts')
                ->get()
                ->result_array();

            // Mark default receipt
            foreach ($rows as &$row) {
                $row['is_default'] = ($row['id'] == $defaultReceiptId) ? 1 : 0;
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($rows), $AES_KEY);

            echo json_encode([
                'success' => true,
                'data' => $encryptedData,
                'default_receipt_id' => $defaultReceiptId
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }

    public function setDefaultReceipt() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $doctorId = $tokenData['id'] ?? null;

            if (!$doctorId) {
                 throw new Exception("Invalid doctor ID");
            }
            
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['receipt_id'])) {
                throw new Exception("Receipt ID is required");
            }
            
            $receiptId = $data['receipt_id'];


            
            // Update ms_doctors
            $this->db->where('id', $doctorId);
            $this->db->update('ms_doctors', ['receipt' => $receiptId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Default receipt updated successfully'
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }

    public function upload_shared_receipt() {
        // Load URL helper
        $this->load->helper('url');

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $loguid = $tokenData['loguid'] ?? null;
            $role = $tokenData['role'] ?? null;

            if (!$loguid || !in_array($role, ['doctor','staff'], true)) {
                throw new Exception("Invalid user token or insufficient privileges");
            }
            
            $patient_id = $this->input->post('patient_id');
            $appointment_id = $this->input->post('appointment_id');
            
            if (!$patient_id || !$appointment_id) {
                throw new Exception("Missing patient or appointment ID");
            }

            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                throw new Exception("File upload failed");
            }

            // Create directory if not exists
            $upload_path = FCPATH . 'uploads/reports/' . $patient_id . '/';
            if (!is_dir($upload_path)) {
                mkdir($upload_path, 0777, true);
            }

            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|png|jpg|jpeg';
            $config['encrypt_name'] = TRUE;

            $this->load->library('upload', $config);

            if (!$this->upload->do_upload('file')) {
                throw new Exception($this->upload->display_errors('', ''));
            }

            $upload_data = $this->upload->data();
            $file_path = 'uploads/reports/' . $patient_id . '/' . $upload_data['file_name'];
            
            // Generate token and password
            $access_token = bin2hex(random_bytes(16));
            $password = sprintf("%04d", mt_rand(1, 9999));
            
            $this->load->model('SharedReceiptModel');
            $this->SharedReceiptModel->create([
                'patient_id' => $patient_id,
                'appointment_id' => $appointment_id,
                'file_path' => $file_path,
                'access_token' => $access_token,
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'created_at' => date('Y-m-d H:i:s'),
                'expires_at' => date('Y-m-d H:i:s', strtotime('+7 days'))
            ]);

            // Construct frontend link dynamically based on the request origin
            // This ensures it works for localhost:8080, production domains, etc.
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
            
            // Fallback to Referer if Origin is missing
            if (empty($origin) && isset($_SERVER['HTTP_REFERER'])) {
                $parsed = parse_url($_SERVER['HTTP_REFERER']);
                if (isset($parsed['scheme']) && isset($parsed['host'])) {
                    $origin = $parsed['scheme'] . '://' . $parsed['host'];
                    if (isset($parsed['port'])) {
                        $origin .= ':' . $parsed['port'];
                    }
                }
            }

            // Fallback default if detection fails (e.g. direct API call)
            if (empty($origin)) {
                // Default to standard React dev port or try to guess based on server
                $origin = 'http://localhost:8080';
            }

            // Remove trailing slash just in case
            $origin = rtrim($origin, '/');
            
            $frontend_link = $origin . '/shared/receipt/' . $access_token;

            // Fetch patient phone number
            $patient_phone = '';
            $patient = $this->db->select('phone')->where('id', $patient_id)->get('ms_patient')->row();
            if ($patient) {
                $patient_phone = $patient->phone;
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'link' => $frontend_link,
                    'token' => $access_token,
                    'password' => $password,
                    'patient_phone' => $patient_phone
                ]
            ]);

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

}
