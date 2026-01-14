<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSPatientController  extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->model('DoctorCommonModel');
        $this->load->model('StaffCommonModel');
        $this->load->model('PatientCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
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


    public function ManagePatientList() {


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
            if (!$rawData || !is_array($rawData)) {
                return $this->jsonResponse(false, "Invalid or missing payload", 400);
            }

            $limit = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page  = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';

            $offset = ($page - 1) * $limit;

            // Total count
            $totalRows = $this->PatientCommonModel->get_PatientCountByHospital($search, $loguid);

            // Doctor list
            $patientList = $this->PatientCommonModel->get_PatientListByHospital($search, $loguid, $limit, $offset);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($patientList), $AES_KEY);


            echo json_encode([
                "success" => true,
                //"data"    => $patientList,
                "data"    => $encryptedData,
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limit
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


    public function AddPatientInformation() {
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
            if (!$rawData || !is_array($rawData)) {
                
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;

            }


            $requiredFields = ['firstName', 'lastName','email','phone','gender','bloodGroup'];


            foreach ($requiredFields as $field) {
                if (empty($rawData[$field])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required field: $field"
                    ]);
                    return;
                }
            }

            $AES_KEY = "RohitGaradHos@173414"; 


            $fName = isset($rawData['firstName']) ? trim($this->decrypt_aes_from_js($rawData['firstName'], $AES_KEY)) : '';
            $lName = isset($rawData['lastName']) ? trim($this->decrypt_aes_from_js($rawData['lastName'], $AES_KEY)) : '';
            $email = isset($rawData['email']) ? trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY)) : '';
            $phone = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $dob = isset($rawData['dob']) ? trim($this->decrypt_aes_from_js($rawData['dob'], $AES_KEY)) : '';
            $gender = isset($rawData['gender']) ? trim($this->decrypt_aes_from_js($rawData['gender'], $AES_KEY)) : 'male';
            $bloodGroup = isset($rawData['bloodGroup']) ? trim($this->decrypt_aes_from_js($rawData['bloodGroup'], $AES_KEY)) : '';
            $emergencyContact = isset($rawData['emergencyContact']) ? trim($this->decrypt_aes_from_js($rawData['emergencyContact'], $AES_KEY)) : '';
            $address = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : 'male';



           


            // Validate email
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid email format"
                ]);
                return;
            }

            // ✅ Check if email already exists
            $this->db->where("email", $email);
            $this->db->where("hosuid", $loguid);
            $exists = $this->db->get("ms_patient")->row();

            if ($exists) {
                echo json_encode([
                    "success" => false,
                    "message" => "Email ID already exists"
                ]);
                return;
            }


            // Validate phone
            if (!$phone || strlen($phone) < 7 || strlen($phone) > 15) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid phone number"
                ]);
                return;
            }


            // Optional: Validate IDs exist in DB (hospital, specialization)
            if (!$this->DoctorCommonModel->existsHospital($loguid)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital does not exist"
                ]);
                return;
            }

            $password = "india@1234";
            

            $patientData = [
                'patient_uid'           => uniqid('PTF_'),
                'fname'                 => $fName,
                'lname'                 => $lName,
                'email'                 => $email,
                'password'              => md5($password),
                'phone'                 => $phone,
                'dob'                   => $dob,
                'gender'                => $gender,
                'blood_group'           => $bloodGroup,
                'emergency_contact'     => $emergencyContact,
                'address'               => $address,
                'hosuid'                => $loguid,
                'status'                => 0,
                'created_by'            => $loguid,
                'created_at'            => date('Y-m-d H:i:s')
            ];



           
            // 5️⃣ Insert into DB
            $insertId = $this->PatientCommonModel->insertPatientInformation($patientData);
            if ($insertId) {
                echo json_encode([
                    "success" => true,
                    "message" => "Staff added successfully",
                    "staff_id" => $insertId
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to add staff"
                ]);
            }


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    private function ensurePatientInfoShareTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `ms_hospitals_patient_info_share` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `hospital_id` INT NULL,
            `hosuid` VARCHAR(64) NULL,
            `patient_id` INT NOT NULL,
            `fname` VARCHAR(80) NULL,
            `lname` VARCHAR(80) NULL,
            `email` VARCHAR(128) NULL,
            `phone` VARCHAR(32) NULL,
            `dob` DATE NULL,
            `gender` VARCHAR(16) NULL,
            `blood_group` VARCHAR(16) NULL,
            `address` TEXT NULL,
            `share_to` VARCHAR(128) NULL,
            `status` TINYINT DEFAULT 1,
            `isdelete` TINYINT DEFAULT 0,
            `created_by` VARCHAR(64) NULL,
            `created_at` DATETIME NULL,
            `updated_at` DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $this->db->query($sql);
    }

    public function hs_patient_info_share_create() {
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
                echo json_encode(["success"=>false,"message"=>"Invalid user token or insufficient privileges"]);
                return;
            }

            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) {
                echo json_encode(["success"=>false,"message"=>"Invalid payload"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $patientIdEnc = $raw['patient_id'] ?? '';
            $shareToEnc = $raw['share_to'] ?? '';
            $fields = isset($raw['fields']) && is_array($raw['fields']) ? $raw['fields'] : [];

            $patientId = intval($this->decrypt_aes_from_js($patientIdEnc, $AES_KEY));
            $shareTo = trim($this->decrypt_aes_from_js($shareToEnc, $AES_KEY));

            if ($patientId <= 0) {
                echo json_encode(["success"=>false,"message"=>"Invalid patient"]);
                return;
            }
            if ($shareTo === '') {
                echo json_encode(["success"=>false,"message"=>"Share recipient required"]);
                return;
            }

            $this->ensurePatientInfoShareTable();

            $this->db->where("id", $patientId);
            $this->db->where("hosuid", $loguid);
            $p = $this->db->get("ms_patient")->row_array();
            if (!$p) {
                echo json_encode(["success"=>false,"message"=>"Patient not found"]);
                return;
            }

            $insert = [
                "hospital_id" => null,
                "hosuid" => $loguid,
                "patient_id" => $patientId,
                "fname" => in_array("fname", $fields) ? ($p['fname'] ?? '') : null,
                "lname" => in_array("lname", $fields) ? ($p['lname'] ?? '') : null,
                "email" => in_array("email", $fields) ? ($p['email'] ?? '') : null,
                "phone" => in_array("phone", $fields) ? ($p['phone'] ?? '') : null,
                "dob" => in_array("dob", $fields) ? ($p['dob'] ?? null) : null,
                "gender" => in_array("gender", $fields) ? ($p['gender'] ?? null) : null,
                "blood_group" => in_array("blood_group", $fields) ? ($p['blood_group'] ?? null) : null,
                "address" => in_array("address", $fields) ? ($p['address'] ?? null) : null,
                "share_to" => $shareTo,
                "status" => 1,
                "isdelete" => 0,
                "created_by" => $loguid,
                "created_at" => date('Y-m-d H:i:s'),
                "updated_at" => date('Y-m-d H:i:s')
            ];

            $this->db->insert("ms_hospitals_patient_info_share", $insert);
            echo json_encode(["success"=>true,"message"=>"Shared"]);
        } catch (Exception $e) {
            echo json_encode(["success"=>false,"message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }

    public function hs_patient_info_share_list() {
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
                echo json_encode(["success"=>false,"message"=>"Invalid user token or insufficient privileges"]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $this->ensurePatientInfoShareTable();

            $raw = json_decode(file_get_contents("php://input"), true);
            $limit = isset($raw['limit']) ? (int)$raw['limit'] : 10;
            $page = isset($raw['page']) ? (int)$raw['page'] : 1;
            $offset = ($page - 1) * $limit;

            $this->db->from("ms_hospitals_patient_info_share");
            $this->db->where("hosuid", $loguid);
            $this->db->where("isdelete", 0);
            $this->db->order_by("created_at", "DESC");
            $this->db->limit($limit, $offset);
            $rows = $this->db->get()->result_array();

            $list = [];
            foreach ($rows as $r) {
                $list[] = [
                    "id" => $r['id'],
                    "patient_id" => $r['patient_id'],
                    "name" => trim(($r['fname'] ?? '') . ' ' . ($r['lname'] ?? '')),
                    "email" => $r['email'] ?? '',
                    "phone" => $r['phone'] ?? '',
                    "dob" => $r['dob'] ?? '',
                    "gender" => $r['gender'] ?? '',
                    "blood_group" => $r['blood_group'] ?? '',
                    "address" => $r['address'] ?? '',
                    "share_to" => $r['share_to'] ?? '',
                    "status" => intval($r['status'] ?? 0),
                    "created_at" => $r['created_at'] ?? ''
                ];
            }

            $encryptedData = $this->encrypt_aes_for_js(json_encode($list), $AES_KEY);
            echo json_encode(["success"=>true,"data"=>$encryptedData]);
        } catch (Exception $e) {
            echo json_encode(["success"=>false,"message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }

    public function hs_patient_info_share_revoke() {
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
                echo json_encode(["success"=>false,"message"=>"Invalid user token or insufficient privileges"]);
                return;
            }

            $raw = json_decode(file_get_contents("php://input"), true);
            if (!$raw || !is_array($raw)) {
                echo json_encode(["success"=>false,"message"=>"Invalid payload"]);
                return;
            }
            $AES_KEY = "RohitGaradHos@173414";
            $idEnc = $raw['id'] ?? '';
            $id = intval($this->decrypt_aes_from_js($idEnc, $AES_KEY));
            if ($id <= 0) {
                echo json_encode(["success"=>false,"message"=>"Invalid share id"]);
                return;
            }

            $this->db->where("id", $id);
            $this->db->where("hosuid", $loguid);
            $this->db->update("ms_hospitals_patient_info_share", [
                "status" => 0,
                "updated_at" => date('Y-m-d H:i:s')
            ]);
            echo json_encode(["success"=>true,"message"=>"Revoked"]);
        } catch (Exception $e) {
            echo json_encode(["success"=>false,"message"=>"Authorization failed: " . $e->getMessage()]);
        }
    }

    public function UpdatePatientInformation() {
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
            if (!$rawData || !is_array($rawData)) {
                
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;

            }


            $requiredFields = ['firstName', 'lastName','phone','gender','bloodGroup'];


            foreach ($requiredFields as $field) {
                if (empty($rawData[$field])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required field: $field"
                    ]);
                    return;
                }
            }

            $AES_KEY = "RohitGaradHos@173414"; 


            $patientUid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

            $fName = isset($rawData['firstName']) ? trim($this->decrypt_aes_from_js($rawData['firstName'], $AES_KEY)) : '';
            $lName = isset($rawData['lastName']) ? trim($this->decrypt_aes_from_js($rawData['lastName'], $AES_KEY)) : '';
            
            $phone = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $dob = isset($rawData['dob']) ? trim($this->decrypt_aes_from_js($rawData['dob'], $AES_KEY)) : '';
            $gender = isset($rawData['gender']) ? trim($this->decrypt_aes_from_js($rawData['gender'], $AES_KEY)) : 'male';
            $bloodGroup = isset($rawData['bloodGroup']) ? trim($this->decrypt_aes_from_js($rawData['bloodGroup'], $AES_KEY)) : '';
            $emergencyContact = isset($rawData['emergencyContact']) ? trim($this->decrypt_aes_from_js($rawData['emergencyContact'], $AES_KEY)) : '';
            $address = isset($rawData['address']) ? trim($this->decrypt_aes_from_js($rawData['address'], $AES_KEY)) : 'male';

           
           
           


            // Validate phone
            if (!$phone || strlen($phone) < 7 || strlen($phone) > 15) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid phone number"
                ]);
                return;
            }


            // Optional: Validate IDs exist in DB (hospital, specialization)
            if (!$this->DoctorCommonModel->existsHospital($loguid)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital does not exist"
                ]);
                return;
            }

            

            $patientData = [

                'fname'                 => $fName,
                'lname'                 => $lName,
                'phone'                 => $phone,
                'dob'                   => $dob,
                'gender'                => $gender,
                'blood_group'           => $bloodGroup,
                'emergency_contact'     => $emergencyContact,
                'address'               => $address,
                'status'                => 0,
                'updated_by'            => $loguid,
                'updated_at'            => date('Y-m-d H:i:s')
            ];

            $update = $this->PatientCommonModel->UpdatePatientInformationByHospital($patientUid, $patientData, $loguid);
           
            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Patient updated successfully",
                    "staff_id" => $patientUid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update Patient"
                ]);
            }



        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


    public function changePatientStatus() {
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

            if (!isset($rawData['id'], $rawData['status'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing staff ID or status"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414"; 

            $patientUid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
            $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '';

            // Update staff status in DB
            $update = $this->PatientCommonModel->updateStaffStatusByHospital($patientUid, $loguid, $status);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Patient status updated successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update Patient status"
                ]);
            }
           


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function DeletePatientInformation() {
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

            if (!isset($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing staff ID or status"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414"; 

            $patientUid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

            $updateData = [
                'isdelete' => 1,
                'updated_by' => $loguid,
                'updated_at' => date('Y-m-d H:i:s')
            ];


            $update = $this->PatientCommonModel->UpdatePatientInformationByHospital($patientUid, $updateData, $loguid);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Patient deleted successfully ",
                    "patient_uid" => $patientUid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to delete Patient"
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function getPatientVisitHistory() {
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
            if (!isset($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing patient ID"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $patientId = trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY));

            if (!$patientId) {
                throw new Exception("Invalid Patient ID");
            }

            // Get Hospital ID
            $hospital_id = null;
            if ($hrole === 'hospital_admin') {
                $this->load->model('HospitalCommonModel');
                $hospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                if ($hospitalInfo && isset($hospitalInfo['id'])) {
                    $hospital_id = $hospitalInfo['id'];
                }
            } else {
                $this->load->model('StaffCommonModel');
                $staffInfo = $this->StaffCommonModel->get_logstaffInfo($loguid);
                if ($staffInfo && isset($staffInfo['hospital_id'])) {
                    $hospital_id = $staffInfo['hospital_id'];
                }
            }

            if (!$hospital_id) {
                 throw new Exception("Hospital information not found for this user");
            }

            $history = $this->PatientCommonModel->get_PatientVisitHistoryByHospital($patientId, $hospital_id);
            
            $encryptedData = $this->encrypt_aes_for_js(json_encode($history), $AES_KEY);

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

    public function getTreatment() {
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
            if (!isset($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing visit ID"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $visitId = trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)); // This is appointment_id

            if (!$visitId) {
                throw new Exception("Invalid Visit ID");
            }

            // Verify hospital context if needed, or just allow access for now
            // For strict security, we should check if the appointment belongs to this hospital
            
            $this->load->model('PatientTreatmentModel');
            $treatment = $this->PatientTreatmentModel->getTreatmentByAppointmentId($visitId);
            
            // If no treatment found, return empty or specific message?
            // Doctor view handles null/empty gracefully.
            
            $encryptedData = $this->encrypt_aes_for_js(json_encode($treatment), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData,
                "rowData" =>$treatment 
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }
    public function getPatientDetails() {
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

            if (!isset($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing patient ID"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414"; 

            $patientUid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

            $patientDetails = $this->PatientCommonModel->getPatientDetailsByHospital($patientUid, $loguid);
            
            if ($patientDetails) {
                 $encryptedData = $this->encrypt_aes_for_js(json_encode($patientDetails), $AES_KEY);
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
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

}


