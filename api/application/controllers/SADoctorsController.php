<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SADoctorsController  extends CI_Controller {

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
            $mrole = $tokenData['role'] ?? null;
            $muid = $tokenData['muid'] ?? null;

            /*if (!in_array($mrole, ["super_admin", "hospital_admin"])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user token or insufficient privileges"
                ]);
                return;
            }*/

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

            $limit = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
            $page  = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $specialization = isset($rawData['specialization']) ? trim($rawData['specialization']) : '';

            $offset = ($page - 1) * $limit;

            // Total count
            $totalRows = $this->DoctorCommonModel->get_DoctorsCount($search, $specialization);

            // Doctor list
            $doctorsList = $this->DoctorCommonModel->get_DoctorsList($search, $specialization, $limit, $offset);
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($doctorsList), $AES_KEY);


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
                    "message" => "Invalid payload"
                ]);
                return;

            }


            $requiredFields = ['doctorName','doctorEmail','phone','specialization','hospitalId'];


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
            $hospitalId = isset($rawData['hospitalId']) ? trim($this->decrypt_aes_from_js($rawData['hospitalId'], $AES_KEY)) : '';
            $expYear = isset($rawData['expYear']) ? trim($this->decrypt_aes_from_js($rawData['expYear'], $AES_KEY)) : 0;
            $expMonth = isset($rawData['expMonth']) ? trim($this->decrypt_aes_from_js($rawData['expMonth'], $AES_KEY)) : 0;
            $consultation_fee = isset($rawData['doctorFees']) ? floatval($this->decrypt_aes_from_js($rawData['doctorFees'], $AES_KEY)) : 0;
            $gender = isset($rawData['gender']) ? trim($this->decrypt_aes_from_js($rawData['gender'], $AES_KEY)) : '';


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
            if (!$this->DoctorCommonModel->existsHospital($hospitalId)) {
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
            $doctorData = [
                'docuid'            => $docuid,
                'name'              => $doctorName,
                'email'             => $email,
                'password'          => md5($password),
                'phone'             => $phone,
                'gender'            => $gender,
                'specialization_id' => $specialization_id,
                'hosuid'            => $hospitalId,
                'consultation_fee'  => $consultation_fee,
                'status'            => 0,
                'experience_year'   => $expYear,
                'experience_month'  => $expMonth,
                'created_by'        => $muid,
                'created_at'        => date('Y-m-d H:i:s')
            ];

           

           

            // 5️⃣ Insert into DB
            $insertId = $this->DoctorCommonModel->insertDoctorInformation($doctorData);
            if ($insertId) {


                $doctorAccess = [
                    'docuid'            => $docuid,
                    'created_by'        => $muid,
                    'created_at'        => date('Y-m-d H:i:s')
                ];

                $doctorAccessId = $this->DoctorCommonModel->insertDoctorAccess($doctorAccess);

                echo json_encode([
                    "success" => true,
                    "message" => "Doctor added successfully",
                    "doctor_id" => $insertId
                ]);
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


            $requiredFields = ['doctorName', 'phone', 'specialization','hospitalId'];


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
            $hospitalId = isset($rawData['hospitalId']) ? trim($this->decrypt_aes_from_js($rawData['hospitalId'], $AES_KEY)) : '';
            $expYear = isset($rawData['expYear']) ? trim($this->decrypt_aes_from_js($rawData['expYear'], $AES_KEY)) : 0;
            $expMonth = isset($rawData['expMonth']) ? trim($this->decrypt_aes_from_js($rawData['expMonth'], $AES_KEY)) : 0;
            $consultation_fee = isset($rawData['doctorFees']) ? floatval($this->decrypt_aes_from_js($rawData['doctorFees'], $AES_KEY)) : 0;
            $gender = isset($rawData['gender']) ? trim($this->decrypt_aes_from_js($rawData['gender'], $AES_KEY)) : '';

            

            // Validate phone
            if (!$phone || strlen($phone) < 7 || strlen($phone) > 15) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid phone number"
                ]);
                return;
            }


            // Optional: Validate IDs exist in DB (hospital, specialization)
            if (!$this->DoctorCommonModel->existsHospital($hospitalId)) {
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


            $doctorData = [
                'name'                  => $doctorName,
                //'email'                 => $email,
                'phone'                 => $phone,
                'gender'                => $gender,
                'specialization_id'     => $specialization_id,
                'hosuid'                => $hospitalId,
                'consultation_fee'      => $consultation_fee,
                'experience_year'       => $expYear,
                'experience_month'      => $expMonth,
                'status'                => 0,
                'updated_by'            => $muid,
                'updated_at'            => date('Y-m-d H:i:s')
            ];

           
            // 6️⃣ Update in database
            $update = $this->DoctorCommonModel->updateDoctorInformation($rawData['id'], $doctorData);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "doctor updated successfully",
                    "hospital_id" => $rawData['id']
                ]);
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

    public function changeDoctorStatus() {
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

            if (!in_array($mrole, ["super_admin", "hospital_admin"])) {
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

            $docuid = $rawData['id'];
            $status = $rawData['status'];

            // Update hospital status in DB
            $update = $this->DoctorCommonModel->updateDoctorStatus($docuid, $status);

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

            
            $muid = $tokenData['muid'] ?? null;
            $mrole = $tokenData['role'] ?? null;

            if (!in_array($mrole, ["super_admin", "hospital_admin"])) {
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
                    "message" => "Missing doctor ID or status"
                ]);
                return;
            }

            $docuid = $rawData['id'];

            $updateData = [
                'isdelete' => 1,
                'updated_by' => $muid,
                'updated_at' => date('Y-m-d H:i:s')
            ];


            $update = $this->DoctorCommonModel->updateDoctorInformation($docuid, $updateData);

            if ($update) {
                echo json_encode([
                    "success" => true,
                    "message" => "doctor deleted successfully ",
                    "hospital_id" => $hosuid
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


