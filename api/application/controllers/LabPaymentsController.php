<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class LabPaymentsController extends CI_Controller {

    public function __construct(){
        parent::__construct();
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        
        date_default_timezone_set('Asia/Kolkata');
        $this->load->helper(array('form', 'url', 'date', 'verifyAuthToken'));
        $this->load->model('LabPaymentModel');
        
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
            return false;
        }
        $saltHeader = substr($cipherText, 0, 8);
        if (strncmp($saltHeader, "Salted__", 8) !== 0) {
            return false;
        }
        $salt = substr($cipherText, 8, 8);
        $cipherRaw = substr($cipherText, 16);
        $keyAndIV = $this->openssl_EVP_BytesToKey($passphrase, $salt, 32, 16);
        $decrypted = openssl_decrypt($cipherRaw, 'aes-256-cbc', $keyAndIV['key'], OPENSSL_RAW_DATA, $keyAndIV['iv']);
        return $decrypted;
    }

    public function getPayments() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        
        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);
        $order_id = isset($rawData['order_id']) ? $rawData['order_id'] : null;

        if (!$order_id) {
            echo json_encode(["success" => false, "message" => "Order ID is required"]);
            return;
        }

        $payments = $this->LabPaymentModel->get_order_payments($order_id, $lab_id);

        $AES_KEY = "RohitGaradHos@173414";
        $encryptedData = $this->encrypt_aes_for_js(json_encode($payments), $AES_KEY);

        echo json_encode([
            "success" => true,
            "data"    => $encryptedData
        ]);
    }

    public function getBillingData() {
        try {
            $tokenData = $this->authenticate();
            $lab_id = $tokenData['lab_id'] ?? null;
            
            if (!$lab_id) {
                echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
                return;
            }

            $rawData = json_decode(file_get_contents("php://input"), true);
            $search = isset($rawData['search']) ? trim($rawData['search']) : '';
            $status = isset($rawData['status']) ? $rawData['status'] : 'all';
            $limit = isset($rawData['limit']) ? (int)$rawData['limit'] : 100;
            $page = isset($rawData['page']) ? (int)$rawData['page'] : 1;
            $offset = ($page - 1) * $limit;

            $stats = $this->LabPaymentModel->get_billing_stats($lab_id);
            $invoices = $this->LabPaymentModel->get_billing_invoices($lab_id, $limit, $offset, $search, $status);

            $data = [
                'stats' => $stats,
                'invoices' => $invoices
            ];

            $AES_KEY = "RohitGaradHos@173414";
            $encryptedData = $this->encrypt_aes_for_js(json_encode($data), $AES_KEY);

            echo json_encode([
                "success" => true,
                "data"    => $encryptedData
            ]);
        } catch (Throwable $e) {
            log_message('error', 'getBillingData Error: ' . $e->getMessage());
            echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
        }
    }

    public function addPayment() {
        $tokenData = $this->authenticate();
        $lab_id = $tokenData['lab_id'] ?? null;
        $user_id = $tokenData['id'] ?? null;
        
        if (!$lab_id) {
            echo json_encode(["success" => false, "message" => "Invalid lab ID"]);
            return;
        }

        $rawData = json_decode(file_get_contents("php://input"), true);
        $encryptedPayload = isset($rawData['encrypted_payload']) ? $rawData['encrypted_payload'] : null;

        if (!$encryptedPayload) {
            echo json_encode(["success" => false, "message" => "Invalid payload"]);
            return;
        }

        $AES_KEY = "RohitGaradHos@173414";
        $decryptedJson = $this->decrypt_aes_from_js($encryptedPayload, $AES_KEY);
        
        if (!$decryptedJson) {
            echo json_encode(["success" => false, "message" => "Decryption failed"]);
            return;
        }

        $data = json_decode($decryptedJson, true);
        
        if (!isset($data['order_id']) || !isset($data['amount'])) {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
            return;
        }

        $paymentData = [
            'lab_id' => $lab_id,
            'order_id' => $data['order_id'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? 'Cash',
            'transaction_ref' => $data['transaction_ref'] ?? '',
            'payment_date' => date('Y-m-d H:i:s'),
            // 'notes' => $data['notes'] ?? '', // Schema doesn't have notes, but we can add if needed. Check schema again?
            'created_by' => $user_id,
            'created_at' => date('Y-m-d H:i:s')
        ];

        // Schema check earlier showed: id, lab_id, order_id, amount, payment_date, payment_method, transaction_ref, created_by, created_at.
        // It does NOT have 'notes'. I should remove 'notes' or add the column. 
        // For now, I'll ignore notes in the insert array to avoid DB error, or add it to transaction_ref if short.
        // Or better, let's stick to schema.

        $result = $this->LabPaymentModel->add_payment($paymentData);

        if ($result) {
            echo json_encode(["success" => true, "message" => "Payment added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to add payment"]);
        }
    }
}
