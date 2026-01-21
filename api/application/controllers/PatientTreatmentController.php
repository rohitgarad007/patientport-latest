<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class PatientTreatmentController extends CI_Controller {

    private $AES_KEY = "RohitGaradHos@173414"; // Should ideally be in config or env

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date', 'jwt'));
        $this->load->model('PatientTreatmentModel');
        $this->load->helper('verifyauthtoken');
        $this->load->database();

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        // header("Access-Control-Allow-Credentials: true"); // Removed to allow Origin: *
        header('Content-Type: application/json');

        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            exit;
        }
    }

    // --- Encryption Helpers ---

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

    // --- Authentication ---

    private function _authenticate() {
        $userToken = $this->input->get_request_header('Authorization');
        if (!$userToken) {
            echo json_encode(["success" => false, "message" => "Authorization header missing"]);
            exit;
        }
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        
        try {
            $decoded = verifyAuthToken($token);
            if (!$decoded) {
                echo json_encode(["success" => false, "message" => "Invalid or expired token"]);
                exit;
            }
            $tokenData = is_string($decoded) ? json_decode($decoded, true) : $decoded;
            
            // Role validation similar to SFDoctorController
            $role = $tokenData['role'] ?? null;
            if (!in_array($role, ['doctor', 'staff', 'admin', 'superadmin'])) { // Add allowed roles
                 echo json_encode(["success" => false, "message" => "Insufficient privileges"]);
                 exit;
            }

            return $tokenData;
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Unauthorized: " . $e->getMessage()]);
            exit;
        }
    }

    // --- Endpoints ---

    public function save_treatment() {
        $userData = $this->_authenticate();
        
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);

        // Debug logging
        $logFile = FCPATH . 'debug_log.txt';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Raw Input: " . $raw . "\n", FILE_APPEND);

        // Check if payload is encrypted
        $data = [];
        if (isset($requestData['payload'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['payload'], $this->AES_KEY);
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - Decrypted: " . $decryptedJson . "\n", FILE_APPEND);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - Decrypt Error: " . $e->getMessage() . "\n", FILE_APPEND);
                echo json_encode(['success' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            // Fallback to plain JSON for backward compatibility or testing (optional, but good for transition)
            $data = $requestData;
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Unencrypted Data: " . json_encode($data) . "\n", FILE_APPEND);
        }

        if (!isset($data['appointment_id']) || !isset($data['patient_id'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            return;
        }

        // doctor_id might be passed or derived from token if it's a doctor
        $doctor_id = $data['doctor_id'] ?? ($userData['id'] ?? 0); 
        
        // Prepare data for model
        $saveData = [
            'appointment_id' => $data['appointment_id'],
            'patient_id' => $data['patient_id'],
            'doctor_id' => $doctor_id,
            'purpose' => $data['purpose'] ?? [],
            'diagnosis' => $data['diagnosis'] ?? [],
            'lab_tests' => $data['lab_tests'] ?? [],
            'lab_reports' => $data['lab_reports'] ?? [],
            'medications' => $data['medications'] ?? [],
            'sugg_lab' => $data['sugg_lab'] ?? null,
            'treatment_status' => $data['status'] ?? 'draft'
        ];

        $result = $this->PatientTreatmentModel->saveTreatment($saveData);

        if ($result) {
            // Update appointment status
            $apptStatus = ($saveData['treatment_status'] === 'completed') ? 'completed' : 'draft';
            $this->PatientTreatmentModel->updateAppointmentStatus($data['appointment_id'], $apptStatus);

            $response = ['success' => true, 'message' => 'Treatment saved successfully', 'id' => $result];
        } else {
            $response = ['success' => false, 'message' => 'Failed to save treatment'];
        }

        // Encrypt Response
        $encryptedResponse = $this->encrypt_aes_for_js(json_encode($response), $this->AES_KEY);
        echo json_encode(['success' => true, 'data' => $encryptedResponse]); // Wrap in 'data' field standard
    }

    public function get_treatment() {
        $userData = $this->_authenticate();
        
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);
        
        $data = [];
        if (isset($requestData['payload'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['payload'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Decryption failed']);
                return;
            }
        } else {
             $data = $requestData;
        }
        
        $appointment_id = $data['appointment_id'] ?? null;

        //echo $appointment_id;
        //exit;
        
        if (!$appointment_id) {
            echo json_encode(['success' => false, 'message' => 'Appointment ID required']);
            return;
        }

        $treatment = $this->PatientTreatmentModel->getTreatmentByAppointmentId($appointment_id);

        if ($treatment) {
            $response = ['success' => true, 'data' => $treatment];
        } else {
            $response = ['success' => false, 'message' => 'No treatment record found'];
        }

        // Encrypt Response
        $encryptedResponse = $this->encrypt_aes_for_js(json_encode($response), $this->AES_KEY);
        echo json_encode(['success' => true, 'data' => $encryptedResponse, 'rowData' => $response]);
    }

    public function get_lab_report_view() {
        $userData = $this->_authenticate();

        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);

        $data = [];
        if (isset($requestData['payload'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['payload'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Decryption failed']);
                return;
            }
        } else {
            $data = $requestData;
        }

        $treatment_id = $data['treatment_id'] ?? null;
        if (!$treatment_id) {
            echo json_encode(['success' => false, 'message' => 'Treatment ID required']);
            return;
        }

        $this->load->model('LabCommonModel');

        $this->db->select('id, lab_id');
        $this->db->from('lb_lab_orders');
        $this->db->where('treatment_id', $treatment_id);
        $this->db->order_by('updated_at', 'DESC');
        $this->db->limit(1);
        $orderRow = $this->db->get()->row_array();

        if (!$orderRow) {
            $response = ['success' => false, 'message' => 'No lab order found for treatment'];
        } else {
            $orderId = $orderRow['id'];
            $labid = $orderRow['lab_id'];
            $details = $this->LabCommonModel->get_report_details($orderId, $labid);
            if ($details) {
                $response = ['success' => true, 'data' => $details];
            } else {
                $response = ['success' => false, 'message' => 'No report details found'];
            }
        }

        $encryptedResponse = $this->encrypt_aes_for_js(json_encode($response), $this->AES_KEY);
        echo json_encode(['success' => true, 'data' => $encryptedResponse]);
    }

    public function upload_report() {
        $userData = $this->_authenticate();
        
        $treatment_id = $this->input->post('treatment_id');
        
        if (!$treatment_id) {
            echo json_encode(['success' => false, 'message' => 'Treatment ID required']);
            return;
        }

        // Get Patient ID
        $patient_id = $this->PatientTreatmentModel->getPatientIdByTreatmentId($treatment_id);
        if (!$patient_id) {
             echo json_encode(['success' => false, 'message' => 'Invalid Treatment ID']);
             return;
        }

        if (!isset($_FILES['file']['name'])) {
            echo json_encode(['success' => false, 'message' => 'No file uploaded']);
            return;
        }

        // Create directory: api/uploads/reports/{patient_id}/
        // FCPATH points to the directory containing index.php (api/)
        $uploadPath = FCPATH . 'uploads/reports/' . $patient_id . '/';
        
        if (!is_dir($uploadPath)) {
            if (!mkdir($uploadPath, 0777, true)) {
                echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
                return;
            }
        }

        $config['upload_path'] = $uploadPath;
        $config['allowed_types'] = 'jpg|jpeg|png|pdf|doc|docx';
        $config['max_size'] = 10240; // 10MB
        $config['encrypt_name'] = TRUE; // Rename file to random string

        $this->load->library('upload', $config);

        if (!$this->upload->do_upload('file')) {
            echo json_encode(['success' => false, 'message' => $this->upload->display_errors('', '')]);
        } else {
            $uploadData = $this->upload->data();
            $relativePath = 'uploads/reports/' . $patient_id . '/' . $uploadData['file_name'];
            $fullUrl = base_url() . $relativePath;

            $is_combined = $this->input->post('is_combined');
            $covered = $this->input->post('covered_tests');
            $lab_test_id = $this->input->post('lab_test_id');

            $coveredTests = [];
            if (!empty($covered)) {
                $decoded = json_decode($covered, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $coveredTests = array_values(array_map('strval', $decoded));
                } else {
                    $parts = array_filter(array_map('trim', explode(',', $covered)));
                    if (!empty($parts)) {
                        $coveredTests = array_values(array_map('strval', $parts));
                    }
                }
            }
            
            // If lab_test_id is missing but we have a single covered test and it's not combined, use it
            $is_combined_val = !empty($is_combined) && (int)$is_combined === 1 ? 1 : 0;
            if (empty($lab_test_id) && $is_combined_val === 0 && count($coveredTests) === 1) {
                $lab_test_id = $coveredTests[0];
            }

            $dbData = [
                'treatment_id' => $treatment_id,
                'file_name' => $uploadData['client_name'],
                'file_url' => $relativePath,
                'file_type' => $uploadData['file_type'],
                'is_combined' => $is_combined_val,
                'covered_tests' => !empty($coveredTests) ? json_encode($coveredTests) : null,
                'lab_test_id' => !empty($lab_test_id) ? $lab_test_id : ''
            ];
            
            $reportId = $this->PatientTreatmentModel->addLabReport($dbData);

            $response = [
                'success' => true, 
                'message' => 'File uploaded successfully',
                'id' => $reportId,
                'file_path' => $relativePath,
                'full_url' => $fullUrl,
                'file_name' => $uploadData['file_name'],
                'original_name' => $uploadData['client_name'],
                'is_combined' => $dbData['is_combined'],
                'covered_tests' => $dbData['covered_tests'],
                'lab_test_id' => $dbData['lab_test_id']
            ];
            
            // Encrypt response for consistency if needed, but for now plain JSON
            // to ensure it works with our new frontend service function
            echo json_encode($response);
        }
    }

    public function delete_report() {
        $userData = $this->_authenticate();
        $report_id = $this->input->post('report_id');
        
        if (!$report_id) {
            echo json_encode(['success' => false, 'message' => 'Report ID required']);
            return;
        }

        // Get report details to delete file
        $report = $this->db->get_where('ms_patient_treatment_lab_reports', ['id' => $report_id])->row_array();
        
        if ($report) {
            // Delete from DB
            $this->db->where('id', $report_id);
            $this->db->delete('ms_patient_treatment_lab_reports');
            
            // Delete file
            if (!empty($report['file_url'])) {
                // Remove base_url if present to get relative path
                $relativePath = str_replace(base_url(), '', $report['file_url']);
                $filePath = FCPATH . $relativePath;
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Report deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Report not found']);
        }
    }
}
