<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class AIPrescriptionController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(0);
        date_default_timezone_set('Asia/Kolkata');

        $this->load->model('AIPrescriptionModel');
        $this->load->helper('verifyAuthToken');

       header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Content-Type: application/json");
    }

    // =============================
    // 🔐 TOKEN VALIDATION
    // =============================
    private function validateTokenOrFail() {

        $userToken = $this->input->get_request_header('Authorization');
        $split = explode(" ", $userToken);
        $token = $split[1] ?? '';

        if (!$token) {
            echo json_encode(["success"=>false,"message"=>"Token missing"]); exit;
        }

        $token = verifyAuthToken($token);
        if (!$token) {
            echo json_encode(["success"=>false,"message"=>"Unauthorized"]); exit;
        }

        $data = is_string($token) ? json_decode($token, true) : $token;

        if (($data['role'] ?? '') !== "super_admin") {
            echo json_encode(["success"=>false,"message"=>"Access denied"]); exit;
        }

        return $data;
    }

    // =============================
    // 🔹 LIST
    // =============================
    public function ai_prescription_list() {

        $this->validateTokenOrFail();

        $input = json_decode(file_get_contents("php://input"), true);

        $limit = $input['limit'] ?? 10;
        $page = $input['page'] ?? 1;
        $search = $input['search'] ?? '';
        $offset = ($page - 1) * $limit;

        $list = $this->AIPrescriptionModel->getList($search, $limit, $offset);
        $total = $this->AIPrescriptionModel->getCount($search);

        $AES_KEY = "RohitGaradHos@173414";

        $encrypted = $this->encrypt_aes_for_js(json_encode($list['data']), $AES_KEY);

        echo json_encode([
            "success" => true,
            "data" => $encrypted,
            "total" => $total['total'],
            "rowData" => $list['data']
        ]);
    }

    // =============================
    // 🔹 ADD
    // =============================
    public function ai_prescription_add() {

        $tokenData = $this->validateTokenOrFail();
        $muid = $tokenData['muid'];

        $raw = json_decode(file_get_contents("php://input"), true);

        $AES_KEY = "RohitGaradHos@173414";

        $dec = fn($k) => $this->decrypt_aes_from_js($raw[$k] ?? '', $AES_KEY);

        $data = [
            "apuid" => uniqid("AP_"),
            "name" => $dec("name"),
            "aiuid" => $dec("aiuid"),
            "model" => $dec("model"),
            "system_prompt" => $dec("systemPrompt"),
            "user_prompt" => $dec("userPrompt"),
            "temperature" => $dec("temperature"),
            "max_tokens" => $dec("maxTokens"),
            "is_default" => $dec("isDefault") === "true" ? 1 : 0,
            "created_by" => $muid,
            "created_at" => date("Y-m-d H:i:s")
        ];

        if ($data['is_default'] == 1) {
            $this->AIPrescriptionModel->setDefault(""); // reset all
        }

        $this->AIPrescriptionModel->insert($data);

        echo json_encode(["success"=>true,"message"=>"Added"]);
    }

    // =============================
    // 🔹 UPDATE
    // =============================
    public function ai_prescription_update() {

        $tokenData = $this->validateTokenOrFail();
        $muid = $tokenData['muid'];

        $raw = json_decode(file_get_contents("php://input"), true);

        $AES_KEY = "RohitGaradHos@173414";
        $dec = fn($k) => $this->decrypt_aes_from_js($raw[$k] ?? '', $AES_KEY);

        $apuid = $dec("apuid");

        $data = [
            "name" => $dec("name"),
            "aiuid" => $dec("aiuid"),
            "model" => $dec("model"),
            "system_prompt" => $dec("systemPrompt"),
            "user_prompt" => $dec("userPrompt"),
            "temperature" => $dec("temperature"),
            "max_tokens" => $dec("maxTokens"),
            "is_default" => $dec("isDefault") === "true" ? 1 : 0,
            "updated_by" => $muid,
            "updated_at" => date("Y-m-d H:i:s")
        ];

        if ($data['is_default'] == 1) {
            $this->AIPrescriptionModel->setDefault("");
        }

        $this->AIPrescriptionModel->update($apuid, $data);

        echo json_encode(["success"=>true,"message"=>"Updated"]);
    }

    // =============================
    // 🔹 DELETE
    // =============================
    public function ai_prescription_delete() {

        $tokenData = $this->validateTokenOrFail();
        $muid = $tokenData['muid'];

        $raw = json_decode(file_get_contents("php://input"), true);

        $AES_KEY = "RohitGaradHos@173414";
        $apuid = $this->decrypt_aes_from_js($raw['apuid'], $AES_KEY);

        $this->AIPrescriptionModel->update($apuid, [
            "isdelete" => 1,
            "updated_by" => $muid,
            "updated_at" => date("Y-m-d H:i:s")
        ]);

        echo json_encode(["success"=>true,"message"=>"Deleted"]);
    }

    // =============================
    // 🔹 SET DEFAULT
    // =============================
    public function ai_prescription_set_default() {

        $this->validateTokenOrFail();

        $raw = json_decode(file_get_contents("php://input"), true);

        $AES_KEY = "RohitGaradHos@173414";
        $apuid = $this->decrypt_aes_from_js($raw['apuid'], $AES_KEY);

        $this->AIPrescriptionModel->setDefault($apuid);

        echo json_encode(["success"=>true,"message"=>"Default set"]);
    }

    // =============================
    // 🔐 AES HELPERS (same as AIManage)
    // =============================
    public function encrypt_aes_for_js($text, $pass) {
        $salt = openssl_random_pseudo_bytes(8);
        $salted = 'Salted__' . $salt;
        $keyIV = $this->openssl_EVP_BytesToKey($pass, $salt, 32, 16);
        $enc = openssl_encrypt($text, 'aes-256-cbc', $keyIV['key'], OPENSSL_RAW_DATA, $keyIV['iv']);
        return base64_encode($salted . $enc);
    }

    public function openssl_EVP_BytesToKey($pass, $salt, $klen, $ilen) {
        $dtot = '';
        $d = '';
        while (strlen($dtot) < ($klen + $ilen)) {
            $d = md5($d . $pass . $salt, true);
            $dtot .= $d;
        }
        return ['key'=>substr($dtot,0,$klen),'iv'=>substr($dtot,$klen,$ilen)];
    }

    public function decrypt_aes_from_js($cipher, $pass) {
        $ct = base64_decode($cipher);
        $salt = substr($ct, 8, 8);
        $raw = substr($ct, 16);
        $keyIV = $this->openssl_EVP_BytesToKey($pass, $salt, 32, 16);
        return openssl_decrypt($raw, 'aes-256-cbc', $keyIV['key'], OPENSSL_RAW_DATA, $keyIV['iv']);
    }
}