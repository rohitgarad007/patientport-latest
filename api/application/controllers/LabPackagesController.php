<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LabPackagesController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors', 0);
        
        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url', 'date', 'verifyAuthToken'));
        $this->load->model('LabPackagesModel');
        
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header("Access-Control-Allow-Credentials: true");
        header("Vary: Origin");
        header('Content-Type: application/json');

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header("HTTP/1.1 200 OK");
            exit();
        }
    }

    private function authenticate() {
        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';
        try {
            $token = verifyAuthToken($token);
            if (!$token) throw new Exception("Unauthorized");
            $tokenData = is_string($token) ? json_decode($token, true) : $token;
            return $tokenData;
        } catch (Throwable $e) {
            echo json_encode(["success" => false, "message" => "Unauthorized access"]);
            exit;
        }
    }

    public function encrypt_aes_for_js($plainText, $passphrase) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $encrypted = openssl_encrypt($plainText, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return base64_encode($salted . $encrypted);
    }

    public function openssl_EVP_BytesToKey($passphrase, $salt, $keyLen, $ivLen) {
        $dtot = '';
        $d = '';
        while (strlen($dtot) < ($keyLen + $ivLen)) {
            $d = md5($d . $passphrase . $salt, true);
            $dtot .= $d;
        }
        return ['key' => substr($dtot, 0, $keyLen), 'iv' => substr($dtot, $keyLen, $ivLen)];
    }

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

    public function listPackages() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        
        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);
        $limit = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
        $page = isset($rawData['page']) ? (int)$rawData['page'] : 1;
        $search = isset($rawData['search']) ? trim($rawData['search']) : '';
        $offset = ($page - 1) * $limit;

        $packages = $this->LabPackagesModel->get_packages($lab_id, $search, $limit, $offset);
        $total = $this->LabPackagesModel->get_packages_count($lab_id, $search);

        $AES_KEY = "RohitGaradHos@173414";
        $encryptedData = $this->encrypt_aes_for_js(json_encode($packages), $AES_KEY);

        echo json_encode([
            "success" => true,
            "data" => $encryptedData,
            "total" => $total,
            "page" => $page,
            "limit" => $limit
        ]);
    }

    public function addPackage() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        $user_id = $tokenData['id'] ?? null;

        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);
        
        $payload = $rawData;
        if (isset($rawData['encrypted_payload'])) {
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($rawData['encrypted_payload'], $AES_KEY);
            $payload = json_decode($decryptedJson, true);
            if (!$payload) {
                echo json_encode(["success" => false, "message" => "Invalid encrypted payload"]);
                return;
            }
        }
        
        $package_name = $payload['name'] ?? $payload['package_name'] ?? '';
        $description = $payload['description'] ?? '';
        $price = $payload['price'] ?? 0;
        $discount = $payload['discount'] ?? 0;
        $test_ids = $payload['tests'] ?? $payload['test_ids'] ?? [];

        if (empty($package_name)) {
            echo json_encode(["success" => false, "message" => "Package name is required"]);
            return;
        }

        $data = [
            'lab_id' => $lab_id,
            'package_name' => $package_name,
            'description' => $description,
            'price' => $price,
            'discount' => $discount,
            'status' => 1,
            'created_by' => $user_id,
            'created_at' => date('Y-m-d H:i:s')
        ];

        if ($this->LabPackagesModel->add_package($data, $test_ids)) {
            echo json_encode(["success" => true, "message" => "Package added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to add package"]);
        }
    }

    public function updatePackage() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        $user_id = $tokenData['id'] ?? null;

        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);

        $payload = $rawData;
        if (isset($rawData['encrypted_payload'])) {
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($rawData['encrypted_payload'], $AES_KEY);
            $payload = json_decode($decryptedJson, true);
            if (!$payload) {
                echo json_encode(["success" => false, "message" => "Invalid encrypted payload"]);
                return;
            }
        }

        $package_id = $payload['id'] ?? null;

        if (!$package_id) {
            echo json_encode(["success" => false, "message" => "Package ID is required"]);
            return;
        }

        $package_name = $payload['name'] ?? $payload['package_name'] ?? '';
        $description = $payload['description'] ?? '';
        $price = $payload['price'] ?? 0;
        $discount = $payload['discount'] ?? 0;
        $test_ids = $payload['tests'] ?? $payload['test_ids'] ?? [];

        $data = [
            'package_name' => $package_name,
            'description' => $description,
            'price' => $price,
            'discount' => $discount,
            'updated_by' => $user_id,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        if ($this->LabPackagesModel->update_package($package_id, $data, $test_ids, $lab_id)) {
            echo json_encode(["success" => true, "message" => "Package updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update package"]);
        }
    }

    public function deletePackage() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        $user_id = $tokenData['id'] ?? null;

        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);

        $payload = $rawData;
        if (isset($rawData['encrypted_payload'])) {
            $AES_KEY = "RohitGaradHos@173414";
            $decryptedJson = $this->decrypt_aes_from_js($rawData['encrypted_payload'], $AES_KEY);
            $payload = json_decode($decryptedJson, true);
            if (!$payload) {
                echo json_encode(["success" => false, "message" => "Invalid encrypted payload"]);
                return;
            }
        }

        $package_id = $payload['id'] ?? null;

        if (!$package_id) {
            echo json_encode(["success" => false, "message" => "Package ID is required"]);
            return;
        }

        if ($this->LabPackagesModel->delete_package($package_id, $lab_id, $user_id)) {
            echo json_encode(["success" => true, "message" => "Package deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to delete package"]);
        }
    }
    
    public function getPackage() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        
        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $package_id = $this->input->get('id');

        if (!$package_id) {
            echo json_encode(["success" => false, "message" => "Package ID is required"]);
            return;
        }

        $package = $this->LabPackagesModel->get_package_by_id($package_id, $lab_id);

        if ($package) {
            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($package), $AES_KEY);
            echo json_encode(["success" => true, "data" => $encryptedData]);
        } else {
             echo json_encode(["success" => false, "message" => "Package not found"]);
        }
    }
}
