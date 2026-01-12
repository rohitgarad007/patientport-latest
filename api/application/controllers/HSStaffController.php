<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSStaffController  extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->model('DoctorCommonModel');
        $this->load->model('StaffCommonModel');
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


    public function AddStaffInformation() {
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


            $requiredFields = ['name','email','phone','role','department'];


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


            $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
            $email = isset($rawData['email']) ? trim($this->decrypt_aes_from_js($rawData['email'], $AES_KEY)) : '';
            $password = isset($rawData['password']) ? trim($this->decrypt_aes_from_js($rawData['password'], $AES_KEY)) : '';
            $phone = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $role = isset($rawData['role']) ? trim($this->decrypt_aes_from_js($rawData['role'], $AES_KEY)) : '';
            $department = isset($rawData['department']) ? trim($this->decrypt_aes_from_js($rawData['department'], $AES_KEY)) : '';
            $hospitalId = isset($rawData['hospitalId']) ? trim($this->decrypt_aes_from_js($rawData['hospitalId'], $AES_KEY)) : '';
            $shift = isset($rawData['shift']) ? trim($this->decrypt_aes_from_js($rawData['shift'], $AES_KEY)) : '';
            

            $experienceYears = isset($rawData['experienceYears']) ? floatval($this->decrypt_aes_from_js($rawData['experienceYears'], $AES_KEY)) : 0;

            $experienceMonths = isset($rawData['experienceMonths']) ? floatval($this->decrypt_aes_from_js($rawData['experienceMonths'], $AES_KEY)) : 0;

            // 🔑 Default password if empty
            if (empty($password)) {
                $password = "india@1234";
            }

           


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
            // $this->db->where("isdelete", 0); // check only active records
            $exists = $this->db->get("ms_staff")->row();

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

            
            $staffUid = uniqid('STF_');

            $staffData = [
                'staff_uid'             => $staffUid,
                'name'                  => $name,
                'email'                 => $email,
                'password'              => md5($password),
                'phone'                 => $phone,
                'role'                  => $role,
                'department'            => $department,
                'hosuid'                => $loguid,
                'shift'                 => $shift,
                'experience_years'      => $experienceYears,
                'experience_months'     => $experienceMonths,
                'status'                => 0,
                'created_by'            => $loguid,
                'created_at'            => date('Y-m-d H:i:s')
            ];

           

           

            // 5️⃣ Insert into DB
            $insertId = $this->StaffCommonModel->insertStaffInformation($staffData);
            if ($insertId) {

                $staffAccess = [
                    'staff_uid'           => $staffUid,
                    'created_by'          => $loguid,
                    'created_at'          => date('Y-m-d H:i:s'),
                ];

                $doctorAccessId = $this->StaffCommonModel->insertStaffAccess($staffAccess);


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

    public function UpdateStaffInformation() {
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


            $requiredFields = ['name','phone','role','department'];


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


            $staffUid = isset($rawData['id']) ? trim($this->decrypt_aes_from_js($rawData['id'], $AES_KEY)) : '';
            $name = isset($rawData['name']) ? trim($this->decrypt_aes_from_js($rawData['name'], $AES_KEY)) : '';
            $phone = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $role = isset($rawData['role']) ? trim($this->decrypt_aes_from_js($rawData['role'], $AES_KEY)) : '';
            $department = isset($rawData['department']) ? trim($this->decrypt_aes_from_js($rawData['department'], $AES_KEY)) : '';
            
            $shift = isset($rawData['shift']) ? trim($this->decrypt_aes_from_js($rawData['shift'], $AES_KEY)) : '';
            

            $experienceYears = isset($rawData['experienceYears']) ? floatval($this->decrypt_aes_from_js($rawData['experienceYears'], $AES_KEY)) : 0;

            $experienceMonths = isset($rawData['experienceMonths']) ? floatval($this->decrypt_aes_from_js($rawData['experienceMonths'], $AES_KEY)) : 0;

           
           
           


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

            

            $staffData = [
                'name'                  => $name,
                'phone'                 => $phone,
                'role'                  => $role,
                'department'            => $department,
                'hosuid'                => $loguid,
                'shift'                 => $shift,
                'experience_years'      => $experienceYears,
                'experience_months'     => $experienceMonths,
                'status'                => 0,
                'updated_by'            => $loguid,
                'updated_at'            => date('Y-m-d H:i:s')
            ];

            $update = $this->StaffCommonModel->updateStaffInformationByHospital($staffUid, $staffData, $loguid);
           
            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "Staff updated successfully",
                    "staff_id" => $staffUid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update Staff"
                ]);
            }



        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


    public function ManageStaffList() {


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
            $role = isset($rawData['role']) ? trim($rawData['role']) : '';

            $offset = ($page - 1) * $limit;

            // Total count
            $totalRows = $this->StaffCommonModel->get_StaffCountByHospital($search, $role, $loguid);

            // Doctor list
            $staffList = $this->StaffCommonModel->get_StaffListByHospital($search, $role, $loguid, $limit, $offset);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($staffList), $AES_KEY);


            echo json_encode([
                "success" => true,
                //"data"    => $staffList,
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

    public function GetStaffOptionList() {


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



            $staffList = $this->StaffCommonModel->get_StaffOptionListByHospital($loguid);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($staffList), $AES_KEY);


            echo json_encode([
                "success" => true,
                //"data"    => $staffList,
                "data"    => $encryptedData,
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


    public function GetStaffAccess() {


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

            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;

            }

            $AES_KEY = "RohitGaradHos@173414";

            $staffUid = isset($rawData['staff_uid']) ? trim($this->decrypt_aes_from_js($rawData['staff_uid'], $AES_KEY)) : '';

            
            // Doctor list
            $staffAccess = $this->StaffCommonModel->get_StaffsAccessByHospital($loguid, $staffUid);
            
            $encryptedData = $this->encrypt_aes_for_js(json_encode($staffAccess), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data"    => $staffAccess
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function UpdateStaffAccess() {
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

            // Get input payload
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414"; 

            // Decrypt staff_uid
            if (empty($rawData['staff_uid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing staff UID"
                ]);
                return;
            }
            $staff_uid = $this->decrypt_aes_from_js($rawData['staff_uid'], $AES_KEY);

            // List of all new permissions fields in ms_staff_access
            $permissionsFields = [
                'patient_list', 'view_patients', 'add_patients', 'edit_patients',
                'view_medical_history', 'write_prescriptions', 'view_lab_results', 'request_lab_tests',
                'manage_vitals', 'appointment_list', 'book_appointment', 'reschedule_appointment', 'cancel_appointment',
                'icu_access', 'assign_rooms', 'bad_request_approved', 'monitor_beds', 'emergency_access',
                'view_inventory', 'dispense_medication', 'manage_controlled', 'reorder_stock',
                'perform_lab_tests', 'manage_lab_equipment', 'lab_safety',
                'view_billing', 'process_payments', 'apply_discounts', 'insurance_claims', 'financial_reports',
                'manage_users', 'assign_roles', 'system_monitoring', 'emergency_override',
                'view_staff_profiles', 'manage_shifts', 'performance_reviews'
            ];

            $updateData = [];
            foreach ($permissionsFields as $field) {
                if (isset($rawData[$field])) {
                    $updateData[$field] = intval($this->decrypt_aes_from_js($rawData[$field], $AES_KEY));
                }
            }

            $updateData['updated_by'] = $loguid;
            $updateData['updated_at'] = date('Y-m-d H:i:s');

            // Check if record exists
            $existing = $this->db->get_where('ms_staff_access', ['staff_uid' => $staff_uid])->row_array();
            if ($existing) {
                // Update existing access record
                $this->db->where('staff_uid', $staff_uid);
                $success = $this->db->update('ms_staff_access', $updateData);
            } else {
                // Insert new access record
                $updateData['staff_uid'] = $staff_uid;
                $updateData['created_by'] = $loguid;
                $updateData['created_at'] = date('Y-m-d H:i:s');
                $success = $this->db->insert('ms_staff_access', $updateData);
            }

            if ($success) {
                echo json_encode([
                    "success" => true,
                    "message" => "Staff access updated successfully",
                    "staff_uid" => $staff_uid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update staff access"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }



    public function changeStaffStatus() {
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

            // Optional: Validate IDs exist in DB (hospital, specialization)
            if (!$this->DoctorCommonModel->existsHospital($loguid)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital does not exist"
                ]);
                return;
            }

            $staffUid = $rawData['id'];
            $status = $rawData['status'];

            // Update staff status in DB
            $update = $this->StaffCommonModel->updateStaffStatusByHospital($staffUid, $status, $loguid);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "staff status updated successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update staff status"
                ]);
            }
           


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function DeleteStaffInformation() {
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

            // Optional: Validate IDs exist in DB (hospital, specialization)
            if (!$this->DoctorCommonModel->existsHospital($loguid)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital does not exist"
                ]);
                return;
            }

            $staffUid = $rawData['id'];

            $updateData = [
                'isdelete' => 1,
                'updated_by' => $loguid,
                'updated_at' => date('Y-m-d H:i:s')
            ];


            $update = $this->StaffCommonModel->updateStaffInformationByHospital($staffUid, $updateData, $loguid);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "staff deleted successfully ",
                    "staff_id" => $staffUid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to delete staff"
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


