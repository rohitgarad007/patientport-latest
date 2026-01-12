<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HSDoctorsController  extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url','date'));
        $this->load->model('AdmCommonModel');
        $this->load->model('DoctorCommonModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json');
    }


    public function GetSpecializationsList() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            // Validate and decode token
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");

            $tokenData = is_string($token) ? json_decode($token, true) : $token;

            
            //$muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

            if (!in_array($mrole, ["super_admin", "hospital_admin"])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }



            $specializationsList = $this->AdmCommonModel->get_doctor_specializationsList();

            echo json_encode([
                "success" => true,
                "data"    => $specializationsList
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }


    public function ManageDoctorList() {


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
                return $this->jsonResponse(false, "Invalid or missing payload", 400);
            }

            $limit = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page  = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $specialization = isset($rawData['specialization']) ? trim($rawData['specialization']) : '';

            $offset = ($page - 1) * $limit;

            // Total count
            $totalRows = $this->DoctorCommonModel->get_DoctorsCountByHospital($search, $specialization, $loguid);

            // Doctor list
            $doctorsList = $this->DoctorCommonModel->get_DoctorsListByHospital($loguid, $search, $specialization, $limit, $offset);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                "total"   => $totalRows,
                "page"    => $page,
                "limit"   => $limitValue,
                "rowData"   => $doctorsList
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function GetDoctorOptionList() {


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




            // Doctor list
            $doctorsList = $this->DoctorCommonModel->get_DoctorsOptionListByHospital($loguid);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsList), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data"    => $doctorsList
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function GetDoctorAccess() {


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

            // Support both JSON and multipart/form-data
            $rawData = json_decode(file_get_contents("php://input"), true);
            if (!$rawData || !is_array($rawData)) {
                // Fallback to POST for multipart
                $rawData = $_POST;
            }
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }

            $AES_KEY = "RohitGaradHos@173414";

            $docuid = isset($rawData['docuid']) ? trim($this->decrypt_aes_from_js($rawData['docuid'], $AES_KEY)) : '';

            
            // Doctor list
            $doctorsAccess = $this->DoctorCommonModel->get_DoctorsAccessByHospital($loguid, $docuid);
            
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsAccess), $AES_KEY);


            echo json_encode([
                "success" => true,
                "data"    => $encryptedData,
                //"data"    => $doctorsAccess
            ]);


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
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



    public function AddDoctorInformation() {
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
                // Fallback to standard POST for multipart/form-data
                $rawData = $_POST;
            }
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
                ]);
                return;
            }


            $requiredFields = ['doctorName','doctorEmail','phone','specialization'];


            foreach ($requiredFields as $field) {
                if (empty($rawData[$field])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required field: $field"
                    ]);
                    return;
                }
            }

            //$username = $this->decrypt_aes_from_js($rawData['username'], $AES_KEY);
            $AES_KEY = "RohitGaradHos@173414"; 


            $doctorName = isset($rawData['doctorName']) ? trim($this->decrypt_aes_from_js($rawData['doctorName'], $AES_KEY)) : '';
            $email = isset($rawData['doctorEmail']) ? trim($this->decrypt_aes_from_js($rawData['doctorEmail'], $AES_KEY)) : '';
            $password = isset($rawData['password']) ? trim($this->decrypt_aes_from_js($rawData['password'], $AES_KEY)) : '';
            $phone = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $specialization_id = isset($rawData['specialization']) ? intval($this->decrypt_aes_from_js($rawData['specialization'], $AES_KEY)) : 0;
            //$hospitalId = isset($rawData['hospitalId']) ? trim($this->decrypt_aes_from_js($rawData['hospitalId'], $AES_KEY)) : '';
            $expYear = isset($rawData['expYear']) ? trim($this->decrypt_aes_from_js($rawData['expYear'], $AES_KEY)) : 0;
            $expMonth = isset($rawData['expMonth']) ? trim($this->decrypt_aes_from_js($rawData['expMonth'], $AES_KEY)) : 0;
            $consultation_fee = isset($rawData['doctorFees']) ? floatval($this->decrypt_aes_from_js($rawData['doctorFees'], $AES_KEY)) : 0;


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
            $exists = $this->db->get("ms_doctors")->row();

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

            if (!$this->DoctorCommonModel->existsSpecialization($specialization_id)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Specialization does not exist"
                ]);
                return;
            }

            $docuid = uniqid('DOC_');

            // Optional profile image upload
            $imageRelPath = null;
            $imageUploadError = null;
            if (!empty($_FILES['profile_image']) && !empty($_FILES['profile_image']['name'])) {
                $uploadDir = FCPATH . 'assets/images/doctors/';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0777, true);
                }
                $config = [
                    'upload_path'   => $uploadDir,
                    'allowed_types' => 'jpg|jpeg|png|gif|webp',
                    'max_size'      => 5120,
                    'encrypt_name'  => TRUE,
                ];
                $this->load->library('upload', $config);
                if (!$this->upload->do_upload('profile_image')) {
                    $imageUploadError = $this->upload->display_errors('', '');
                } else {
                    $ud = $this->upload->data();
                    $imageRelPath = 'assets/images/doctors/' . $ud['file_name'];
                }
            }

            $doctorData = [
                'docuid'            => $docuid,
                'name'              => $doctorName,
                'email'             => $email,
                'password'          => md5($password),
                'phone'             => $phone,
                'specialization_id' => $specialization_id,
                'hosuid'            => $loguid,
                'consultation_fee'  => $consultation_fee,
                'status'            => 0,
                'experience_year'   => $expYear,
                'experience_month'  => $expMonth,
                'created_by'        => $loguid,
                'created_at'        => date('Y-m-d H:i:s')
            ];

            // Attach image path if a suitable column exists
            if (!empty($imageRelPath)) {
                if ($this->db->field_exists('image_url', 'ms_doctors')) {
                    $doctorData['image_url'] = $imageRelPath;
                } elseif ($this->db->field_exists('profile_image', 'ms_doctors')) {
                    $doctorData['profile_image'] = $imageRelPath;
                } elseif ($this->db->field_exists('image', 'ms_doctors')) {
                    $doctorData['image'] = $imageRelPath;
                }
            }

           

           

            // 5️⃣ Insert into DB
            $insertId = $this->DoctorCommonModel->insertDoctorInformation($doctorData);
            if ($insertId) {

                $doctorAccess = [
                    'docuid'              => $docuid,
                    'created_by'          => $loguid,
                    'created_at'          => date('Y-m-d H:i:s'),
                ];

                $doctorAccessId = $this->DoctorCommonModel->insertDoctorAccess($doctorAccess);



                $resp = [
                    "success" => true,
                    "message" => "Doctor added successfully",
                    "doctor_id" => $insertId
                ];
                if (!empty($imageRelPath)) {
                    $resp['image_path'] = $imageRelPath;
                }
                if (!empty($imageUploadError)) {
                    $resp['image_error'] = $imageUploadError;
                }
                echo json_encode($resp);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to add octor"
                ]);
            }


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function UpdateDoctorInformation() {
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
                // Fallback for multipart/form-data
                $rawData = $_POST;
            }
            if (!$rawData || !is_array($rawData)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid payload"
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


            $requiredFields = ['doctorName', 'phone', 'specialization'];


            foreach ($requiredFields as $field) {
                if (empty($rawData[$field])) {
                    echo json_encode([
                        "success" => false,
                        "message" => "Missing required field: $field"
                    ]);
                    return;
                }
            }

            //$username = $this->decrypt_aes_from_js($rawData['username'], $AES_KEY);
             $AES_KEY = "RohitGaradHos@173414"; 
             

            $doctorName = isset($rawData['doctorName']) ? trim($this->decrypt_aes_from_js($rawData['doctorName'], $AES_KEY)) : '';
            //$email = isset($rawData['doctorEmail']) ? trim($this->decrypt_aes_from_js($rawData['doctorEmail'], $AES_KEY)) : '';
            $phone = isset($rawData['phone']) ? preg_replace('/[^0-9]/', '', $this->decrypt_aes_from_js($rawData['phone'], $AES_KEY)) : '';
            $specialization_id = isset($rawData['specialization']) ? intval($this->decrypt_aes_from_js($rawData['specialization'], $AES_KEY)) : 0;
            //$hospitalId = isset($rawData['hospitalId']) ? trim($this->decrypt_aes_from_js($rawData['hospitalId'], $AES_KEY)) : '';
            $expYear = isset($rawData['expYear']) ? trim($this->decrypt_aes_from_js($rawData['expYear'], $AES_KEY)) : 0;
            $expMonth = isset($rawData['expMonth']) ? trim($this->decrypt_aes_from_js($rawData['expMonth'], $AES_KEY)) : 0;
            $consultation_fee = isset($rawData['doctorFees']) ? floatval($this->decrypt_aes_from_js($rawData['doctorFees'], $AES_KEY)) : 0;

            

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

            if (!$this->DoctorCommonModel->existsSpecialization($specialization_id)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Specialization does not exist"
                ]);
                return;
            }


            // Optional profile image upload
            $imageRelPath = null;
            $imageUploadError = null;
            if (!empty($_FILES['profile_image']) && !empty($_FILES['profile_image']['name'])) {
                $uploadDir = FCPATH . 'assets/images/doctors/';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0777, true);
                }
                $config = [
                    'upload_path'   => $uploadDir,
                    'allowed_types' => 'jpg|jpeg|png|gif|webp',
                    'max_size'      => 5120,
                    'encrypt_name'  => TRUE,
                ];
                $this->load->library('upload', $config);
                if (!$this->upload->do_upload('profile_image')) {
                    $imageUploadError = $this->upload->display_errors('', '');
                } else {
                    $ud = $this->upload->data();
                    $imageRelPath = 'assets/images/doctors/' . $ud['file_name'];
                }
            }

            $doctorData = [
                'name'                  => $doctorName,
                //'email'                 => $email,
                'phone'                 => $phone,
                'specialization_id'     => $specialization_id,
                'consultation_fee'      => $consultation_fee,
                'experience_year'       => $expYear,
                'experience_month'      => $expMonth,
                'status'                => 0,
                'updated_by'            => $loguid,
                'updated_at'            => date('Y-m-d H:i:s')
            ];

            if (!empty($imageRelPath)) {
                if ($this->db->field_exists('image_url', 'ms_doctors')) {
                    $doctorData['image_url'] = $imageRelPath;
                } elseif ($this->db->field_exists('profile_image', 'ms_doctors')) {
                    $doctorData['profile_image'] = $imageRelPath;
                } elseif ($this->db->field_exists('image', 'ms_doctors')) {
                    $doctorData['image'] = $imageRelPath;
                }
            }

           
            // 6️⃣ Update in database
            $update = $this->DoctorCommonModel->updateDoctorInformation($rawData['id'], $doctorData);

            if ($update) {
                $resp = [
                    "success" => true,
                    "message" => "doctor updated successfully",
                    "hospital_id" => $rawData['id']
                ];
                if (!empty($imageRelPath)) {
                    $resp['image_path'] = $imageRelPath;
                }
                if (!empty($imageUploadError)) {
                    $resp['image_error'] = $imageUploadError;
                }
                echo json_encode($resp);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update doctor"
                ]);
            }

           


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function UpdateDoctorAccess() {
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

            // Decrypt docuid
            if (empty($rawData['docuid'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctor UID"
                ]);
                return;
            }
            $docuid = $this->decrypt_aes_from_js($rawData['docuid'], $AES_KEY);

            // List of all new permissions columns in ms_doctors_access
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
            $existing = $this->db->get_where('ms_doctors_access', ['docuid' => $docuid])->row_array();
            if ($existing) {
                // Update existing access record
                $this->db->where('docuid', $docuid);
                $success = $this->db->update('ms_doctors_access', $updateData);
            } else {
                // Insert new access record
                $updateData['docuid'] = $docuid;
                $updateData['created_by'] = $loguid;
                $updateData['created_at'] = date('Y-m-d H:i:s');
                $success = $this->db->insert('ms_doctors_access', $updateData);
            }

            if ($success) {
                echo json_encode([
                    "success" => true,
                    "message" => "Doctor access updated successfully",
                    "docuid" => $docuid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update doctor access"
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }



    public function changeDoctorStatus() {
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
                    "message" => "Missing hospital ID or status"
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



            $docuid = $rawData['id'];
            $status = $rawData['status'];

            // Update hospital status in DB
            $update = $this->DoctorCommonModel->updateDoctorStatusByHos($docuid, $loguid, $status);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "doctor status updated successfully"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to update doctor status"
                ]);
            }
           


        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Authorization failed: " . $e->getMessage()
            ]);
        }
    }

    public function DeleteDoctorInformation() {
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

            // Optional: Validate IDs exist in DB (hospital, specialization)
            if (!$this->DoctorCommonModel->existsHospital($loguid)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Hospital does not exist"
                ]);
                return;
            }


            $rawData = json_decode(file_get_contents("php://input"), true);

            if (!isset($rawData['id'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing doctor ID or status"
                ]);
                return;
            }

            $docuid = $rawData['id'];

            $updateData = [
                'isdelete' => 1,
                'updated_by' => $loguid,
                'updated_at' => date('Y-m-d H:i:s')
            ];


            $update = $this->DoctorCommonModel->updateDoctorInformation($docuid, $updateData);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "doctor deleted successfully ",
                    //"hospital_id" => $loguid
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to delete doctor"
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
