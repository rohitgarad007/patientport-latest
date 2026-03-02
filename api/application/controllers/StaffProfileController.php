<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class StaffProfileController extends CI_Controller {

    private $AES_KEY = "RohitGaradHos@173414";

    public function __construct() {
        parent::__construct();
        $this->load->model('StaffProfileModel');
        $this->load->helper(['verifyauthtoken']);
        
        // Enable CORS
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Content-Length, Accept-Encoding, Authorization");
        if ( "OPTIONS" === $_SERVER['REQUEST_METHOD'] ) {
            die();
        }
    }

    private function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen = 32, $ivLen = 16) {
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

    private function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    private function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $cipherText = base64_decode($cipherTextBase64);
        if (!$cipherText || strlen($cipherText) < 16) {
            throw new Exception('Base64 decode failed or too short');
        }
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, 'Salted__', 8) !== 0) {
            throw new Exception('Invalid salt header');
        }
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $decrypted = openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        if ($decrypted === false) {
            throw new Exception('Decryption failed');
        }
        return $decrypted;
    }

    private function get_staff_from_token() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        if (!$token) {
            throw new Exception("Unauthorized: No token provided");
        }

        $token = verifyAuthToken($token);
        if (!$token) {
            throw new Exception("Unauthorized: Invalid token");
        }

        $tokenData = is_string($token) ? json_decode($token, true) : $token;
        $role = $tokenData['role'] ?? null;
        $loguid = $tokenData['loguid'] ?? null;

        // Allow all roles except known non-staff roles
        // This is necessary because staff tokens contain specific job titles (e.g., "Receptionist", "Anesthetist")
        // instead of the generic "staff" role.
        $non_staff_roles = ['doctor', 'hospital_admin', 'patient', 'admin', 'super_admin'];

        if (!$role || in_array($role, $non_staff_roles)) {
            throw new Exception("Unauthorized: Not a staff member");
        }
        
        return $loguid;
    }

    public function get_profile() {
        try {
            $staff_uid = $this->get_staff_from_token();
            
            $profile = $this->StaffProfileModel->get_staff_profile($staff_uid);
            
            if ($profile) {
                $encryptedData = $this->encrypt_aes_for_js(json_encode($profile), $this->AES_KEY);
                echo json_encode(['status' => true, 'data' => $encryptedData]);
            } else {
                echo json_encode(['status' => false, 'message' => 'Profile not found']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }

    public function update_profile() {
        try {
            $staff_uid = $this->get_staff_from_token();
            
            // Check if request is multipart/form-data or JSON
            $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
            
            $data = [];
            
            if (strpos($contentType, 'application/json') !== false) {
                // JSON Request
                $raw = file_get_contents("php://input");
                $requestData = json_decode($raw, true);
                if (isset($requestData['data'])) {
                    $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                    $data = json_decode($decryptedJson, true);
                } else {
                    $data = !empty($requestData) ? $requestData : $_POST;
                }
            } else {
                // Multipart Request (FormData)
                if (isset($_POST['data'])) {
                    $decryptedJson = $this->decrypt_aes_from_js($_POST['data'], $this->AES_KEY);
                    $data = json_decode($decryptedJson, true);
                } else {
                    $data = $_POST;
                }
            }
            
            if (!$data && empty($_FILES)) {
                throw new Exception("No data provided");
            }
            
            // Prepare update data
            $updateData = [];
            // Whitelist fields to allow update
            $allowedFields = [
                'name', 'phone', 'gender', 'specialization', 
                'experience_years', 'experience_months', 
                'screen_lock_pin', 'screen_sleep_time'
            ];
            
            // Validate screen_lock_pin
            if (isset($data['screen_lock_pin']) && strlen($data['screen_lock_pin']) > 0) {
                 if (!preg_match('/^\d{4}$/', $data['screen_lock_pin'])) {
                      throw new Exception("Screen Lock PIN must be exactly 4 digits.");
                 }
            }
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateData[$field] = $data[$field];
                }
            }
            
            // Handle Profile Image Upload
            if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES['profile_image'];
                $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                
                if (!in_array($file['type'], $allowedTypes)) {
                    throw new Exception("Invalid file type. Only JPG and PNG are allowed.");
                }
                
                // Validate size (e.g. 5MB)
                if ($file['size'] > 5 * 1024 * 1024) {
                    throw new Exception("File size too large.");
                }
                
                $uploadDir = FCPATH . 'assets/images/staff/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                $filename = 'staff_' . $staff_uid . '_' . time() . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                    $updateData['profile_image'] = 'assets/images/staff/' . $filename;
                } else {
                    throw new Exception("Failed to upload image.");
                }
            }
            
            if (!empty($updateData)) {
                $result = $this->StaffProfileModel->update_staff_profile($staff_uid, $updateData);
                if ($result) {
                     echo json_encode(['status' => true, 'message' => 'Profile updated successfully']);
                } else {
                     echo json_encode(['status' => false, 'message' => 'No changes made or update failed']);
                }
            } else {
                // If only checking password or nothing to update
                echo json_encode(['status' => true, 'message' => 'No profile data to update']);
            }
            
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }
    
    public function change_password() {
        try {
            $staff_uid = $this->get_staff_from_token();
            
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!$data || !isset($data['data'])) {
                throw new Exception("Invalid input data");
            }
            
            $decryptedJson = $this->decrypt_aes_from_js($data['data'], $this->AES_KEY);
            $passwordData = json_decode($decryptedJson, true);
            
            if (!isset($passwordData['currentPassword']) || !isset($passwordData['newPassword'])) {
                throw new Exception("Missing password fields");
            }
            
            // Verify current password
            if (!$this->StaffProfileModel->verify_password($staff_uid, $passwordData['currentPassword'])) {
                throw new Exception("Incorrect current password");
            }
            
            // Update to new password
            $result = $this->StaffProfileModel->update_password($staff_uid, $passwordData['newPassword']);
            
            if ($result) {
                echo json_encode(['status' => true, 'message' => 'Password changed successfully']);
            } else {
                echo json_encode(['status' => false, 'message' => 'Failed to update password']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }
}
?>
