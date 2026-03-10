<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use OpenApi\Annotations as OA;

class HospitalDashboardController extends CI_Controller {
    private $AES_KEY = "RohitGaradHos@173414";

    public function __construct(){
        parent::__construct();
        error_reporting(0);

        date_default_timezone_set('Asia/Kolkata');
        $this->load->database();
        $this->load->model('HospitalDashboardModel');
        $this->load->helper(['form', 'url', 'date', 'verifyAuthToken', 'jwt']);

        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, Content-Length, Accept-Encoding");
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            exit;
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

    private function authHosuid() {
        $userToken = $this->input->get_request_header('Authorization');
        if (empty($userToken) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $userToken = $_SERVER['HTTP_AUTHORIZATION'];
        }
        if (!$userToken) {
            echo json_encode(["success" => false, "message" => "Authorization header missing"]);
            exit;
        }

        $splitToken = explode(" ", $userToken);
        $token = isset($splitToken[1]) ? $splitToken[1] : '';

        try {
            $decoded = verifyAuthToken($token);
            if (!$decoded) {
                echo json_encode(["success" => false, "message" => "Invalid or expired token"]);
                exit;
            }
            $tokenData = is_string($decoded) ? json_decode($decoded, true) : $decoded;

            $role = $tokenData['role'] ?? null;
            if ($role !== 'hospital_admin') {
                echo json_encode(["success" => false, "message" => "Access denied"]);
                exit;
            }

            $hosuid = $tokenData['loguid'] ?? ($tokenData['id'] ?? '');
            if (!$hosuid) {
                echo json_encode(["success" => false, "message" => "Invalid user"]);
                exit;
            }

            return $hosuid;
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Unauthorized: " . $e->getMessage()]);
            exit;
        }
    }

    /**
     * @OA\Get(
     *     path="/HospitalDashboardController/getStats",
     *     tags={"Hospital Dashboard"},
     *     summary="Get dashboard statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="string", description="Encrypted stats data")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function getStats() {
        $hosuid = $this->authHosuid();
        $payload = $this->HospitalDashboardModel->getStats($hosuid);
        $encrypted = $this->encrypt_aes_for_js(json_encode($payload), $this->AES_KEY);

        echo json_encode([
            "success" => true,
            "message" => "Dashboard stats",
            "data" => $encrypted
        ]);
    }

    /**
     * @OA\Get(
     *     path="/HospitalDashboardController/getLists",
     *     tags={"Hospital Dashboard"},
     *     summary="Get dashboard lists",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="string", description="Encrypted lists data")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function getLists() {
        $hosuid = $this->authHosuid();
        $payload = $this->HospitalDashboardModel->getLists($hosuid);
        $encrypted = $this->encrypt_aes_for_js(json_encode($payload), $this->AES_KEY);

        echo json_encode([
            "success" => true,
            "message" => "Dashboard lists",
            "data" => $encrypted
        ]);
    }

    /**
     * @OA\Get(
     *     path="/HospitalDashboardController/getAppointments",
     *     tags={"Hospital Dashboard"},
     *     summary="Get dashboard appointments",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="string", description="Encrypted appointments data")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function getAppointments() {
        $hosuid = $this->authHosuid();
        $payload = $this->HospitalDashboardModel->getAppointments($hosuid);
        $encrypted = $this->encrypt_aes_for_js(json_encode($payload), $this->AES_KEY);

        echo json_encode([
            "success" => true,
            "message" => "Dashboard appointments",
            "data" => $encrypted
        ]);
    }

    /**
     * @OA\Get(
     *     path="/HospitalDashboardController/getBottom",
     *     tags={"Hospital Dashboard"},
     *     summary="Get dashboard bottom data",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="string", description="Encrypted bottom data")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function getBottom() {
        $hosuid = $this->authHosuid();
        $payload = $this->HospitalDashboardModel->getBottom($hosuid);
        $encrypted = $this->encrypt_aes_for_js(json_encode($payload), $this->AES_KEY);

        echo json_encode([
            "success" => true,
            "message" => "Dashboard bottom data",
            "data" => $encrypted
        ]);
    }

}
