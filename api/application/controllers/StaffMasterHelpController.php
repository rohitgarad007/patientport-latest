<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class StaffMasterHelpController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('HospitalCommonModel');
        $this->load->model('StaffCommonModel');
        $this->load->model('DoctorCommonModel');
        $this->load->helper('verifyAuthToken');

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

    // Key/IV derivation function
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

    // AES Decryption function
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



    public function getDoctorOptionList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

            $doctorsList = $this->DoctorCommonModel->get_ActiveDoctorsOptionListByHospital($staffInfo['hospital_id']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data1"    => $doctorsList
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function getActivityOptionList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

            $activityList = $this->HospitalCommonModel->get_activityOptionListById($staffInfo['hospital_id']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($activityList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data2"    => $activityList
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function getPatientCurrentStatusOptionList(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

            $statusList = $this->HospitalCommonModel->get_patientCurrentStatusOptionListByHospital($staffInfo['hospital_id']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($statusList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data2"    => $statusList
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    /*public function getPatientsListSearch(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;
            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

             // Get POST data
            $payload = json_decode($this->input->raw_input_stream, true);
            $page    = isset($payload['page']) ? (int)$payload['page'] : 1;
            $limit   = isset($payload['limit']) ? (int)$payload['limit'] : 10;
            $search  = isset($payload['search']) ? trim($payload['search']) : '';

            $offset = ($page - 1) * $limit;
            $hospital_id = $staffInfo['hospital_id'];

            $this->db->select('id, patient_uid as patientuid, fname, lname, email');
            $this->db->from('ms_patient');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);

            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('fname', $search);
                $this->db->or_like('lname', $search);
                $this->db->or_like('email', $search);
                $this->db->or_like('phone', $search);
                $this->db->group_end();
            }

            // Count total
            $totalQuery = clone $this->db;
            $totalCount = $totalQuery->count_all_results('', false);

            // Pagination
            $this->db->limit($limit, $offset);
            $query = $this->db->get();
            $patients = $query->result_array();




            $AES_KEY = "RohitGaradHos@173414";

            $encryptedData = $this->encrypt_aes_for_js(json_encode($patients), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData,
                //"data2" => $patients
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }*/

    public function getPatientsListSearch(){
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

            // 🔹 Get POST data
            $payload = json_decode($this->input->raw_input_stream, true);
            $page    = isset($payload['page']) ? (int)$payload['page'] : 1;
            $limit   = isset($payload['limit']) ? (int)$payload['limit'] : 10;
            $search  = isset($payload['search']) ? trim($payload['search']) : '';

            $offset = ($page - 1) * $limit;
            $hospital_id = $staffInfo['hospital_id'];

            // 🔹 Base query
            $this->db->select('id, patient_uid as patientuid, fname, lname, email, phone');
            $this->db->from('ms_patient');
            $this->db->where('hospital_id', $hospital_id);
            $this->db->where('isdelete', 0);

            // ✅ Exclude patients already assigned to a bed
            $this->db->where("id NOT IN (SELECT assigned_patient_id FROM ms_hospitals_rooms_bed WHERE isdelete = 0 AND assigned_patient_id IS NOT NULL)", null, false);

            // 🔹 Apply search
            if ($search !== '') {
                $this->db->group_start();
                $this->db->like('fname', $search);
                $this->db->or_like('lname', $search);
                $this->db->or_like('email', $search);
                $this->db->or_like('phone', $search);
                $this->db->group_end();
            }

            // 🔹 Clone for count
            $totalQuery = clone $this->db;
            $totalCount = $totalQuery->count_all_results('', false);

            // 🔹 Pagination
            $this->db->limit($limit, $offset);
            $query = $this->db->get();
            $patients = $query->result_array();

            // 🔹 Encrypt output
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($patients), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData,
                "total" => $totalCount
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }



}