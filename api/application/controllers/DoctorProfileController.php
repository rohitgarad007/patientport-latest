<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class DoctorProfileController extends CI_Controller {

    private $AES_KEY = "RohitGaradHos@173414";

    public function __construct() {
        parent::__construct();
        $this->load->model('DoctorProfileModel');
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

    private function get_doctor_from_token() {
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
        $loguid = $tokenData['loguid'] ?? null; // For doctor, loguid is docuid usually, or we check loguid mapping

        // Based on SFDoctorController, loguid is docuid
        // But check SFDoctorController again: $loguid = $tokenData['loguid']; $doctorInfo = $this->DoctorCommonModel->get_logdoctorInfo($loguid);
        // get_logdoctorInfo uses where('d.docuid', $loguid);
        // So loguid IS docuid for doctors.

        if ($role !== 'doctor') {
            throw new Exception("Unauthorized: Not a doctor");
        }
        
        return $loguid;
    }

    public function get_profile() {
        try {
            $docuid = $this->get_doctor_from_token();
            
            $profile = $this->DoctorProfileModel->get_doctor_profile($docuid);
            
            if ($profile) {
                $encryptedData = $this->encrypt_aes_for_js(json_encode($profile), $this->AES_KEY);
                echo json_encode(['status' => true, 'data' => $encryptedData]);
            } else {
                echo json_encode(['status' => false, 'message' => 'Doctor profile not found']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }

    public function update_profile() {
        try {
            $docuid = $this->get_doctor_from_token();
            
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

            // Update Profile Info
            $updateData = [];
            // Whitelist fields to allow update
            $allowedFields = [
                'name', 'phone', 'gender', 'specialization_id', 
                'experience_year', 'experience_month', 'consultation_fee', 'screen_default_message'
            ];
            
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
                
                $uploadDir = FCPATH . 'assets/images/doctors/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                $filename = 'doc_' . $docuid . '_' . time() . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                    // Save relative path or full URL? usually relative path is better
                    $updateData['profile_image'] = 'assets/images/doctors/' . $filename;
                } else {
                    throw new Exception("Failed to upload image.");
                }
            }
            
            if (!empty($updateData)) {
                $this->DoctorProfileModel->update_doctor_profile($docuid, $updateData);
            }
            
            // Handle Password Change if provided
            if (!empty($data['new_password'])) {
                if (empty($data['current_password'])) {
                    throw new Exception("Current password is required to set new password");
                }
                
                // Verify current password
                if (!$this->DoctorProfileModel->verify_password($docuid, $data['current_password'])) {
                    throw new Exception("Incorrect current password");
                }
                
                // Update to new password
                $this->DoctorProfileModel->update_password($docuid, $data['new_password']);
            }

            echo json_encode(['status' => true, 'message' => 'Profile updated successfully']);

        } catch (Exception $e) {
            echo json_encode(['status' => false, 'message' => $e->getMessage()]);
        }
    }
}
