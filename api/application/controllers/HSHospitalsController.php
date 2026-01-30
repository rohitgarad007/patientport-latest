<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSHospitalsController  extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->model('HospitalCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    /* ===== Doctors List Code Start Here ===== */
    public function getDoctorsList(){
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
            exit;
        }
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

            // Doctors list
            $doctorsList = $this->HospitalCommonModel->get_HospitalDoctorsList($loguid);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsList), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }
    /* ===== Doctors List Code End Here ===== */

    /* ===== Screen Management Code Start Here ===== */
    public function saveScreen(){
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

            // Get payload
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // Decrypt fields
            $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
            $location = isset($rawData['location']) ? trim($this->decrypt_aes_from_js($rawData['location'], $AES_KEY)) : '';
            $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
            $doctorIds = isset($rawData['doctorIds']) ? $this->decrypt_aes_from_js($rawData['doctorIds'], $AES_KEY) : '[]';
            
            // Other fields
            $resolution = isset($rawData['resolution']) ? trim($this->decrypt_aes_from_js($rawData['resolution'], $AES_KEY)) : '1920x1080';
            $layout = isset($rawData['layout']) ? trim($this->decrypt_aes_from_js($rawData['layout'], $AES_KEY)) : 'standard';
            $theme = isset($rawData['theme']) ? trim($this->decrypt_aes_from_js($rawData['theme'], $AES_KEY)) : 'blue';
            $showLogo = isset($rawData['showLogo']) ? trim($this->decrypt_aes_from_js($rawData['showLogo'], $AES_KEY)) : '1';
            $showDateTime = isset($rawData['showDateTime']) ? trim($this->decrypt_aes_from_js($rawData['showDateTime'], $AES_KEY)) : '1';
            $showQueue = isset($rawData['showQueue']) ? trim($this->decrypt_aes_from_js($rawData['showQueue'], $AES_KEY)) : '1';
            $enableAudio = isset($rawData['enableAudio']) ? trim($this->decrypt_aes_from_js($rawData['enableAudio'], $AES_KEY)) : '1';
            $autoRefresh = isset($rawData['autoRefresh']) ? trim($this->decrypt_aes_from_js($rawData['autoRefresh'], $AES_KEY)) : '1';
            $refreshInterval = isset($rawData['refreshInterval']) ? trim($this->decrypt_aes_from_js($rawData['refreshInterval'], $AES_KEY)) : '30';

            // Validate required fields
            if (!$name || !$location) {
                 echo json_encode([
                    "success" => false,
                    "message" => "Missing required fields (Name or Location)"
                ]);
                return;
            }

            $doctorIdsArray = json_decode($doctorIds, true); 

            $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            $hospital_id = isset($hospitalInfo['id']) ? $hospitalInfo['id'] : 0;

            $screenuid = uniqid('SCN_');

            $screenData = [
                'screenuid' => $screenuid,
                'hosuid' => $hospital_id, // Saving hospital_id (int) in hosuid column as requested
                'name' => $name,
                'location' => $location,
                'description' => $description,
                'resolution' => $resolution,
                'layout' => $layout,
                'theme' => $theme,
                'show_logo' => ($showLogo === 'true' || $showLogo === '1') ? 1 : 0,
                'show_date_time' => ($showDateTime === 'true' || $showDateTime === '1') ? 1 : 0,
                'show_queue' => ($showQueue === 'true' || $showQueue === '1') ? 1 : 0,
                'enable_audio' => ($enableAudio === 'true' || $enableAudio === '1') ? 1 : 0,
                'auto_refresh' => ($autoRefresh === 'true' || $autoRefresh === '1') ? 1 : 0,
                'refresh_interval' => (int)$refreshInterval,
                'status' => 1,
                'created_at' => date('Y-m-d H:i:s')
            ];

            $result = $this->HospitalCommonModel->save_screen_info($screenData, $doctorIdsArray);

            if ($result) {
                echo json_encode([
                    "success" => true,
                    "message" => "Screen created successfully",
                    "screenuid" => $screenuid
                ]);
            } else {
                // Debugging: return DB error if any (careful in production)
                $db_error = $this->db->error();
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to save screen info. DB Error: " . $db_error['message'] . " Code: " . $db_error['code']
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }

    public function getScreensList() {
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
            exit;
        }
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

            $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            $hospital_id = isset($hospitalInfo['id']) ? $hospitalInfo['id'] : 0;

            // Get screens list
            $screensList = $this->HospitalCommonModel->get_HospitalScreensList($hospital_id);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($screensList), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "rowData" => $screensList
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }
    public function getScreenPreviewAppointments() {
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
            exit;
        }
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
            
            $rawData = json_decode(file_get_contents("php://input"), true);
            $AES_KEY = "RohitGaradHos@173414";
            
            $encryptedDoctorIds = isset($rawData['doctorIds']) ? $rawData['doctorIds'] : '';
            $doctorIds = [];
            if ($encryptedDoctorIds) {
                 $doctorIdsStr = $this->decrypt_aes_from_js($encryptedDoctorIds, $AES_KEY);
                 $doctorIds = json_decode($doctorIdsStr, true);
            } else {
                 $doctorIds = isset($rawData['doctorIds']) ? $rawData['doctorIds'] : [];
            }

            if (empty($doctorIds)) {
                echo json_encode(["success" => true, "data" => ""]);
                return;
            }

            $appointments = $this->HospitalCommonModel->get_DoctorsAppointmentsToday($doctorIds);
            
            // Group by doctor
            $grouped = [];
            foreach ($appointments as $apt) {
                $docId = $apt['doctor_id'];
                if (!isset($grouped[$docId])) {
                    $grouped[$docId] = [];
                }
                $grouped[$docId][] = [
                    'id' => $apt['appointment_id'],
                    'token' => $apt['token_no'],
                    'name' => $apt['patient_name'],
                    'status' => $apt['status'],
                    'time' => $apt['start_time'],
                    'created_at' => $apt['created_at']
                ];
            }

            $encryptedResponse = $this->encrypt_aes_for_js(json_encode($grouped), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedResponse
            ]);
            
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    /* ===== Screen Management Code End Here ===== */

    // AES Encryption function compatible with JS decryption
    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    // Reuse your existing key/iv derivation function
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

    // Decrypt AES function compatible with JS encryption
    public function decrypt_aes_from_js($encryptedBase64, $passphrase) {
        $encryptedData = base64_decode($encryptedBase64);
        $salt = substr($encryptedData, 8, 8);
        $ciphertext = substr($encryptedData, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        return openssl_decrypt($ciphertext, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
    }

}
