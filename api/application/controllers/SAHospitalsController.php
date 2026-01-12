<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SAHospitalsController  extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }

    public function ManageHospitalList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

             if (!$muid || $mrole !== "super_admin") {
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

            $limitValue = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';


            $offsetValue = ($page - 1) * $limitValue;

            // Fetch total count and paginated hospital list
            $total = $this->AdmCommonModel->get_hospitalCount($search);
            $totalRows = $total['total'] ?? 0;

            $hospitalList = $this->AdmCommonModel->get_hospitalList($search, $limitValue, $offsetValue);

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($hospitalList['data']), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data"    => $hospitalList['data'],
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limitValue
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    

    public function AddHospital() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");

            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

            if (!$muid || $mrole !== "super_admin") {
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
                    "message" => "Invalid or missing payload"
                ]);
                return;
            }

            // Required fields
            $requiredFields = ['name','registration_number','email','phone','state','city','pincode','type','address'];
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

            // 🔑 Decrypt all inputs safely
            $decrypt = function($key) use ($rawData, $AES_KEY) {
                return isset($rawData[$key])
                    ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY))
                    : '';
            };

            $name                = $decrypt('name');
            $registration_number = $decrypt('registration_number');
            $email               = $decrypt('email');
            $phone               = $decrypt('phone');
            $alternate_phone     = $decrypt('alternate_phone');
            $address             = $decrypt('address');
            $city                = $decrypt('city');
            $state               = $decrypt('state');
            $country             = $decrypt('country') ?: 'India';
            $pincode             = $decrypt('pincode');
            $type                = $decrypt('type');
            $logo_url            = $decrypt('logo_url');
            $website_url         = $decrypt('website_url');
            $password            = $decrypt('password');
            $doctorsCount        = $decrypt('doctorsCount');
            $staffCount          = $decrypt('staffCount');

            // 🔑 Default password if empty
            if (empty($password)) {
                $password = "india@1234";
            }

            // ✅ Check if email already exists
            $this->db->where("email", $email);
            //$this->db->where("isdelete", 0); // check only active records
            $exists = $this->db->get("ms_hospitals")->row();

            if ($exists) {
                echo json_encode([
                    "success" => false,
                    "message" => "Email ID already exists"
                ]);
                return;
            }

            // Prepare data for insertion
            $hospitalData = [
                'hosuid'              => uniqid('HOS_'),
                'name'                => $name,
                'registration_number' => $registration_number,
                'email'               => $email,
                'password'            => md5($password),
                'phone'               => $phone,
                'alternate_phone'     => $alternate_phone,
                'address'             => $address,
                'city'                => $city,
                'state'               => $state,
                'country'             => $country,
                'doctorsCount'        => $doctorsCount,
                'staffCount'          => $staffCount,
                'pincode'             => $pincode,
                'type'                => $type,
                'logo_url'            => $logo_url,
                'website_url'         => $website_url,
                'status'              => 1, // active by default
                'created_by'          => $muid,
                'created_at'          => date('Y-m-d H:i:s')
            ];

            // Insert into database
            $insertId = $this->AdmCommonModel->insertHospital($hospitalData);

            if ($insertId) {
                echo json_encode([
                    "success" => true,
                    "message" => "Hospital added successfully",
                    "hospital_id" => $insertId
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to add hospital"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }


    


    public function UpdateHospital() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");

            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

            if (!$muid || $mrole !== "super_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // 2️⃣ Read Payload
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid or missing payload"
                ]);
                return;
            }

            // 3️⃣ Ensure 'id' is present
            if (empty($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing hospital ID"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            // 🔑 Decrypt helper
            $decrypt = function($key) use ($rawData, $AES_KEY) {
                return isset($rawData[$key])
                    ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY))
                    : '';
            };

            // 4️⃣ Decrypt only allowed update fields (exclude email & password)
            $hospitalData = [
                'name'                => $decrypt('name'),
                'registration_number' => $decrypt('registration_number'),
                'phone'               => $decrypt('phone'),
                'alternate_phone'     => $decrypt('alternate_phone'),
                'address'             => $decrypt('address'),
                'city'                => $decrypt('city'),
                'state'               => $decrypt('state'),
                'country'             => $decrypt('country') ?: 'India',
                'pincode'             => $decrypt('pincode'),
                'doctorsCount'        => $decrypt('doctorsCount'),
                'staffCount'          => $decrypt('staffCount'),
                'type'                => $decrypt('type'),
                'logo_url'            => $decrypt('logo_url'),
                'website_url'         => $decrypt('website_url'),
                'updated_by'          => $muid,
                'updated_at'          => date('Y-m-d H:i:s')
            ];

            // 5️⃣ Update in DB
            $update = $this->AdmCommonModel->updateHospital($rawData['id'], $hospitalData);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Hospital updated successfully",
                    "hospital_id" => $rawData['id']
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update hospital"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
    }



    public function changeHospitalStatus() {
        try {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            $tokenData = verifyAuthToken($token);

            if (!$tokenData) throw new Exception("Unauthorized");

            $tokenData = is_string($tokenData) ? json_decode($tokenData, true) : $tokenData;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

            if (!$muid || $mrole !== "super_admin") {
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
                    "message" => "Missing hospital ID or status"
                ]);
                return;
            }

            $hosuid = $rawData['id'];
            $status = $rawData['status'] === "active" ? "1" : "0";

            // Update hospital status in DB
            $update = $this->AdmCommonModel->updateHospitalStatus($hosuid, $status);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Hospital status updated successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update hospital status"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function DeleteHospital() {
        try {
            // 1️⃣ Verify Authorization Token
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            $decodedToken = verifyAuthToken($token);
            if (!$decodedToken) throw new Exception("Unauthorized");

            $tokenData = is_string($decodedToken) ? json_decode($decodedToken, true) : $decodedToken;
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

            if (!$muid || $mrole !== "super_admin") {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // 2️⃣ Read payload
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !isset($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing hospital ID"
                ]);
                return;
            }

            $hosuid = $rawData['id'];

            // 3️⃣ Soft delete: set isdelete = 1
            $updateData = [
                'isdelete' => 1,
                'updated_by' => $muid,
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $update = $this->AdmCommonModel->updateHospital($hosuid, $updateData);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Hospital deleted successfully",
                    "hospital_id" => $hosuid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to delete hospital"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ]);
        }
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


}
