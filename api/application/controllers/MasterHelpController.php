<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MasterHelpController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(['form', 'url','date','verifyAuthToken']);
        $this->load->model('AdmCommonModel');
        $this->load->model('HospitalCommonModel');

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

    // AES Decryption function
    public function decrypt_aes_from_js($cipherTextBase64, $passphrase) {
        $cipherText = base64_decode($cipherTextBase64);
        if (!$cipherText || strlen($cipherText) < 16) return false;
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, "Salted__", 8) !== 0) return false;
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        return openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
    }

    private function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen, $ivLen) {
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

    // Optional helper for JSON responses
    public function jsonResponse($success, $message = '', $data = []) {
        echo json_encode(['success'=>$success,'message'=>$message,'data'=>$data]);
        exit;
    }
}
