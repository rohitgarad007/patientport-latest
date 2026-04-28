<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class AIManageController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);
        date_default_timezone_set('Asia/Kolkata');

        $this->load->model('AIManageModel');
        $this->load->helper('verifyAuthToken');

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Content-Type: application/json");
    }

    // ✅ COMMON TOKEN VALIDATION (UPDATED)
    private function validateTokenOrFail() {

        $userToken = $this->input->get_request_header('Authorization');
        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        if (!$token) {
            echo json_encode(["success" => false, "message" => "Token missing"]);
            exit;
        }

        $token = verifyAuthToken($token);

        if (!$token) {
            echo json_encode(["success" => false, "message" => "Unauthorized"]);
            exit;
        }

        $tokenData = is_string($token) ? json_decode($token, true) : $token;

        $muid  = $tokenData['muid'] ?? null;
        $mrole = $tokenData['role'] ?? null;

        if (!$muid || $mrole !== "super_admin") {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user token or insufficient privileges"
            ]);
            exit;
        }

        return $tokenData;
    }

    // 🔹 LIST
    public function ai_manage_list() {

        $tokenData = $this->validateTokenOrFail();

        $rawData = json_decode(file_get_contents("php://input"), true);

        $limit  = isset($rawData['limit']) ? (int)$rawData['limit'] : 10;
        $page   = isset($rawData['page']) ? (int)$rawData['page'] : 1;
        $search = isset($rawData['search']) ? trim($rawData['search']) : '';
        $offset = ($page - 1) * $limit;

        $total = $this->AIManageModel->getAICount($search);
        $list  = $this->AIManageModel->getAIList($search, $limit, $offset);

        $AES_KEY = "RohitGaradHos@173414";
        $encryptedData = $this->encrypt_aes_for_js(json_encode($list['data']), $AES_KEY);

        echo json_encode([
            "success" => true,
            "data"    => $encryptedData,
            "rowData" => $list['data'],
            "total"   => $total['total'],
            "page"    => $page,
            "limit"   => $limit
        ]);
    }

    // 🔹 ADD
    public function ai_manage_add() {

        $tokenData = $this->validateTokenOrFail();
        $muid = $tokenData['muid'];

        $rawData = json_decode(file_get_contents("php://input"), true);

        if (!$rawData) {
            echo json_encode(["success"=>false,"message"=>"Invalid payload"]);
            return;
        }

        $AES_KEY = "RohitGaradHos@173414";
        $decrypt = function($key) use ($rawData, $AES_KEY) {
            return isset($rawData[$key]) ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY)) : '';
        };

        $name = $decrypt('name');
        $apiKey = $decrypt('apiKey');

        if (!$name || !$apiKey) {
            echo json_encode(["success"=>false,"message"=>"Name & API Key required"]);
            return;
        }

        $data = [
            "aiuid" => uniqid("AI_"),
            "name" => $name,
            "api_key" => $apiKey,
            "model" => $decrypt('model'),
            "description" => $decrypt('description'),
            "status" => 1,
            "isdelete" => 0,
            "created_by" => $muid,
            "created_at" => date("Y-m-d H:i:s")
        ];

        $insert = $this->AIManageModel->insertAI($data);

        if ($insert) {
            echo json_encode(["success"=>true,"message"=>"Added successfully"]);
        } else {
            echo json_encode(["success"=>false,"message"=>"Insert failed"]);
        }
    }

    // 🔹 UPDATE
    public function ai_manage_update() {

        $tokenData = $this->validateTokenOrFail();
        $muid = $tokenData['muid'];

        $rawData = json_decode(file_get_contents("php://input"), true);

        if (!$rawData || empty($rawData['aiuid'])) {
            echo json_encode(["success"=>false,"message"=>"Missing ID"]);
            return;
        }

        $AES_KEY = "RohitGaradHos@173414";

        $decrypt = function($key) use ($rawData, $AES_KEY) {
            return isset($rawData[$key]) 
                ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY)) 
                : '';
        };

        $aiuid = $decrypt('aiuid');

        $data = [
            "name" => $decrypt('name'),
            "api_key" => $decrypt('apiKey'),
            "model" => $decrypt('model'),
            "description" => $decrypt('description'),
            "updated_by" => $muid,
            "updated_at" => date("Y-m-d H:i:s")
        ];

        


        $update = $this->AIManageModel->updateAI($aiuid, $data);

        if ($update) {
            echo json_encode(["success"=>true,"message"=>"Updated successfully"]);
        } else {
            echo json_encode(["success"=>false,"message"=>"Update failed"]);
        }
    }

    // 🔹 STATUS
    public function ai_manage_status() {

        // ✅ Validate token
        $this->validateTokenOrFail();

        $rawData = json_decode(file_get_contents("php://input"), true);

        if (!$rawData || empty($rawData['aiuid']) || !isset($rawData['status'])) {
            echo json_encode([
                "success" => false,
                "message" => "Missing aiuid or status"
            ]);
            return;
        }

        // 🔐 Decrypt aiuid
        $AES_KEY = "RohitGaradHos@173414";

        $decrypt = function($key) use ($rawData, $AES_KEY) {
            return isset($rawData[$key])
                ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY))
                : '';
        };

        $aiuid = $decrypt('aiuid');

        if (!$aiuid) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid aiuid"
            ]);
            return;
        }

        // 🔄 Convert status
        $status = $rawData['status'] === "active" ? 1 : 0;

        $update = $this->AIManageModel->updateAIStatus($aiuid, $status);

        if ($update) {
            echo json_encode([
                "success" => true,
                "message" => "Status updated successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Status update failed"
            ]);
        }
    }

    // 🔹 DELETE (SOFT)
    public function ai_manage_delete() {

        // ✅ Validate token + get user
        $tokenData = $this->validateTokenOrFail();
        $muid = $tokenData['muid'];

        $rawData = json_decode(file_get_contents("php://input"), true);

        if (!$rawData || empty($rawData['aiuid'])) {
            echo json_encode([
                "success" => false,
                "message" => "Missing aiuid"
            ]);
            return;
        }

        // 🔐 Decrypt aiuid
        $AES_KEY = "RohitGaradHos@173414";

        $decrypt = function($key) use ($rawData, $AES_KEY) {
            return isset($rawData[$key])
                ? trim($this->decrypt_aes_from_js($rawData[$key], $AES_KEY))
                : '';
        };

        $aiuid = $decrypt('aiuid');

        if (!$aiuid) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid aiuid"
            ]);
            return;
        }

        // 🧹 Soft delete
        $data = [
            "isdelete"   => 1,
            "updated_by" => $muid,
            "updated_at" => date("Y-m-d H:i:s")
        ];

        $update = $this->AIManageModel->updateAI($aiuid, $data);

        if ($update) {
            echo json_encode([
                "success" => true,
                "message" => "Deleted successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Delete failed"
            ]);
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
}