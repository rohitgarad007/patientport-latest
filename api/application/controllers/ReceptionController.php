<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ReceptionController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('HospitalCommonModel');
        $this->load->helper('verifyAuthToken');
        $this->load->helper('jwt');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

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

    public function getDashboardStats() {
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


            if (!$loguid || ($hrole !== "hospital_admin" && $hrole !== "Receptionist")) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Get Hospital ID
            if ($hrole === "hospital_admin") {
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                $hospital_id = isset($hospitalInfo['id']) ? $hospitalInfo['id'] : 0;
                $hosuid = $loguid; // For hospital_admin, hosuid is loguid
            } else if ($hrole === "Receptionist") {
                $staffInfo = $this->HospitalCommonModel->get_StaffHospitalInfo($loguid);
                $hospital_id = isset($staffInfo['hospital_id']) ? $staffInfo['hospital_id'] : 0;

                $hosuid = isset($staffInfo['hosuid']) ? $staffInfo['hosuid'] : '';
            } else {
                $hospital_id = 0;
                $hosuid = '';
            }

            if (!$hospital_id) {
                throw new Exception("Hospital not found");
            }

            // Fetch Data
            $stats = $this->HospitalCommonModel->get_ReceptionStats($hospital_id, $hosuid);
            $activeConsultations = $this->HospitalCommonModel->get_ActiveConsultations($hospital_id);
            $waitingQueue = $this->HospitalCommonModel->get_WaitingQueue($hospital_id);
            $doctors = $this->HospitalCommonModel->get_DashboardDoctors($hosuid);

            $responseData = [
                'stats' => $stats,
                'activeConsultations' => $activeConsultations,
                'waitingQueue' => $waitingQueue,
                'doctors' => $doctors
            ];

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($responseData), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }

    public function save_screen_settings() {
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') { exit; }
        
        try {
            $userToken = $this->input->get_request_header('Authorization');
            if (empty($userToken) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $userToken = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if (empty($userToken) && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                if (isset($headers['Authorization'])) {
                    $userToken = $headers['Authorization'];
                } elseif (isset($headers['authorization'])) {
                    $userToken = $headers['authorization'];
                }
            }

            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            $token = verifyAuthToken($token);

            if (!$token) throw new Exception("Unauthorized");
            
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            
            if (!$loguid || ($hrole !== "hospital_admin" && $hrole !== "Receptionist")) {
                throw new Exception("Unauthorized access");
            }

            if ($hrole === "hospital_admin") {
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                $hospital_id = $hospitalInfo['id'] ?? 0;
            } else {
                $staffInfo = $this->HospitalCommonModel->get_StaffHospitalInfo($loguid);
                $hospital_id = $staffInfo['hospital_id'] ?? 0;
            }
            
            if (!$hospital_id) throw new Exception("Hospital not found");

            $json = json_decode(file_get_contents('php://input'), true);
            $encryptedData = $json['data'] ?? '';
            
            $decryptedJson = $this->decrypt_aes_from_js($encryptedData, "RohitGaradHos@173414");
            $data = json_decode($decryptedJson, true);

            if (!$data) throw new Exception("Invalid data");
            
            // Extract settings from the payload
            $settings = $data['settings'] ?? [];
            
            // Ensure volume is a single integer, not an array
            $volume = isset($settings['volume']) ? $settings['volume'] : 75;
            if (is_array($volume)) {
                $volume = isset($volume[0]) ? $volume[0] : 75;
            }

            $saveData = [
                'screen_layout_id' => $data['screen_layout_id'],
                'volume' => $volume,
                'is_muted' => isset($settings['isMuted']) ? ($settings['isMuted'] ? 1 : 0) : 0,
                'repeat_count' => isset($settings['repeatCount']) ? $settings['repeatCount'] : 2,
                'is_announcing' => isset($settings['isAnnouncing']) ? ($settings['isAnnouncing'] ? 1 : 0) : 0,
                'is_paused' => isset($settings['isPaused']) ? ($settings['isPaused'] ? 1 : 0) : 0,
                'flash_on_call' => isset($settings['flashOnCall']) ? ($settings['flashOnCall'] ? 1 : 0) : 1,
                'emergency_mode' => isset($settings['emergencyMode']) ? ($settings['emergencyMode'] ? 1 : 0) : 0,
                'display_view' => isset($settings['displayView']) ? $settings['displayView'] : 'single',
                'display_timer' => isset($settings['displayTimer']) ? (int)$settings['displayTimer'] : 30,
                'settings' => json_encode($settings)
            ];
            
            $this->HospitalCommonModel->save_ScreenSettings($hospital_id, $saveData);
            
            $response = json_encode(['success' => true, 'message' => 'Settings saved successfully']);
            echo json_encode(['data' => $this->encrypt_aes_for_js($response, "RohitGaradHos@173414")]);

        } catch (Throwable $e) {
             $response = json_encode(['success' => false, 'message' => $e->getMessage()]);
             echo json_encode(['data' => $this->encrypt_aes_for_js($response, "RohitGaradHos@173414")]);
        }
    }

    public function get_screen_settings() {
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') { exit; }
        
        try {
            $userToken = $this->input->get_request_header('Authorization');
            if (empty($userToken) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $userToken = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if (empty($userToken) && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                if (isset($headers['Authorization'])) {
                    $userToken = $headers['Authorization'];
                } elseif (isset($headers['authorization'])) {
                    $userToken = $headers['authorization'];
                }
            }
            
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            
            if (!$loguid || ($hrole !== "hospital_admin" && $hrole !== "Receptionist")) {
                throw new Exception("Unauthorized access");
            }

            if ($hrole === "hospital_admin") {
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                $hospital_id = $hospitalInfo['id'] ?? 0;
            } else {
                $staffInfo = $this->HospitalCommonModel->get_StaffHospitalInfo($loguid);
                $hospital_id = $staffInfo['hospital_id'] ?? 0;
            }

            if (!$hospital_id) throw new Exception("Hospital not found");

            $settings = $this->HospitalCommonModel->get_ScreenSettings($hospital_id);
            
            $response = json_encode(['success' => true, 'data' => $settings]);
            echo json_encode(['data' => $this->encrypt_aes_for_js($response, "RohitGaradHos@173414")]);

        } catch (Throwable $e) {
             $response = json_encode(['success' => false, 'message' => $e->getMessage()]);
             echo json_encode(['data' => $this->encrypt_aes_for_js($response, "RohitGaradHos@173414")]);
        }
    }

    public function getReceptionScreensList() {
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') { exit; }
        
        try {
            $userToken = $this->input->get_request_header('Authorization');
            if (empty($userToken) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $userToken = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if (empty($userToken) && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                if (isset($headers['Authorization'])) {
                    $userToken = $headers['Authorization'];
                } elseif (isset($headers['authorization'])) {
                    $userToken = $headers['authorization'];
                }
            }
            
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            
            if (!$loguid || ($hrole !== "hospital_admin" && $hrole !== "Receptionist")) {
                throw new Exception("Unauthorized access");
            }

            if ($hrole === "hospital_admin") {
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                $hospital_id = $hospitalInfo['id'] ?? 0;
            } else {
                $staffInfo = $this->HospitalCommonModel->get_StaffHospitalInfo($loguid);
                $hospital_id = $staffInfo['hospital_id'] ?? 0;
            }

            if (!$hospital_id) throw new Exception("Hospital not found");

            // Get screens list using the common model
            $screensList = $this->HospitalCommonModel->get_HospitalScreensList($hospital_id);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($screensList), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);

        } catch (Throwable $e) {
             $response = json_encode(['success' => false, 'message' => $e->getMessage()]);
             echo json_encode(['data' => $this->encrypt_aes_for_js($response, "RohitGaradHos@173414")]);
        }
    }

    public function get_screen_announcement() {
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') { exit; }
        try {
            $userToken = $this->input->get_request_header('Authorization');
            if (empty($userToken) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $userToken = $_SERVER['HTTP_AUTHORIZATION'];
            }
            if (empty($userToken) && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                if (isset($headers['Authorization'])) {
                    $userToken = $headers['Authorization'];
                } elseif (isset($headers['authorization'])) {
                    $userToken = $headers['authorization'];
                }
            }

            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $hrole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid || ($hrole !== "hospital_admin" && $hrole !== "Receptionist")) {
                throw new Exception("Unauthorized access");
            }

            if ($hrole === "hospital_admin") {
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                $hospital_id = $hospitalInfo['id'] ?? 0;
            } else {
                $staffInfo = $this->HospitalCommonModel->get_StaffHospitalInfo($loguid);
                $hospital_id = $staffInfo['hospital_id'] ?? 0;
            }
            if (!$hospital_id) throw new Exception("Hospital not found");

            $doctor_id = $this->input->get('doctor_id');
            $message = '';
            if (!empty($doctor_id)) {
                $message = $this->HospitalCommonModel->get_DoctorScreenMessage($doctor_id);
            }
            if (empty($message)) {
                $message = $this->HospitalCommonModel->get_HospitalScreenMessage($hospital_id);
            }
            if (empty($message)) {
                $message = "Now Coming...";
            }

            $AES_KEY = "RohitGaradHos@173414";
            $payload = json_encode(['message' => $message]);
            $encryptedData = $this->encrypt_aes_for_js($payload, $AES_KEY);
            echo json_encode([ "success" => true, "data" => $encryptedData ]);
        } catch (Throwable $e) {
            $response = json_encode(['success' => false, 'message' => $e->getMessage()]);
            echo json_encode(['data' => $this->encrypt_aes_for_js($response, "RohitGaradHos@173414")]);
        }
    }
}
