<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MasterRoomController  extends CI_Controller {

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



    /* ===== Room Type List CRUD Code Start Here ===== */

        public function getRoomTypeList(){
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
                $roomTypeList = $this->HospitalCommonModel->get_HospitalRoomTypeList($loguid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($roomTypeList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    //"data"    => $roomTypeList
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddRoomTypeInfo(){
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

                $roomtypeuid = uniqid('HRT_');

                // 5️ Insert into database
                $insertData = [
                    'roomtypeuid'   => $roomtypeuid,
                    'hosuid'        => $loguid,
                    'title'         => $title,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $result = $this->db->insert('ms_hospitals_room_type', $insertData);
                

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room type added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add room type"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateRoomTypeInfo(){
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
                $roomtypeuid   = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $title       = isset($rawData['title']) ? trim($this->decrypt_aes_from_js($rawData['title'], $AES_KEY)) : '';
                $status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️⃣ Validate required fields
                if (!$roomtypeuid || !$title) {
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

                $this->db->where('roomtypeuid', $roomtypeuid);
                $result = $this->db->update('ms_hospitals_room_type', $updateData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room type updated successfully",
                        "id" => $roomtypeuid
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

        public function DeleteRoomTypeInfo() {
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
                $roomtypeuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$roomtypeuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('roomtypeuid', $roomtypeuid);
                $result = $this->db->update('ms_hospitals_room_type', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room type deleted successfully",
                        "id" => $roomtypeuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete room type"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }
    /* ===== Room Type List CRUD Code End Here ===== */


    /* ===== Room List CRUD Code Start Here ===== */

        public function getRoomFullList(){
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

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
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



                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $wardid = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                
                // echo "testi"+ $wardid;
               
                // 4️ Validate required fields
                if (!$wardid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }


            $roomList = $this->HospitalCommonModel->get_HospitalRoomList($hospital_id, $wardid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($roomList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "rowData"    => $roomList,
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function AddRoomInformation(){
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

                $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "hospital not found"
                    ]);
                    return;
                }

                $hospital_id = $HospitalInfo['id'];


                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $wardid = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                $room_name = isset($rawData['room_name']) ? trim($this->decrypt_aes_from_js($rawData['room_name'], $AES_KEY)) : '';
                $room_type = isset($rawData['room_type']) ? trim($this->decrypt_aes_from_js($rawData['room_type'], $AES_KEY)) : '';
                $bed_count = isset($rawData['bed_count']) ? trim($this->decrypt_aes_from_js($rawData['bed_count'], $AES_KEY)) : '';
                $amenities = isset($rawData['amenities']) ? trim($this->decrypt_aes_from_js($rawData['amenities'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$wardid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                //$status = ($status === 'active' || $status === '1') ? 1 : 0;

                $roomtypeuid = uniqid('HR_');

                // 5️ Insert into database
                $insertData = [
                    'roomuid'       => $roomtypeuid,
                    'ward_id'       => $wardid,
                    'hospital_id'   => $hospital_id,
                    'title'         => $room_name,
                    'room_type'     => $room_type,
                    'bed_count'     => $bed_count,
                    'amenities'     => $amenities,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                
                $result = $this->db->insert('ms_hospitals_rooms', $insertData);
                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room added successfully",
                        "shift_id" => $speuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add room"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function UpdateRoomInformation(){
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
                $roomuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $wardid = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                $room_name = isset($rawData['room_name']) ? trim($this->decrypt_aes_from_js($rawData['room_name'], $AES_KEY)) : '';
                $room_type = isset($rawData['room_type']) ? trim($this->decrypt_aes_from_js($rawData['room_type'], $AES_KEY)) : '';
                $bed_count = isset($rawData['bed_count']) ? trim($this->decrypt_aes_from_js($rawData['bed_count'], $AES_KEY)) : '';
                $amenities = isset($rawData['amenities']) ? trim($this->decrypt_aes_from_js($rawData['amenities'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$wardid || !$roomuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                //$status = ($status === 'active' || $status === '1') ? 1 : 0;


                // 5️ Insert into database
                $updateData = [
                    'title'         => $room_name,
                    'room_type'     => $room_type,
                    'bed_count'     => $bed_count,
                    'amenities'     => $amenities,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                $this->db->where('id', $roomuid);
                $this->db->where('ward_id', $wardid);

                $result = $this->db->update('ms_hospitals_rooms', $updateData);

                


                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room updated successfully",
                        "id" => $roomuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update room"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        public function DeleteRoomInformation() {
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
                $roomuid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$roomuid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('id', $roomuid);
                $result = $this->db->update('ms_hospitals_rooms', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room deleted successfully",
                        "id" => $roomuid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete room"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

    /* ===== Room List CRUD Code End Here ===== */



    /* ===== Bed List CRUD Code Start Here ===== */

        public function getBedFullList(){
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

                // 2️ Get payload
                $rawData = json_decode(file_get_contents("php://input"), true);
                if (!$rawData || !is_array($rawData)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid payload"
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




                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $roomid = isset($rawData['room_id']) ? trim($this->decrypt_aes_from_js($rawData['room_id'], $AES_KEY)) : '';
        
                // 4️ Validate required fields
                if (!$roomid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }


                $bedList = $this->HospitalCommonModel->get_HospitalRoomBedList($HospitalInfo['id'], $roomid);
                $AES_KEY = "RohitGaradHos@173414";
                $encryptedData = $this->encrypt_aes_for_js(json_encode($bedList), $AES_KEY);
                echo json_encode([
                    "success" => true,
                    "data"    => $encryptedData,
                    "rowData"    => $bedList,
                ]);
            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }

        /*public function AddBedInformation(){
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

                $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "hospital not found"
                    ]);
                    return;
                }



                $AES_KEY = "RohitGaradHos@173414";

                // 3️ Decrypt fields
                $wardid = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                $roomuid = isset($rawData['room_id']) ? trim($this->decrypt_aes_from_js($rawData['room_id'], $AES_KEY)) : '';
                $bed_number = isset($rawData['bed_number']) ? trim($this->decrypt_aes_from_js($rawData['bed_number'], $AES_KEY)) : '';
                //$assigned_patient_id = isset($rawData['assigned_patient_id']) ? trim($this->decrypt_aes_from_js($rawData['assigned_patient_id'], $AES_KEY)) : '';
    
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);

        
                // 4️ Validate required fields
                if (!$wardid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                //$status = ($status === 'active' || $status === '1') ? 1 : 0;


                // 5️ Insert into database
                $insertData = [
                    'ward_id'       => $wardid,
                    'room_id'       => $roomuid,
                    'hospital_id'   => $HospitalInfo['id'],
                    'title'         => $bed_number,
                    'status'        => $status,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                

                
                $result = $this->db->insert('ms_hospitals_rooms_bed', $insertData);
                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room added successfully",
                        "shift_id" => $beduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add room"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }*/

        public function AddBedInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate and decode token
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

                // 3️⃣ Get hospital info
                $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital not found"
                    ]);
                    return;
                }

                $AES_KEY = "RohitGaradHos@173414";

                // 4️⃣ Decrypt incoming fields
                $wardid      = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                $roomuid     = isset($rawData['room_id']) ? trim($this->decrypt_aes_from_js($rawData['room_id'], $AES_KEY)) : '';
                $bed_number  = isset($rawData['bed_number']) ? trim($this->decrypt_aes_from_js($rawData['bed_number'], $AES_KEY)) : '';
               // $status      = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 5️⃣ Validate required fields
                if (empty($wardid) || empty($roomuid) || empty($bed_number)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                // 6️⃣ Check if bed already exists in this hospital
                $this->db->where('hospital_id', $HospitalInfo['id']);
                $this->db->where('title', $bed_number);
                $this->db->where('isdelete', 0);
                $existingBed = $this->db->get('ms_hospitals_rooms_bed')->row();

                if ($existingBed) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Bed number already exists in this hospital"
                    ]);
                    return;
                }

                // 7️⃣ Prepare insert data
                $insertData = [
                    'ward_id'       => $wardid,
                    'room_id'       => $roomuid,
                    'hospital_id'   => $HospitalInfo['id'],
                    'title'         => $bed_number,
                    'status'        => 1,
                    'isdelete'      => 0,
                    'created_by'    => $loguid,
                    'created_at'    => date('Y-m-d H:i:s'),
                    'updated_at'    => date('Y-m-d H:i:s')
                ];

                // 8️⃣ Insert new bed record
                $result = $this->db->insert('ms_hospitals_rooms_bed', $insertData);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Bed added successfully"
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to add bed"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }


        /*public function UpdateBedInformation(){
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
                $beduid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $wardid = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                $roomuid = isset($rawData['room_id']) ? trim($this->decrypt_aes_from_js($rawData['room_id'], $AES_KEY)) : '';
                $bed_number = isset($rawData['bed_number']) ? trim($this->decrypt_aes_from_js($rawData['bed_number'], $AES_KEY)) : '';
                $status = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';
        
                // 4️ Validate required fields
                if (!$wardid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }
                //$status = ($status === 'active' || $status === '1') ? 1 : 0;

                $updateData = [
                    'title'         => $bed_number,
                    'status'        => $status,
                    'updated_by'    => $loguid,
                    'updated_at'    => date('Y-m-d H:i:s'),
                   
                ];

                


                $this->db->where('roomuid', $roomuid);
                $this->db->where('warduid', $wardid);
                $this->db->where('beduid', $beduid);

                $result = $this->db->update('ms_hospitals_rooms_bed', $updateData);

                
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "room update successfully",
                        "id" => $beduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update room"
                    ]);
                }

                

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }*/

        public function UpdateBedInformation(){
            $userToken = $this->input->get_request_header('Authorization');
            $splitToken = explode(" ", $userToken);
            $token = isset($splitToken[1]) ? $splitToken[1] : '';

            try {
                // 1️⃣ Validate and decode token
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
                $beduid     = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
                $wardid     = isset($rawData['ward_id']) ? trim($this->decrypt_aes_from_js($rawData['ward_id'], $AES_KEY)) : '';
                $roomuid    = isset($rawData['room_id']) ? trim($this->decrypt_aes_from_js($rawData['room_id'], $AES_KEY)) : '';
                $bed_number = isset($rawData['bed_number']) ? trim($this->decrypt_aes_from_js($rawData['bed_number'], $AES_KEY)) : '';
                //$status     = isset($rawData['status']) ? trim($this->decrypt_aes_from_js($rawData['status'], $AES_KEY)) : '0';

                // 4️⃣ Validate required fields
                if (empty($beduid) || empty($wardid) || empty($roomuid) || empty($bed_number)) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required fields"
                    ]);
                    return;
                }

                // 5️⃣ Get hospital info
                $HospitalInfo = $this->HospitalCommonModel->get_logHospitalInfo($loguid);
                if (!$HospitalInfo || empty($HospitalInfo['hosuid'])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Hospital not found"
                    ]);
                    return;
                }

                // 6️⃣ Check for duplicate bed number within same hospital (excluding current bed)
                $this->db->where('hospital_id', $HospitalInfo['id']);
                $this->db->where('title', $bed_number);
                $this->db->where('isdelete', 0);
                $this->db->where('id !=', $beduid);
                $existingBed = $this->db->get('ms_hospitals_rooms_bed')->row();

                if ($existingBed) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Bed number already exists in this hospital"
                    ]);
                    return;
                }

                // 7️⃣ Prepare update data
                $updateData = [
                    'title'       => $bed_number,
                    'updated_by'  => $loguid,
                    'updated_at'  => date('Y-m-d H:i:s'),
                ];

                // 8️⃣ Perform update
                $this->db->where('id', $beduid);
                $this->db->where('ward_id', $wardid);
                $this->db->where('room_id', $roomuid);
                $result = $this->db->update('ms_hospitals_rooms_bed', $updateData);

                // 9️⃣ Return response
                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Bed updated successfully",
                        "id" => $beduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to update bed"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }



        public function DeleteBedInformation() {
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
                $beduid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';

                if (!$beduid) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing shift ID"
                    ]);
                    return;
                }

                // 4️⃣ Delete (soft delete)
                $this->db->where('beduid', $beduid);
                $result = $this->db->update('ms_hospitals_rooms_bed', [
                    'isdelete'   => 1,
                    'updated_by' => $loguid,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);

                if ($result) {
                    echo json_encode([
                        "success" => true,
                        "message" => "bed deleted successfully",
                        "id" => $beduid
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Failed to delete bed"
                    ]);
                }

            } catch (Exception $e) {
                echo json_encode([
                    "success" => false,
                    "message" => "Authorization failed: " . $e->getMessage()
                ]);
            }
        }
    /* ===== Bed List CRUD Code End Here ===== */
}
