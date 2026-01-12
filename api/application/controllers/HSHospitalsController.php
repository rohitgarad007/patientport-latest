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



    public function ManageHospitalList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            echo json_encode($tokenData);
            exit;

            
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

    /* ===== Shift CRUD Code Start Here ===== */
        public function getShiftList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                

                // Shift list
                $shiftList = $this->HospitalCommonModel->get_HospitalShiftList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($shiftList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $shiftList
                ]);

                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddShiftTime(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $start_time = isset($rawData['start_time']) ? trim($this->decrypt_aes_from_js($rawData['start_time'], $AES_KEY)) : '';
                $end_time = isset($rawData['end_time']) ? trim($this->decrypt_aes_from_js($rawData['end_time'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️ Validate required fields
                if (!$name || !$start_time || !$end_time) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $shiftuid = uniqid('HSF_');

                // 5️ Insert into database
                $insertData = [
                    'shiftuid'   => $shiftuid,
                    'hosuid'     => $loguid,
                    'shift_name' => $name,
                    'start_time' => $start_time,
                    'end_time'   => $end_time,
                    'status'     => $status,
                    'isdelete'   => 0,
                    'created_by' => $loguid,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_shift_time', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Shift time added successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add shift time"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateShiftTime(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $shiftuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $start_time = isset($rawData['start_time']) ? trim($this->decrypt_aes_from_js($rawData['start_time'], $AES_KEY)) : '';
                $end_time   = isset($rawData['end_time']) ? trim($this->decrypt_aes_from_js($rawData['end_time'], $AES_KEY)) : '';
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';


                // 4️⃣ Validate required fields
                if (!$shiftuid || !$name || !$start_time || !$end_time) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'shift_name' => $name,
                    'start_time' => $start_time,
                    'end_time'   => $end_time,
                    'status'     => $status,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ];

                $this->db->where('shiftuid', $shiftuid);
                $result = $this->db->update('ms_hospitals_shift_time', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Shift time updated successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update shift time"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteShiftTime() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $shiftuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$shiftuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('shiftuid', $shiftuid);
                $result = $this->db->update('ms_hospitals_shift_time', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Shift deleted successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete shift"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    /* ===== Shift CRUD Code end Here ===== */


    /* ===== Specialization CRUD Code Start Here ===== */
        public function getSpecializationList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                

                // Shift list
                $SpecializationList = $this->HospitalCommonModel->get_HospitalSpecializationList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($SpecializationList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $SpecializationList
                ]);

                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddSpecializationInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $speuid = uniqid('HSP_');

                // 5️ Insert into database
                $insertData = [
                    'speuid'        => $speuid,
                    'hosuid'        => $loguid,
                    'name'          => $name,
                    'description'   => $description,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_specialization', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "specialization time added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add specialization"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateSpecializationInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $speuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $description       = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';


                // 4️⃣ Validate required fields
                if (!$speuid || !$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'name'          => $name,
                    'description'   => $description,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('speuid', $speuid);
                $result = $this->db->update('ms_hospitals_specialization', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "specialization time updated successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update specialization"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteSpecializationInfo() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $speuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$speuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('speuid', $speuid);
                $result = $this->db->update('ms_hospitals_specialization', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "specialization deleted successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete specialization"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }
    /* ===== Specialization CRUD Code End Here ===== */

    /* ===== Event Type CRUD Code Start Here ===== */
        public function getEventTypeList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                

                // Shift list
                $eventTypeList = $this->HospitalCommonModel->get_HospitalEventTypeList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($eventTypeList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $eventTypeList
                ]);

                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddEventTypeInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $color = isset($rawData['color']) ? trim($this->decrypt_aes_from_js($rawData['color'], $AES_KEY)) : '#ccc';
                $description = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $eventuid = uniqid('HET_');

                // 5️ Insert into database
                $insertData = [
                    'eventuid'      => $eventuid,
                    'hosuid'        => $loguid,
                    'name'          => $name,
                    'color'          => $color,
                    'description'   => $description,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_event_type', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "event type added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add event type"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateEventTypeInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $eventuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $color       = isset($rawData['color']) ? trim($this->decrypt_aes_from_js($rawData['color'], $AES_KEY)) : '#ccc';
                $description       = isset($rawData['description']) ? trim($this->decrypt_aes_from_js($rawData['description'], $AES_KEY)) : '';
                
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';


                // 4️⃣ Validate required fields
                if (!$eventuid || !$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'name'          => $name,
                    'color'         => $color,
                    'description'   => $description,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('eventuid', $eventuid);
                $result = $this->db->update('ms_hospitals_event_type', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "event type time updated successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update event type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteEventTypeInformation() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $eventuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$eventuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('eventuid', $eventuid);
                $result = $this->db->update('ms_hospitals_event_type', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "event type deleted successfully",
                        "event_id" => $eventuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete event type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    /* ===== Event Type CRUD Code End Here ===== */


    /* ===== Department List CRUD Code Start Here ===== */
        public function getDepartmentList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                

                // Shift list
                $departmentList = $this->HospitalCommonModel->get_HospitalDepartmentList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($departmentList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $departmentList
                ]);

                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddDepartmentInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                
                
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $deptuid = uniqid('HDP_');

                // 5️ Insert into database
                $insertData = [
                    'deptuid'       => $deptuid,
                    'hosuid'        => $loguid,
                    'name'          => $name,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_department', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "department added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add department"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateDepartmentInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $deptuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
               
                
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';


                // 4️⃣ Validate required fields
                if (!$deptuid || !$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'name'          => $name,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('deptuid', $deptuid);
                $result = $this->db->update('ms_hospitals_department', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "event type time updated successfully",
                        "shift_id" => $shiftuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update event type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }


        public function DeleteDepartmentInformation() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $deptuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$deptuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('deptuid', $deptuid);
                $result = $this->db->update('ms_hospitals_department', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "department deleted successfully",
                        "department_id" => $deptuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete department"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    /* ===== Department List CRUD Code End Here ===== */


    /* ===== Role List CRUD Code Start Here ===== */
        public function getRoleList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                

                $roleList = $this->HospitalCommonModel->get_HospitalRoleList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($roleList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $roleList
                ]);

                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddRoleInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $deptuid = isset($rawData['deptuid']) ? trim($this->decrypt_aes_from_js($rawData['deptuid'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

        
                // 4️ Validate required fields
                if (!$name || !$deptuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }


                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $roleuid = uniqid('HRO_');

                // 5️ Insert into database
                $insertData = [
                    'roleuid'       => $roleuid,
                    'hosuid'        => $loguid,
                    'deptuid'       => $deptuid,
                    'name'          => $name,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_role', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "role added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add role"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateRoleInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $roleuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $deptuid   = isset($rawData['deptuid']) ? trim($this->decrypt_aes_from_js($rawData['deptuid'], $AES_KEY)) : '';
                $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
               
                
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';


                // 4️⃣ Validate required fields
                if (!$roleuid || !$deptuid || !$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'name'          => $name,
                    'deptuid'       => $deptuid,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('roleuid', $roleuid);
                $result = $this->db->update('ms_hospitals_role', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "event type time updated successfully",
                        "role_id" => $roleuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update event type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteRoleInformation() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $roleuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$roleuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('roleuid', $roleuid);
                $result = $this->db->update('ms_hospitals_role', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "role deleted successfully",
                        "role_id" => $roleuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete role"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }
    /* ===== Role List CRUD Code End Here ===== */



    /* ===== Amenity List CRUD Code Start Here ===== */

        public function getAmenityList(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                

                $amenityList = $this->HospitalCommonModel->get_HospitalAmenityList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($amenityList), $AES_KEY);


                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $amenityList
                ]);

                

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddAmenityInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $icon = isset($rawData['icon']) ? trim($this->decrypt_aes_from_js($rawData['icon'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

        
                // 4️ Validate required fields
                if (!$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }


                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $amenityuid = uniqid('HAE_');

                // 5️ Insert into database
                $insertData = [
                    'amenityuid'    => $amenityuid,
                    'hosuid'        => $loguid,
                    'name'          => $name,
                    'icon'          => $icon,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_amenity', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "amenity added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add amenity"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateAmenityInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $amenityuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $name       = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
                $icon       = isset($rawData['icon']) ? trim($this->decrypt_aes_from_js($rawData['icon'], $AES_KEY)) : '';
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';


                // 4️⃣ Validate required fields
                if (!$amenityuid || !$name) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'name'          => $name,
                    'icon'          => $icon,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('amenityuid', $amenityuid);
                $result = $this->db->update('ms_hospitals_amenity', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "amenity updated successfully",
                        "id" => $amenityuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update amenity"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteAmenityInformation() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $amenityuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$amenityuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('amenityuid', $amenityuid);
                $result = $this->db->update('ms_hospitals_amenity', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "amenity deleted successfully",
                        "id" => $amenityuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete amenity"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    /* ===== Amenity List CRUD Code End Here ===== */



    /* ===== Ward Type List CRUD Code Start Here ===== */

        public function getWardTypeList(){
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
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }
                $wardTypeList = $this->HospitalCommonModel->get_HospitalWardTypeList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($wardTypeList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $wardTypeList
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddWardTypeInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
                $hrole = $tokenData['role'] ?? null;
                $loguid = $tokenData['loguid'] ?? null;

                if (!$loguid || $hrole !== "hospital_admin") {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid user token or insufficient privileges"
                    ]);
                    return;
                }

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $title = isset($rawData['title']) ? trim($this->decrypt_aes_from_js($rawData['title'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$title) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $wardtypeuid = uniqid('HWT_');

                // 5️ Insert into database
                $insertData = [
                    'wardtypeuid'   => $wardtypeuid,
                    'hosuid'        => $loguid,
                    'title'         => $title,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_ward_type', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "ward type added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add ward type"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateWardTypeInfo(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $wardtypeuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $title       = isset($rawData['title']) ? trim($this->decrypt_aes_from_js($rawData['title'], $AES_KEY)) : '';
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️⃣ Validate required fields
                if (!$wardtypeuid || !$title) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'title'          => $title,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('wardtypeuid', $wardtypeuid);
                $result = $this->db->update('ms_hospitals_ward_type', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room type updated successfully",
                        "id" => $wardtypeuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update room type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteWardTypeInfo() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $wardtypeuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$wardtypeuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('wardtypeuid', $wardtypeuid);
                $result = $this->db->update('ms_hospitals_ward_type', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "ward type deleted successfully",
                        "id" => $wardtypeuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete ward type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

     /* ===== Ward Type List CRUD Code End Here ===== */

    /* ===== Ward List List CRUD Code Start Here ===== */

        public function getWarList(){
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
            
                $wardTypeList = $this->HospitalCommonModel->get_HospitalWardList($hospital_id);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($wardTypeList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "data2"    => $wardTypeList
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddWardInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            try {
                // Validate and decode token
                $token = verifyAuthToken($token);
                if (!$token) throw new Exception("Unauthorized");

                $tokenData = is_string($token) ? json_decode($token, true) : $token;

                //$muid = $tokenData['muid'] ?? null;
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

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $wardName = isset($rawData['ward_name']) ? trim($this->decrypt_aes_from_js($rawData['ward_name'], $AES_KEY)) : '';
                $wardType = isset($rawData['ward_type']) ? trim($this->decrypt_aes_from_js($rawData['ward_type'], $AES_KEY)) : '';
                $floor_no = isset($rawData['floor_no']) ? trim($this->decrypt_aes_from_js($rawData['floor_no'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

        
                // 4️ Validate required fields

                if (!$wardName || !$wardType) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                $warduid = uniqid('HW_');

                // 5️ Insert into database
                $insertData = [
                    'warduid'       => $warduid,
                    'hospital_id'   => $hospital_id,
                    'title'         => $wardName,
                    'ward_type'     => $wardType,
                    'floor_no'      => $floor_no,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_ward', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "ward added successfully",
                        "id" => $warduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add ward "
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateWardInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';
            
            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt fields
                $warduid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $wardName = isset($rawData['ward_name']) ? trim($this->decrypt_aes_from_js($rawData['ward_name'], $AES_KEY)) : '';
                $wardType = isset($rawData['ward_type']) ? trim($this->decrypt_aes_from_js($rawData['ward_type'], $AES_KEY)) : '';
                $floor_no = isset($rawData['floor_no']) ? trim($this->decrypt_aes_from_js($rawData['floor_no'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️⃣ Validate required fields
                if (!$warduid || !$wardName || !$wardType) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                $status = ($status === 'active' || $status === '1') ? 1 : 0;

                // 5️⃣ Update database
                $updateData = [
                    'title'         => $wardName,
                    'ward_type'     => $wardType,
                    'floor_no'      => $floor_no,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $warduid);
                $result = $this->db->update('ms_hospitals_ward', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "ward updated successfully",
                        "id" => $warduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update ward"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteWardInformation() {
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate token
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

                // 2️⃣ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 3️⃣ Decrypt shift ID
                $warduid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$warduid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('id', $warduid);
                $result = $this->db->update('ms_hospitals_ward', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "ward deleted successfully",
                        "id" => $warduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete ward"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    /* ===== Ward List List CRUD Code Start Here ===== */ 



}
