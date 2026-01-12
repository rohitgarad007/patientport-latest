<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SFStaffPatientController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('DoctorCommonModel');
        $this->load->model('StaffCommonModel');
        $this->load->model('PatientCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    // AES helpers — same scheme used elsewhere to match frontend
    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
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

    private function requireStaffAuth() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        $token = verifyAuthToken($token);
        if (!$token) { throw new Exception("Unauthorized"); }
        $tokenData = is_string($token) ? json_decode($token, true) : $token;
        $srole = $tokenData['role'] ?? null;
        $loguid = $tokenData['loguid'] ?? null;
        if (!$loguid || $srole !== "staff") {
            throw new Exception("Invalid user token or insufficient privileges");
        }
        $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
        if (!$staffInfo || empty($staffInfo['hosuid'])) {
            throw new Exception("Staff hospital not found");
        }
        return [ 'loguid' => $loguid, 'hosuid' => $staffInfo['hosuid'] ];
    }

    // List patients for staff hospital
    public function ManagePatientList() {
        try {
            $auth = $this->requireStaffAuth();
            $hosuid = $auth['hosuid'];

            $AES_KEY = "RohitGaradHos@173414";
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) { $rawData = []; }

            $page   = isset($rawData['page']) ? intval($rawData['page']) : 1;
            $limit  = isset($rawData['limit']) ? intval($rawData['limit']) : 10;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';

            $offset = ($page - 1) * $limit;
            $total  = $this->PatientCommonModel->get_PatientCountByHospital($search, $hosuid);
            $items  = $this->PatientCommonModel->get_PatientListByHospital($search, $hosuid, $limit, $offset);

            $payload = json_encode([ 'items' => $items, 'total' => $total, 'page' => $page, 'limit' => $limit ]);
            $encrypted = $this->encrypt_aes_for_js($payload, $AES_KEY);

            echo json_encode([ 'success' => true, 'data' => $encrypted ]);
        } catch (Exception $e) {
            echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
        }
    }

    // Add patient under staff's hospital
    public function AddPatientInformation() {
        try {
            $auth = $this->requireStaffAuth();
            $loguid = $auth['loguid'];
            $hosuid = $auth['hosuid'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode(["success" => false, "message" => "Invalid payload"]); return;
            }

            $required = ['firstName','lastName','email','phone','gender','bloodGroup'];
            foreach ($required as $f) {
                if (empty($rawData[$f])) { echo json_encode(["success"=>false,"message"=>"Missing required field: $f"]); return; }
            }

            $AES_KEY = "RohitGaradHos@173414";
            $fName = trim($this->decrypt_aes_from_js($rawData['firstName'], $AES_KEY));
            $lName = trim($this->decrypt_aes_from_js($rawData['lastName'], $AES_KEY));
            $email = trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY));
            $phone = preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY));
            $dob   = isset($rawData['dob']) ? trim($this->decrypt_aes_from_js($rawData['dob'], $AES_KEY)) : '';
            $gender = trim($this->decrypt_aes_from_js($rawData['gender'], $AES_KEY));
            $bloodGroup = trim($this->decrypt_aes_from_js($rawData['bloodGroup'], $AES_KEY));
            $emergencyContact = isset($rawData['emergencyContact']) ? trim($this->decrypt_aes_from_js($rawData['emergencyContact'], $AES_KEY)) : '';
            $address = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : '';

            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["success"=>false,"message"=>"Invalid email format"]); return;
            }
            $this->db->where("email", $email);
            $this->db->where("hosuid", $hosuid);
            $exists = $this->db->get("ms_patient")->row();
            if ($exists) { echo json_encode(["success"=>false,"message"=>"Email ID already exists"]); return; }

            if (!$phone || strlen($phone) < 7 || strlen($phone) > 15) {
                echo json_encode(["success"=>false,"message"=>"Invalid phone number"]); return;
            }
            if (!$this->DoctorCommonModel->existsHospital($hosuid)) {
                echo json_encode(["success"=>false,"message"=>"Hospital does not exist"]); return;
            }

            $patientData = [
                'patient_uid'       => uniqid('PTF_'),
                'fname'             => $fName,
                'lname'             => $lName,
                'email'             => $email,
                'password'          => md5('india@1234'),
                'phone'             => $phone,
                'dob'               => $dob,
                'gender'            => $gender,
                'blood_group'       => $bloodGroup,
                'emergency_contact' => $emergencyContact,
                'address'           => $address,
                'hosuid'            => $hosuid,
                'status'            => 0,
                'created_by'        => $loguid,
                'created_at'        => date('Y-m-d H:i:s')
            ];

            $insertId = $this->PatientCommonModel->insertPatientInformation($patientData);
            if ($insertId) {
                echo json_encode(["success"=>true, "message"=>"Patient added successfully", "patient_id"=>$insertId]);
            } else {
                echo json_encode(["success"=>false, "message"=>"Failed to add patient"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success"=>false, "message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }

    public function UpdatePatientInformation() {
        try {
            $auth = $this->requireStaffAuth();
            $loguid = $auth['loguid'];
            $hosuid = $auth['hosuid'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) { echo json_encode(["success"=>false,"message"=>"Invalid payload"]); return; }

            $required = ['id','firstName','lastName','phone','gender','bloodGroup'];
            foreach ($required as $f) { if (empty($rawData[$f])) { echo json_encode(["success"=>false,"message"=>"Missing required field: $f"]); return; } }

            $AES_KEY = "RohitGaradHos@173414";
            $patientUid = trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY));
            $fName = trim($this->decrypt_aes_from_js($rawData['firstName'], $AES_KEY));
            $lName = trim($this->decrypt_aes_from_js($rawData['lastName'], $AES_KEY));
            $phone = preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY));
            $dob   = isset($rawData['dob']) ? trim($this->decrypt_aes_from_js($rawData['dob'], $AES_KEY)) : '';
            $gender = trim($this->decrypt_aes_from_js($rawData['gender'], $AES_KEY));
            $bloodGroup = trim($this->decrypt_aes_from_js($rawData['bloodGroup'], $AES_KEY));
            $emergencyContact = isset($rawData['emergencyContact']) ? trim($this->decrypt_aes_from_js($rawData['emergencyContact'], $AES_KEY)) : '';
            $address = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : '';

            if (!$phone || strlen($phone) < 7 || strlen($phone) > 15) { echo json_encode(["success"=>false,"message"=>"Invalid phone number"]); return; }
            if (!$this->DoctorCommonModel->existsHospital($hosuid)) { echo json_encode(["success"=>false,"message"=>"Hospital does not exist"]); return; }

            $updateData = [
                'fname'             => $fName,
                'lname'             => $lName,
                'phone'             => $phone,
                'dob'               => $dob,
                'gender'            => $gender,
                'blood_group'       => $bloodGroup,
                'emergency_contact' => $emergencyContact,
                'address'           => $address,
                'updated_by'        => $loguid,
                'updated_at'        => date('Y-m-d H:i:s')
            ];

            $ok = $this->PatientCommonModel->UpdatePatientInformationByHospital($patientUid, $updateData, $hosuid);
            if ($ok) { echo json_encode(["success"=>true,"message"=>"Patient updated successfully","patient_uid"=>$patientUid]); }
            else { echo json_encode(["success"=>false,"message"=>"Failed to update patient"]); }
        } catch (Exception $e) {
            echo json_encode(["success"=>false, "message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }

    public function changePatientStatus() {
        try {
            $auth = $this->requireStaffAuth();
            $loguid = $auth['loguid'];
            $hosuid = $auth['hosuid'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData) || !isset($rawData['id'],$rawData['status'])) { echo json_encode(["success"=>false,"message"=>"Missing patient id or status"]); return; }

            $AES_KEY = "RohitGaradHos@173414";
            $patientUid = trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY));
            $statusRaw  = trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY));
            $status = ($statusRaw === 'active' || $statusRaw === '1') ? 1 : 0;

            $ok = $this->PatientCommonModel->updateStaffStatusByHospital($patientUid, $hosuid, $status);
            if ($ok) { echo json_encode(["success"=>true, "message"=>"Patient status updated successfully"]); }
            else { echo json_encode(["success"=>false, "message"=>"Failed to update patient status"]); }
        } catch (Exception $e) {
            echo json_encode(["success"=>false, "message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }

    public function DeletePatientInformation() {
        try {
            $auth = $this->requireStaffAuth();
            $loguid = $auth['loguid'];
            $hosuid = $auth['hosuid'];

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData) || !isset($rawData['id'])) { echo json_encode(["success"=>false,"message"=>"Missing patient id"]); return; }

            $AES_KEY = "RohitGaradHos@173414";
            $patientUid = trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY));

            $updateData = [
                'isdelete'  => 1,
                'updated_by'=> $loguid,
                'updated_at'=> date('Y-m-d H:i:s')
            ];
            $ok = $this->PatientCommonModel->UpdatePatientInformationByHospital($patientUid, $updateData, $hosuid);
            if ($ok) { echo json_encode(["success"=>true, "message"=>"Patient deleted successfully", "patient_uid"=>$patientUid]); }
            else { echo json_encode(["success"=>false, "message"=>"Failed to delete patient"]); }
        } catch (Exception $e) {
            echo json_encode(["success"=>false, "message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }
}

