<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MasterRoomDataController extends CI_Controller {

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

    // Staff: Get Ward List
    public function getWardList(){
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

            $wardList = $this->HospitalCommonModel->get_HospitalWardListById($staffInfo['hospital_id']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($wardList), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "data2"    => $wardList,
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    // Staff: Get Room List by Ward
    public function getRoomList(){
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

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $ward_id = isset($rawData['warduid']) ? trim($this->decrypt_aes_from_js($rawData['warduid'], $AES_KEY)) : '';
            if (!$ward_id) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing required field: ward_id"
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

            $roomList = $this->HospitalCommonModel->get_HospitalRoomListById($staffInfo['hospital_id'], $ward_id);
            $encryptedData = $this->encrypt_aes_for_js(json_encode($roomList), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "data2"    => $roomList,
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    // Staff: Get Bed List by Room
    public function getBedList(){
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

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";
            $room_id = isset($rawData['roomuid']) ? trim($this->decrypt_aes_from_js($rawData['roomuid'], $AES_KEY)) : '';
            if (!$room_id) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing required field: room_id"
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

            $bedList = $this->HospitalCommonModel->get_HospitalRoomBedListById($staffInfo['hospital_id'], $room_id);
            $encryptedData = $this->encrypt_aes_for_js(json_encode($bedList), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "data2"    => $bedList,
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
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

            $doctorsList = $this->DoctorCommonModel->get_ActiveDoctorsOptionListByHospital($staffInfo['hosuid']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "data"    => $doctorsList
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

            $activityList = $this->HospitalCommonModel->get_activityOptionList($staffInfo['hosuid']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($activityList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data"    => $activityList
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

            $activityList = $this->HospitalCommonModel->get_patientCurrentStatusOptionList($staffInfo['hosuid']);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($activityList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data"    => $activityList
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


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

             // Get POST data
            $payload = json_decode($this->input->raw_input_stream, true);
            $page    = isset($payload['page']) ? (int)$payload['page'] : 1;
            $limit   = isset($payload['limit']) ? (int)$payload['limit'] : 10;
            $search  = isset($payload['search']) ? trim($payload['search']) : '';

            $offset = ($page - 1) * $limit;
            $hosuid = $staffInfo['hosuid'];

            $this->db->select('id, patient_uid as patientuid, fname, lname, email');
            $this->db->from('ms_patient');
            $this->db->where('hosuid', $hosuid);
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
            /*$encryptedData = $this->encrypt_aes_for_js(json_encode([
                "list" => $patients,
                "pagination" => [
                    "page" => $page,
                    "limit" => $limit,
                    "total" => $totalCount,
                    "pages" => ceil($totalCount / $limit)
                ]
            ]), $AES_KEY);*/

            $encryptedData = $this->encrypt_aes_for_js(json_encode($patients), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data" => $encryptedData,
                "data2" => $patients
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


 

    public function staffBookBedForPatient(){
        // Step 1: Get the Authorization Token
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Step 2: Verify the Token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            // Step 3: Validate Role
            if (!$loguid) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }

            // Step 4: Decrypt Payload
            $AES_KEY = "RohitGaradHos@173414";
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $patient_id     = trim($this->decrypt_aes_from_js($rawData['patientuid'], $AES_KEY));
            $ward_id        = trim($this->decrypt_aes_from_js($rawData['warduid'], $AES_KEY));
            $room_id        = trim($this->decrypt_aes_from_js($rawData['roomuid'], $AES_KEY));
            $bed_id         = trim($this->decrypt_aes_from_js($rawData['beduid'], $AES_KEY));
            $doctor_id      = trim($this->decrypt_aes_from_js($rawData['docuid'], $AES_KEY));
            $activity_type  = trim($this->decrypt_aes_from_js($rawData['activityType'], $AES_KEY));
            $current_status = trim($this->decrypt_aes_from_js($rawData['currentStatus'], $AES_KEY));
            $priority       = trim($this->decrypt_aes_from_js($rawData['priority'], $AES_KEY));
            $medical_notes  = trim($this->decrypt_aes_from_js($rawData['medicalNotes'], $AES_KEY));
            $action         = trim($this->decrypt_aes_from_js($rawData['action'], $AES_KEY));

            // Step 5: Retrieve Staff Info
            $staffInfo = $this->StaffCommonModel->get_logstaffInfoWithAccess($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Staff hospital not found"
                ]);
                return;
            }

            $hospital_id = $staffInfo['hospital_id'];
            $bad_request_approved = isset($staffInfo['bad_request_approved']) ? $staffInfo['bad_request_approved'] : 0;
            $logstaff_id = $staffInfo['id'];

            if ($bad_request_approved == 1) {
                $permission_status = 1;
                $permission_change_by = $staffInfo['id'];
            } else {
                $permission_status = 0;
                $permission_change_by = 0;
            }
            

            // ✅ Start Transaction
            $this->db->trans_start();

            // Step 6: Insert Into `ms_patient_bed_admission`
            $admit_date = date('Y-m-d H:i:s');
            $insertAdmissionQuery = "
                INSERT INTO ms_patient_bed_admission
                (patient_id, hospital_id, ward_id, room_id, bed_id, doctor_id, admit_date, activity_type, current_status, priority, medical_notes, created_by, permission_status, permission_change_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            $this->db->query($insertAdmissionQuery, [
                $patient_id, $hospital_id, $ward_id, $room_id, $bed_id, $doctor_id,
                $admit_date, $activity_type, $current_status, $priority, $medical_notes, $logstaff_id, $permission_status, $permission_change_by
            ]);

            // ✅ Get the inserted admission ID
            $admission_id = $this->db->insert_id();
            if (!$admission_id) {
                throw new Exception("Failed to get admission ID");
            }

            // Step 7: Update Bed Table
            $updateBedQuery = "
                UPDATE ms_hospitals_rooms_bed
                SET status = 2, assigned_patient_id = ?, admission_id = ?
                WHERE id = ?
            ";
            $this->db->query($updateBedQuery, [$patient_id, $admission_id, $bed_id]);

            // Step 8: Insert Into `ms_bed_allocation_history`
            $from_beduid = 0;
            $to_beduid = $bed_id;
            $from_date = date('Y-m-d H:i:s');

            $insertHistoryQuery = "
                INSERT INTO ms_bed_allocation_history
                (admission_id, patient_id, hospital_id, doctor_id, activity_type, from_bed_id, to_bed_id, from_date, medical_notes, created_by, to_ward_id, to_room_id, priority, permission_status, permission_change_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            $this->db->query($insertHistoryQuery, [
                $admission_id, $patient_id, $hospital_id, $doctor_id, $activity_type, $from_beduid, $to_beduid,
                $from_date, $medical_notes, $logstaff_id, $ward_id, $room_id, $priority, $permission_status, $permission_change_by
            ]);

            // ✅ Complete Transaction
            $this->db->trans_complete();

            // Step 9: Check Transaction Status
            if ($this->db->trans_status() === FALSE) {
                throw new Exception("Database transaction failed. All changes rolled back.");
            }

            // Step 10: Success Response
            echo json_encode([
                "success" => true,
                "message" => "Bed booked successfully for the patient",
                "admission_id" => $admission_id
            ]);

        } catch (Exception $e) {
            // Rollback if any manual error occurs before completion
            if ($this->db->trans_status() !== FALSE) {
                $this->db->trans_rollback();
            }

            echo json_encode([
                "success" => false,
                "message" => "Booking failed: " . $e->getMessage()
            ]);
        }
    }




    



    public function staffBookBedTransferForPatient() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            // Verify token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            $srole = $tokenData['role'] ?? null;
            $loguid = $tokenData['loguid'] ?? null;

            if (!$loguid) {
                throw new Exception("Invalid user token or insufficient privileges");
            }

            // Decrypt payload
            $AES_KEY = "RohitGaradHos@173414";
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) throw new Exception("Invalid payload");

            $patient_id     = trim($this->decrypt_aes_from_js($rawData['patientuid'], $AES_KEY));
            $from_ward_id   = trim($this->decrypt_aes_from_js($rawData['from_warduid'], $AES_KEY));
            $from_room_id   = trim($this->decrypt_aes_from_js($rawData['from_roomuid'], $AES_KEY));
            $from_bed_id    = trim($this->decrypt_aes_from_js($rawData['from_beduid'], $AES_KEY));
            $to_ward_id     = trim($this->decrypt_aes_from_js($rawData['to_warduid'], $AES_KEY));
            $to_room_id     = trim($this->decrypt_aes_from_js($rawData['to_roomuid'], $AES_KEY));
            $to_bed_id      = trim($this->decrypt_aes_from_js($rawData['to_beduid'], $AES_KEY));
            $doctor_id      = trim($this->decrypt_aes_from_js($rawData['docuid'], $AES_KEY));
            $activity_type  = trim($this->decrypt_aes_from_js($rawData['activityType'], $AES_KEY));
            $current_status = trim($this->decrypt_aes_from_js($rawData['currentStatus'], $AES_KEY));
            $priority       = trim($this->decrypt_aes_from_js($rawData['priority'], $AES_KEY));
            $medical_notes  = trim($this->decrypt_aes_from_js($rawData['medicalNotes'], $AES_KEY));

            // Staff info
            $staffInfo = $this->StaffCommonModel->get_logstaffInfoWithAccess($loguid);
            if (!$staffInfo || empty($staffInfo['hosuid'])) {
                throw new Exception("Staff hospital not found");
            }

            $hospital_id = $staffInfo['hospital_id'];
            $bad_request_approved = isset($staffInfo['bad_request_approved']) ? $staffInfo['bad_request_approved'] : 0;
            $logstaff_id = $staffInfo['id'];

            if ($bad_request_approved == 1) {
                $permission_status = 1;
                $permission_change_by = $staffInfo['id'];
            } else {
                $permission_status = 0;
                $permission_change_by = 0;
            }


            // Begin transaction
            $this->db->trans_strict(TRUE);
            $this->db->trans_start();

            // Find existing active admission
            $admission = $this->db->select('id, bed_id')
                ->from('ms_patient_bed_admission')
                ->where('patient_id', $patient_id)
                ->where('hospital_id', $hospital_id)
                ->where('discharge_date IS NULL', null, false)
                ->order_by('id', 'DESC')
                ->limit(1)
                ->get()
                ->row_array();

            if (!$admission) {
                throw new Exception("No active admission found for this patient.");
            }

            $admission_id = $admission['id'];

            // Update old bed to available
            $this->db->where('id', $from_bed_id)
                ->update('ms_hospitals_rooms_bed', [
                    'status' => 1,
                    'assigned_patient_id' => null,
                    'admission_id' => null
                ]);

            // Update admission to new bed details
            $this->db->where('id', $admission_id)
                ->update('ms_patient_bed_admission', [
                    'ward_id' => $to_ward_id,
                    'room_id' => $to_room_id,
                    'bed_id' => $to_bed_id,
                    'doctor_id' => $doctor_id,
                    'activity_type' => $activity_type,
                    'current_status' => $current_status,
                    'permission_status' => $permission_status,
                    'permission_change_by' => $permission_change_by,
                    'priority' => $priority,
                    'updated_at' => date('Y-m-d H:i:s'),
                    'updated_by' => $logstaff_id
                ]);

            // Update new bed as occupied
            $this->db->where('id', $to_bed_id)
                ->update('ms_hospitals_rooms_bed', [
                    'status' => 2,
                    'assigned_patient_id' => $patient_id,
                    'admission_id' => $admission_id
                ]);

            // Insert transfer history
            $this->db->insert('ms_bed_allocation_history', [
                'admission_id' => $admission_id,
                'patient_id' => $patient_id,
                'hospital_id' => $hospital_id,
                'ward_id' => $from_ward_id,
                'room_id' => $from_room_id,
                'bed_id' => $from_bed_id,
                'from_bed_id' => $from_bed_id,
                'to_bed_id' => $to_bed_id,
                'to_ward_id' => $to_ward_id,
                'to_room_id' => $to_room_id,
                'doctor_id' => $doctor_id,
                'activity_type' => $activity_type,
                'current_status' => $current_status,
                'priority' => $priority,
                'medical_notes' => $medical_notes,
                'created_by' => $logstaff_id,
                'permission_status' => $permission_status,
                'permission_change_by' => $permission_change_by,
            ]);

            $this->db->trans_complete();

            if ($this->db->trans_status() === FALSE) {
                throw new Exception("Database transaction failed. Changes rolled back.");
            }

            echo json_encode([
                "success" => true,
                "message" => "Patient bed transferred successfully",
                "admission_id" => $admission_id
            ]);

        } catch (Exception $e) {
            if ($this->db->trans_status() !== FALSE) {
                $this->db->trans_rollback();
            }
            echo json_encode([
                "success" => false,
                "message" => "Transfer failed: " . $e->getMessage()
            ]);
        }
    }



}