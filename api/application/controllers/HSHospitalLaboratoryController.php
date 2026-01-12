<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSHospitalLaboratoryController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('HospitalCommonModel');
        $this->load->model('DoctorCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    private function getAuthData() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        
        try {
            $token = verifyAuthToken($token);
            if (!$token) return null;

            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            return $tokenData;
        } catch (Exception $e) {
            return null;
        }
    }

    public function GetPreferredLaboratories() {
        $tokenData = $this->getAuthData();
        if (!$tokenData) {
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            return;
        }

        $role = $tokenData['role'] ?? '';
        if ($role !== "hospital_admin" && $role !== "doctor") {
             echo json_encode(["success" => false, "message" => "Unauthorized role"]);
             return;
        }

        $loguid = $tokenData['loguid'] ?? null;
        $hospitalId = null;

        if ($role === "hospital_admin") {
            $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
            if ($hospitalInfo) {
                $hospitalId = $hospitalInfo['id'];
            }
        } elseif ($role === "doctor") {
            $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
            if ($doctorInfo && isset($doctorInfo['hosuid'])) {
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($doctorInfo['hosuid']);
                if ($hospitalInfo) {
                    $hospitalId = $hospitalInfo['id'];
                }
            }
        }
        
        if (!$hospitalId) {
            echo json_encode(["success" => false, "message" => "Hospital not found"]);
            return;
        }

        $data = $this->HospitalCommonModel->get_PreferredLaboratories($hospitalId);

        $AES_KEY = "RohitGaradHos@173414";
        $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

        echo json_encode(["success" => true, "data" => $encryptedData]);
    }
    
    public function GetAvailableLaboratories() {
        $tokenData = $this->getAuthData();
        if (!$tokenData || ($tokenData['role'] ?? '') !== "hospital_admin") {
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            return;
        }

        $loguid = $tokenData['loguid'] ?? null;
        $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
        
        if (!$hospitalInfo) {
            echo json_encode(["success" => false, "message" => "Hospital not found"]);
            return;
        }

        $data = $this->HospitalCommonModel->get_AvailableLaboratories($hospitalInfo['id']);
        
        $AES_KEY = "RohitGaradHos@173414";
        $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

        echo json_encode(["success" => true, "data" => $encryptedData]);
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

    public function AddPreferredLaboratory() {
        $tokenData = $this->getAuthData();
        if (!$tokenData || ($tokenData['role'] ?? '') !== "hospital_admin") {
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            return;
        }

        $loguid = $tokenData['loguid'] ?? null;
        $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
        
        if (!$hospitalInfo) {
            echo json_encode(["success" => false, "message" => "Hospital not found"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);
        $laboratory_id = $rawData['laboratory_id'] ?? null;

        if (!$laboratory_id) {
            echo json_encode(["success" => false, "message" => "Laboratory ID required"]);
            return;
        }

        $insertData = [
            'hospital_id' => $hospitalInfo['id'],
            'laboratory_id' => $laboratory_id,
            'status' => 1,
            'created_at' => date('Y-m-d H:i:s')
        ];

        if ($this->HospitalCommonModel->add_PreferredLaboratory($insertData)) {
            echo json_encode(["success" => true, "message" => "Laboratory added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to add laboratory"]);
        }
    }

    public function RemovePreferredLaboratory() {
        $tokenData = $this->getAuthData();
        if (!$tokenData || ($tokenData['role'] ?? '') !== "hospital_admin") {
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            return;
        }

        $loguid = $tokenData['loguid'] ?? null;
        $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
        
        if (!$hospitalInfo) {
            echo json_encode(["success" => false, "message" => "Hospital not found"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);
        $laboratory_id = $rawData['laboratory_id'] ?? null;

        if (!$laboratory_id) {
            echo json_encode(["success" => false, "message" => "Laboratory ID required"]);
            return;
        }

        if ($this->HospitalCommonModel->remove_PreferredLaboratory($hospitalInfo['id'], $laboratory_id)) {
            echo json_encode(["success" => true, "message" => "Laboratory removed successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to remove laboratory"]);
        }
    }
}
?>
