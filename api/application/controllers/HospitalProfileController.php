<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class HospitalProfileController extends CI_Controller {

    private $AES_KEY = "RohitGaradHos@173414";

    public function __construct() {
        parent::__construct();
        $this->load->model('HospitalProfileModel');
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

    public function get_profile($hosuid) {
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }
        $profile = $this->HospitalProfileModel->get_hospital_profile($hosuid);
        if ($profile) {
            $encryptedData = $this->encrypt_aes_for_js(json_encode($profile), $this->AES_KEY);
            echo json_encode(['status' => true, 'data' => $encryptedData]);
        } else {
            echo json_encode(['status' => false, 'message' => 'Hospital not found']);
        }
    }

    public function update_profile() {
        $raw = file_get_contents("php://input");
        $requestData = json_decode($raw, true);
        
        $data = [];
        if (isset($requestData['data'])) {
            try {
                $decryptedJson = $this->decrypt_aes_from_js($requestData['data'], $this->AES_KEY);
                $data = json_decode($decryptedJson, true);
            } catch (Exception $e) {
                echo json_encode(['status' => false, 'message' => 'Decryption failed: ' . $e->getMessage()]);
                return;
            }
        } else {
            // Fallback for unencrypted form data
            $data = !empty($requestData) ? $requestData : $_POST;
        }

        $hosuid = $data['hosuid'] ?? null;
        if (!$hosuid) {
            echo json_encode(['status' => false, 'message' => 'Hospital UID is required']);
            return;
        }

        $updateData = [
            'name' => $data['name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'state' => $data['state'] ?? null,
            'city' => $data['city'] ?? null,
            'appointment_day_limit' => $data['appointment_day_limit'] ?? null,
            'book_appointment_status' => $data['book_appointment_status'] ?? null
        ];

        // Remove null values (preserve 0 for status)
        $updateData = array_filter($updateData, function($value) { return !is_null($value) && $value !== ''; });

        $updated = $this->HospitalProfileModel->update_hospital_profile($hosuid, $updateData);

        if ($updated) {
            echo json_encode(['status' => true, 'message' => 'Profile updated successfully']);
        } else {
            echo json_encode(['status' => false, 'message' => 'Failed to update profile']);
        }
    }

    public function change_password() {
        $hosuid = $this->input->post('hosuid');
        $currentPassword = $this->input->post('currentPassword');
        $newPassword = $this->input->post('newPassword');

        if (!$hosuid || !$currentPassword || !$newPassword) {
            echo json_encode(['status' => false, 'message' => 'All fields are required']);
            return;
        }

        // Verify current password
        if ($this->HospitalProfileModel->verify_password($hosuid, $currentPassword)) {
            // Update to new password
            if ($this->HospitalProfileModel->update_password($hosuid, $newPassword)) {
                echo json_encode(['status' => true, 'message' => 'Password updated successfully']);
            } else {
                echo json_encode(['status' => false, 'message' => 'Failed to update password']);
            }
        } else {
            echo json_encode(['status' => false, 'message' => 'Current password is incorrect']);
        }
    }
}
